import * as THREE from 'three';

class NarratorManifestations {
    constructor(scene) {
        this.scene = scene;
        this.manifestations = [];
        this.memoryEchoes = [];
        
        this.init();
    }
    
    init() {
        this.createNarratorEyes();
        this.createMemoryEchoes();
    }
    
    createNarratorEyes() {
        for (let i = 0; i < 5; i++) {
            const eyeGroup = new THREE.Group();
            
            const eyeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const eyeMaterial = new THREE.MeshLambertMaterial({
                color: 0x888888,
                transparent: true,
                opacity: 0.7,
                emissive: 0x000000
            });
            const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eyeGroup.add(eye);
            
            const irisGeometry = new THREE.SphereGeometry(0.15, 12, 12);
            const irisMaterial = new THREE.MeshLambertMaterial({
                color: 0x4488ff,
                transparent: true,
                opacity: 0.9,
                emissive: 0x001122
            });
            const iris = new THREE.Mesh(irisGeometry, irisMaterial);
            iris.position.z = 0.2;
            eyeGroup.add(iris);
            
            eyeGroup.position.set(
                (Math.random() - 0.5) * 60,
                8 + Math.random() * 5,
                (Math.random() - 0.5) * 60
            );
            
            eyeGroup.userData = {
                type: 'narratorEye',
                watchingPlayer: false,
                attention: 0,
                blinkTimer: Math.random() * 5,
                iris: iris
            };
            
            this.scene.add(eyeGroup);
            this.manifestations.push(eyeGroup);
        }
    }
    
    createMemoryEchoes() {
        for (let i = 0; i < 8; i++) {
            const echoGeometry = new THREE.BoxGeometry(1, 1, 1);
            const echoMaterial = new THREE.MeshBasicMaterial({
                color: 0x6666aa,
                transparent: true,
                opacity: 0,
                wireframe: true
            });
            
            const echo = new THREE.Mesh(echoGeometry, echoMaterial);
            echo.position.set(
                (Math.random() - 0.5) * 80,
                1,
                (Math.random() - 0.5) * 80
            );
            
            echo.userData = {
                type: 'memoryEcho',
                decision: null,
                playerChoice: null,
                emotionalResonance: 0,
                originalPosition: echo.position.clone(),
                manifestTimer: 0,
                fadingIn: false,
                fadingOut: false
            };
            
            this.scene.add(echo);
            this.memoryEchoes.push(echo);
        }
    }
    
    update(deltaTime, elapsedTime, camera, storyEngine) {
        this.updateNarratorEyes(deltaTime, elapsedTime, camera, storyEngine);
        this.updateMemoryEchoes(deltaTime, elapsedTime, camera);
    }
    
    updateNarratorEyes(deltaTime, elapsedTime, camera, storyEngine) {
        this.manifestations.forEach(eye => {
            if (!eye || !eye.userData || !camera) return;
            
            try {
                const distanceToPlayer = eye.position.distanceTo(camera.position);
                if (distanceToPlayer < 15 && storyEngine && storyEngine.playerData) {
                    const relationship = storyEngine.playerData.narratorRelationship || 0;
                    if (relationship > 30 || relationship < -30) {
                        eye.lookAt(camera.position);
                        eye.userData.watchingPlayer = true;
                        eye.userData.attention = Math.min(1, (eye.userData.attention || 0) + deltaTime);
                        
                        if (eye.userData.iris && eye.userData.iris.material && eye.userData.iris.material.color) {
                            if (relationship > 50) {
                                eye.userData.iris.material.color.setHex(0x44ff88);
                            } else if (relationship < -50) {
                                eye.userData.iris.material.color.setHex(0xff4488);
                            } else {
                                eye.userData.iris.material.color.setHex(0x4488ff);
                            }
                        }
                    } else {
                        eye.userData.watchingPlayer = false;
                        eye.userData.attention = Math.max(0, (eye.userData.attention || 0) - deltaTime);
                    }
                }
                
                eye.userData.blinkTimer = (eye.userData.blinkTimer || 0) - deltaTime;
                if (eye.userData.blinkTimer <= 0) {
                    eye.userData.blinkTimer = 2 + Math.random() * 3;
                    if (eye.scale) {
                        eye.scale.y = 0.1;
                        setTimeout(() => {
                            if (eye && eye.scale) eye.scale.y = 1;
                        }, 100);
                    }
                }
                
                const glowIntensity = (eye.userData.attention || 0) * 0.5;
                if (eye.children && eye.children[0] && eye.children[0].material && eye.children[0].material.emissive) {
                    eye.children[0].material.emissive.setScalar(glowIntensity * 0.3);
                }
                if (eye.position) {
                    eye.position.y += Math.sin(elapsedTime + eye.position.x) * 0.01;
                }
            } catch (error) {
                console.error('Error updating narrator eye:', error);
            }
        });
    }
    
    updateMemoryEchoes(deltaTime, elapsedTime, camera) {
        this.memoryEchoes.forEach(echo => {
            if (!echo || !echo.userData || !echo.material) return;
            
            try {
                if (echo.userData.fadingIn) {
                    echo.userData.manifestTimer += deltaTime;
                    echo.material.opacity = Math.min(0.6, echo.userData.manifestTimer * 0.5);
                    if (echo.userData.manifestTimer > 1.2) {
                        echo.userData.fadingIn = false;
                        setTimeout(() => {
                            if (echo && echo.userData) {
                                echo.userData.fadingOut = true;
                                echo.userData.manifestTimer = 0;
                            }
                        }, 8000);
                    }
                }
                
                if (echo.userData.fadingOut) {
                    echo.userData.manifestTimer += deltaTime;
                    echo.material.opacity = Math.max(0, echo.material.opacity - echo.userData.manifestTimer * 0.3);
                    if (echo.material.opacity <= 0) {
                        echo.userData.fadingOut = false;
                        echo.userData.decision = null;
                        echo.userData.playerChoice = null;
                        echo.userData.emotionalResonance = 0;
                        if (echo.position && echo.userData.originalPosition) {
                            echo.position.copy(echo.userData.originalPosition);
                        }
                    }
                }
                
                if (echo.userData.decision && echo.rotation && echo.position) {
                    echo.rotation.y += deltaTime * (1 + echo.userData.emotionalResonance);
                    echo.position.y = echo.userData.originalPosition.y + 
                        Math.sin(elapsedTime * 2 + echo.position.x) * (0.2 + echo.userData.emotionalResonance * 0.3);
                    
                    const pulse = Math.sin(elapsedTime * 3) * (0.1 + echo.userData.emotionalResonance * 0.2);
                    if (echo.scale) echo.scale.setScalar(1 + pulse);
                }
            } catch (error) {
                console.error('Error updating memory echo:', error);
            }
        });
    }
}

export { NarratorManifestations };