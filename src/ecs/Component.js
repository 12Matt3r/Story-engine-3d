import './types.js';

export class Component {
  /** @param {import('./Entity.js').Entity} entity */
  onAttach(entity) { this.entity = entity; }
  onDetach() { this.entity = undefined; }
  /** @param {UpdateCtx} ctx */
  update(ctx) {}
  /** Optional: serialize to persist/clone */
  toJSON() { return {}; }
  /** Optional: static fromJSON(data) {} */
}
