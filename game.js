import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { StoryManager } from './story.js';
import { UIManager } from './ui.js';
import { WorldBuilder } from './world-builder.js';
import { InteractionSystem } from './interaction-system.js';
import { ControlsManager } from './controls.js';
import { EnvironmentalStorytellingSystem } from './environmental-storytelling.js';
import { StoryDNASystem } from './story-dna.js';
import { StoryArchaeologySystem } from './story-archaeology.js';
import { EnvironmentalEffectsSystem } from './environmental-effects.js';

const GAME_CONFIG = {
    FOG: {
        COLOR: 0x1a1a2e,
        NEAR: 10,
        FAR: 100,
    },
    AMBIENT_LIGHT: {
        COLOR: 0x404040,
        INTENSITY: 0.3,
    },
    DIRECTIONAL_LIGHT: {
        COLOR: 0xffffff,
        INTENSITY: 0.6,
        POSITION: { x: 10, y: 10, z: 5 },
    },
    CAMERA: {
        POSITION: { x: 0, y: 2, z: 5 },
    },
    RENDERER: {
        CLEAR_COLOR: 0x1a1a2e,
    },
    TIMERS: {
        LOADING_SCREEN_FADEOUT: 2000,
        LOADING_SCREEN_HIDDEN: 500,
        GLITCH_EFFECT: 1000,
    },
    AUDIO: {
        AMBIENT_VOLUME: 0.3,
        MYSTERY_VOLUME: 0.1,
    },
};

class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.storyManager = null;
        this.uiManager = null;
        this.worldBuilder = null;
        this.interactionSystem = null;
        this.systems = [];
        this.clock = new THREE.Clock();
        this.isInitialized = false;
        
        this.init();
    }

    _initializeSystem(systemClass, propertyName, ...args) {
        try {
            const system = new systemClass(...args);
            this[propertyName] = system;
            this.systems.push(system);
        } catch (error) {
            console.warn(`Error creating ${propertyName}:`, error);
            this[propertyName] = null;
        }
    }
    
    init() {
        try {
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupUIManager();
            this.setupStoryManager();
            this.setupWorld();
            this.setupSystems();
            this.setupEventListeners();
            this.startGameLoop();
            this.showLoadingScreen();
            this.isInitialized = true;
        } catch (error) {
            console.error('Critical error initializing game:', error);
            this.showErrorMessage('Failed to initialize game. Please refresh the page.');
        }
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(
            GAME_CONFIG.FOG.COLOR,
            GAME_CONFIG.FOG.NEAR,
            GAME_CONFIG.FOG.FAR
        );
        
        const ambientLight = new THREE.AmbientLight(
            GAME_CONFIG.AMBIENT_LIGHT.COLOR,
            GAME_CONFIG.AMBIENT_LIGHT.INTENSITY
        );
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(
            GAME_CONFIG.DIRECTIONAL_LIGHT.COLOR,
            GAME_CONFIG.DIRECTIONAL_LIGHT.INTENSITY
        );
        directionalLight.position.set(
            GAME_CONFIG.DIRECTIONAL_LIGHT.POSITION.x,
            GAME_CONFIG.DIRECTIONAL_LIGHT.POSITION.y,
            GAME_CONFIG.DIRECTIONAL_LIGHT.POSITION.z
        );
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(
            GAME_CONFIG.CAMERA.POSITION.x,
            GAME_CONFIG.CAMERA.POSITION.y,
            GAME_CONFIG.CAMERA.POSITION.z
        );
    }
    
    setupRenderer() {
        const canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(GAME_CONFIG.RENDERER.CLEAR_COLOR, 1);
    }
    
    setupStoryManager() {
        this.storyManager = new StoryManager();
        this.storyManager.onStoryUpdate = this.handleStoryUpdate.bind(this);
        this.storyManager.onDecisionRequired = this.handleDecisionRequired.bind(this);
        this.storyManager.onEnvironmentChange = this.handleEnvironmentChange.bind(this);
    }
    
    setupUIManager() {
        this.uiManager = new UIManager(GAME_CONFIG);
    }
    
    setupWorld() {
        this.worldBuilder = new WorldBuilder(this.scene);
        this.worldBuilder.createWorld();
    }
    
    setupSystems() {
        this.controls = new PointerLockControls(this.camera, document.body);
        this._initializeSystem(ControlsManager, 'controlsManager', this.camera, this.controls);
        
        this._initializeSystem(InteractionSystem, 'interactionSystem', this.scene, this.camera, this.storyManager);
        if(this.interactionSystem) {
            this.interactionSystem.setInteractableObjects(this.worldBuilder.getInteractableObjects());
        }

        this._initializeSystem(EnvironmentalStorytellingSystem, 'environmentalStorytelling', this.scene, this.storyManager);
        this._initializeSystem(StoryDNASystem, 'storyDNASystem', this.scene);
        this._initializeSystem(StoryArchaeologySystem, 'storyArchaeology', this.scene, this.uiManager);
        this._initializeSystem(EnvironmentalEffectsSystem, 'environmentalEffects', this.scene);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        document.addEventListener('click', () => {
            if (!this.controls.isLocked) {
                this.controls.lock();
            } else {
                this.handleInteraction();
            }
        });
        
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                if (this.interactionSystem) {
                    this.interactionSystem.advanceStory();
                }
            }
        });
        
        window.addEventListener('mobile-interaction', () => {
            this.handleInteraction();
        });
    }
    
    startGameLoop() {
        this.animate();
    }
    
    showLoadingScreen() {
        this.uiManager.showLoadingScreen(GAME_CONFIG.TIMERS.LOADING_SCREEN_FADEOUT, () => {
            this.showCharacterSelect();
        });
    }
    
    showCharacterSelect() {
        this.uiManager.showCharacterSelection((archetype) => {
            this.storyManager.setPlayerArchetype(archetype);
            this.storyManager.beginStory();
        });
    }
    
    handleInteraction() {
        if (this.storyManager.isWaitingForDecision) return;
        
        try {
            if (!this.interactionSystem) return;
            const interactedObject = this.interactionSystem.handleInteraction();
            if (interactedObject) {
                if (this.environmentalStorytelling && typeof this.environmentalStorytelling.activateMemoryPool === 'function') {
                    this.environmentalStorytelling.activateMemoryPool(
                        interactedObject.userData.storyType, 
                        interactedObject.position
                    );
                }
                
                if (this.storyArchaeology && typeof this.storyArchaeology.recordChoiceInArchaeology === 'function') {
                    this.storyArchaeology.recordChoiceInArchaeology(
                        interactedObject, 
                        this.storyDNASystem
                    );
                }
                
                if (this.environmentalEffects && typeof this.environmentalEffects.updateStoryWeather === 'function') {
                    this.environmentalEffects.updateStoryWeather(
                        interactedObject.userData.storyType
                    );
                }
            }
        } catch (error) {
            console.warn('Error in handleInteraction:', error);
        }
    }
    
    handleStoryUpdate(update) {
        this.uiManager.updateNarratorText(update);
        this.uiManager.updatePlayerInfo(this.storyManager.playerData);
    }
    
    handleDecisionRequired(decisions) {
        this.uiManager.showDecisionButtons(decisions, (index) => {
            this.storyManager.makeDecision(index);
        });
    }
    
    handleEnvironmentChange(change) {
        if (this.environmentalEffects) {
            this.environmentalEffects.updateStoryWeather(change.consequence);
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        try {
            const deltaTime = this.clock.getDelta();
            const elapsedTime = this.clock.getElapsedTime();
            
            for (const system of this.systems) {
                if (system && typeof system.update === 'function') {
                    system.update(deltaTime, elapsedTime, this.camera);
                }
            }
            
            this.updateDynamicGround(elapsedTime);
            this.updateSurrealObjects(deltaTime, elapsedTime);
            
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        } catch (error) {
            console.warn('Error in animation loop:', error);
        }
    }
    
    updateDynamicGround(elapsedTime) {
        const ground = this.scene.children.find(child => 
            child.userData && child.userData.type === 'dynamicGround'
        );
        if (ground && ground.userData.material.uniforms) {
            ground.userData.material.uniforms.time.value = elapsedTime;
            ground.userData.material.uniforms.playerPos.value.copy(this.camera.position);
        }
    }
    
    updateSurrealObjects(deltaTime, elapsedTime) {
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.rotationSpeed !== undefined) {
                child.rotation.y += child.userData.rotationSpeed;
                child.position.y += Math.sin(elapsedTime * child.userData.floatSpeed) * 0.01;
            }
        });
    }
    
    showErrorMessage(message) {
        this.uiManager.showErrorMessage(message);
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});

export { Game };