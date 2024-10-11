// js/main.js
import Game from './Game/game.js';

window.startGame = () => {
    new Game();
};

// Start the game when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    startGame();
});
