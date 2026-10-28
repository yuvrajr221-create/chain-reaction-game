import { createComponent, createSystem, Types } from '@iwsdk/core';

export const Ball = createComponent('Ball', {});

export const Goal = createComponent('Goal', {
  radius: { type: Types.Float32, default: 0.1 },
  reached: { type: Types.Boolean, default: false },
});

function showWin() {
  const d = document.createElement('div');
  d.textContent = 'जीत 🎉';
  d.style.cssText =
    'position:fixed;top:20%;left:0;right:0;text-align:center;' +
    'font:700 64px sans-serif;color:#fff;text-shadow:0 2px 8px #000;' +
    'z-index:9999;pointer-events:none';
  document.body.appendChild(d);
}

export class GoalSystem extends createSystem({
  goals: { required: [Goal] },
  balls: { required: [Ball] },
}) {
  update() {
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
          showWin();
        }
      }
    }
  }
}
