import * as THREE from 'three';
import { Entity } from './src/ecs/Entity.js';
import { Rotatable } from './src/components/Rotatable.js';
import { Floatable } from './src/components/Floatable.js';
import { Interactable } from './src/components/Interactable.js';
import { DynamicGround } from './src/components/DynamicGround.js';
import { HoverHighlight } from './src/components/HoverHighlight.js';

export function createSurrealCube({ size = 1, color = 0xff00ff, rotate = {}, float = {} } = {}) {
  const geo = new THREE.BoxGeometry(size, size, size);
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.6 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const entity = new Entity({ object3D: mesh });
  entity.add(new Rotatable(rotate));
  entity.add(new Floatable(float));

  return entity;
}

class WorldBuilder {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
    }
    
    createWorld(camera) {
        this.createGround(camera);
        this.createStoryNodes();
        this.createSurrealObjects();
        this.createArchitecturalElements();
    }
    
    createGround(camera) {
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
                varying float distanceToPlayer;
                void main() {
                    vec3 color1 = vec3(0.1, 0.1, 0.2);
                    vec3 color2 = vec3(0.2, 0.1, 0.3);
                    vec3 color3 = vec3(0.3, 0.2, 0.5);
                    
                    float pattern = sin(vUv.x * 10.0 + time) * sin(vUv.y * 10.0 + time);
                    float intensity = mix(0.5, storyIntensity, pattern);
                    
                    vec3 finalColor = mix(color1, mix(color2, color3, intensity), intensity);
                    gl_FragColor = vec4(finalColor, 0.8);
                }
            `,
            transparent: true
        });
        
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.receiveShadow = true;

        const groundEntity = new Entity({ object3D: groundMesh });
        groundEntity.add(new DynamicGround({ material: groundMaterial, camera: camera }));

        this.world.addEntity(groundEntity, { tags: ['ground'] });
        this.scene.add(groundMesh);
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
        
        nodeConfigs.forEach((config) => {
            const geometry = new THREE.BoxGeometry(2, 3, 1);
            const material = new THREE.MeshLambertMaterial({ 
                color: config.color,
                transparent: true,
                opacity: 0.7,
                emissive: 0x000000
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...config.pos);
            mesh.castShadow = true;

            const entity = new Entity({ object3D: mesh });
            entity.add(new Interactable({
                storyType: config.type,
                title: config.title,
            }));
            entity.add(new HoverHighlight());
            
            this.world.addEntity(entity, { tags: ['storyNode'] });
            this.scene.add(mesh);
            
            this.addFloatingText(config.title, mesh.position, 0.3);
        });
    }
    
    createSurrealObjects() {
        for (let i = 0; i < 12; i++) {
            const entity = createSurrealCube({
                size: 0.5 + Math.random(),
                color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
                rotate: { speed: (Math.random() - 0.5) * 2 },
                float: { speed: 0.5 + Math.random(), amplitude: 0.2 + Math.random() * 0.3 }
            });

            entity.object3D.position.set(
                (Math.random() - 0.5) * 50,
                2 + Math.random() * 5,
                (Math.random() - 0.5) * 50
            );

            this.world.addEntity(entity, { tags: ['surreal'] });
            this.scene.add(entity.object3D);
        }
    }
    
    createArchitecturalElements() {
        const stairGeometry = new THREE.BoxGeometry(10, 0.5, 2);
        const stairMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x333366,
            transparent: true,
            opacity: 0.7
        });
        
        for (let i = 0; i < 5; i++) {
            const stair = new THREE.Mesh(stairGeometry, stairMaterial);
            stair.position.set(20, i * 2, -20 + i * 3);
            stair.rotation.y = i * 0.3;
            this.scene.add(stair);
        }
        
        for (let i = 0; i < 6; i++) {
            const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.8, 8, 8);
            const pillarMaterial = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(0.8, 0.5, 0.3),
                transparent: true,
                opacity: 0.8
            });
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(
                (Math.random() - 0.5) * 60,
                4,
                (Math.random() - 0.5) * 60
            );
            pillar.rotation.z = (Math.random() - 0.5) * 0.5;
            this.scene.add(pillar);
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