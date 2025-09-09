import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { StoryEngine } from './story.js';
import { UIManager } from './ui.js';
import { WorldBuilder, createSurrealCube } from './src/world/world-builder.js';
import { InteractionSystem } from './interaction-system.js';
import { ControlsManager } from './controls.js';
import { EnvironmentalStorytellingSystem } from './environmental-storytelling.js';
import { StoryDNASystem } from './story-dna.js';
import { StoryArchaeologySystem } from './story-archaeology.js';
import { EnvironmentalEffectsSystem } from './environmental-effects.js';
import { World } from './src/ecs/World.js';
import { Interactable } from './src/components/Interactable.js';

const world = new World();

class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.storyEngine = null;
        this.uiManager = null;
        this.worldBuilder = null;
        this.interactionSystem = null;
        this.controlsManager = null;
        this.clock = new THREE.Clock();
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        try {
            this.setupScene();
            this.initScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupControls();
            this.setupStoryEngine();
            this.setupUIManager();
            this.setupWorld();
            this.setupInteractionSystem();
            this.setupEnvironmentalSystems();
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

    initScene() {
        // Example: spawn a few cubes
        for (let i = 0; i < 8; i++) {
            const e = createSurrealCube({
                size: 1 + Math.random() * 0.6,
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.55),
                rotate: { speed: 0.4 + Math.random() * 1.2, axis: Math.random() > 0.5 ? 'y' : 'x' },
                float: { amplitude: 0.2 + Math.random() * 0.5, speed: 0.6 + Math.random() * 1.0, phase: Math.random() * Math.PI * 2 }
            });
            e.object3D.position.set((i - 4) * 2, 1.5, -4 - Math.random() * 3);
            world.addEntity(e, { tags: ['surreal', 'cube'] });
            this.scene.add(e.object3D);
        }
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x1a1a2e, 10, 100);
        
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(10, 10, 5);
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
        this.camera.position.set(0, 2, 5);
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
        this.renderer.setClearColor(0x1a1a2e, 1);
    }

    setupControls() {
        this.controls = new PointerLockControls(this.camera, document.body);
        this.controlsManager = new ControlsManager(this.camera, this.controls);
    }
    
    setupStoryEngine() {
        this.storyEngine = new StoryEngine();
        this.storyEngine.onStoryUpdate = this.handleStoryUpdate.bind(this);
        this.storyEngine.onDecisionRequired = this.handleDecisionRequired.bind(this);
        this.storyEngine.onEnvironmentChange = this.handleEnvironmentChange.bind(this);
    }
    
    setupUIManager() {
        this.uiManager = new UIManager();
    }
    
    setupWorld() {
        this.worldBuilder = new WorldBuilder(this.scene, world);
        this.worldBuilder.createWorld(this.camera);
    }
    
    setupInteractionSystem() {
        this.interactionSystem = new InteractionSystem(
            this.scene,
            this.camera,
            this.storyEngine,
            world
        );
    }

    setupEnvironmentalSystems() {
        try {
            this.environmentalStorytelling = new EnvironmentalStorytellingSystem(
                this.scene,
                this.storyEngine
            );
        } catch (error) {
            console.warn('Error creating environmental storytelling:', error);
            this.environmentalStorytelling = null;
        }

        try {
            this.storyDNASystem = new StoryDNASystem(this.scene);
        } catch (error) {
            console.warn('Error creating story DNA system:', error);
            this.storyDNASystem = null;
        }
        
        try {
            this.storyArchaeology = new StoryArchaeologySystem(this.scene, this.uiManager);
        } catch (error) {
            console.warn('Error creating story archaeology:', error);
            this.storyArchaeology = null;
        }

        try {
            this.environmentalEffects = new EnvironmentalEffectsSystem(this.scene);
        } catch (error) {
            console.warn('Error creating environmental effects:', error);
            this.environmentalEffects = null;
        }
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
                this.interactionSystem.advanceStory();
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
                ambientAudio.volume = 0.3;
                const playPromise = ambientAudio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn('Failed to play ambient audio:', error);
                    });
                }
            }

            if (mysterySound) {
                mysterySound.volume = 0.1;
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
                }, 500);
            } catch (error) {
                console.warn('Error transitioning loading screen:', error);
            }
        }, 2000);
    }
    
    showCharacterSelect() {
        const modal = document.getElementById('character-select');
        if (modal) {
            modal.classList.remove('hidden');

            const cards = modal.querySelectorAll('.archetype-card');
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    const archetype = card.dataset.archetype;
                    this.storyEngine.setPlayerArchetype(archetype);
                    modal.classList.add('hidden');
                    this.storyEngine.beginStory();
                });
            });
        }
    }
    
    handleInteraction() {
        if (this.storyEngine.isWaitingForDecision) return;
        
        try {
            const interactedObject = this.interactionSystem.handleInteraction();
            if (interactedObject) {
                if (this.environmentalStorytelling && typeof this.environmentalStorytelling.activateMemoryPool === 'function') {
                    this.environmentalStorytelling.activateMemoryPool(
                        interactedObject.get(Interactable).storyType,
                        interactedObject.object3D.position
                    );
                }
                
                if (this.storyArchaeology && typeof this.storyArchaeology.recordChoiceInArchaeology === 'function') {
                    this.storyArchaeology.recordChoiceInArchaeology(
                        interactedObject.object3D,
                        this.storyDNASystem
                    );
                }
                
                if (this.environmentalEffects && typeof this.environmentalEffects.updateStoryWeather === 'function') {
                    this.environmentalEffects.updateStoryWeather(
                        interactedObject.get(Interactable).storyType
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
                setTimeout(() => narratorText.classList.remove('glitch'), 1000);
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
                this.storyEngine.makeDecision(index);
                container.innerHTML = '';
            });
            container.appendChild(button);
        });
    }
    
    handleEnvironmentChange(change) {
        this.environmentalEffects.updateStoryWeather(change.consequence);
    }

    updatePlayerInfo() {
        const elements = {
            'player-name': this.storyEngine.playerData.name,
            'player-archetype': this.storyEngine.playerData.archetype,
            'current-day': this.storyEngine.playerData.day,
            'sanity-level': `${this.storyEngine.playerData.sanity}%`
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
            
            if (this.controlsManager && typeof this.controlsManager.update === 'function') {
                this.controlsManager.update(deltaTime);
            }

            if (this.environmentalStorytelling && typeof this.environmentalStorytelling.update === 'function') {
                this.environmentalStorytelling.update(deltaTime, this.clock.getElapsedTime(), this.camera);
            }

            if (this.storyDNASystem && typeof this.storyDNASystem.update === 'function') {
                this.storyDNASystem.update(deltaTime, this.clock.getElapsedTime());
            }

            if (this.storyArchaeology && typeof this.storyArchaeology.update === 'function') {
                this.storyArchaeology.update(deltaTime, this.clock.getElapsedTime());
            }

            if (this.environmentalEffects && typeof this.environmentalEffects.update === 'function') {
                this.environmentalEffects.update(deltaTime, this.clock.getElapsedTime());
            }
            
            world.update(deltaTime);
            
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        } catch (error) {
            console.warn('Error in animation loop:', error);
        }
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