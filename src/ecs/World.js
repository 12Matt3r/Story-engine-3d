export class World {
  constructor() {
    this.entities = new Map();  // id -> Entity
    this.tags = new Map();      // optional: tag -> Set<Entity>
  }

  addEntity(entity, { tags = [] } = {}) {
    this.entities.set(entity.id, entity);
    for (const t of tags) {
      if (!this.tags.has(t)) this.tags.set(t, new Set());
      this.tags.get(t).add(entity);
    }
    return entity;
  }

  removeEntity(entity) {
    this.entities.delete(entity.id);
    for (const set of this.tags.values()) set.delete(entity);
  }

  /** @param {number} dt seconds */
  update(dt) {
    for (const e of this.entities.values()) e.update(dt);
  }

  queryByTag(tag) { return this.tags.get(tag) ?? new Set(); }
}
