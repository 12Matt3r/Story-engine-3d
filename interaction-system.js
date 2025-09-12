import * as THREE from 'three';

import { Hovered } from './src/components/Hovered.js';
import { Interactable } from './src/components/Interactable.js';

class InteractionSystem {
    constructor(scene, camera, storyEngine, world) {
        this.scene = scene;
        this.camera = camera;
        this.storyEngine = storyEngine;
        this.world = world;
        this.raycaster = new THREE.Raycaster();
        this.currentlyHovered = null;
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
    
    triggerStoryNode(node) {
        node.userData.triggered = true;
        
        // Visual feedback
        node.material.emissive.setHex(0x333333);
        
        // Trigger story event
        this.storyEngine.triggerEvent(node.userData.storyType, node.userData.title);
        
        // Add glitch effect
        const sprite = this.scene.children.find(child => 
            child.isSprite && 
            child.position.distanceTo(node.position) < 3
        );
        if (sprite) {
            sprite.material.color.setHex(0xff0000);
            setTimeout(() => {
                sprite.material.color.setHex(0xffffff);
            }, 200);
        }
        
        return node;
    }
    
    update(ctx) {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        const interactableEntities = this.world.queryByTag('storyNode');
        const interactableMeshes = [...interactableEntities].map(e => e.object3D);

        const intersects = this.raycaster.intersectObjects(interactableMeshes);

        let intersectedEntity = null;
        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            // Find the entity that owns this mesh
            intersectedEntity = [...interactableEntities].find(e => e.object3D === mesh) || null;
        }

        // Manage the Hovered component
        if (this.currentlyHovered && this.currentlyHovered !== intersectedEntity) {
            if (this.currentlyHovered.has(Hovered)) {
                this.currentlyHovered.remove(Hovered);
            }
        }

        if (intersectedEntity && !intersectedEntity.has(Hovered)) {
            intersectedEntity.add(new Hovered());
        }

        this.currentlyHovered = intersectedEntity;
    }

    advanceStory() {
        if (this.storyEngine.canAdvance()) {
            this.storyEngine.advance();
        }
    }
}

export { InteractionSystem };
