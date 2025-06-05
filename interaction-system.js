import * as THREE from 'three';

class InteractionSystem {
    constructor(scene, camera, storyEngine) {
        this.scene = scene;
        this.camera = camera;
        this.storyEngine = storyEngine;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.interactableObjects = [];
    }
    
    setInteractableObjects(objects) {
        this.interactableObjects = objects;
    }
    
    handleInteraction() {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactableObjects);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData.type === 'storyNode' && !object.userData.triggered) {
                this.triggerStoryNode(object);
                return object;
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
        const sprite = node.userData.textSprite; // Retrieve sprite from userData
        if (sprite && sprite.material) { // Check if sprite and material exist
            sprite.material.color.setHex(0xff0000);
            setTimeout(() => {
                if (sprite.material) { // Check material again in async callback
                    sprite.material.color.setHex(0xffffff);
                }
            }, 200);
        }
        
        return node;
    }
    
    advanceStory() {
        if (this.storyEngine.canAdvance()) {
            this.storyEngine.advance();
        }
    }
}

export { InteractionSystem };
