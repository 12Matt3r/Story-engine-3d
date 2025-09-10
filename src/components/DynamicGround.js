import { Component } from '../ecs/Component.js';

export class DynamicGround extends Component {
  /**
   * @param {{
   *   material: THREE.ShaderMaterial,
   *   camera: THREE.Camera
   * }} opts
   */
  constructor({ material, camera }) {
    super();
    this.material = material;
    this.camera = camera;
  }

  update({ t }) {
    if (this.material.uniforms.time) {
      this.material.uniforms.time.value = t;
    }
    if (this.material.uniforms.playerPos && this.camera) {
      this.material.uniforms.playerPos.value.copy(this.camera.position);
    }
  }

  toJSON() {
    // This component is stateful and tied to scene objects,
    // so serialization is not straightforward.
    return {};
  }
}
