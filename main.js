import { Game } from './game.js';
import { GameState } from './gameState.js';
import { Renderer } from './renderer.js';
import { ChatManager } from './chat.js';
import { UIManager } from './ui.js';

class Main {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.gameState = new GameState();
        this.renderer = new Renderer(this.canvas);
        this.chatManager = null;
        this.uiManager = null;
        this.game = null;
        this.room = null;
    }
    
    async initialize() {
        // Initialize room
        this.room = new WebsimSocket();
        await this.room.initialize();
        
        // Initialize game
        this.game = new Game(this.room);
        this.chatManager = new ChatManager(this.room);
        this.uiManager = new UIManager(this.room);
        
        this.game.initialize();
        this.setupSubscriptions();
        this.gameLoop();
    }
    
    setupSubscriptions() {
        // Subscribe to presence updates
        this.room.subscribePresence((presence) => {
            this.gameState.updatePlayers(presence);
            this.uiManager.updatePlayerCount(Object.keys(presence).length);
            
            // Clean up UI for disconnected players
            const currentClients = Object.keys(presence);
            const existingElements = document.querySelectorAll('[data-client]');
            existingElements.forEach(el => {
                const clientId = el.getAttribute('data-client');
                if (!currentClients.includes(clientId)) {
                    el.remove();
                }
            });
        });
        
        // Subscribe to room state updates
        this.room.subscribeRoomState((roomState) => {
            this.gameState.updateProjectiles(roomState.projectiles);
            this.gameState.updateWorld(roomState.world);
        });
        
        // Handle damage requests
        this.room.subscribePresenceUpdateRequests((updateRequest, fromClientId) => {
            const player = this.room.presence[this.room.clientId];
            if (updateRequest.type === 'damage' && !player.dead) {
                const newHealth = Math.max(0, player.health - updateRequest.amount);
                this.room.updatePresence({
                    ...player,
                    health: newHealth,
                    dead: newHealth <= 0
                });
                
                this.uiManager.updatePlayerHealth(newHealth);
                
                if (newHealth <= 0) {
                    // Respawn after delay
                    setTimeout(() => {
                        this.room.updatePresence({
                            x: Math.random() * 25 * 32,
                            y: Math.random() * 18 * 32,
                            health: 100,
                            maxHealth: 100,
                            direction: 1,
                            dead: false
                        });
                    }, 3000);
                }
            }
        });
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.game.update(this.gameState);
        
        // Update UI
        const player = this.room.presence[this.room.clientId];
        if (player) {
            this.uiManager.updatePlayerHealth(player.health);
        }
    }
    
    render() {
        this.renderer.clear();
        this.renderer.saveContext();
        
        // Render world
        this.renderer.renderWorld(this.gameState.world);
        
        // Render players
        for (const [clientId, player] of Object.entries(this.gameState.players)) {
            if (!player.dead) {
                this.renderer.renderPlayer(player, clientId);
                this.uiManager.renderPlayerUI(player, clientId, this.room.peers, this.renderer.camera);
            }
        }
        
        // Render projectiles
        this.renderer.renderProjectiles(this.gameState.projectiles);
        
        this.renderer.restoreContext();
    }
}

// Initialize and start the game
const main = new Main();
main.initialize();

// Prevent context menu
document.getElementById('gameCanvas').addEventListener('contextmenu', (e) => e.preventDefault());