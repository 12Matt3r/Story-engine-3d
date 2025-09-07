export class Entity {
  constructor({ id, object3D }) {
    this.id = id ?? crypto.randomUUID?.() ?? String(Math.random());
    this.object3D = object3D;       // THREE.Object3D
    this._components = new Map();   // key = class/function, value = instance
    this.enabled = true;
  }

  add(component) {
    const key = component.constructor;
    if (this._components.has(key)) throw new Error(`Duplicate component: ${key.name}`);
    this._components.set(key, component);
    component.onAttach(this);
    return this;
  }

  remove(ComponentType) {
    const c = this._components.get(ComponentType);
    if (!c) return;
    c.onDetach?.();
    this._components.delete(ComponentType);
  }

  get(ComponentType) { return this._components.get(ComponentType); }
  has(ComponentType) { return this._components.has(ComponentType); }

  update(dt) {
    if (!this.enabled) return;
    for (const c of this._components.values()) c.update?.(dt);
  }

  toJSON() {
    return {
      id: this.id,
      components: [...this._components.values()].map(c => ({
        type: c.constructor.name,
        data: c.toJSON?.() ?? {}
      }))
    };
  }
}
