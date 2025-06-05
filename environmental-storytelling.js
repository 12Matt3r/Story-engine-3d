import * as THREE from 'three';
import { NarratorManifestations } from './narrator-manifestations.js';
import { EnvironmentalSystems } from './environmental-systems.js';

class EnvironmentalStorytellingSystem {
    constructor(scene, storyEngine) {
        this.scene = scene;
        this.storyEngine = storyEngine;
        
        this.narratorManifestations = new NarratorManifestations(scene);
        this.environmentalSystems = new EnvironmentalSystems(scene);
    }
    
    update(deltaTime, elapsedTime, camera) {
        try {
            if (this.narratorManifestations && typeof this.narratorManifestations.update === 'function') {
                this.narratorManifestations.update(deltaTime, elapsedTime, camera, this.storyEngine);
            }
        } catch (error) {
            console.error('Error updating narrator manifestations:', error);
        }
        
        try {
            if (this.environmentalSystems) {
                if (typeof this.environmentalSystems.updateMemoryPools === 'function') {
                    this.environmentalSystems.updateMemoryPools(deltaTime, elapsedTime);
                }
                if (typeof this.environmentalSystems.updateStoryThreads === 'function') {
                    this.environmentalSystems.updateStoryThreads(deltaTime, elapsedTime);
                }
                if (typeof this.environmentalSystems.updateChoiceResonances === 'function') {
                    this.environmentalSystems.updateChoiceResonances(deltaTime, elapsedTime);
                }
                if (typeof this.environmentalSystems.updateEmotionalLights === 'function' && 
                    this.storyEngine && this.storyEngine.narratorPersonality) {
                    this.environmentalSystems.updateEmotionalLights(deltaTime, this.storyEngine.narratorPersonality);
                }
            }
        } catch (error) {
            console.error('Error updating environmental systems:', error);
        }
    }
    
    activateMemoryPool(choice, position) {
        try {
            if (this.environmentalSystems && typeof this.environmentalSystems.activateMemoryPool === 'function') {
                this.environmentalSystems.activateMemoryPool(choice, position);
            }
        } catch (error) {
            console.error('Error activating memory pool:', error);
        }
    }
    
    activateStoryThread(choice) {
        try {
            if (this.environmentalSystems && typeof this.environmentalSystems.activateStoryThread === 'function') {
                this.environmentalSystems.activateStoryThread(choice);
            }
        } catch (error) {
            console.error('Error activating story thread:', error);
        }
    }
    
    activateChoiceResonance(choice) {
        try {
            if (this.environmentalSystems && typeof this.environmentalSystems.activateChoiceResonance === 'function') {
                this.environmentalSystems.activateChoiceResonance(choice);
            }
        } catch (error) {
            console.error('Error activating choice resonance:', error);
        }
    }
}

export { EnvironmentalStorytellingSystem };