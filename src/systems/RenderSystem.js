import * as THREE from 'three';

export class RenderSystem {
    constructor(world, scene, renderer) {
        this.world = world;
        this.scene = scene;
        this.renderer = renderer;
        this.entitiesInScene = new Set();
    }

    update({ camera }) {
        // Add new entities to the scene
        for (const entity of this.world.entities.values()) {
            if (entity.object3D && !this.entitiesInScene.has(entity)) {
                this.scene.add(entity.object3D);
                this.entitiesInScene.add(entity);
            }
        }

        // Remove old entities from the scene
        const worldEntityIds = new Set([...this.world.entities.keys()]);
        for (const entity of this.entitiesInScene) {
            if (!worldEntityIds.has(entity.id)) {
                this.scene.remove(entity.object3D);
                this.entitiesInScene.delete(entity);
            }
        }

        // Render the scene
        if (this.renderer && this.scene && camera) {
            this.renderer.render(this.scene, camera);
        }
    }
}
