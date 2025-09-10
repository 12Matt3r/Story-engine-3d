import { Component } from '../ecs/Component.js';

export class Floatable extends Component {
  /**
   * @param {{amplitude?: number, speed?: number, phase?: number}} opts
   */
  constructor({ amplitude = 0.3, speed = 1.0, phase = 0 } = {}) {
    super();
    this.amp = amplitude;
    this.speed = speed;
    this.phase = phase;
    this._baseY = undefined;
  }

  onAttach(entity) {
    super.onAttach(entity);
    const o = entity.object3D;
    if (o) this._baseY = o.position.y;
  }

  update({ t }) {
    const o = this.entity.object3D;
    if (!o || this._baseY === undefined) return;
    o.position.y = this._baseY + Math.sin(t * this.speed + this.phase) * this.amp;
  }

  toJSON() { return { amplitude: this.amp, speed: this.speed, phase: this.phase }; }
  static fromJSON({ amplitude, speed, phase }) {
    return new Floatable({ amplitude, speed, phase });
  }
}
