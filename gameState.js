export class GameState {
    constructor() {
        this.players = {};
        this.projectiles = {};
        this.world = {
            obstacles: {
                "tree-1": { x: 5, y: 5, type: "tree" },
                "tree-2": { x: 15, y: 8, type: "tree" },
                "tree-3": { x: 20, y: 12, type: "tree" },
                "rock-1": { x: 8, y: 3, type: "rock" },
                "rock-2": { x: 18, y: 15, type: "rock" },
                "house-1": { x: 12, y: 6, type: "house" }
            }
        };
    }
    
    updatePlayers(players) {
        this.players = players;
    }
    
    updateProjectiles(projectiles) {
        this.projectiles = projectiles || {};
    }
    
    updateWorld(world) {
        this.world = world || this.world;
    }
}

