import {
  World,
  Mesh,
  BoxGeometry,
  SphereGeometry,
  MeshStandardMaterial,
  PhysicsBody,
  PhysicsShape,
  PhysicsShapeType,
  PhysicsState,
  PhysicsManipulation,
  RayInteractable,
  PokeInteractable,
} from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';
import { LV } from './levels.js';
import { Ball, Goal, GoalSystem } from './goal.js';
import {
  StartButton,
  ResetButton,
  LeftButton,
  RightButton,
  PickButton,
  Plank,
  ButtonSystem,
  PlankSystem,
  actions,
  TABLE_Y as Y,
  TABLE_Z as Z,
  PLANK_Y,
} from './game.js';

const params = new URLSearchParams(window.location.search);
const BRIDGE = params.get('bridge') === '1';
const AUTOSTART = params.get('autostart') === '1';
const STEP = 0.05;

World.create(
  document.getElementById('scene-container') as HTMLDivElement,
  projectOptions,
).then((world) => {
  world
    .registerComponent(Ball)
    .registerComponent(Goal)
    .registerComponent(StartButton)
    .registerComponent(ResetButton)
    .registerComponent(LeftButton)
    .registerComponent(RightButton)
    .registerComponent(PickButton)
    .registerComponent(Plank);
  world.registerSystem(GoalSystem);
  world.registerSystem(ButtonSystem);
  world.registerSystem(PlankSystem);

  let started = false;
  let active = 0;

  function addTable(x: number) {
    const m = new Mesh(
      new BoxGeometry(0.5, 0.05, 0.6),
      new MeshStandardMaterial({ color: 0x8b5a2b }),
    );
    m.position.set(x, Y, Z);
    const e = world.createTransformEntity(m);
    e.addComponent(PhysicsShape, {
      shape: PhysicsShapeType.Box,
      dimensions: [0.5, 0.05, 0.6],
      friction: 0.6,
    });
    e.addComponent(PhysicsBody, { state: PhysicsState.Static });
  }
  addTable(-(LV.gap / 2 + 0.25));
  addTable(LV.gap / 2 + 0.25);

  const planks: { mesh: Mesh; entity: any }[] = [];
  function addPlank(x: number, color: number) {
    const mesh = new Mesh(
      new BoxGeometry(0.4, 0.02, 0.2),
      new MeshStandardMaterial({ color }),
    );
    mesh.position.set(x, PLANK_Y, Z);
    const entity = world.createTransformEntity(mesh);
    entity.addComponent(Plank);
    planks.push({ mesh, entity });
  }
  if (LV.planks === 2) {
    addPlank(-0.55, 0xd9a066);
    addPlank(0.55, 0x8fc9a0);
  } else {
    addPlank(BRIDGE ? 0 : -0.25, 0xd9a066);
  }

  function highlight() {
    if (planks.length < 2) return;
    planks.forEach((p, i) => {
      const mat = p.mesh.material as any;
      mat.emissive.set(i === active ? 0x666600 : 0x000000);
    });
  }
  highlight();

  const ball = new Mesh(
    new SphereGeometry(0.07),
    new MeshStandardMaterial({ color: 0xff5533 }),
  );
  ball.position.set(-(LV.gap / 2 + 0.5) + 0.04, Y + 0.1, Z);
  const ballEntity = world.createTransformEntity(ball);
  ballEntity.addComponent(PhysicsShape, {
    shape: PhysicsShapeType.Sphere,
    dimensions: [0.07],
    restitution: 0.2,
    friction: 0.6,
  });
  ballEntity.addComponent(PhysicsBody, { state: PhysicsState.Dynamic });
  ballEntity.addComponent(Ball);

  const goal = new Mesh(
    new SphereGeometry(0.1),
    new MeshStandardMaterial({
      color: 0x22cc66,
      transparent: true,
      opacity: 0.35,
    }),
  );
  goal.position.set(LV.gap / 2 + 0.3, Y + 0.06, Z);
  const goalEntity = world.createTransformEntity(goal);
  goalEntity.addComponent(Goal, { radius: 0.1 });

  function addButton(x: number, color: number, tag: any) {
    const m = new Mesh(
      new BoxGeometry(0.18, 0.1, 0.18),
      new MeshStandardMaterial({ color }),
    );
    m.position.set(x, Y + 0.1, Z + 0.4);
    const e = world.createTransformEntity(m);
    e.addComponent(RayInteractable);
    e.addComponent(PokeInteractable);
    e.addComponent(tag);
  }
  addButton(-0.45, 0x3377ff, LeftButton);
  addButton(-0.21, 0x3377ff, RightButton);
  addButton(0.15, 0x22aa55, StartButton);
  addButton(0.63, 0xdd3333, ResetButton);
  if (LV.planks === 2) addButton(0.39, 0xffcc00, PickButton);

  function movePlank(dx: number) {
    if (started) return;
    const p = planks[active].mesh;
    let x = p.position.x + dx;
    if (x < -0.55) x = -0.55;
    if (x > 0.55) x = 0.55;
    p.position.x = x;
  }
  actions.left = () => movePlank(-STEP);
  actions.right = () => movePlank(STEP);
  actions.pick = () => {
    if (started || planks.length < 2) return;
    active = 1 - active;
    highlight();
  };
  actions.start = () => {
    if (started) return;
    started = true;
    for (const p of planks) {
      p.entity.addComponent(PhysicsShape, {
        shape: PhysicsShapeType.Box,
        dimensions: [0.4, 0.02, 0.2],
        friction: 0.8,
      });
      p.entity.addComponent(PhysicsBody, { state: PhysicsState.Static });
    }
    ballEntity.addComponent(PhysicsManipulation, {
      linearVelocity: [1.2, 0, 0],
    });
  };
  if (AUTOSTART) {
    setTimeout(() => actions.start(), 2500);
  }

  // debug
  const dbg = document.createElement('div');
  dbg.style.cssText =
    'position:fixed;top:60px;left:8px;z-index:9999;font:16px monospace;color:#000;background:#fff9;padding:4px;pointer-events:none';
  document.body.appendChild(dbg);
  setInterval(() => {
    dbg.textContent =
      'plank' + (active + 1) + ' X ' + planks[active].mesh.position.x.toFixed(2) + ' | started ' + started;
  }, 200);
});
