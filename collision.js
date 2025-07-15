import { CONFIG } from './config.js';

export class CollisionDetector {
    static checkCollision(x, y, world) {
        const playerRect = {
            x: x,
            y: y,
            width: CONFIG.TILE_SIZE,
            height: CONFIG.TILE_SIZE
        };
        
        for (const obstacle of Object.values(world.obstacles)) {
            const obstacleRect = {
                x: obstacle.x * CONFIG.TILE_SIZE,
                y: obstacle.y * CONFIG.TILE_SIZE,
                width: CONFIG.TILE_SIZE,
                height: CONFIG.TILE_SIZE
            };
            
            if (playerRect.x < obstacleRect.x + obstacleRect.width &&
                playerRect.x + playerRect.width > obstacleRect.x &&
                playerRect.y < obstacleRect.y + obstacleRect.height &&
                playerRect.y + playerRect.height > obstacleRect.y) {
                return true;
            }
        }
        return false;
    }
    
    static checkProjectileCollision(projectile, world) {
        const newX = projectile.x + projectile.vx;
        const newY = projectile.y + projectile.vy;
        
        // World bounds
        if (newX < 0 || newX > CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE ||
            newY < 0 || newY > CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE) {
            return null;
        }
        
        // Obstacle collision
        for (const obstacle of Object.values(world.obstacles)) {
            const obstacleRect = {
                x: obstacle.x * CONFIG.TILE_SIZE,
                y: obstacle.y * CONFIG.TILE_SIZE,
                width: CONFIG.TILE_SIZE,
                height: CONFIG.TILE_SIZE
            };
            
            if (newX > obstacleRect.x && newX < obstacleRect.x + obstacleRect.width &&
                newY > obstacleRect.y && newY < obstacleRect.y + obstacleRect.height) {
                return null;
            }
        }
        
        return { ...projectile, x: newX, y: newY };
    }
}

