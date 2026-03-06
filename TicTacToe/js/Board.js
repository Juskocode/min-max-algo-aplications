export default class Board {
    constructor(cells) {
        this.cells = cells ? [...cells] : Array.from(Array(9).keys());
    }

    getEmptySquares() {
        return this.cells.filter(s => typeof s === 'number');
    }

    makeMove(index, player) {
        this.cells[index] = player;
    }

    checkWin(player) {
        const winCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [6, 4, 2]
        ];
        let plays = this.cells.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
        for (let win of winCombos) {
            if (win.every(elem => plays.indexOf(elem) > -1)) {
                return { win: true, combo: win };
            }
        }
        return false;
    }

    isFull() {
        return this.getEmptySquares().length === 0;
    }

    reset() {
        this.cells = Array.from(Array(9).keys());
    }

    clone() {
        return new Board(this.cells);
    }
}
