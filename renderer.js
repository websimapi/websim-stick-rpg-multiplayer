import { CONFIG, COLORS } from './config.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = { x: 0, y: 0 };
    }
    
    setCameraPosition(x, y) {
        this.camera.x = x - CONFIG.CANVAS_WIDTH / 2;
        this.camera.y = y - CONFIG.CANVAS_HEIGHT / 2;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    saveContext() {
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
    }
    
    restoreContext() {
        this.ctx.restore();
    }
    
    renderWorld(world) {
        // Ground
        this.ctx.fillStyle = COLORS.GROUND;
        this.ctx.fillRect(0, 0, CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE, CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE);
        
        // Grid lines
        this.ctx.strokeStyle = COLORS.GRID_LINES;
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= CONFIG.WORLD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * CONFIG.TILE_SIZE, 0);
            this.ctx.lineTo(x * CONFIG.TILE_SIZE, CONFIG.WORLD_HEIGHT * CONFIG.TILE_SIZE);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= CONFIG.WORLD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * CONFIG.TILE_SIZE);
            this.ctx.lineTo(CONFIG.WORLD_WIDTH * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE);
            this.ctx.stroke();
        }
        
        // Obstacles
        for (const obstacle of Object.values(world.obstacles)) {
            this.renderObstacle(obstacle);
        }
    }
    
    renderObstacle(obstacle) {
        const x = obstacle.x * CONFIG.TILE_SIZE;
        const y = obstacle.y * CONFIG.TILE_SIZE;
        
        switch (obstacle.type) {
            case 'tree':
                this.ctx.fillStyle = COLORS.TREE;
                this.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                this.ctx.fillStyle = COLORS.TREE_ACCENT;
                this.ctx.fillRect(x + 4, y + 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 8);
                break;
            case 'rock':
                this.ctx.fillStyle = COLORS.ROCK;
                this.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                this.ctx.fillStyle = COLORS.ROCK_ACCENT;
                this.ctx.fillRect(x + 2, y + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);
                break;
            case 'house':
                this.ctx.fillStyle = COLORS.HOUSE;
                this.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                this.ctx.fillStyle = COLORS.HOUSE_ACCENT;
                this.ctx.fillRect(x + 2, y + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);
                this.ctx.fillStyle = COLORS.HOUSE_DOOR;
                this.ctx.fillRect(x + 8, y + 16, 8, 12);
                break;
        }
    }
    
    renderPlayer(player, clientId, peers) {
        const x = player.x;
        const y = player.y;
        
        // Body
        this.ctx.fillStyle = COLORS.PLAYER_BODY;
        this.ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        
        // Head
        this.ctx.fillStyle = COLORS.PLAYER_HEAD;
        this.ctx.fillRect(x + 8, y + 4, 16, 12);
        
        // Eyes
        this.ctx.fillStyle = COLORS.PLAYER_EYES;
        if (player.direction > 0) {
            this.ctx.fillRect(x + 18, y + 6, 2, 2);
        } else {
            this.ctx.fillRect(x + 12, y + 6, 2, 2);
        }
        
        // Arms
        this.ctx.strokeStyle = COLORS.PLAYER_HEAD;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 8, y + 20);
        this.ctx.lineTo(x, y + 22);
        this.ctx.moveTo(x + 24, y + 20);
        this.ctx.lineTo(x + 32, y + 22);
        this.ctx.stroke();
        
        // Legs
        this.ctx.beginPath();
        this.ctx.moveTo(x + 8, y + 28);
        this.ctx.lineTo(x + 4, y + 32);
        this.ctx.moveTo(x + 24, y + 28);
        this.ctx.lineTo(x + 28, y + 32);
        this.ctx.stroke();
        
        // Player name and health
        this.renderPlayerUI(player, clientId, peers);
    }
    
    renderProjectiles(projectiles) {
        this.ctx.fillStyle = COLORS.PROJECTILE;
        for (const projectile of Object.values(projectiles)) {
            this.ctx.fillRect(projectile.x - 2, projectile.y - 2, 4, 4);
        }
    }
    
    renderPlayerUI(player, clientId, peers) {
        // These DOM elements are handled in the main game class
    }
}