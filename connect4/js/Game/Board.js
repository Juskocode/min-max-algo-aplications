// js/Board.js
export default class Board {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.board = Array.from(Array(rows), () => Array(cols).fill(null));
    }

    reset() {
        this.board = Array.from(Array(this.rows), () => Array(this.cols).fill(null));
    }

    setCell(row, col, playerColor) {
        this.board[row][col] = playerColor;
    }

    getCell(row, col) {
        return this.board[row][col];
    }

    getLowestEmptyRow(col) {
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col] === null) {
                return row;
            }
        }
        return null;
    }

    isFull() {
        return this.board.flat().every(cell => cell !== null);
    }
}
