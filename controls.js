import * as THREE from 'three';

class ControlsManager {
    constructor(camera, pointerLockControls) {
        this.camera = camera;
        this.controls = pointerLockControls;
        
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        this.autoMoveDirection = null;
        this.autoMoveSpeed = 0;
        
        this.prevTime = performance.now();
        
        this.setupKeyboardControls();
        this.setupMobileControls();
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = true;
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = false;
                    break;
            }
        });
    }
    
    setupMobileControls() {
        // Mobile joystick movement
        window.addEventListener('mobile-move', (event) => {
            const { angle, force } = event.detail;
            const normalizedForce = Math.min(force, 1);
            
            // Convert angle to movement direction
            const radians = (angle - 90) * Math.PI / 180; // Adjust for forward being 0°
            
            this.mobileDirection = {
                x: Math.cos(radians) * normalizedForce,
                z: Math.sin(radians) * normalizedForce
            };
        });
        
        window.addEventListener('mobile-stop', () => {
            this.mobileDirection = null;
        });
        
        // Mobile interaction
        window.addEventListener('mobile-interact', () => {
            // Trigger interaction event
            window.dispatchEvent(new Event('mobile-interaction'));
        });
        
        window.addEventListener('mobile-next', () => {
            // Trigger next story event
            document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
        });
    }
    
    autoMove(direction) {
        this.autoMoveDirection = direction.clone().normalize();
        this.autoMoveSpeed = 5; // units per second
    }
    
    stopAutoMove() {
        this.autoMoveDirection = null;
        this.autoMoveSpeed = 0;
    }
    
    update(delta) {
        if (!this.controls.isLocked) return;
        
        const moveSpeed = 10; // units per second
        
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        
        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();
        
        // Handle mobile movement
        if (this.mobileDirection) {
            this.direction.x = this.mobileDirection.x;
            this.direction.z = this.mobileDirection.z;
        }
        
        // Handle auto-movement
        if (this.autoMoveDirection && this.autoMoveSpeed > 0) {
            this.direction.x = this.autoMoveDirection.x;
            this.direction.z = this.autoMoveDirection.z;
            
            // Gradually reduce auto-move speed
            this.autoMoveSpeed -= delta * 2;
            if (this.autoMoveSpeed <= 0) {
                this.stopAutoMove();
            }
        }
        
        if (this.moveForward || this.moveBackward || this.mobileDirection || this.autoMoveDirection) {
            this.velocity.z -= this.direction.z * moveSpeed * delta;
        }
        
        if (this.moveLeft || this.moveRight || this.mobileDirection || this.autoMoveDirection) {
            this.velocity.x -= this.direction.x * moveSpeed * delta;
        }
        
        this.controls.moveRight(-this.velocity.x * delta);
        this.controls.moveForward(-this.velocity.z * delta);
        
        // Clamp camera position to reasonable bounds
        this.camera.position.x = Math.max(-50, Math.min(50, this.camera.position.x));
        this.camera.position.z = Math.max(-50, Math.min(50, this.camera.position.z));
        this.camera.position.y = Math.max(0.5, Math.min(10, this.camera.position.y));
    }
}

export { ControlsManager };

