import Game from './Game.js';

let game;
window.onload = () => {
    game = new Game();
    window.gameInstance = game; // Expose for HTML event handlers
};

window.chooseSymbol = (symbol) => {
    game.chooseSymbol(symbol);
};

window.startGame = () => {
    game.startGame();
};

window.updateDepth = (value) => {
    game.updateDepth(value);
};
