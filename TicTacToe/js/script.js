class Board {
    constructor() {
        this.cells = Array.from(Array(9).keys());
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
}

class Minimax {
    constructor() {
        this.totalStatesSearched = 0;
    }

    bestSpot(board, aiPlayer, huPlayer, depth) {
        this.totalStatesSearched = 0;
        const res = this.minimax(board, aiPlayer, depth, -Infinity, Infinity, aiPlayer, huPlayer);
        return res.index;
    }

    minimax(board, player, depth, alpha, beta, aiPlayer, huPlayer) {
        this.totalStatesSearched++;
        
        if (board.checkWin(huPlayer)) {
            return { score: -10 };
        } else if (board.checkWin(aiPlayer)) {
            return { score: 10 };
        } else if (board.isFull() || depth === 0) {
            return { score: 0 };
        }

        const spots = board.getEmptySquares();
        // Move ordering: Center (4), Corners (0,2,6,8), Edges (1,3,5,7)
        spots.sort((a, b) => {
            const weights = [3, 2, 3, 2, 4, 2, 3, 2, 3];
            return weights[b] - weights[a];
        });

        let bestMove = { score: player === aiPlayer ? -Infinity : Infinity };

        for (let spot of spots) {
            let move = { index: spot };
            board.makeMove(spot, player);
            
            let res = this.minimax(board, player === aiPlayer ? huPlayer : aiPlayer, depth - 1, alpha, beta, aiPlayer, huPlayer);
            move.score = res.score;
            
            board.cells[spot] = spot; // backtrack

            if (player === aiPlayer) {
                if (move.score > bestMove.score) bestMove = move;
                alpha = Math.max(alpha, move.score);
            } else {
                if (move.score < bestMove.score) bestMove = move;
                beta = Math.min(beta, move.score);
            }

            if (alpha >= beta) break;
        }

        return bestMove;
    }
}

class Game {
    constructor() {
        this.board = new Board();
        this.minimaxAI = new Minimax();
        this.huPlayer = null;
        this.aiPlayer = null;
        this.currentDepth = 9;
        this.cells = document.querySelectorAll('.cell');
        this.statsElement = document.querySelector(".stats");
        this.endgameModal = document.getElementById('endgame-modal');
        this.symbolModal = document.getElementById('symbol-modal');
        
        this.init();
    }

    init() {
        if (this.symbolModal) {
            this.symbolModal.classList.add('show');
        }
    }

    chooseSymbol(symbol) {
        this.huPlayer = symbol;
        this.aiPlayer = (symbol === 'X') ? 'O' : 'X';
        if (this.symbolModal) {
            this.symbolModal.classList.remove('show');
        }
        this.startGame();
    }

    startGame() {
        this.board.reset();
        this.minimaxAI.totalStatesSearched = 0;
        if (this.endgameModal) {
            this.endgameModal.classList.remove('show');
        }
        this.updateStats();

        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].innerText = '';
            this.cells[i].style.removeProperty('background-color');
            this.cells[i].classList.remove('cell-clicked');
            this.cells[i].onclick = (e) => this.turnClick(e);
        }

        if (this.aiPlayer === 'X') {
            this.aiTurn();
        }
    }

    turnClick(square) {
        const id = parseInt(square.target.id);
        if (typeof this.board.cells[id] === 'number') {
            this.turn(id, this.huPlayer);
            square.target.classList.add('cell-clicked');
            if (!this.checkGameOver(this.huPlayer) && !this.checkTie()) {
                setTimeout(() => this.aiTurn(), 300);
            }
        }
    }

    turn(squareId, player) {
        this.board.makeMove(squareId, player);
        document.getElementById(squareId).innerText = player;
    }

    aiTurn() {
        const bestSpot = this.minimaxAI.bestSpot(this.board, this.aiPlayer, this.huPlayer, this.currentDepth);
        this.turn(bestSpot, this.aiPlayer);
        this.updateStats();
        if (!this.checkGameOver(this.aiPlayer)) {
            this.checkTie();
        }
    }

    checkGameOver(player) {
        const result = this.board.checkWin(player);
        if (result) {
            this.gameOver(result, player);
            return true;
        }
        return false;
    }

    gameOver(result, player) {
        for (let index of result.combo) {
            document.getElementById(index).style.backgroundColor =
                player === this.huPlayer ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)";
        }
        for (let cell of this.cells) {
            cell.onclick = null;
        }
        this.declareWinner(player === this.huPlayer ? "You win!" : "AI wins!");
    }

    checkTie() {
        if (this.board.isFull() && !this.board.checkWin(this.huPlayer) && !this.board.checkWin(this.aiPlayer)) {
            for (let cell of this.cells) {
                cell.style.backgroundColor = "rgba(255, 255, 0, 0.3)";
                cell.onclick = null;
            }
            this.declareWinner("Tie Game!");
            return true;
        }
        return false;
    }

    declareWinner(who) {
        if (this.endgameModal) {
            const modalText = this.endgameModal.querySelector('.text');
            modalText.innerText = who;
            this.endgameModal.classList.add('show');
        }
    }

    updateDepth(value) {
        this.currentDepth = parseInt(value);
        document.getElementById('depth-value').innerText = value;
    }

    updateStats() {
        if (this.statsElement) {
            this.statsElement.innerText = `States Searched: ${this.minimaxAI.totalStatesSearched} | Max Depth: ${this.currentDepth}`;
        }
    }
}

let game;
window.onload = () => {
    game = new Game();
};

function chooseSymbol(symbol) {
    game.chooseSymbol(symbol);
}

function startGame() {
    game.startGame();
}

function updateDepth(value) {
    game.updateDepth(value);
}
