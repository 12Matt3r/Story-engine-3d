import * as THREE from 'three';

class StoryDNASystem {
    constructor(scene) {
        this.scene = scene;
        this.storyDNA = {
            patterns: [],
            helixStrands: [],
            codeFragments: [],
            evolutionMarkers: [],
            uniqueFingerprint: new Map(),
            dnaVisualization: null
        };
        
        this.init();
    }
    
    init() {
        this.createStoryDNASystem();
    }
    
    createStoryDNASystem() {
        // Create the main DNA helix structure
        this.createDNAHelix();
        
        // Create floating code fragments that represent story elements
        this.createStoryCodeFragments();
        
        // Create evolution markers that track narrative development
        this.createEvolutionMarkers();
        
        // Create pattern recognition nodes
        this.createPatternNodes();
    }
    
    createDNAHelix() {
        const helixGroup = new THREE.Group();
        
        // Create twin spiral strands
        for (let strand = 0; strand < 2; strand++) {
            const strandPoints = [];
            const strandColors = [];
            
            for (let i = 0; i <= 100; i++) {
                const t = i / 100;
                const radius = 2;
                const height = t * 20 - 10;
                const angle = t * Math.PI * 8 + (strand * Math.PI);
                
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                
                strandPoints.push(new THREE.Vector3(x, height, z));
                
                // Color based on story progression
                const color = new THREE.Color().setHSL(
                    (t + strand * 0.5) % 1,
                    0.7,
                    0.5
                );
                strandColors.push(color.r, color.g, color.b);
            }
            
            const strandGeometry = new THREE.BufferGeometry().setFromPoints(strandPoints);
            strandGeometry.setAttribute('color', new THREE.Float32BufferAttribute(strandColors, 3));
            
            const strandMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                linewidth: 3
            });
            
            const strandLine = new THREE.Line(strandGeometry, strandMaterial);
            helixGroup.add(strandLine);
            
            this.storyDNA.helixStrands.push({
                line: strandLine,
                geometry: strandGeometry,
                material: strandMaterial,
                strand: strand
            });
        }
        
        // Create connecting bonds between strands
        this.createDNABonds(helixGroup);
        
        // Position the helix in the world
        helixGroup.position.set(0, 10, -30);
        helixGroup.userData = {
            type: 'storyDNAHelix',
            rotationSpeed: 0.1,
            pulsePhase: 0,
            evolutionLevel: 0
        };
        
        this.scene.add(helixGroup);
        this.storyDNA.dnaVisualization = helixGroup;
    }
    
    createDNABonds(helixGroup) {
        // Create horizontal bonds between the DNA strands
        for (let i = 0; i < 20; i++) {
            const t = i / 20;
            const height = t * 20 - 10;
            const angle = t * Math.PI * 8;
            
            const x1 = Math.cos(angle) * 2;
            const z1 = Math.sin(angle) * 2;
            const x2 = Math.cos(angle + Math.PI) * 2;
            const z2 = Math.sin(angle + Math.PI) * 2;
            
            const bondGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x1, height, z1),
                new THREE.Vector3(x2, height, z2)
            ]);
            
            const bondMaterial = new THREE.LineBasicMaterial({
                color: 0x8888ff,
                transparent: true,
                opacity: 0.4
            });
            
            const bond = new THREE.Line(bondGeometry, bondMaterial);
            bond.userData = {
                type: 'dnaBond',
                index: i,
                activated: false
            };
            
            helixGroup.add(bond);
        }
    }
    
    createStoryCodeFragments() {
        for (let i = 0; i < 15; i++) {
            const fragmentGroup = new THREE.Group();
            
            // Create geometric representation of story code
            const geometries = [
                new THREE.TetrahedronGeometry(0.3),
                new THREE.OctahedronGeometry(0.3),
                new THREE.IcosahedronGeometry(0.3),
                new THREE.DodecahedronGeometry(0.3)
            ];
            
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
                transparent: true,
                opacity: 0.7,
                wireframe: true
            });
            
            const fragment = new THREE.Mesh(geometry, material);
            fragmentGroup.add(fragment);
            
            // Add floating text representation
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            
            context.fillStyle = 'rgba(255, 255, 255, 0.8)';
            context.font = '16px Courier New';
            context.textAlign = 'center';
            
            const codeFragments = [
                'if(choice == mirror)',
                'narrative.evolve()',
                'story.branch()',
                'memory.store()',
                'pattern.recognize()',
                'dna.mutate()',
                'consciousness.expand()',
                'reality.bend()'
            ];
            
            const code = codeFragments[Math.floor(Math.random() * codeFragments.length)];
            context.fillText(code, 128, 32);
            
            const texture = new THREE.CanvasTexture(canvas);
            const textMaterial = new THREE.SpriteMaterial({ 
                map: texture, 
                transparent: true,
                opacity: 0.6
            });
            const textSprite = new THREE.Sprite(textMaterial);
            textSprite.scale.set(2, 0.5, 1);
            textSprite.position.y = 1;
            fragmentGroup.add(textSprite);
            
            fragmentGroup.position.set(
                (Math.random() - 0.5) * 50,
                3 + Math.random() * 8,
                (Math.random() - 0.5) * 50
            );
            
            fragmentGroup.userData = {
                type: 'storyCodeFragment',
                code: code,
                activated: false,
                rotationSpeed: 0.2 + Math.random() * 0.3,
                floatPhase: Math.random() * Math.PI * 2,
                relatedChoices: []
            };
            
            this.scene.add(fragmentGroup);
            this.storyDNA.codeFragments.push(fragmentGroup);
        }
    }
    
    createEvolutionMarkers() {
        for (let i = 0; i < 8; i++) {
            const markerGroup = new THREE.Group();
            
            // Central evolution core
            const coreGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const coreMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    evolutionLevel: { value: 0 },
                    complexity: { value: 0 }
                },
                vertexShader: `
                    uniform float time;
                    uniform float evolutionLevel;
                    uniform float complexity;
                    varying vec3 vPosition;
                    varying vec3 vNormal;
                    void main() {
                        vPosition = position;
                        vNormal = normal;
                        vec3 pos = position;
                        pos += normal * sin(time * 3.0 + pos.x * 5.0) * evolutionLevel * 0.1;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform float evolutionLevel;
                    uniform float complexity;
                    varying vec3 vPosition;
                    varying vec3 vNormal;
                    void main() {
                        vec3 color1 = vec3(0.3, 0.8, 0.9);
                        vec3 color2 = vec3(0.9, 0.3, 0.8);
                        vec3 color3 = vec3(0.8, 0.9, 0.3);
                        
                        float pattern = sin(vPosition.x * 10.0 + time) * 
                                       sin(vPosition.y * 10.0 + time) * 
                                       sin(vPosition.z * 10.0 + time);
                        
                        vec3 finalColor = mix(
                            mix(color1, color2, evolutionLevel),
                            color3,
                            complexity
                        );
                        
                        float alpha = 0.7 + pattern * 0.3;
                        gl_FragColor = vec4(finalColor, alpha);
                    }
                `,
                transparent: true
            });
            
            const core = new THREE.Mesh(coreGeometry, coreMaterial);
            markerGroup.add(core);
            
            // Orbiting evolution rings
            for (let ring = 0; ring < 3; ring++) {
                const ringGeometry = new THREE.TorusGeometry(1 + ring * 0.5, 0.1, 8, 16);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setHSL((ring / 3) * 0.3 + 0.5, 0.7, 0.6),
                    transparent: true,
                    opacity: 0.5
                });
                
                const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
                ringMesh.rotation.x = Math.random() * Math.PI;
                ringMesh.rotation.y = Math.random() * Math.PI;
                ringMesh.userData = {
                    type: 'evolutionRing',
                    ring: ring,
                    rotationSpeed: (ring + 1) * 0.1
                };
                
                markerGroup.add(ringMesh);
            }
            
            markerGroup.position.set(
                (Math.random() - 0.5) * 70,
                5 + Math.random() * 10,
                (Math.random() - 0.5) * 70
            );
            
            markerGroup.userData = {
                type: 'evolutionMarker',
                evolutionLevel: 0,
                complexity: 0,
                core: core,
                material: coreMaterial,
                connectedChoices: new Set(),
                lastEvolution: 0
            };
            
            this.scene.add(markerGroup);
            this.storyDNA.evolutionMarkers.push(markerGroup);
        }
    }
    
    createPatternNodes() {
        for (let i = 0; i < 6; i++) {
            const nodeGroup = new THREE.Group();
            
            // Pattern recognition matrix
            const matrixSize = 5;
            const cellSize = 0.2;
            const cells = [];
            
            for (let x = 0; x < matrixSize; x++) {
                for (let y = 0; y < matrixSize; y++) {
                    const cellGeometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);
                    const cellMaterial = new THREE.MeshBasicMaterial({
                        color: 0x444444,
                        transparent: true,
                        opacity: 0.3
                    });
                    
                    const cell = new THREE.Mesh(cellGeometry, cellMaterial);
                    cell.position.set(
                        (x - matrixSize/2) * cellSize * 1.2,
                        (y - matrixSize/2) * cellSize * 1.2,
                        0
                    );
                    
                    cell.userData = {
                        type: 'patternCell',
                        x: x,
                        y: y,
                        activated: false,
                        pattern: null
                    };
                    
                    nodeGroup.add(cell);
                    cells.push(cell);
                }
            }
            
            nodeGroup.position.set(
                (Math.random() - 0.5) * 60,
                6 + Math.random() * 4,
                (Math.random() - 0.5) * 60
            );
            
            nodeGroup.userData = {
                type: 'patternNode',
                cells: cells,
                recognizedPatterns: new Set(),
                complexity: 0,
                lastUpdate: 0
            };
            
            this.scene.add(nodeGroup);
            this.storyDNA.patterns.push(nodeGroup);
        }
    }
    
    updateStoryDNA(choice, position) {
        // Update the unique fingerprint
        if (!this.storyDNA.uniqueFingerprint.has(choice)) {
            this.storyDNA.uniqueFingerprint.set(choice, 0);
        }
        this.storyDNA.uniqueFingerprint.set(choice, 
            this.storyDNA.uniqueFingerprint.get(choice) + 1);
        
        // Activate nearby code fragments
        this.activateNearbyCodeFragments(choice, position);
        
        // Update evolution markers
        this.updateEvolutionMarkers(choice);
        
        // Update pattern recognition
        this.updatePatternRecognition(choice);
        
        // Update DNA helix visualization
        this.updateDNAHelix(choice);
    }
    
    activateNearbyCodeFragments(choice, position) {
        this.storyDNA.codeFragments.forEach(fragment => {
            const distance = fragment.position.distanceTo(position);
            if (distance < 20 && Math.random() < 0.4) {
                fragment.userData.activated = true;
                fragment.userData.relatedChoices.push(choice);
                
                // Change color based on choice
                const choiceColors = {
                    mirror: 0x4a90e2,
                    tree: 0x7ed321,
                    door: 0xf5a623,
                    clock: 0xe94b3c,
                    ai: 0x9013fe,
                    void: 0x50e3c2,
                    library: 0xb19cd9,
                    laboratory: 0xff6b6b,
                    theater: 0x4ecdc4
                };
                
                fragment.children[0].material.color.setHex(
                    choiceColors[choice] || 0x888888
                );
                
                // Create connection beam to DNA helix
                if (this.storyDNA.dnaVisualization) {
                    this.createDNAConnectionBeam(fragment, this.storyDNA.dnaVisualization);
                }
            }
        });
    }
    
    createDNAConnectionBeam(fragment, helix) {
        const beamGeometry = new THREE.BufferGeometry().setFromPoints([
            fragment.position,
            helix.position.clone().add(new THREE.Vector3(0, Math.random() * 20 - 10, 0))
        ]);
        
        const beamMaterial = new THREE.LineBasicMaterial({
            color: fragment.children[0].material.color.getHex(),
            transparent: true,
            opacity: 0.6
        });
        
        const beam = new THREE.Line(beamGeometry, beamMaterial);
        this.scene.add(beam);
        
        // Animate beam fade out
        setTimeout(() => {
            const fadeOut = () => {
                beam.material.opacity -= 0.02;
                if (beam.material.opacity > 0) {
                    requestAnimationFrame(fadeOut);
                } else {
                    this.scene.remove(beam);
                    beamMaterial.dispose();
                    beamGeometry.dispose();
                }
            };
            fadeOut();
        }, 2000);
    }
    
    updateEvolutionMarkers(choice) {
        const nearestMarker = this.storyDNA.evolutionMarkers.reduce((closest, marker) => {
            const distToCamera = marker.position.distanceTo(new THREE.Vector3(0, 0, 0));
            const distToClosest = closest ? closest.position.distanceTo(new THREE.Vector3(0, 0, 0)) : Infinity;
            return distToCamera < distToClosest ? marker : closest;
        }, null);
        
        if (nearestMarker) {
            nearestMarker.userData.connectedChoices.add(choice);
            nearestMarker.userData.evolutionLevel = Math.min(1, 
                nearestMarker.userData.connectedChoices.size / 5);
            nearestMarker.userData.complexity = Math.min(1,
                this.storyDNA.uniqueFingerprint.size / 10);
            nearestMarker.userData.lastEvolution = Date.now();
            
            // Update shader uniforms
            if (nearestMarker.userData.material.uniforms) {
                nearestMarker.userData.material.uniforms.evolutionLevel.value = 
                    nearestMarker.userData.evolutionLevel;
                nearestMarker.userData.material.uniforms.complexity.value = 
                    nearestMarker.userData.complexity;
            }
        }
    }
    
    updatePatternRecognition(choice) {
        // Find patterns in choice sequences
        const choices = Array.from(this.storyDNA.uniqueFingerprint.keys());
        
        this.storyDNA.patterns.forEach(patternNode => {
            const nodeData = patternNode.userData;
            
            // Simple pattern recognition: activate cells based on choice frequency
            choices.forEach((choiceType, index) => {
                const frequency = this.storyDNA.uniqueFingerprint.get(choiceType);
                const cellIndex = index % nodeData.cells.length;
                const cell = nodeData.cells[cellIndex];
                
                if (frequency > 1) {
                    cell.userData.activated = true;
                    cell.userData.pattern = choiceType;
                    cell.material.opacity = Math.min(0.9, frequency * 0.3);
                    
                    // Color based on choice type
                    const choiceColors = {
                        mirror: 0x4a90e2,
                        tree: 0x7ed321,
                        door: 0xf5a623,
                        clock: 0xe94b3c,
                        ai: 0x9013fe,
                        void: 0x50e3c2,
                        library: 0xb19cd9,
                        laboratory: 0xff6b6b,
                        theater: 0x4ecdc4
                    };
                    
                    cell.material.color.setHex(choiceColors[choiceType] || 0x888888);
                    nodeData.recognizedPatterns.add(choiceType);
                }
            });
            
            nodeData.complexity = nodeData.recognizedPatterns.size / 9;
            nodeData.lastUpdate = Date.now();
        });
    }
    
    updateDNAHelix(choice) {
        if (!this.storyDNA.dnaVisualization) return;
        
        const helix = this.storyDNA.dnaVisualization;
        const helixData = helix.userData;
        
        // Increase evolution level based on unique choices
        helixData.evolutionLevel = Math.min(1, this.storyDNA.uniqueFingerprint.size / 8);
        
        // Activate DNA bonds based on choice connections
        const bonds = helix.children.filter(child => 
            child.userData && child.userData.type === 'dnaBond'
        );
        
        const bondIndex = Array.from(this.storyDNA.uniqueFingerprint.keys()).indexOf(choice);
        if (bondIndex >= 0 && bondIndex < bonds.length) {
            const bond = bonds[bondIndex];
            bond.userData.activated = true;
            bond.material.opacity = 0.8;
            bond.material.color.setHex(0xffff88);
        }
        
        // Update helix colors based on story DNA
        this.storyDNA.helixStrands.forEach((strand, index) => {
            const colors = strand.geometry.attributes.color.array;
            const choices = Array.from(this.storyDNA.uniqueFingerprint.keys());
            
            for (let i = 0; i < colors.length; i += 3) {
                const choiceIndex = Math.floor((i / 3) / (colors.length / (3 * choices.length)));
                const choiceType = choices[choiceIndex];
                
                if (choiceType) {
                    const choiceColors = {
                        mirror: [0.29, 0.56, 0.89], // 4a90e2
                        tree: [0.49, 0.83, 0.13],   // 7ed321
                        door: [0.96, 0.64, 0.14],   // f5a623
                        clock: [0.91, 0.30, 0.24],  // e94b3c
                        ai: [0.56, 0.07, 0.99],     // 9013fe
                        void: [0.31, 0.89, 0.76],   // 50e3c2
                        library: [0.69, 0.61, 0.85], // b19cd9
                        laboratory: [1.0, 0.42, 0.42], // ff6b6b
                        theater: [0.31, 0.80, 0.77]  // 4ecdc4
                    };
                    
                    const color = choiceColors[choiceType] || [0.5, 0.5, 0.5];
                    colors[i] = color[0];
                    colors[i + 1] = color[1];
                    colors[i + 2] = color[2];
                }
            }
            
            strand.geometry.attributes.color.needsUpdate = true;
        });
    }
    
    update(deltaTime, elapsedTime) {
        // Animate DNA helix
        if (this.storyDNA.dnaVisualization) {
            const helix = this.storyDNA.dnaVisualization;
            helix.rotation.y += deltaTime * helix.userData.rotationSpeed;
            helix.userData.pulsePhase += deltaTime * 2;
            
            // Pulse based on evolution level
            const scale = 1 + Math.sin(helix.userData.pulsePhase) * 
                helix.userData.evolutionLevel * 0.1;
            helix.scale.setScalar(scale);
        }
        
        // Animate code fragments
        this.storyDNA.codeFragments.forEach(fragment => {
            fragment.rotation.y += deltaTime * fragment.userData.rotationSpeed;
            fragment.userData.floatPhase += deltaTime;
            fragment.position.y += Math.sin(fragment.userData.floatPhase) * 0.01;
            
            if (fragment.userData.activated) {
                // Enhanced animation for activated fragments
                const pulse = Math.sin(elapsedTime * 4) * 0.2 + 1;
                fragment.scale.setScalar(pulse);
                fragment.children[1].material.opacity = 
                    Math.min(1, fragment.children[1].material.opacity + deltaTime * 0.5);
            } else {
                fragment.children[1].material.opacity = 
                    Math.max(0.3, fragment.children[1].material.opacity - deltaTime * 0.2);
            }
        });
        
        // Animate evolution markers
        this.storyDNA.evolutionMarkers.forEach(marker => {
            const markerData = marker.userData;
            
            if (markerData.material.uniforms) {
                markerData.material.uniforms.time.value = elapsedTime;
            }
            
            // Animate orbiting rings
            marker.children.forEach(child => {
                if (child.userData && child.userData.type === 'evolutionRing') {
                    child.rotation.y += deltaTime * child.userData.rotationSpeed;
                    child.rotation.z += deltaTime * child.userData.rotationSpeed * 0.5;
                }
            });
            
            // Pulse when recently evolved
            if (Date.now() - markerData.lastEvolution < 5000) {
                const pulse = Math.sin(elapsedTime * 6) * 0.3 + 1;
                marker.scale.setScalar(pulse);
            } else {
                marker.scale.setScalar(1);
            }
        });
        
        // Animate pattern nodes
        this.storyDNA.patterns.forEach(pattern => {
            const patternData = pattern.userData;
            
            // Matrix effect for activated cells
            patternData.cells.forEach((cell, index) => {
                if (cell.userData.activated) {
                    const wave = Math.sin(elapsedTime * 3 + index * 0.5) * 0.1 + 0.9;
                    cell.scale.setScalar(wave);
                    
                    // Create occasional data sparks
                    if (Math.random() < 0.01) {
                        this.createDataSpark(cell);
                    }
                }
            });
            
            // Rotate entire pattern based on complexity
            pattern.rotation.y += deltaTime * patternData.complexity * 0.5;
        });
    }
    
    createDataSpark(cell) {
        const sparkGeometry = new THREE.SphereGeometry(0.05, 6, 6);
        const sparkMaterial = new THREE.MeshBasicMaterial({
            color: cell.material.color.getHex(),
            transparent: true,
            opacity: 0.8
        });
        
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        spark.position.copy(cell.position);
        spark.position.add(cell.parent.position);
        
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            Math.random() * 0.1,
            (Math.random() - 0.5) * 0.1
        );
        
        this.scene.add(spark);
        
        const animateSpark = () => {
            spark.position.add(velocity.clone().multiplyScalar(0.02));
            spark.material.opacity -= 0.02;
            spark.scale.multiplyScalar(0.98);
            
            if (spark.material.opacity > 0) {
                requestAnimationFrame(animateSpark);
            } else {
                this.scene.remove(spark);
                sparkMaterial.dispose();
                sparkGeometry.dispose();
            }
        };
        
        animateSpark();
    }
}

export { StoryDNASystem };