import * as THREE from 'three';
import SoundManager from './sound-manager.js';

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
            } else if (object.userData.type === 'lore_fragment' && !object.userData.triggered) {
                this.triggerLoreFragment(object);
                return object;
            } else if (object.userData.type === 'lever') {
                this.triggerLever(object);
                return object; // Or null if no further game-world interaction needed from this
            }
        }
        return null;
    }

    triggerLever(leverNode) {
        if (!leverNode || !leverNode.userData || !this.storyEngine) return;

        leverNode.userData.triggered = !leverNode.userData.triggered; // Toggle state

        // Visual feedback for the handle (assuming handle is children[1])
        if (leverNode.children && leverNode.children.length > 1) {
            const handle = leverNode.children[1];
            handle.rotation.x = leverNode.userData.triggered ? -Math.PI / 4 : Math.PI / 4;
        }

        // Update global story flag
        if (leverNode.userData.id) {
            this.storyEngine.updateFlag(`${leverNode.userData.id}_pulled`, leverNode.userData.triggered);
        }

        SoundManager.playSound(leverNode.userData.triggered ? 'lever_on' : 'lever_off');

        // Log the interaction
        this.storyEngine.logEvent(
            `Lever ${leverNode.userData.id || ''} ${leverNode.userData.triggered ? 'activated' : 'deactivated'}`,
            'interaction'
        );
        return leverNode;
    }
    
    triggerLoreFragment(fragmentNode) {
        fragmentNode.userData.triggered = true;

        // Log the lore discovery
        if (this.storyEngine && fragmentNode.userData.title && fragmentNode.userData.loreText) {
            this.storyEngine.logEvent(
                `${fragmentNode.userData.title}: ${fragmentNode.userData.loreText}`,
                'lore_discovery'
            );
        }
        SoundManager.playSound('lore_pickup');

        // Visual feedback: make it dimmer or change color
        if (fragmentNode.material && fragmentNode.material.emissive) {
            // Ensure emissiveIntensity doesn't go below a certain threshold if repeatedly applied
            fragmentNode.material.emissiveIntensity = Math.max(0.1, fragmentNode.material.emissiveIntensity * 0.2);
        } else if (fragmentNode.material) {
            // Fallback if no emissive: make it more transparent or change opacity
            if (fragmentNode.material.hasOwnProperty('opacity')) {
                 fragmentNode.material.opacity *= 0.5;
                 fragmentNode.material.transparent = true; // Ensure transparency is enabled
            }
        }
        // Optional: Could also play a sound effect here via storyEngine or uiManager
        return fragmentNode;
    }

    triggerStoryNode(node) {
        node.userData.triggered = true;
        
        // Visual feedback
        node.material.emissive.setHex(0x333333); // Assuming story nodes can have emissive
        
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
