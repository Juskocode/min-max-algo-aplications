// js/Game.js
import Board from './Board.js';
import Player from './Player.js';
import AI from './AI.js';

export default class Game {
    constructor() {
        this.iterations = 0;
        this.MAX_DEPTH = 5;
        this.ROWS = 6;
        this.COLS = 7;
        this.WIN_LENGTH = 4;
        this.origBoard = new Board(this.ROWS, this.COLS);
        this.huPlayer = new Player('yellow');
        this.aiPlayer = new Player('red');
        this.ai = new AI(this.aiPlayer.color, this.huPlayer.color, this.ROWS, this.COLS);
        this.isPlayerTurn = true;
        this.gameOver = false;
        this.initGame();
    }

    initGame() {
        this.origBoard.reset();
        this.gameOver = false;
        this.isPlayerTurn = true;
        this.updateBoardUI();
        this.hideEndGameModal();
        this.updateStatus();
        this.clearWeightsUI();
    }

    resetGame() {
        this.initGame();
    }

    updateBoardUI() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.innerText = '';
            cell.style.backgroundColor = '';
            cell.classList.remove('piece-pulse', 'red', 'yellow');
            cell.onclick = (e) => this.turnClick(e);
        });
    }

    clearWeightsUI() {
        for (let i = 0; i < this.COLS; i++) {
            document.getElementById(`weight-${i}`).innerText = '-';
        }
        document.getElementById('ai-thinking').style.visibility = 'hidden';
    }

    updateWeightsUI(scores) {
        scores.forEach((score, i) => {
            const el = document.getElementById(`weight-${i}`);
            if (score === null) {
                el.innerText = 'Full';
            } else {
                // Formatting score for better readability
                let displayScore = score;
                if (Math.abs(score) > 50000) displayScore = score > 0 ? 'WIN' : 'LOSE';
                el.innerText = displayScore;
            }
        });
    }

    hideEndGameModal() {
        document.getElementById('endgame-modal').style.display = 'none';
    }

    updateStatus() {
        const statusText = this.isPlayerTurn ? "Player 1's Turn (Yellow)" : "AI's Turn (Red)";
        const statusEl = document.getElementById('status');
        statusEl.innerText = statusText;
        statusEl.style.color = this.isPlayerTurn ? '#f1fa8c' : '#ff5555';
    }

    turnClick(event) {
        if (!this.isPlayerTurn || this.gameOver) return;

        const squareId = parseInt(event.target.id);
        if (isNaN(squareId)) return;
        
        const col = squareId % this.COLS;
        const row = this.origBoard.getLowestEmptyRow(col);

        if (row !== null) {
            this.turn(col, this.huPlayer);
            if (!this.gameOver) {
                this.isPlayerTurn = false;
                this.updateStatus();
                document.getElementById('ai-thinking').style.visibility = 'visible';
                setTimeout(() => {
                    this.turnAi();
                }, 800);
            }
        }
    }

    turn(col, player) {
        const row = this.origBoard.getLowestEmptyRow(col);
        this.origBoard.setCell(row, col, player.color);
        const squareId = row * this.COLS + col;
        const square = document.getElementById(squareId);
        
        // Add color class
        square.classList.add(player.color);
        square.classList.add('piece-pulse');
        setTimeout(() => square.classList.remove('piece-pulse'), 500);

        if (this.ai.checkWin(this.origBoard, player.color)) {
            this.gameOver = true;
            setTimeout(() => this.showEndGameModal(`${player.color === 'yellow' ? 'Yellow' : 'Red'} wins!`), 500);
            return;
        }

        if (this.origBoard.isFull()) {
            this.gameOver = true;
            setTimeout(() => this.showEndGameModal("It's a tie!"), 500);
            return;
        }
    }

    turnAi() {
        if (this.gameOver) return;
        
        const { move, scores } = this.ai.getMove(this.origBoard, this.MAX_DEPTH);
        this.updateWeightsUI(scores);
        document.getElementById('ai-thinking').style.visibility = 'hidden';
        
        this.turn(move, this.aiPlayer);
        
        if (!this.gameOver) {
            this.isPlayerTurn = true;
            this.updateStatus();
        }
    }

    showEndGameModal(message) {
        const modal = document.getElementById('endgame-modal');
        modal.style.display = 'flex';
        modal.querySelector('p').innerText = message;
    }
}
