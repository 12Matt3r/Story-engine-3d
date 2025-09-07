import { Component } from '../ecs/Component.js';

export class Rotatable extends Component {
  /**
   * @param {{speed?: number, axis?: 'x'|'y'|'z'}} opts
   */
  constructor({ speed = 0.8, axis = 'y' } = {}) {
    super();
    this.speed = speed;
    this.axis = axis;
  }

  update(dt) {
    const o = this.entity.object3D;
    if (!o) return;
    const d = this.speed * dt;
    if (this.axis === 'x') o.rotation.x += d;
    else if (this.axis === 'y') o.rotation.y += d;
    else o.rotation.z += d;
  }

  toJSON() { return { speed: this.speed, axis: this.axis }; }
  static fromJSON({ speed, axis }) { return new Rotatable({ speed, axis }); }
}
