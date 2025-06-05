import * as THREE from 'three';

class EnvironmentalEffectsSystem {
    constructor(scene) {
        this.scene = scene;
        this.storyWeather = {
            currentWeather: 'calm',
            intensity: 0,
            particles: []
        };
        this.narrativeShadows = [];
        this.whisperClouds = [];
        
        this.init();
    }
    
    init() {
        this.createStoryWeather();
        this.createNarrativeShadows();
        this.createWhisperClouds();
    }
    
    createStoryWeather() {
        // Weather that responds to narrative tension
        const weatherGeometry = new THREE.BufferGeometry();
        const weatherPositions = new Float32Array(100 * 3);
        const weatherColors = new Float32Array(100 * 3);
        
        for (let i = 0; i < weatherPositions.length; i += 3) {
            weatherPositions[i] = (Math.random() - 0.5) * 60;
            weatherPositions[i + 1] = Math.random() * 20 + 10;
            weatherPositions[i + 2] = (Math.random() - 0.5) * 60;
            
            const color = new THREE.Color().setHSL(0.6, 0.5, 0.8);
            weatherColors[i] = color.r;
            weatherColors[i + 1] = color.g;
            weatherColors[i + 2] = color.b;
        }
        
        weatherGeometry.setAttribute('position', new THREE.Float32BufferAttribute(weatherPositions, 3));
        weatherGeometry.setAttribute('color', new THREE.Float32BufferAttribute(weatherColors, 3));
        
        const weatherMaterial = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });
        
        const weatherSystem = new THREE.Points(weatherGeometry, weatherMaterial);
        weatherSystem.userData = { type: 'storyWeather' };
        this.scene.add(weatherSystem);
        this.storyWeather.particles.push(weatherSystem);
    }
    
    createNarrativeShadows() {
        // Shadows that show the weight of choices
        for (let i = 0; i < 10; i++) {
            const shadowGeometry = new THREE.PlaneGeometry(2, 0.1);
            const shadowMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide
            });
            
            const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
            shadow.rotation.x = -Math.PI / 2;
            shadow.position.set(
                (Math.random() - 0.5) * 40,
                0.05,
                (Math.random() - 0.5) * 40
            );
            
            shadow.userData = {
                type: 'narrativeShadow',
                choice: null,
                weight: 0,
                growing: false
            };
            
            this.scene.add(shadow);
            this.narrativeShadows.push(shadow);
        }
    }
    
    createWhisperClouds() {
        for (let i = 0; i < 6; i++) {
            const cloudGroup = new THREE.Group();
            
            // Create wispy cloud particles
            const particleCount = 20;
            const cloudGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);
            
            for (let j = 0; j < particleCount; j++) {
                const i3 = j * 3;
                positions[i3] = (Math.random() - 0.5) * 4;
                positions[i3 + 1] = Math.random() * 2;
                positions[i3 + 2] = (Math.random() - 0.5) * 4;
                
                const color = new THREE.Color().setHSL(0.6, 0.3, 0.7);
                colors[i3] = color.r;
                colors[i3 + 1] = color.g;
                colors[i3 + 2] = color.b;
            }
            
            cloudGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            cloudGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            const cloud = new THREE.Points(cloudGeometry, new THREE.PointsMaterial({
                size: 0.3,
                vertexColors: true,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            }));
            cloudGroup.add(cloud);
            
            cloudGroup.position.set(
                (Math.random() - 0.5) * 80,
                5 + Math.random() * 5,
                (Math.random() - 0.5) * 80
            );
            
            cloudGroup.userData = {
                type: 'whisperCloud',
                activeMessage: false,
                message: '',
                driftDirection: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    0,
                    (Math.random() - 0.5) * 0.1
                )
            };
            
            this.scene.add(cloudGroup);
            this.whisperClouds.push(cloudGroup);
        }
    }
    
    updateStoryWeather(storyType) {
        const weatherEffects = {
            mirror: 'reflective_rain',
            tree: 'whisper_wind',
            door: 'temporal_snow',
            clock: 'time_storm',
            ai: 'digital_fog',
            void: 'reality_static',
            library: 'paper_snow',
            laboratory: 'thought_mist',
            theater: 'dramatic_lightning'
        };
        const weather = weatherEffects[storyType] || 'calm';
        this.transitionStoryWeather(weather);
    }
    
    transitionStoryWeather(newWeather) {
        this.storyWeather.currentWeather = newWeather;
        const weatherSystem = this.storyWeather.particles[0];
        if (!weatherSystem) return;
        
        const weatherColors = {
            calm: { r: 0.6, g: 0.7, b: 0.8, opacity: 0.1 },
            reflective_rain: { r: 0.8, g: 0.9, b: 1.0, opacity: 0.6 },
            whisper_wind: { r: 0.7, g: 0.9, b: 0.7, opacity: 0.4 },
            temporal_snow: { r: 0.9, g: 0.9, b: 0.9, opacity: 0.5 },
            time_storm: { r: 1.0, g: 0.7, b: 0.3, opacity: 0.8 },
            digital_fog: { r: 0.3, g: 0.8, b: 0.9, opacity: 0.7 },
            reality_static: { r: 0.5, g: 0.5, b: 0.5, opacity: 0.9 },
            paper_snow: { r: 0.95, g: 0.95, b: 0.9, opacity: 0.6 },
            thought_mist: { r: 0.8, g: 0.6, b: 0.9, opacity: 0.5 },
            dramatic_lightning: { r: 1.0, g: 1.0, b: 0.8, opacity: 1.0 }
        };
        
        const targetWeather = weatherColors[newWeather] || weatherColors.calm;
        
        // Animate weather transition
        const colors = weatherSystem.geometry.attributes.color.array;
        const startTime = Date.now();
        const animateWeather = () => {
            const elapsed = (Date.now() - startTime) / 2000; // 2 second transition
            const progress = Math.min(elapsed, 1);
            for (let i = 0; i < colors.length; i += 3) {
                colors[i] = THREE.MathUtils.lerp(colors[i], targetWeather.r, progress * 0.1);
                colors[i + 1] = THREE.MathUtils.lerp(colors[i + 1], targetWeather.g, progress * 0.1);
                colors[i + 2] = THREE.MathUtils.lerp(colors[i + 2], targetWeather.b, progress * 0.1);
            }
            weatherSystem.geometry.attributes.color.needsUpdate = true;
            if (progress < 1) {
                requestAnimationFrame(animateWeather);
            }
        };
        animateWeather();
    }
    
    castNarrativeShadow(node) {
        const availableShadow = this.narrativeShadows.find(shadow => 
            !shadow.userData.choice
        );
        if (availableShadow) {
            availableShadow.userData.choice = node.userData.storyType;
            availableShadow.userData.weight = Math.random() * 0.5 + 0.3;
            availableShadow.userData.growing = true;
            
            // Position shadow near the node
            availableShadow.position.x = node.position.x + (Math.random() - 0.5) * 4;
            availableShadow.position.z = node.position.z + (Math.random() - 0.5) * 4;
            
            // Start growing animation
            const startTime = Date.now();
            const animateShadowGrowth = () => {
                const elapsed = (Date.now() - startTime) / 3000; // 3 second growth
                const progress = Math.min(elapsed, 1);
                availableShadow.material.opacity = availableShadow.userData.weight * progress;
                availableShadow.scale.setScalar(1 + progress * 2);
                if (progress < 1) {
                    requestAnimationFrame(animateShadowGrowth);
                } else {
                    availableShadow.userData.growing = false;
                    // Shadows fade after 30 seconds
                    setTimeout(() => {
                        const fadeOut = () => {
                            availableShadow.material.opacity -= 0.01;
                            if (availableShadow.material.opacity > 0) {
                                requestAnimationFrame(fadeOut);
                            } else {
                                availableShadow.userData.choice = null;
                                availableShadow.userData.weight = 0;
                                availableShadow.scale.setScalar(1);
                            }
                        };
                        fadeOut();
                    }, 30000);
                }
            };
            animateShadowGrowth();
        }
    }
    
    activateWhisperCloud(node) {
        const nearestCloud = this.whisperClouds.find(cloud => 
            cloud.position.distanceTo(node.position) < 15
        );
        
        if (nearestCloud) {
            const messages = [
                `The narrator notices your choice: ${node.userData.title}`,
                `"${node.userData.title}" echoes through the narrative...`,
                `Your interaction with ${node.userData.title} changes something`,
                `The story shifts around your decision`,
                `${node.userData.title} will be remembered`
            ];
            nearestCloud.userData.activeMessage = true;
            nearestCloud.userData.message = messages[Math.floor(Math.random() * messages.length)];
            setTimeout(() => {
                nearestCloud.userData.activeMessage = false;
            }, 5000);
        }
    }
    
    update(deltaTime, elapsedTime) {
        this.animateStoryWeather(deltaTime, elapsedTime);
        this.updateWhisperClouds(deltaTime, elapsedTime);
        this.animateNarrativeShadows(deltaTime, elapsedTime);
    }
    
    animateStoryWeather(deltaTime, elapsedTime) {
        if (!this.storyWeather || !this.storyWeather.particles || this.storyWeather.particles.length === 0) return;
        
        const weatherSystem = this.storyWeather.particles[0];
        if (!weatherSystem || !weatherSystem.geometry || !weatherSystem.geometry.attributes.position) return;
        
        const positions = weatherSystem.geometry.attributes.position.array;
        
        // Animate weather particles based on current weather type
        switch (this.storyWeather.currentWeather) {
            case 'reflective_rain':
                for (let i = 1; i < positions.length; i += 3) {
                    positions[i] -= deltaTime * 5; // Fall down
                    if (positions[i] < 0) positions[i] = 20; // Reset to top
                }
                break;
                
            case 'whisper_wind':
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += Math.sin(elapsedTime + i) * deltaTime * 2;
                    positions[i + 2] += Math.cos(elapsedTime + i) * deltaTime * 2;
                }
                break;
                
            case 'temporal_snow':
                for (let i = 1; i < positions.length; i += 3) {
                    positions[i] -= deltaTime * 2; // Slow fall
                    positions[i] += Math.sin(elapsedTime * 2 + i) * 0.01; // Drift
                    if (positions[i] < 0) positions[i] = 20;
                }
                break;
                
            default:
                // Gentle floating motion
                for (let i = 1; i < positions.length; i += 3) {
                    positions[i] += Math.sin(elapsedTime + i * 0.1) * deltaTime * 0.5;
                }
                break;
        }
        
        weatherSystem.geometry.attributes.position.needsUpdate = true;
        
        // Update weather opacity based on intensity
        if (weatherSystem.material) {
            weatherSystem.material.opacity = (this.storyWeather.intensity || 0) * 0.8;
        }
    }
    
    updateWhisperClouds(deltaTime, elapsedTime) {
        this.whisperClouds.forEach(cloud => {
            if (!cloud || !cloud.userData) return;
            
            const cloudData = cloud.userData;
            
            // Gentle drift
            if (cloudData.driftDirection) {
                cloud.position.add(cloudData.driftDirection);
            }
            
            // Boundary wrapping
            if (Math.abs(cloud.position.x) > 50) {
                if (cloudData.driftDirection) cloudData.driftDirection.x *= -1;
            }
            if (Math.abs(cloud.position.z) > 50) {
                if (cloudData.driftDirection) cloudData.driftDirection.z *= -1;
            }
            
            // Floating motion
            cloud.position.y += Math.sin(elapsedTime + cloud.position.x * 0.1) * 0.005;
            
            // Particle swirl
            const particles = cloud.children[0];
            if (particles && particles.geometry && particles.geometry.attributes.position) {
                const positions = particles.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += Math.sin(elapsedTime * 2 + i) * 0.01;
                    positions[i + 2] += Math.cos(elapsedTime * 2 + i) * 0.01;
                }
                particles.geometry.attributes.position.needsUpdate = true;
            }
            
            // Message display effect
            if (cloudData.activeMessage) {
                cloud.scale.setScalar(1.2 + Math.sin(elapsedTime * 4) * 0.1);
                if (particles && particles.material) {
                    particles.material.opacity = 0.7 + Math.sin(elapsedTime * 6) * 0.2;
                }
            } else {
                cloud.scale.setScalar(1);
                if (particles && particles.material) {
                    particles.material.opacity = 0.4;
                }
            }
        });
    }
    
    animateNarrativeShadows(deltaTime, elapsedTime) {
        this.narrativeShadows.forEach(shadow => {
            if (!shadow || !shadow.userData) return;
            
            if (shadow.userData.growing) {
                // Growing animation handled in castNarrativeShadow
                return;
            }
            
            if (shadow.userData.choice) {
                // Subtle pulsing for active shadows
                const pulse = Math.sin(elapsedTime * 2) * 0.1 + 0.9;
                shadow.scale.setScalar(shadow.scale.x * pulse);
                
                // Fade out old shadows
                if (shadow.material && shadow.material.opacity > 0) {
                    shadow.material.opacity -= deltaTime * 0.01;
                }
            }
        });
    }
}

export { EnvironmentalEffectsSystem };