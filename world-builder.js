import * as THREE from 'three';

class WorldBuilder {
    constructor(scene) {
        this.scene = scene;
        this.interactableObjects = [];
        this.storyNodes = [];
    }
    
    createWorld() {
        this.createGround();
        this.createStoryNodes();
        this.createSurrealObjects();
        this.createArchitecturalElements();
    }
    
    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 20, 20);
        const groundMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                playerPos: { value: new THREE.Vector3() },
                storyIntensity: { value: 0.5 }
            },
            vertexShader: `
                uniform float time;
                uniform vec3 playerPos;
                varying vec2 vUv;
                varying float distanceToPlayer;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    distanceToPlayer = distance(pos, playerPos);
                    pos.y += sin(time + pos.x * 0.1) * 0.2 + sin(time + pos.z * 0.1) * 0.2;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float storyIntensity;
                varying vec2 vUv;
                varying float distanceToPlayer; // Available if needed
                void main() {
                    vec3 color1 = vec3(0.1, 0.1, 0.2);
                    vec3 color2 = vec3(0.2, 0.1, 0.3);
                    vec3 color3 = vec3(0.3, 0.2, 0.5);
                    
                    // Existing large scale pattern
                    float large_scale_pattern = sin(vUv.x * 10.0 + time) * sin(vUv.y * 10.0 + time);

                    // New finer detail procedural noise
                    float fine_detail = 0.0;
                    fine_detail += sin((vUv.x * 50.0 + time * 0.6) + (vUv.y * 30.0)) * 0.5 + 0.5; // range [0,1]
                    fine_detail *= sin((vUv.y * 50.0 - time * 0.4) + (vUv.x * 20.0)) * 0.5 + 0.5; // range [0,1]
                    fine_detail = pow(fine_detail, 2.0); // Contract the pattern a bit

                    // Combine patterns: modulate large_scale_pattern's influence or add detail
                    float intensityModulator = mix(0.8, 1.2, fine_detail); // Modulate between 80% and 120%

                    float intensity = mix(0.5, storyIntensity, large_scale_pattern) * intensityModulator;
                    intensity = clamp(intensity, 0.0, 1.0); // Ensure intensity stays in valid range
                    
                    vec3 finalColor = mix(color1, mix(color2, color3, intensity), intensity);

                    // Optionally, add a very subtle direct brightness variation from fine_detail
                    finalColor += (fine_detail - 0.5) * 0.05; // Small brightness variation
                    finalColor = clamp(finalColor, vec3(0.0), vec3(1.0));

                    gl_FragColor = vec4(finalColor, 0.8);
                }
            `,
            transparent: true
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.userData = { type: 'dynamicGround', material: groundMaterial };
        this.scene.add(ground);
    }
    
    createStoryNodes() {
        const nodeConfigs = [
            { pos: [0, 1, 0], color: 0x4a90e2, type: 'mirror', title: 'The Mirror of Reflection' },
            { pos: [-10, 1, -5], color: 0x7ed321, type: 'tree', title: 'The Whispering Tree' },
            { pos: [8, 1, -8], color: 0xf5a623, type: 'door', title: 'The Door to Nowhere' },
            { pos: [0, 1, -15], color: 0xe94b3c, type: 'clock', title: 'The Broken Clock' },
            { pos: [15, 1, 5], color: 0x9013fe, type: 'ai', title: 'The Crying AI' },
            { pos: [-8, 1, 12], color: 0x50e3c2, type: 'void', title: 'The Void Caller' },
            { pos: [-20, 1, -10], color: 0xb19cd9, type: 'library', title: 'The Infinite Library' },
            { pos: [12, 1, -20], color: 0xff6b6b, type: 'laboratory', title: 'The Consciousness Lab' },
            { pos: [25, 1, -5], color: 0x4ecdc4, type: 'theater', title: 'The Recursive Theater' }
        ];
        

        nodeConfigs.forEach((config, index) => {
            let geometry;
            let node;
            // Default material - MeshStandardMaterial for better PBR properties
            let material = new THREE.MeshStandardMaterial({
                color: config.color,
                transparent: true,
                opacity: 0.85,
                roughness: 0.7,
                metalness: 0.2
            });

            switch (config.type) {
                case 'mirror':
                    geometry = new THREE.BoxGeometry(2.5, 3.5, 0.1);
                    material = new THREE.MeshStandardMaterial({
                        color: 0xc0c0c0, // silver
                        transparent: true, // Keep transparency if desired for ghostly mirror
                        opacity: 0.9,    // Can be less transparent than default
                        metalness: 1.0,
                        roughness: 0.1
                    });
                    node = new THREE.Mesh(geometry, material);
                    break;
                case 'tree':
                    geometry = new THREE.CylinderGeometry(0.4, 0.6, 3, 8);
                    material = new THREE.MeshStandardMaterial({
                        color: 0x5C3A21, // Brown for trunk
                        roughness: 0.9,
                        metalness: 0.0
                        // Opacity and transparency can be default (opaque) for a tree
                    });
                    node = new THREE.Mesh(geometry, material);
                    break;
                case 'clock':
                    geometry = new THREE.BoxGeometry(1.5, 2.0, 0.5);
                    material = new THREE.MeshStandardMaterial({
                        color: config.color, // Use original config color or a specific one like 0xCD7F32 (bronze)
                        transparent: true,
                        opacity: 0.9,
                        metalness: 0.8,
                        roughness: 0.3
                    });
                    node = new THREE.Mesh(geometry, material);
                    break;
                case 'ai':
                    geometry = new THREE.IcosahedronGeometry(1.2, 0);
                    material = new THREE.MeshStandardMaterial({
                        color: config.color,
                        emissive: config.color,
                        emissiveIntensity: 0.5,
                        transparent: true,
                        opacity: 0.8,
                        roughness: 0.4,
                        metalness: 0.1
                    });
                    node = new THREE.Mesh(geometry, material);
                    break;
                case 'door':
                    geometry = new THREE.BoxGeometry(2, 4, 0.2);
                    material = new THREE.MeshStandardMaterial({
                        color: 0x8B4513, // Saddle brown
                        roughness: 0.8,
                        metalness: 0.1,
                        transparent: true,
                        opacity: 0.95
                    });
                    node = new THREE.Mesh(geometry, material);
                    break;
                case 'void':
                    geometry = new THREE.SphereGeometry(1.5, 16, 12);
                    material = new THREE.MeshStandardMaterial({
                        color: 0x050505, // Very dark
                        emissive: 0x100010, // Faint dark purple/black glow
                        emissiveIntensity: 0.25,
                        roughness: 0.6,
                        metalness: 0.0,
                        transparent: true,
                        opacity: 0.9
                    });
                    node = new THREE.Mesh(geometry, material);
                    break;
                case 'library': // Bookshelf
                    geometry = new THREE.BoxGeometry(3, 4, 1.5);
                    material = new THREE.MeshStandardMaterial({
                        color: 0x654321, // Dark wood
                        roughness: 0.85,
                        metalness: 0.0
                        // opaque by default
                    });
                    node = new THREE.Mesh(geometry, material);
                    break;
                case 'laboratory': // Lab bench/equipment
                    geometry = new THREE.BoxGeometry(2.5, 1.2, 1.5);
                    material = new THREE.MeshStandardMaterial({
                        color: 0xbbbbcc, // Light grey, metallic/laminate
                        roughness: 0.4,
                        metalness: 0.6
                        // opaque by default
                    });
                    node = new THREE.Mesh(geometry, material);
                    break;
                case 'theater': // Stage
                    geometry = new THREE.CylinderGeometry(2, 2, 0.3, 16);
                    material = new THREE.MeshStandardMaterial({
                        color: 0x5C2121, // Dark red/brown
                        roughness: 0.7,
                        metalness: 0.1
                        // opaque by default
                    });
                    node = new THREE.Mesh(geometry, material);
                    break;
                default: // Fallback for any other types
                    geometry = new THREE.BoxGeometry(2, 3, 1);
                    // Uses the default material defined at the start of the loop
                    node = new THREE.Mesh(geometry, material);
                    break;
            }

            node.position.set(...config.pos);
            node.castShadow = true;
            node.userData = {
                type: 'storyNode',
                storyType: config.type,
                title: config.title,
                triggered: false
            };
            
            this.scene.add(node);
            this.interactableObjects.push(node);
            this.storyNodes.push(node);
            
            const sprite = this.addFloatingText(config.title, node.position, 0.3);
            node.userData.textSprite = sprite; // Store sprite reference
        });
    }
    
    createSurrealObjects() {
        const numObjects = 18; // Increased from 12
        for (let i = 0; i < numObjects; i++) {
            let geometry;
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6), // Slightly brighter base
                transparent: true,
                opacity: 0.75, // Slightly more opaque
                roughness: Math.random() * 0.5 + 0.25, // Vary roughness 0.25 to 0.75
                metalness: Math.random() * 0.2  // Mostly non-metallic 0.0 to 0.2
            });

            const randomSizeFactor = 0.5 + Math.random() * 0.5; // Common size factor for variety

            switch (i % 4) {
                case 0:
                    geometry = new THREE.BoxGeometry(
                        randomSizeFactor,
                        randomSizeFactor,
                        randomSizeFactor
                    );
                    break;
                case 1:
                    geometry = new THREE.SphereGeometry(randomSizeFactor * 0.7, 12, 8);
                    break;
                case 2:
                    geometry = new THREE.TorusKnotGeometry(randomSizeFactor * 0.6, randomSizeFactor * 0.15, 64, 8);
                    break;
                case 3:
                    geometry = new THREE.IcosahedronGeometry(randomSizeFactor * 0.8, 0);
                    break;
            }

            const surrealObject = new THREE.Mesh(geometry, material);
            
            surrealObject.position.set(
                (Math.random() - 0.5) * 60, // Increased spread
                2 + Math.random() * 8,    // Increased height variation
                (Math.random() - 0.5) * 60  // Increased spread
            );
            
            surrealObject.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            
            surrealObject.userData = {
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                floatSpeed: 0.5 + Math.random() * 0.5
            };
            
            this.scene.add(surrealObject);
        }
    }
    
    createArchitecturalElements() {
        const stairGeometry = new THREE.BoxGeometry(10, 0.5, 2);
        const stairMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a4a5e, // Slightly desaturated blue-grey
            roughness: 0.8,
            metalness: 0.1,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < 5; i++) {
            const stair = new THREE.Mesh(stairGeometry, stairMaterial);
            stair.position.set(20, i * 2, -20 + i * 3);
            stair.rotation.y = i * 0.3;
            stair.receiveShadow = true; // Stairs should receive shadows
            this.scene.add(stair);
        }
        
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.75, 0.3, 0.4), // Random cool grey/purple/blue hues
            roughness: 0.6,
            metalness: 0.2,
            transparent: true,
            opacity: 0.85
        });

        const shaftHeight = 8;
        const baseHeight = 0.5;
        const capitalHeight = 0.5;

        const shaftGeometry = new THREE.CylinderGeometry(0.5, 0.8, shaftHeight, 8); // Original pillar geometry
        const baseGeometry = new THREE.CylinderGeometry(1.0, 1.0, baseHeight, 8);
        const capitalGeometry = new THREE.CylinderGeometry(1.0, 1.0, capitalHeight, 8);

        for (let i = 0; i < 6; i++) {
            const pillarGroup = new THREE.Group();

            const shaftMesh = new THREE.Mesh(shaftGeometry, pillarMaterial);
            shaftMesh.castShadow = true;
            shaftMesh.receiveShadow = true; // Shaft can also receive shadows

            const baseMesh = new THREE.Mesh(baseGeometry, pillarMaterial);
            baseMesh.position.y = -shaftHeight / 2 - baseHeight / 2 + 0.25 ; // Adjusted for potentially tapered shaft base
            baseMesh.castShadow = true;
            baseMesh.receiveShadow = true;

            const capitalMesh = new THREE.Mesh(capitalGeometry, pillarMaterial);
            capitalMesh.position.y = shaftHeight / 2 + capitalHeight / 2 - 0.25; // Adjusted for potentially tapered shaft top
            capitalMesh.castShadow = true;
            capitalMesh.receiveShadow = true;

            pillarGroup.add(shaftMesh);
            pillarGroup.add(baseMesh);
            pillarGroup.add(capitalMesh);

            pillarGroup.position.set(
                (Math.random() - 0.5) * 60,
                baseHeight + shaftHeight / 2, // Position group so base is on ground, group origin at center of shaft
                (Math.random() - 0.5) * 60
            );
            pillarGroup.rotation.z = (Math.random() - 0.5) * 0.5;
            this.scene.add(pillarGroup);
        }
    }
    
    addFloatingText(text, position, scale = 1) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.font = '32px Courier New';
        context.textAlign = 'center';
        context.fillText(text, 256, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        sprite.position.copy(position);
        sprite.position.y += 2;
        sprite.scale.set(4 * scale, 1 * scale, 1);
        
        this.scene.add(sprite);
        return sprite;
    }
    
    getInteractableObjects() {
        return this.interactableObjects;
    }
    
    getStoryNodes() {
        return this.storyNodes;
    }
}

export { WorldBuilder };