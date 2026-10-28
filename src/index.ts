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
  Interactable,
  OneHandGrabbable,
} from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';
import { Ball, Goal, GoalSystem } from './goal.js';

World.create(
  document.getElementById('scene-container') as HTMLDivElement,
  projectOptions,
).then((world) => {
  world.registerComponent(Ball).registerComponent(Goal);
  world.registerSystem(GoalSystem);

  // मेज़ (थोड़ी झुकी हुई, स्थिर)
  const table = new Mesh(
    new BoxGeometry(1.0, 0.05, 0.6),
    new MeshStandardMaterial({ color: 0x8b5a2b }),
  );
  table.position.set(0, 0.9, -1.2);
  table.rotation.z = -0.1;
  const tableEntity = world.createTransformEntity(table);
  tableEntity.addComponent(PhysicsShape, {
    shape: PhysicsShapeType.Box,
    dimensions: [1.0, 0.05, 0.6],
  });
  tableEntity.addComponent(PhysicsBody, { state: PhysicsState.Static });

  // गेंद
  const ball = new Mesh(
    new SphereGeometry(0.05),
    new MeshStandardMaterial({ color: 0xff5533 }),
  );
  ball.position.set(-0.35, 1.0, -1.2);
  const ballEntity = world.createTransformEntity(ball);
  ballEntity.addComponent(PhysicsShape, {
    shape: PhysicsShapeType.Sphere,
    dimensions: [0.05],
    restitution: 0.3,
  });
  ballEntity.addComponent(PhysicsBody, { state: PhysicsState.Dynamic });
  ballEntity.addComponent(Interactable);
  ballEntity.addComponent(OneHandGrabbable);
  ballEntity.addComponent(Ball);

  // लक्ष्य (हरा पारदर्शी गोला)
  const goal = new Mesh(
    new SphereGeometry(0.1),
    new MeshStandardMaterial({
      color: 0x22cc66,
      transparent: true,
      opacity: 0.35,
    }),
  );
  goal.position.set(0.35, 0.93, -1.2);
  const goalEntity = world.createTransformEntity(goal);
  goalEntity.addComponent(Goal, { radius: 0.1 });
});
