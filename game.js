import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
// import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'; // If needed later
import { StoryEngine } from './story.js';
import { UIManager } from './ui.js';
import { WorldBuilder } from './world-builder.js';
import { InteractionSystem } from './interaction-system.js';
import { ControlsManager } from './controls.js';
import { EnvironmentalStorytellingSystem } from './environmental-storytelling.js';
import { StoryDNASystem } from './story-dna.js';
import { StoryArchaeologySystem } from './story-archaeology.js';
import { EnvironmentalEffectsSystem } from './environmental-effects.js';

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

        this.composer = null;
        this.sanityShaderPass = null;
        
        this.init();
    }
    
    init() {
        try {
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupControls();
            this.setupStoryEngine();
            this.setupUIManager();
            this.setupWorld();
            this.setupInteractionSystem();
            this.setupEnvironmentalSystems();
            this.setupPostProcessing(); // Setup post-processing
            this.setupEventListeners();
            this.setupAmbientAudio();
            this.startGameLoop();
            this.showLoadingScreen();
            this.isInitialized = true;
        } catch (error) {
            console.error('Critical error initializing game:', error);
            this.showErrorMessage('Failed to initialize game. Please refresh the page.');
            // Attempt minimal initialization
            this.initMinimalGame();
        }
    }
    
    setupPostProcessing() {
        try {
            this.composer = new EffectComposer(this.renderer);
            this.composer.addPass(new RenderPass(this.scene, this.camera));

            const sanityEffectShader = {
                uniforms: {
                    'tDiffuse': { value: null },
                    'sanityLevel': { value: 1.0 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform sampler2D tDiffuse;
                    uniform float sanityLevel;  // Range 0.0 (low sanity) to 1.0 (high sanity)
                    varying vec2 vUv;

                    void main() {
                        vec4 color = texture2D(tDiffuse, vUv);

                        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                        color.rgb = mix(vec3(gray), color.rgb, sanityLevel);

                        float vignetteStrength = (1.0 - sanityLevel) * 0.5;
                        float dist = distance(vUv, vec2(0.5));
                        color.rgb *= smoothstep(0.8, 0.2 - vignetteStrength * 0.1, dist * (1.0 + vignetteStrength));

                        if (sanityLevel < 0.3) {
                            float noise = (fract(sin(dot(vUv, vec2(12.9898,78.233)*2.0) + sanityLevel) * 43758.5453) - 0.5) * 0.15 * (1.0 - sanityLevel);
                            color.rgb += noise;
                        }

                        gl_FragColor = color;
                    }
                `
            };

            this.sanityShaderPass = new ShaderPass(sanityEffectShader);
            this.composer.addPass(this.sanityShaderPass);

            // If color issues arise (e.g., scene too dark/light), an OutputPass might be needed.
            // const outputPass = new OutputPass();
            // this.composer.addPass(outputPass);

        } catch (error) {
            console.error('Error setting up post-processing:', error);
            this.sanityShaderPass = null; // Ensure it's null if setup fails
            this.composer = null;
        }
    }

    initMinimalGame() {
        try {
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupControls();
            this.setupStoryEngine();
            this.setupUIManager();
            this.startGameLoop();
            this.showLoadingScreen();
        } catch (error) {
            console.error('Even minimal game initialization failed:', error);
            this.showErrorMessage('A critical error occurred during minimal game initialization. The game may not function correctly. Please try refreshing the page.');
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
        this.storyEngine.onWorldEventRequired = this.handleWorldEvent.bind(this); // New callback assignment
    }
    
    handleWorldEvent(eventName) {
        if (!this.worldBuilder) {
            console.warn("WorldBuilder not available to handle world event:", eventName);
            return;
        }

        console.log(`Game handling world event: ${eventName}`); // For debugging

        if (eventName === 'event_clock_smashed') {
            if (typeof this.worldBuilder.makeClockBroken === 'function') {
                this.worldBuilder.makeClockBroken();
            } else {
                console.warn("worldBuilder.makeClockBroken is not a function");
            }
            if (typeof this.worldBuilder.affectSurrealObjects === 'function') {
                this.worldBuilder.affectSurrealObjects('chaos_pulse');
            } else {
                console.warn("worldBuilder.affectSurrealObjects is not a function");
            }
        }
        // Add other world events here later
    }

    setupUIManager() {
        this.uiManager = new UIManager();
    }
    
    setupWorld() {
        this.worldBuilder = new WorldBuilder(this.scene);
        this.worldBuilder.createWorld();
    }
    
    setupInteractionSystem() {
        this.interactionSystem = new InteractionSystem(
            this.scene, 
            this.camera, 
            this.storyEngine
        );
        this.interactionSystem.setInteractableObjects(
            this.worldBuilder.getInteractableObjects()
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

        window.addEventListener('mobile-next', () => {
            // Similar to space bar, advance story if possible
            this.interactionSystem.advanceStory();
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
            let applyGlitch = update.effects.includes('glitch');

            // Check sanity for additional glitch chance
            if (this.storyEngine && this.storyEngine.playerData && this.storyEngine.playerData.sanity < 30) {
                if (Math.random() < 0.5) { // 50% chance to glitch text at low sanity
                    applyGlitch = true;
                }
            }

            if (applyGlitch) {
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
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        try {
            const deltaTime = this.clock.getDelta();
            const elapsedTime = this.clock.getElapsedTime();
            
            if (this.controlsManager && typeof this.controlsManager.update === 'function') {
                this.controlsManager.update(deltaTime);
            }
            
            if (this.environmentalStorytelling && typeof this.environmentalStorytelling.update === 'function') {
                this.environmentalStorytelling.update(deltaTime, elapsedTime, this.camera);
            }
            
            if (this.storyDNASystem && typeof this.storyDNASystem.update === 'function') {
                this.storyDNASystem.update(deltaTime, elapsedTime);
            }
            
            if (this.storyArchaeology && typeof this.storyArchaeology.update === 'function') {
                this.storyArchaeology.update(deltaTime, elapsedTime);
            }
            
            if (this.environmentalEffects && typeof this.environmentalEffects.update === 'function') {
                this.environmentalEffects.update(deltaTime, elapsedTime);
            }
            
            this.updateDynamicGround(elapsedTime);
            this.updateSurrealObjects(deltaTime, elapsedTime);

            // Update sanity shader uniform
            if (this.sanityShaderPass && this.storyEngine && this.storyEngine.playerData) {
                const currentSanity = this.storyEngine.playerData.sanity;
                this.sanityShaderPass.uniforms.sanityLevel.value = Math.max(0, Math.min(100, currentSanity)) / 100.0;
            }
            
            if (this.composer) {
                this.composer.render(deltaTime);
            } else if (this.renderer && this.scene && this.camera) { // Fallback if composer failed
                this.renderer.render(this.scene, this.camera);
            }
        } catch (error) {
            console.warn('Error in animation loop:', error);
            // Continue the animation loop even if there's an error
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