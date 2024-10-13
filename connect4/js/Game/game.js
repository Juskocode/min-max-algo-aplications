// js/Game.js
import Board from './Board.js';
import Player from './Player.js';
import AI from './AI.js';

export default class Game {
    constructor() {
        this.iterations = 0;
        this.MAX_DEPTH = 12;
        this.ROWS = 6;
        this.COLS = 7;
        this.WIN_LENGTH = 4;
        this.origBoard = new Board(this.ROWS, this.COLS);
        this.huPlayer = new Player('yellow');
        this.aiPlayer = new Player('red');
        this.isPlayerTurn = true;
        this.initGame();
    }

    initGame() {
        this.origBoard.reset();
        this.updateBoardUI();
        this.hideEndGameModal();
        this.updateStatus();
    }

    resetGame() {
        this.initGame(); // Re-initialize the game when resetting
    }

    updateBoardUI() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.innerText = '';
            cell.style.backgroundColor = '';
            cell.classList.remove('piece-pulse');
            cell.addEventListener('click', this.turnClick.bind(this));
        });
    }

    hideEndGameModal() {
        document.getElementById('endgame-modal').style.display = 'none';
    }

    updateStatus() {
        const statusText = this.isPlayerTurn ? "Player 1's Turn (Red)" : "AI's Turn (Yellow)";
        document.getElementById('status').innerText = statusText;
    }

    turnClick(event) {
        if (!this.isPlayerTurn) return;

        const squareId = event.target.id;
        const col = squareId % this.COLS;
        const row = this.origBoard.getLowestEmptyRow(col);

        if (row !== null) {
            if (this.isPlayerTurn) {
                this.turn(col, this.huPlayer);
                this.isPlayerTurn = false;
            }

            setTimeout(() => {
                this.turn(this.turnAi(), this.aiPlayer);
            }, 500);
            this.iterations = 0;
        }
    }

    turn(col, player) {
        console.log(this.iterations);
        const row = this.origBoard.getLowestEmptyRow(col);
        this.origBoard.setCell(row, col, player.color);
        const squareId = row * this.COLS + col;
        const square = document.getElementById(squareId);
        square.style.backgroundColor = player.color === this.huPlayer.color ? '#50fa7b' : '#ff77e1';
        square.classList.add('piece-pulse');

        setTimeout(() => {
            square.classList.remove('piece-pulse');
        }, 500);

        square.removeEventListener('click', this.turnClick.bind(this));

        setTimeout(() => {
            if (this.checkWin(row, col, player.color)) {
                this.showEndGameModal(`${player.color} wins!`);
                return;
            }

            if (this.checkTie()) {
                this.showEndGameModal("It's a tie!");
            } else {
                this.isPlayerTurn = true;
                this.updateStatus();
            }
        }, 500);
    }

    turnAi() {
        return this.minimax(this.MAX_DEPTH, true, -Infinity, Infinity);
    }

    checkWin(row, col, playerColor) {
        return this.checkDirection(row, col, playerColor, 1, 0) || // Vertical
               this.checkDirection(row, col, playerColor, 0, 1) || // Horizontal
               this.checkDirection(row, col, playerColor, 1, 1) || // Diagonal \
               this.checkDirection(row, col, playerColor, 1, -1);  // Diagonal /
    }

    checkDirection(row, col, playerColor, deltaRow, deltaCol) {
        let count = 1;
        count += this.countInDirection(row, col, playerColor, deltaRow, deltaCol);
        count += this.countInDirection(row, col, playerColor, -deltaRow, -deltaCol);
        return count >= this.WIN_LENGTH;
    }

    countInDirection(row, col, playerColor, deltaRow, deltaCol) {
        let r = row + deltaRow;
        let c = col + deltaCol;
        let count = 0;

        while (r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS && this.origBoard.getCell(r, c) === playerColor) {
            count++;
            r += deltaRow;
            c += deltaCol;
        }
        return count;
    }

    checkTie() {
        return this.origBoard.isFull();
    }

    showEndGameModal(message) {
        const modal = document.getElementById('endgame-modal');
        modal.style.display = 'flex';
        modal.querySelector('p').innerText = message;
        this.origBoard.reset(); // Reset the board after showing the modal
    }

    minimax(depth, isMaximizing, alpha, beta, r, c) {
        // Check for terminal states
        this.iterations++;
        
        const humanColor = 'red'; // Assuming the human player is 'red'
        const aiColor = this.aiPlayer.color;
    
        // Check for win conditions
        const humanWin = this.checkWin(r, c, humanColor);
        const aiWin = this.checkWin(r, c, aiColor);
    
        if (aiWin) {
            return 100 - depth;  // AI win
        } 
        if (humanWin) {
            return depth - 100;  // Human win (AI needs to block)
        } 
        if (this.origBoard.isFull()) {
            return 0;  // Tie
        }
    
        if (depth === 0) return 0; // Stop search at max depth
    
        let bestScore = isMaximizing ? -Infinity : Infinity;  // Initialize based on player type
        let bestCol = null;
    
        for (let col = 0; col < this.origBoard.cols; col++) {
            const row = this.origBoard.getLowestEmptyRow(col);
            if (row !== null) {
                // Simulate the move
                const playerColor = isMaximizing ? aiColor : humanColor;  // AI or human player
                this.origBoard.setCell(row, col, playerColor);
                console.log(`Simulating move at (${row}, ${col}) by ${playerColor}`);
    
                // Check if this move would lead to a win for the human player
                if (!isMaximizing) {
                    if (this.checkWin(row, col, humanColor)) {
                        this.origBoard.resetCell(row, col);  // Undo the move
                        return -1000;  // High penalty for allowing a win
                    }
                }
    
                // Recursive call to minimax
                const score = this.minimax(depth - 1, !isMaximizing, alpha, beta, row, col);  
    
                this.origBoard.resetCell(row, col);  // Undo the move
    
                if (isMaximizing) {
                    if (score > bestScore) {
                        bestScore = score;
                        bestCol = col;  // Track the best column for AI
                    }
                    alpha = Math.max(bestScore, alpha);
                } else {
                    if (score < bestScore) {
                        bestScore = score;
                        bestCol = col;  // Track the best column for human
                    }
                    beta = Math.min(bestScore, beta);
                }
    
                // Alpha-beta pruning
                if (beta <= alpha) {
                    break;
                }
            }
        }
    
        console.log(`Best column: ${bestCol}, Score: ${bestScore}`);
        return depth === this.MAX_DEPTH ? bestCol : bestScore;  // Return the best move (column index)
    }
}    
