export class UIManager {
    constructor(room) {
        this.room = room;
    }
    
    updatePlayerCount(count) {
        document.getElementById('playerCount').textContent = count;
    }
    
    updatePlayerHealth(health) {
        document.getElementById('playerHealth').textContent = health;
    }
    
    renderPlayerUI(player, clientId, peers, camera) {
        // Create or update player name
        let nameElement = document.querySelector(`[data-client="${clientId}"].player-name`);
        if (!nameElement) {
            nameElement = document.createElement('div');
            nameElement.className = 'player-name';
            nameElement.setAttribute('data-client', clientId);
            document.body.appendChild(nameElement);
        }
        
        nameElement.style.left = (player.x - camera.x + 16) + 'px';
        nameElement.style.top = (player.y - camera.y - 10) + 'px';
        nameElement.textContent = peers[clientId].username;
        
        // Create or update health bar
        let healthBar = document.querySelector(`[data-client="${clientId}"].health-bar`);
        if (!healthBar) {
            healthBar = document.createElement('div');
            healthBar.className = 'health-bar';
            healthBar.setAttribute('data-client', clientId);
            document.body.appendChild(healthBar);
        }
        
        healthBar.style.left = (player.x - camera.x + 16 - 20) + 'px';
        healthBar.style.top = (player.y - camera.y + 32 + 5) + 'px';
        
        let healthFill = healthBar.querySelector('.health-fill');
        if (!healthFill) {
            healthFill = document.createElement('div');
            healthFill.className = 'health-fill';
            healthBar.appendChild(healthFill);
        }
        
        healthFill.style.width = (player.health / player.maxHealth * 100) + '%';
    }
    
    removePlayerUI(clientId) {
        const nameElement = document.querySelector(`[data-client="${clientId}"].player-name`);
        const healthBar = document.querySelector(`[data-client="${clientId}"].health-bar`);
        
        if (nameElement) nameElement.remove();
        if (healthBar) healthBar.remove();
    }
}