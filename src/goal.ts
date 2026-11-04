import { createComponent, createSystem, Types, UIKitMLAsset, AudioUtils } from '@iwsdk/core';
import { HAS_NEXT, nextLevelUrl } from './levels.js';

export const Ball = createComponent('Ball', {});

export const Goal = createComponent('Goal', {
  radius: { type: Types.Float32, default: 0.1 },
  reached: { type: Types.Boolean, default: false },
});

export const gameState = { started: false, over: false };

export class GoalSystem extends createSystem({
  goals: { required: [Goal] },
  balls: { required: [Ball] },
}) {
  private panel: any = null;
  private winRoot: any = null;
  private title: any = null;
  private sub: any = null;
  private label: any = null;
  private winReady = false;
  private lost = false;
  private won = false;

  private setupPanel() {
    if (this.winReady) return;
    const panel = this.world.getSceneObject<UIKitMLAsset>('win-panel');
    const root = panel ? panel.getElementById('win-root') : null;
    if (root == null) return;
    this.panel = panel;
    this.winRoot = root;
    this.winRoot.setProperties({ display: 'none' });
    this.title = panel.getElementById('win-title');
    this.sub = panel.getElementById('win-sub');
    const btn = panel.getElementById('win-btn');
    this.label = panel.getElementById('win-btn-text');
    if (btn) {
      btn.addEventListener('click', () => {
        if (this.won && HAS_NEXT) window.location.href = nextLevelUrl();
        else window.location.reload();
      });
    }
    this.winReady = true;
  }

  private showLose() {
    if (this.lost || this.won || this.winRoot == null) return;
    this.lost = true;
    if (this.title) this.title.setProperties({ text: 'TRY AGAIN', color: '#ff7755' });
    if (this.sub) this.sub.setProperties({ text: 'The ball fell' });
    if (this.label) this.label.setProperties({ text: 'Play again' });
    this.winRoot.setProperties({ display: 'flex' });
  }

  private showWin() {
    if (this.won || this.winRoot == null) return;
    this.won = true;
    AudioUtils.createOneShot(this.world, './audio/chime.mp3', { volume: 0.8, positional: false });
    if (this.label && HAS_NEXT) this.label.setProperties({ text: 'Next level' });
    this.winRoot.setProperties({ display: 'flex' });
  }

  update() {
    this.setupPanel();
    for (const b of this.queries.balls.entities) {
      const bo = b.object3D;
      if (bo != null && gameState.started && bo.position.y < 0.4) this.showLose();
    }
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
          if (this.lost === false) this.showWin();
        }
      }
    }
  }
}
