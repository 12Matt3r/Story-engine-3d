export class Component {
  /** @param {import('./Entity.js').Entity} entity */
  onAttach(entity) { this.entity = entity; }
  onDetach() { this.entity = undefined; }
  /** @param {number} dt Seconds since last frame */
  update(dt) {}
  /** Optional: serialize to persist/clone */
  toJSON() { return {}; }
  /** Optional: static fromJSON(data) {} */
}
