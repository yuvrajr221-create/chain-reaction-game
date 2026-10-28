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
} from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';
import { Ball, Goal, GoalSystem } from './goal.js';
import {
  StartButton,
  ResetButton,
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

World.create(
  document.getElementById('scene-container') as HTMLDivElement,
  projectOptions,
).then((world) => {
  world
    .registerComponent(Ball)
    .registerComponent(Goal)
    .registerComponent(StartButton)
    .registerComponent(ResetButton)
    .registerComponent(Plank);
  world.registerSystem(GoalSystem);
  world.registerSystem(ButtonSystem);
  world.registerSystem(PlankSystem);

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

  // तख्ता (मेज़ पर सरकाकर खाई तक ले जाना है)
  const plank = new Mesh(
    new BoxGeometry(0.4, 0.02, 0.2),
    new MeshStandardMaterial({ color: 0xd9a066 }),
  );
  plank.position.set(BRIDGE ? 0 : -0.3, PLANK_Y, BRIDGE ? Z : Z - 0.2);
  const plankEntity = world.createTransformEntity(plank);
  plankEntity.addComponent(PhysicsShape, {
    shape: PhysicsShapeType.Box,
    dimensions: [0.4, 0.02, 0.2],
    friction: 0.8,
  });
  plankEntity.addComponent(PhysicsBody, { state: PhysicsState.Kinematic });
  plankEntity.addComponent(RayInteractable);
  plankEntity.addComponent(DistanceGrabbable);
  plankEntity.addComponent(Plank);

  // गेंद
  const ball = new Mesh(
    new SphereGeometry(0.07),
    new MeshStandardMaterial({ color: 0xff5533 }),
  );
  ball.position.set(-0.5, Y + 0.1, Z);
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

  // Start / Reset बटन
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
  addButton(-0.12, 0x22aa55, StartButton);
  addButton(0.12, 0xdd3333, ResetButton);

  // Start दबने पर गेंद को धक्का
  let started = false;
  actions.start = () => {
    if (started) return;
    started = true;
    ballEntity.addComponent(PhysicsManipulation, {
      linearVelocity: [1.2, 0, 0],
    });
  };
  if (AUTOSTART) {
    setTimeout(() => actions.start(), 2500);
  }
});
