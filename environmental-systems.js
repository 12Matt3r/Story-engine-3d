import * as THREE from 'three';

class EnvironmentalSystems {
    constructor(scene) {
        this.scene = scene;
        this.memoryPools = [];
        this.storyThreads = [];
        this.choiceResonances = [];
        this.emotionalLights = [];
        
        this.init();
    }
    
    init() {
        this.createMemoryPools();
        this.createStoryThreads();
        this.createChoiceResonances();
        this.createEmotionalLights();
    }
    
    createEmotionalLights() {
        for (let i = 0; i < 6; i++) {
            const emotionalLight = new THREE.PointLight(0x888888, 0.3, 15);
            emotionalLight.position.set(
                (Math.random() - 0.5) * 50,
                5 + Math.random() * 3,
                (Math.random() - 0.5) * 50
            );
            emotionalLight.userData = {
                baseIntensity: 0.3,
                pulsePhase: Math.random() * Math.PI * 2
            };
            this.scene.add(emotionalLight);
            this.emotionalLights.push(emotionalLight);
        }
    }
    
    createMemoryPools() {
        for (let i = 0; i < 4; i++) {
            const poolGroup = new THREE.Group();
            
            const poolGeometry = new THREE.CircleGeometry(3, 32);
            const poolMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    rippleIntensity: { value: 0 },
                    memoryColor: { value: new THREE.Color(0x4488aa) }
                },
                vertexShader: `
                    uniform float time;
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        vec3 pos = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform float rippleIntensity;
                    uniform vec3 memoryColor;
                    varying vec2 vUv;
                    void main() {
                        vec2 center = vec2(0.5);
                        float dist = distance(vUv, center);
                        float ripple = sin(dist * 20.0 - time * 5.0) * rippleIntensity;
                        vec3 color = memoryColor + ripple * 0.3;
                        float alpha = 0.6 + ripple * 0.4;
                        gl_FragColor = vec4(color, alpha);
                    }
                `,
                transparent: true
            });
            
            const pool = new THREE.Mesh(poolGeometry, poolMaterial);
            pool.rotation.x = -Math.PI / 2;
            poolGroup.add(pool);
            
            const fragments = [];
            for (let j = 0; j < 5; j++) {
                const fragmentGeometry = new THREE.TetrahedronGeometry(0.2);
                const fragmentMaterial = new THREE.MeshBasicMaterial({
                    color: 0x88aaff,
                    transparent: true,
                    opacity: 0
                });
                const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
                fragment.position.set(
                    (Math.random() - 0.5) * 6,
                    Math.random() * 2 + 1,
                    (Math.random() - 0.5) * 6
                );
                poolGroup.add(fragment);
                fragments.push(fragment);
            }
            
            poolGroup.position.set(
                (Math.random() - 0.5) * 60,
                0,
                (Math.random() - 0.5) * 60
            );
            
            poolGroup.userData = {
                type: 'memoryPool',
                showingMemory: false,
                rippleTimer: 0,
                lastChoice: null,
                material: poolMaterial,
                fragments: fragments
            };
            
            this.scene.add(poolGroup);
            this.memoryPools.push(poolGroup);
        }
    }
    
    createStoryThreads() {
        for (let i = 0; i < 6; i++) {
            const threadGroup = new THREE.Group();
            
            const points = [];
            for (let j = 0; j < 10; j++) {
                points.push(new THREE.Vector3(
                    j * 2 + (Math.random() - 0.5),
                    Math.sin(j * 0.5) * 2 + 2,
                    (Math.random() - 0.5) * 2
                ));
            }
            
            const threadGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const threadMaterial = new THREE.LineBasicMaterial({
                color: 0x8888aa,
                transparent: true,
                opacity: 0.05
            });
            const threadLine = new THREE.Line(threadGeometry, threadMaterial);
            threadGroup.add(threadLine);
            
            const nodes = [];
            points.forEach((point, index) => {
                if (index % 3 === 0) {
                    const nodeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
                    const nodeMaterial = new THREE.MeshBasicMaterial({
                        color: 0xaaaaff,
                        transparent: true,
                        opacity: 0
                    });
                    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
                    node.position.copy(point);
                    threadGroup.add(node);
                    nodes.push(node);
                }
            });
            
            threadGroup.position.set(
                (Math.random() - 0.5) * 40,
                0,
                (Math.random() - 0.5) * 40
            );
            
            threadGroup.userData = {
                type: 'storyThread',
                connectionStrength: 0,
                connectedChoices: [],
                pulsePhase: 0,
                threadLine: threadLine,
                nodes: nodes
            };
            
            this.scene.add(threadGroup);
            this.storyThreads.push(threadGroup);
        }
    }
    
    createChoiceResonances() {
        for (let i = 0; i < 3; i++) {
            const resonanceGroup = new THREE.Group();
            
            const coreGeometry = new THREE.IcosahedronGeometry(0.5);
            const coreMaterial = new THREE.MeshBasicMaterial({
                color: 0x4488aa,
                transparent: true,
                opacity: 0.3
            });
            const core = new THREE.Mesh(coreGeometry, coreMaterial);
            resonanceGroup.add(core);
            
            const echoes = [];
            for (let j = 0; j < 3; j++) {
                const echoGeometry = new THREE.OctahedronGeometry(0.2);
                const echoMaterial = new THREE.MeshBasicMaterial({
                    color: 0x6666cc,
                    transparent: true,
                    opacity: 0
                });
                const echoMesh = new THREE.Mesh(echoGeometry, echoMaterial);
                
                const echo = {
                    mesh: echoMesh,
                    angle: (j / 3) * Math.PI * 2,
                    radius: 2 + j * 0.5,
                    speed: 0.5 + j * 0.2,
                    choice: null
                };
                
                resonanceGroup.add(echoMesh);
                echoes.push(echo);
            }
            
            resonanceGroup.position.set(
                (Math.random() - 0.5) * 70,
                2,
                (Math.random() - 0.5) * 70
            );
            
            resonanceGroup.userData = {
                type: 'choiceResonance',
                activeChoices: 0,
                resonanceLevel: 0,
                lastActivation: 0,
                core: core,
                echoes: echoes
            };
            
            this.scene.add(resonanceGroup);
            this.choiceResonances.push(resonanceGroup);
        }
    }
    
    updateMemoryPools(deltaTime, elapsedTime) {
        this.memoryPools.forEach(memoryPool => {
            if (!memoryPool || !memoryPool.userData) return;
            
            const poolData = memoryPool.userData;
            if (poolData.material && poolData.material.uniforms && poolData.material.uniforms.time) {
                poolData.material.uniforms.time.value = elapsedTime;
            }
            
            if (poolData.showingMemory) {
                poolData.rippleTimer += deltaTime;
                if (poolData.material && poolData.material.uniforms && poolData.material.uniforms.rippleIntensity) {
                    poolData.material.uniforms.rippleIntensity.value = Math.sin(poolData.rippleTimer) * 0.5 + 0.5;
                }
                
                if (poolData.fragments && Array.isArray(poolData.fragments)) {
                    poolData.fragments.forEach((fragment, index) => {
                        if (!fragment || !fragment.material || !fragment.position) return;
                        
                        fragment.material.opacity = Math.min(0.8, fragment.material.opacity + deltaTime);
                        fragment.position.y += Math.sin(elapsedTime * 2 + index) * 0.01;
                        if (fragment.rotation) fragment.rotation.y += deltaTime;
                    });
                }
                
                if (poolData.rippleTimer > 15) {
                    poolData.showingMemory = false;
                    poolData.rippleTimer = 0;
                    poolData.lastChoice = null;
                }
            }
        });
    }
    
    updateStoryThreads(deltaTime, elapsedTime) {
        this.storyThreads.forEach(thread => {
            if (!thread || !thread.userData) return;
            
            const threadData = thread.userData;
            threadData.pulsePhase += deltaTime;
            
            if (threadData.connectionStrength > 0) {
                const pulseIntensity = Math.sin(threadData.pulsePhase * 2) * 0.3 + 0.7;
                if (threadData.threadLine && threadData.threadLine.material) {
                    threadData.threadLine.material.opacity = threadData.connectionStrength * pulseIntensity * 0.5;
                }
                
                if (threadData.nodes && Array.isArray(threadData.nodes)) {
                    threadData.nodes.forEach((node, index) => {
                        if (!node || !node.material || !node.scale) return;
                        
                        const nodeOpacity = threadData.connectionStrength * (Math.sin(threadData.pulsePhase + index) * 0.3 + 0.7);
                        node.material.opacity = Math.max(0, nodeOpacity);
                        node.scale.setScalar(1 + Math.sin(threadData.pulsePhase * 3 + index) * 0.2);
                    });
                }
                
                threadData.connectionStrength = Math.max(0, threadData.connectionStrength - deltaTime * 0.1);
            }
        });
    }
    
    updateChoiceResonances(deltaTime, elapsedTime) {
        this.choiceResonances.forEach(resonance => {
            if (!resonance || !resonance.userData) return;
            
            const resonanceData = resonance.userData;
            
            if (resonanceData.activeChoices > 0) {
                if (resonanceData.core && resonanceData.core.rotation && resonanceData.core.material) {
                    resonanceData.core.rotation.y += deltaTime * (1 + resonanceData.resonanceLevel);
                    resonanceData.core.material.opacity = 0.3 + resonanceData.resonanceLevel * 0.4;
                }
                
                if (resonanceData.echoes && Array.isArray(resonanceData.echoes)) {
                    resonanceData.echoes.forEach((echo, index) => {
                        if (!echo || !echo.mesh) return;
                        
                        if (index < resonanceData.activeChoices) {
                            echo.angle += echo.speed * deltaTime;
                            const x = Math.cos(echo.angle) * echo.radius;
                            const z = Math.sin(echo.angle) * echo.radius;
                            const y = Math.sin(elapsedTime * 2 + index) * 0.3;
                            if (echo.mesh.position) echo.mesh.position.set(x, y, z);
                            if (echo.mesh.material) echo.mesh.material.opacity = Math.min(0.7, echo.mesh.material.opacity + deltaTime);
                            if (echo.mesh.rotation) echo.mesh.rotation.y += deltaTime * 2;
                        } else {
                            if (echo.mesh.material) echo.mesh.material.opacity = Math.max(0, echo.mesh.material.opacity - deltaTime);
                        }
                    });
                }
                
                if (Date.now() - resonanceData.lastActivation > 10000) {
                    resonanceData.activeChoices = Math.max(0, resonanceData.activeChoices - 1);
                    resonanceData.resonanceLevel = Math.max(0, resonanceData.resonanceLevel - 0.1);
                }
            }
        });
    }
    
    updateEmotionalLights(deltaTime, narratorPersonality) {
        if (!narratorPersonality) return;
        
        try {
            const narratorMood = narratorPersonality.mood;
            const narrativeStyle = narratorPersonality.narrativeStyle;
            
            this.emotionalLights.forEach(light => {
                if (!light || !light.userData) return;
                
                light.userData.pulsePhase += deltaTime * 2;
                
                const moodColors = {
                    neutral: 0x888888,
                    amused: 0x7ed321,
                    frustrated: 0xff8888,
                    concerned: 0x8888ff,
                    fascinated: 0xffff88,
                    mocking: 0xff88ff
                };
                
                const styleIntensity = {
                    clinical: 0.3,
                    intimate: 0.8,
                    hostile: 1.2,
                    chaotic: 1.5,
                    possessive: 0.9
                };
                
                if (light.color) light.color.setHex(moodColors[narratorMood] || 0x888888);
                light.intensity = light.userData.baseIntensity * 
                    (styleIntensity[narrativeStyle] || 1) * 
                    (1 + Math.sin(light.userData.pulsePhase) * 0.3);
            });
        } catch (error) {
            console.warn('Error updating emotional lights:', error);
        }
    }
    
    activateMemoryPool(choice, position) {
        const nearestPool = this.memoryPools.reduce((closest, pool) => {
            const distToPos = pool.position.distanceTo(position);
            const distToClosest = closest ? closest.position.distanceTo(position) : Infinity;
            return distToPos < distToClosest ? pool : closest;
        }, null);
        
        if (nearestPool && nearestPool.position.distanceTo(position) < 20) {
            nearestPool.userData.showingMemory = true;
            nearestPool.userData.rippleTimer = 0;
            nearestPool.userData.lastChoice = choice;
        }
    }
    
    activateStoryThread(choice) {
        const nearestThread = this.storyThreads.find(thread => {
            if (!thread.userData.threadLine || !thread.userData.threadLine.geometry) return false;
            const threadPos = thread.userData.threadLine.geometry.attributes.position.array;
            const firstPoint = new THREE.Vector3(threadPos[0], threadPos[1], threadPos[2]);
            return firstPoint.distanceTo(new THREE.Vector3(0, 0, 0)) < 15;
        });
        
        if (nearestThread) {
            nearestThread.userData.connectionStrength = Math.min(1, 
                nearestThread.userData.connectionStrength + 0.5);
            nearestThread.userData.connectedChoices.push(choice);
        }
    }
    
    activateChoiceResonance(choice) {
        const nearestResonance = this.choiceResonances.reduce((closest, resonance) => {
            const distToCamera = resonance.position.distanceTo(new THREE.Vector3(0, 0, 0));
            const distToClosest = closest ? closest.position.distanceTo(new THREE.Vector3(0, 0, 0)) : Infinity;
            return distToCamera < distToClosest ? resonance : closest;
        }, null);
        
        if (nearestResonance) {
            const resonanceData = nearestResonance.userData;
            resonanceData.activeChoices = Math.min(3, resonanceData.activeChoices + 1);
            resonanceData.resonanceLevel = Math.min(1, resonanceData.resonanceLevel + 0.3);
            resonanceData.lastActivation = Date.now();
        }
    }
}

export { EnvironmentalSystems };