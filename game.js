import { CONFIG } from './config.js';
import { CollisionDetector } from './collision.js';

export class Game {
    constructor(room) {
        this.room = room;
        this.keys = {};
        this.lastShot = 0;
    }
    
    initialize() {
        // Initialize room state
        this.room.updateRoomState({
            projectiles: {},
            world: {
                obstacles: {
                    "tree-1": { x: 5, y: 5, type: "tree" },
                    "tree-2": { x: 15, y: 8, type: "tree" },
                    "tree-3": { x: 20, y: 12, type: "tree" },
                    "rock-1": { x: 8, y: 3, type: "rock" },
                    "rock-2": { x: 18, y: 15, type: "rock" },
                    "house-1": { x: 12, y: 6, type: "house" }
                }
            }
        });
        
        // Initialize player presence
        this.room.updatePresence({
            x: Math.random() * CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE,
            y: Math.random() * CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE,
            health: 100,
            maxHealth: 100,
            direction: 1,
            dead: false
        });
        
        this.setupInputHandlers();
    }
    
    setupInputHandlers() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    update(gameState) {
        const player = this.room.presence[this.room.clientId];
        if (!player || player.dead) return;
        
        let dx = 0;
        let dy = 0;
        
        if (this.keys['w'] || this.keys['ArrowUp']) dy -= CONFIG.PLAYER_SPEED;
        if (this.keys['s'] || this.keys['ArrowDown']) dy += CONFIG.PLAYER_SPEED;
        if (this.keys['a'] || this.keys['ArrowLeft']) { 
            dx -= CONFIG.PLAYER_SPEED; 
            this.room.updatePresence({ ...player, direction: -1 }); 
        }
        if (this.keys['d'] || this.keys['ArrowRight']) { 
            dx += CONFIG.PLAYER_SPEED; 
            this.room.updatePresence({ ...player, direction: 1 }); 
        }
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        const newX = Math.max(0, Math.min(CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE - CONFIG.TILE_SIZE, player.x + dx));
        const newY = Math.max(0, Math.min(CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE - CONFIG.TILE_SIZE, player.y + dy));
        
        // Check collision
        if (!CollisionDetector.checkCollision(newX, newY, gameState.world)) {
            this.room.updatePresence({ ...player, x: newX, y: newY });
        }
        
        // Shooting
        if (this.keys[' '] && Date.now() - this.lastShot > CONFIG.SHOOT_COOLDOWN) {
            this.shoot();
            this.lastShot = Date.now();
        }
        
        this.updateProjectiles(gameState);
    }
    
    shoot() {
        const player = this.room.presence[this.room.clientId];
        const projectiles = this.room.roomState.projectiles || {};
        const id = Date.now().toString();
        
        projectiles[id] = {
            x: player.x + CONFIG.TILE_SIZE / 2,
            y: player.y + CONFIG.TILE_SIZE / 2,
            vx: player.direction * CONFIG.PROJECTILE_SPEED,
            vy: 0,
            owner: this.room.clientId
        };
        
        this.room.updateRoomState({ projectiles });
    }
    
    updateProjectiles(gameState) {
        const projectiles = this.room.roomState.projectiles || {};
        const updatedProjectiles = {};
        
        for (const [id, projectile] of Object.entries(projectiles)) {
            const newProjectile = CollisionDetector.checkProjectileCollision(projectile, gameState.world);
            if (newProjectile) {
                updatedProjectiles[id] = newProjectile;
            } else {
                // Hit detection
                for (const [clientId, target] of Object.entries(this.room.presence)) {
                    if (clientId !== projectile.owner && !target.dead) {
                        const dist = Math.hypot(
                            newProjectile ? newProjectile.x : projectile.x - target.x,
                            newProjectile ? newProjectile.y : projectile.y - target.y
                        );
                        if (dist < CONFIG.TILE_SIZE / 2) {
                            this.room.requestPresenceUpdate(clientId, {
                                type: 'damage',
                                amount: CONFIG.DAMAGE_AMOUNT
                            });
                        }
                    }
                }
            }
        }
        
        this.room.updateRoomState({ projectiles: updatedProjectiles });
    }
}