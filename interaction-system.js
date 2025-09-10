import * as THREE from 'three';
import { Interactable } from './src/components/Interactable.js';
import { HoverHighlight } from './src/components/HoverHighlight.js';

class InteractionSystem {
    constructor(scene, camera, storyEngine, world) {
        this.scene = scene;
        this.camera = camera;
        this.storyEngine = storyEngine;
        this.world = world;
        this.raycaster = new THREE.Raycaster();
        this.currentlyHovered = null;
    }

    update(dt) {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        const interactableEntities = this.world.queryByTag('storyNode');
        const interactableMeshes = [...interactableEntities].map(e => e.object3D);

        const intersects = this.raycaster.intersectObjects(interactableMeshes);

        let intersectedEntity = null;
        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            const entity = [...interactableEntities].find(e => e.object3D === mesh);
            if (entity && entity.has(HoverHighlight)) {
                intersectedEntity = entity;
            }
        }

        if (this.currentlyHovered && this.currentlyHovered !== intersectedEntity) {
            this.currentlyHovered.get(HoverHighlight)?.onHoverEnd();
        }

        if (intersectedEntity && this.currentlyHovered !== intersectedEntity) {
            intersectedEntity.get(HoverHighlight)?.onHoverStart();
        }

        this.currentlyHovered = intersectedEntity;
    }

    handleInteraction() {
        if (this.currentlyHovered) {
            const interactable = this.currentlyHovered.get(Interactable);
            if (interactable && !interactable.triggered) {
                this.triggerStoryNode(this.currentlyHovered);
                return this.currentlyHovered;
            }
        }
        return null;
    }
    
    triggerStoryNode(entity) {
        const interactable = entity.get(Interactable);
        if (!interactable) return;

        interactable.triggered = true;
        
        entity.get(HoverHighlight)?.onHoverEnd();
        this.currentlyHovered = null;

        const mesh = entity.object3D;
        if (mesh.material.emissive) {
            mesh.material.emissive.setHex(0x333333);
        }
        
        this.storyEngine.triggerEvent(interactable.storyType, interactable.title);
        
        const sprite = this.scene.children.find(child => 
            child.isSprite && 
            child.position.distanceTo(mesh.position) < 3
        );
        if (sprite) {
            sprite.material.color.setHex(0xff0000);
            setTimeout(() => {
                sprite.material.color.setHex(0xffffff);
            }, 200);
        }
        
        return entity;
    }
    
    advanceStory() {
        if (this.storyEngine.canAdvance()) {
            this.storyEngine.advance();
        }
    }
}

export { InteractionSystem };
