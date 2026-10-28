import { createComponent, createSystem, Pressed } from '@iwsdk/core';

export const TABLE_Y = 0.85;
export const TABLE_Z = -0.6;
export const PLANK_Y = TABLE_Y + 0.016;

export const StartButton = createComponent('StartButton', {});
export const ResetButton = createComponent('ResetButton', {});
export const LeftButton = createComponent('LeftButton', {});
export const RightButton = createComponent('RightButton', {});
export const Plank = createComponent('Plank', {});

export const actions = {
  start: () => {},
  left: () => {},
  right: () => {},
  reset: () => {
    window.location.reload();
  },
};

export class ButtonSystem extends createSystem({
  starts: { required: [StartButton, Pressed] },
  resets: { required: [ResetButton, Pressed] },
  lefts: { required: [LeftButton, Pressed] },
  rights: { required: [RightButton, Pressed] },
}) {
  init(): void {
    this.queries.starts.subscribe('qualify', () => {
      actions.start();
    });
    this.queries.resets.subscribe('qualify', () => {
      actions.reset();
    });
    this.queries.lefts.subscribe('qualify', () => {
      actions.left();
    });
    this.queries.rights.subscribe('qualify', () => {
      actions.right();
    });
  }
}

export class PlankSystem extends createSystem({
  planks: { required: [Plank] },
}) {
  update(): void {
    for (const e of this.queries.planks.entities) {
      const o = e.object3D;
      if (o == null) continue;
      o.position.y = PLANK_Y;
      o.rotation.x = 0;
      o.rotation.z = 0;
      if (o.position.x < -0.55) o.position.x = -0.55;
      if (o.position.x > 0.55) o.position.x = 0.55;
      if (o.position.z < TABLE_Z - 0.25) o.position.z = TABLE_Z - 0.25;
      if (o.position.z > TABLE_Z + 0.25) o.position.z = TABLE_Z + 0.25;
    }
  }
}
