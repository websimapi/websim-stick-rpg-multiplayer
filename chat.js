export class ChatManager {
    constructor(room) {
        this.room = room;
        this.chatInput = document.getElementById('chatInput');
        this.chatMessages = document.getElementById('chatMessages');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.chatInput.value.trim()) {
                this.room.send({
                    type: 'chat',
                    message: this.chatInput.value.trim(),
                    username: this.room.peers[this.room.clientId].username
                });
                this.chatInput.value = '';
            }
        });
        
        this.room.onmessage = (event) => {
            if (event.data.type === 'chat') {
                this.addMessage(`${event.data.username}: ${event.data.message}`);
            }
        };
    }
    
    addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

