import { createComponent, createSystem, Types, UIKitMLAsset } from '@iwsdk/core';

export const Ball = createComponent('Ball', {});

export const Goal = createComponent('Goal', {
  radius: { type: Types.Float32, default: 0.1 },
  reached: { type: Types.Boolean, default: false },
});

export class GoalSystem extends createSystem({
  goals: { required: [Goal] },
  balls: { required: [Ball] },
}) {
  private winRoot: any = null;
  private winReady = false;

  private setupPanel() {
    if (this.winReady) return;
    const panel = this.world.getSceneObject<UIKitMLAsset>('win-panel');
    const root = panel ? panel.getElementById('win-root') : null;
    if (root == null) return;
    this.winRoot = root;
    this.winRoot.setProperties({ display: 'none' });
    const btn = panel.getElementById('win-btn');
    if (btn) btn.addEventListener('click', () => { window.location.reload(); });
    this.winReady = true;
  }

  update() {
    this.setupPanel();
    for (const g of this.queries.goals.entities) {
      if (g.getValue(Goal, 'reached')) continue;
      const go = g.object3D;
      if (go == null) continue;
      const r = g.getValue(Goal, 'radius') as number;
      for (const b of this.queries.balls.entities) {
        const bo = b.object3D;
        if (bo == null) continue;
        if (go.position.distanceTo(bo.position) < r) {
          g.setValue(Goal, 'reached', true);
          const m = (go as any).material;
          if (m) m.color.set(0xffd700);
          if (this.winRoot) {
            this.winRoot.setProperties({ display: 'flex' });
          }
        }
      }
    }
  }
}
