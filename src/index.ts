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
  DistanceGrabbable,
  MovementMode,
} from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';
import { Ball, Goal, GoalSystem } from './goal.js';
import {
  StartButton,
  ResetButton,
  LeftButton,
  RightButton,
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
const GRAB = params.get('grab') === '1';
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
    .registerComponent(Plank);
  world.registerSystem(GoalSystem);
  world.registerSystem(ButtonSystem);
  world.registerSystem(PlankSystem);

  let started = false;

  // मेज़ के दो हिस्से (बीच में खाई)
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
  addTable(-0.35);
  addTable(0.35);

  // तख्ता (Start से पहले बिना फिजिक्स के, सिर्फ दिखने वाला)
  const plank = new Mesh(
    new BoxGeometry(0.4, 0.02, 0.2),
    new MeshStandardMaterial({ color: 0xd9a066 }),
  );
  plank.position.set(BRIDGE ? 0 : -0.25, PLANK_Y, Z);
  const plankEntity = world.createTransformEntity(plank);
  plankEntity.addComponent(Plank);
  if (GRAB) {
    plankEntity.addComponent(RayInteractable);
    plankEntity.addComponent(DistanceGrabbable, {
      movementMode: MovementMode.MoveFromTarget,
    });
  }

  // गेंद
  const ball = new Mesh(
    new SphereGeometry(0.07),
    new MeshStandardMaterial({ color: 0xff5533 }),
  );
  ball.position.set(-0.56, Y + 0.1, Z);
  const ballEntity = world.createTransformEntity(ball);
  ballEntity.addComponent(PhysicsShape, {
    shape: PhysicsShapeType.Sphere,
    dimensions: [0.07],
    restitution: 0.2,
    friction: 0.6,
  });
  ballEntity.addComponent(PhysicsBody, { state: PhysicsState.Dynamic });
  ballEntity.addComponent(Ball);

  // लक्ष्य
  const goal = new Mesh(
    new SphereGeometry(0.1),
    new MeshStandardMaterial({
      color: 0x22cc66,
      transparent: true,
      opacity: 0.35,
    }),
  );
  goal.position.set(0.4, Y + 0.06, Z);
  const goalEntity = world.createTransformEntity(goal);
  goalEntity.addComponent(Goal, { radius: 0.1 });

  // बटन
  function addButton(x: number, color: number, tag: any) {
    const m = new Mesh(
      new BoxGeometry(0.14, 0.07, 0.14),
      new MeshStandardMaterial({ color }),
    );
    m.position.set(x, Y + 0.1, Z + 0.4);
    const e = world.createTransformEntity(m);
    e.addComponent(RayInteractable);
    e.addComponent(PokeInteractable);
    e.addComponent(tag);
  }
  addButton(-0.32, 0x3377ff, LeftButton);
  addButton(-0.16, 0x3377ff, RightButton);
  addButton(0.06, 0x22aa55, StartButton);
  addButton(0.22, 0xdd3333, ResetButton);

  // क्रियाएँ
  function movePlank(dx: number) {
    if (started) return;
    let x = plank.position.x + dx;
    if (x < -0.55) x = -0.55;
    if (x > 0.55) x = 0.55;
    plank.position.x = x;
  }
  actions.left = () => movePlank(-STEP);
  actions.right = () => movePlank(STEP);
  actions.start = () => {
    if (started) return;
    started = true;
    // तख्ते में अब फिजिक्स जोड़ो (जहाँ रखा है वहीं)
    plankEntity.addComponent(PhysicsShape, {
      shape: PhysicsShapeType.Box,
      dimensions: [0.4, 0.02, 0.2],
      friction: 0.8,
    });
    plankEntity.addComponent(PhysicsBody, { state: PhysicsState.Static });
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
      'plankX ' + plank.position.x.toFixed(2) + ' | started ' + started;
  }, 200);
});
