// js/AI.js
import Player from './Player.js';

export default class AI {
    constructor(color) {
        this.player = new Player(color);
    }

    getMove(board) {
        const bestMove = this.minimax(board, 3, true); // Depth limit can be adjusted
        return bestMove.move; // Returns the best move found
    }

    makeMove(board) {
        const { col, row } = this.getMove(board);
        const squareIdToFill = row * board.cols + col;
        return squareIdToFill; // Returns the square ID where the AI will place its piece
    }

    

    
}
