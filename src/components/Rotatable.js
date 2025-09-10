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

  update({ t }) {
    const o = this.entity.object3D;
    if (!o) return;
    const angle = t * this.speed;
    if (this.axis === 'x') o.rotation.x = angle;
    else if (this.axis === 'y') o.rotation.y = angle;
    else o.rotation.z = angle;
  }

  toJSON() { return { speed: this.speed, axis: this.axis }; }
  static fromJSON({ speed, axis }) { return new Rotatable({ speed, axis }); }
}
