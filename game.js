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
            this.setupStoryManager();
            this.setupUIManager();
            this.setupWorld();
            this.setupSystems();
            this.setupEventListeners();
            this.setupAmbientAudio();
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
        this.uiManager = new UIManager();
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
    
    setupAmbientAudio() {
        try {
            const ambientAudio = document.getElementById('ambient-audio');
            const mysterySound = document.getElementById('mystery-sound');
            
            if (ambientAudio) {
                ambientAudio.volume = GAME_CONFIG.AUDIO.AMBIENT_VOLUME;
                const playPromise = ambientAudio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn('Failed to play ambient audio:', error);
                    });
                }
            }
            
            if (mysterySound) {
                mysterySound.volume = GAME_CONFIG.AUDIO.MYSTERY_VOLUME;
                const playPromise = mysterySound.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn('Failed to play mystery sound:', error);
                    });
                }
            }
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }
    
    startGameLoop() {
        this.animate();
    }
    
    showLoadingScreen() {
        setTimeout(() => {
            try {
                document.getElementById('loading-screen').style.opacity = '0';
                setTimeout(() => {
                    try {
                        const loadingScreen = document.getElementById('loading-screen');
                        if (loadingScreen) {
                            loadingScreen.style.display = 'none';
                        }
                        this.showCharacterSelect();
                    } catch (error) {
                        console.warn('Error hiding loading screen:', error);
                    }
                }, GAME_CONFIG.TIMERS.LOADING_SCREEN_HIDDEN);
            } catch (error) {
                console.warn('Error transitioning loading screen:', error);
            }
        }, GAME_CONFIG.TIMERS.LOADING_SCREEN_FADEOUT);
    }
    
    showCharacterSelect() {
        const modal = document.getElementById('character-select');
        if (modal) {
            modal.classList.remove('hidden');
            
            const cards = modal.querySelectorAll('.archetype-card');
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    const archetype = card.dataset.archetype;
                    this.storyManager.setPlayerArchetype(archetype);
                    modal.classList.add('hidden');
                    this.storyManager.beginStory();
                });
            });
        }
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
        const narratorText = document.getElementById('narrator-text');
        if (narratorText) {
            narratorText.innerHTML = `<p>${update.text}</p>`;
            if (update.effects.includes('glitch')) {
                narratorText.classList.add('glitch');
                setTimeout(() => narratorText.classList.remove('glitch'), GAME_CONFIG.TIMERS.GLITCH_EFFECT);
            }
        }
        
        this.updatePlayerInfo();
    }
    
    handleDecisionRequired(decisions) {
        const container = document.getElementById('decision-buttons');
        if (!container) return;
        
        container.innerHTML = '';
        decisions.forEach((decision, index) => {
            const button = document.createElement('button');
            button.className = 'decision-btn';
            button.textContent = decision.text;
            button.addEventListener('click', () => {
                this.storyManager.makeDecision(index);
                container.innerHTML = '';
            });
            container.appendChild(button);
        });
    }
    
    handleEnvironmentChange(change) {
        if (this.environmentalEffects) {
            this.environmentalEffects.updateStoryWeather(change.consequence);
        }
    }
    
    updatePlayerInfo() {
        const elements = {
            'player-name': this.storyManager.playerData.name,
            'player-archetype': this.storyManager.playerData.archetype,
            'current-day': this.storyManager.playerData.day,
            'sanity-level': `${this.storyManager.playerData.sanity}%`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
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
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: 'Courier New', monospace;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});

export { Game };