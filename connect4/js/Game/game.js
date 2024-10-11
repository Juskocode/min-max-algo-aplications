// js/Game.js
import Board from './Board.js';
import Player from './Player.js';

export default class Game {
    constructor() {
        this.ROWS = 6;
        this.COLS = 7;
        this.WIN_LENGTH = 4;
        this.origBoard = new Board(this.ROWS, this.COLS);
        this.huPlayer = new Player('red');
        this.aiPlayer = new Player('yellow');
        this.isPlayerTurn = true;
        this.initGame();
    }

    initGame() {
        this.origBoard.reset();
        this.updateBoardUI();
        this.hideEndGameModal();
        this.updateStatus();
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
            const squareIdToFill = row * this.COLS + col;
            this.turn(squareIdToFill, this.huPlayer);
            this.isPlayerTurn = false;

            setTimeout(() => {
                this.turnAi();
            }, 500);
        }
    }

    turn(squareId, player) {
        const row = Math.floor(squareId / this.COLS);
        const col = squareId % this.COLS;
        this.origBoard.setCell(row, col, player.color);

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
        let col, row;
        do {
            col = Math.floor(Math.random() * this.COLS);
            row = this.origBoard.getLowestEmptyRow(col);
        } while (row === null);

        const squareIdToFill = row * this.COLS + col;
        this.turn(squareIdToFill, this.aiPlayer);
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
}
