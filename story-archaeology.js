import * as THREE from 'three';

class StoryArchaeologySystem {
    constructor(scene, uiManager) {
        this.scene = scene;
        this.uiManager = uiManager;
        this.storyArchaeology = {
            markers: [],
            discoveries: new Set(),
            ancientEchoes: [],
            narrativeRunes: [],
            choiceObelisks: []
        };
        
        this.init();
    }
    
    init() {
        this.createStoryArchaeologySystem();
    }
    
    createStoryArchaeologySystem() {
        // Create ancient markers that reveal story history
        for (let i = 0; i < 10; i++) {
            const marker = this.createArchaeologyMarker();
            marker.position.set(
                (Math.random() - 0.5) * 80,
                0.1,
                (Math.random() - 0.5) * 80
            );
            this.scene.add(marker);
            this.storyArchaeology.markers.push(marker);
        }
        
        // Create choice obelisks
        for (let i = 0; i < 5; i++) {
            const obelisk = this.createChoiceObelisk();
            obelisk.position.set(
                (Math.random() - 0.5) * 60,
                0,
                (Math.random() - 0.5) * 60
            );
            this.scene.add(obelisk);
            this.storyArchaeology.choiceObelisks.push(obelisk);
        }
        
        // Create narrative runes
        for (let i = 0; i < 8; i++) {
            const rune = this.createNarrativeRune();
            rune.position.set(
                (Math.random() - 0.5) * 70,
                2 + Math.random() * 5,
                (Math.random() - 0.5) * 70
            );
            this.scene.add(rune);
            this.storyArchaeology.narrativeRunes.push(rune);
        }
    }
    
    createArchaeologyMarker() {
        const markerGroup = new THREE.Group();
        
        const markerGeometry = new THREE.CylinderGeometry(0.5, 0.8, 0.2, 8);
        const markerMaterial = new THREE.MeshLambertMaterial({
            color: 0x8888aa,
            transparent: true,
            opacity: 0.7
        });
        
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        markerGroup.add(marker);
        
        markerGroup.userData = {
            type: 'archaeologyMarker',
            discovered: false,
            storyFragment: null,
            activationRadius: 3
        };
        
        return markerGroup;
    }
    
    createChoiceObelisk() {
        const obeliskGroup = new THREE.Group();
        
        const obeliskGeometry = new THREE.BoxGeometry(0.5, 4, 0.5);
        const obeliskMaterial = new THREE.MeshLambertMaterial({
            color: 0x666699,
            transparent: true,
            opacity: 0.8
        });
        
        const obelisk = new THREE.Mesh(obeliskGeometry, obeliskMaterial);
        obelisk.position.y = 2;
        obeliskGroup.add(obelisk);
        
        obeliskGroup.userData = {
            type: 'choiceObelisk',
            isActive: false,
            recordedChoices: [],
            glowIntensity: 0
        };
        
        return obeliskGroup;
    }
    
    createNarrativeRune() {
        const runeGroup = new THREE.Group();
        
        const runeGeometry = new THREE.TorusGeometry(0.8, 0.2, 8, 16);
        const runeMaterial = new THREE.MeshBasicMaterial({
            color: 0xaa88ff,
            transparent: true,
            opacity: 0.6,
            wireframe: true
        });
        
        const rune = new THREE.Mesh(runeGeometry, runeMaterial);
        runeGroup.add(rune);
        
        runeGroup.userData = {
            type: 'narrativeRune',
            isActive: false,
            message: null,
            rotationSpeed: 0.5 + Math.random() * 0.5
        };
        
        return runeGroup;
    }
    
    recordChoiceInArchaeology(node, storyDNASystem) {
        const choice = node.userData.storyType;
        this.storyArchaeology.discoveries.add(choice);
        
        // Activate nearby obelisk
        const nearestObelisk = this.storyArchaeology.choiceObelisks.find(obelisk => 
            obelisk.position.distanceTo(node.position) < 20
        );
        
        if (nearestObelisk) {
            nearestObelisk.userData.isActive = true;
            nearestObelisk.userData.recordedChoices.push(choice);
            nearestObelisk.userData.glowIntensity = Math.min(1, 
                nearestObelisk.userData.glowIntensity + 0.3);
        }
        
        // Activate nearby rune
        const nearestRune = this.storyArchaeology.narrativeRunes.find(rune =>
            rune.position.distanceTo(node.position) < 15
        );
        
        if (nearestRune && !nearestRune.userData.isActive) {
            nearestRune.userData.isActive = true;
            nearestRune.userData.message = `Ancient choice: ${choice}`;
        }

        // Update Story DNA using the new system
        if (storyDNASystem) {
            storyDNASystem.updateStoryDNA(choice, node.position);
        }
        
        // Show archaeology notification
        if (this.uiManager) {
            this.uiManager.showNotification(
                `Archaeological Discovery!\nChoice "${choice}" recorded in the narrative ruins.\nStory DNA evolving...`,
                'archaeology'
            );
        }
    }
    
    update({ dt, t }) {
        // Update narrative runes
        this.storyArchaeology.narrativeRunes.forEach(rune => {
            if (rune.userData.isActive) {
                rune.rotation.y += dt * rune.userData.rotationSpeed;
                rune.children[0].material.opacity = 0.6 + Math.sin(t * 3) * 0.2;
            }
        });
        
        // Update choice obelisks
        this.storyArchaeology.choiceObelisks.forEach(obelisk => {
            if (obelisk.userData.isActive) {
                const glow = Math.sin(t * 2) * 0.3 + 0.7;
                obelisk.children[0].material.opacity = 0.8 * glow * obelisk.userData.glowIntensity;
            }
        });
    }
}

export { StoryArchaeologySystem };