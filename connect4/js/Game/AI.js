// js/Game/AI.js
import Player from './Player.js';

export default class AI {
    constructor(color, opponentColor, rows, cols) {
        this.player = new Player(color);
        this.color = color;
        this.opponentColor = opponentColor;
        this.rows = rows;
        this.cols = cols;
    }

    // Heuristic function to evaluate the current board state
    evaluate(board) {
        let score = 0;

        // Center column preference
        const centerCol = Math.floor(this.cols / 2);
        let centerCount = 0;
        for (let r = 0; r < this.rows; r++) {
            if (board.getCell(r, centerCol) === this.color) centerCount++;
            else if (board.getCell(r, centerCol) === this.opponentColor) centerCount--;
        }
        score += centerCount * 6;

        // Horizontal
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols - 3; c++) {
                const window = [board.getCell(r, c), board.getCell(r, c + 1), board.getCell(r, c + 2), board.getCell(r, c + 3)];
                score += this.evaluateWindow(window);
            }
        }
        // Vertical
        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows - 3; r++) {
                const window = [board.getCell(r, c), board.getCell(r + 1, c), board.getCell(r + 2, c), board.getCell(r + 3, c)];
                score += this.evaluateWindow(window);
            }
        }
        // Positive Diagonal
        for (let r = 0; r < this.rows - 3; r++) {
            for (let c = 0; c < this.cols - 3; c++) {
                const window = [board.getCell(r, c), board.getCell(r + 1, c + 1), board.getCell(r + 2, c + 2), board.getCell(r + 3, c + 3)];
                score += this.evaluateWindow(window);
            }
        }
        // Negative Diagonal
        for (let r = 3; r < this.rows; r++) {
            for (let c = 0; c < this.cols - 3; c++) {
                const window = [board.getCell(r, c), board.getCell(r - 1, c + 1), board.getCell(r - 2, c + 2), board.getCell(r - 3, c + 3)];
                score += this.evaluateWindow(window);
            }
        }
        return score;
    }

    evaluateWindow(window) {
        let score = 0;
        const playerCount = window.filter(c => c === this.color).length;
        const opponentCount = window.filter(c => c === this.opponentColor).length;
        const emptyCount = window.filter(c => c === null).length;

        if (playerCount === 4) {
            score += 10000;
        } else if (playerCount === 3 && emptyCount === 1) {
            score += 100;
        } else if (playerCount === 2 && emptyCount === 2) {
            score += 10;
        }

        if (opponentCount === 3 && emptyCount === 1) {
            score -= 80;
        } else if (opponentCount === 2 && emptyCount === 2) {
            score -= 5;
        }

        return score;
    }

    isTerminal(board) {
        if (this.checkWin(board, this.color)) return { winner: this.color };
        if (this.checkWin(board, this.opponentColor)) return { winner: this.opponentColor };
        if (board.isFull()) return { winner: 'tie' };
        return null;
    }

    checkWin(board, playerColor) {
        // Horizontal
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols - 3; c++) {
                if (board.getCell(r, c) === playerColor && board.getCell(r, c + 1) === playerColor && board.getCell(r, c + 2) === playerColor && board.getCell(r, c + 3) === playerColor) return true;
            }
        }
        // Vertical
        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows - 3; r++) {
                if (board.getCell(r, c) === playerColor && board.getCell(r + 1, c) === playerColor && board.getCell(r + 2, c) === playerColor && board.getCell(r + 3, c) === playerColor) return true;
            }
        }
        // Positive Diagonal
        for (let r = 0; r < this.rows - 3; r++) {
            for (let c = 0; c < this.cols - 3; c++) {
                if (board.getCell(r, c) === playerColor && board.getCell(r + 1, c + 1) === playerColor && board.getCell(r + 2, c + 2) === playerColor && board.getCell(r + 3, c + 3) === playerColor) return true;
            }
        }
        // Negative Diagonal
        for (let r = 3; r < this.rows; r++) {
            for (let c = 0; c < this.cols - 3; c++) {
                if (board.getCell(r, c) === playerColor && board.getCell(r - 1, c + 1) === playerColor && board.getCell(r - 2, c + 2) === playerColor && board.getCell(r - 3, c + 3) === playerColor) return true;
            }
        }
        return false;
    }

    minimax(board, depth, alpha, beta, isMaximizing) {
        const terminal = this.isTerminal(board);
        if (terminal) {
            if (terminal.winner === this.color) return 100000 + depth;
            if (terminal.winner === this.opponentColor) return -100000 - depth;
            return 0;
        }
        if (depth === 0) return this.evaluate(board);

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let c = 0; c < this.cols; c++) {
                const r = board.getLowestEmptyRow(c);
                if (r !== null) {
                    board.setCell(r, c, this.color);
                    const evalScore = this.minimax(board, depth - 1, alpha, beta, false);
                    board.resetCell(r, c);
                    maxEval = Math.max(maxEval, evalScore);
                    alpha = Math.max(alpha, evalScore);
                    if (beta <= alpha) break;
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let c = 0; c < this.cols; c++) {
                const r = board.getLowestEmptyRow(c);
                if (r !== null) {
                    board.setCell(r, c, this.opponentColor);
                    const evalScore = this.minimax(board, depth - 1, alpha, beta, true);
                    board.resetCell(r, c);
                    minEval = Math.min(minEval, evalScore);
                    beta = Math.min(beta, evalScore);
                    if (beta <= alpha) break;
                }
            }
            return minEval;
        }
    }

    getMove(board, depth = 5) {
        let bestScore = -Infinity;
        let bestMove = -1;
        const colScores = Array(this.cols).fill(null);

        // First, check if there's an immediate winning move for AI or immediate need to block human
        for (let c = 0; c < this.cols; c++) {
            const r = board.getLowestEmptyRow(c);
            if (r !== null) {
                board.setCell(r, c, this.color);
                if (this.checkWin(board, this.color)) {
                    board.resetCell(r, c);
                    colScores[c] = 100000;
                    return { move: c, scores: colScores };
                }
                board.resetCell(r, c);
            }
        }

        for (let c = 0; c < this.cols; c++) {
            const r = board.getLowestEmptyRow(c);
            if (r !== null) {
                board.setCell(r, c, this.color);
                const score = this.minimax(board, depth - 1, -Infinity, Infinity, false);
                board.resetCell(r, c);
                colScores[c] = score;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = c;
                }
            }
        }
        
        // Fallback: pick the first available column if somehow bestMove is still -1
        if (bestMove === -1) {
            for (let c = 0; c < this.cols; c++) {
                if (board.getLowestEmptyRow(c) !== null) {
                    bestMove = c;
                    break;
                }
            }
        }

        return { move: bestMove, scores: colScores };
    }
}
