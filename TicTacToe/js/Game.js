import Board from './Board.js';
import Minimax from './Minimax.js';
import TreeVisualizer from './TreeVisualizer.js';

export default class Game {
    constructor() {
        this.board = new Board();
        this.minimaxAI = new Minimax();
        this.visualizer = new TreeVisualizer('tree-visualization');
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
        this.visualizer.reset();
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
        const { index, tree } = this.minimaxAI.bestSpot(this.board, this.aiPlayer, this.huPlayer, this.currentDepth);
        this.turn(index, this.aiPlayer);
        this.updateStats();
        this.visualizer.render(tree, true);
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
