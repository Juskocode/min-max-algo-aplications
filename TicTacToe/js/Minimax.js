export default class Minimax {
    constructor() {
        this.totalStatesSearched = 0;
        this.treeRoot = null;
    }

    bestSpot(board, aiPlayer, huPlayer, maxDepth) {
        this.totalStatesSearched = 0;
        this.treeRoot = {
            board: board.cells.slice(),
            player: aiPlayer,
            depth: 0,
            children: [],
            score: null,
            move: null
        };
        const res = this.minimax(board, aiPlayer, maxDepth, -Infinity, Infinity, aiPlayer, huPlayer, 0, this.treeRoot);
        this.treeRoot.score = res.score;
        return { index: res.index, tree: this.treeRoot };
    }

    minimax(board, player, depth, alpha, beta, aiPlayer, huPlayer, currentDepth, node) {
        this.totalStatesSearched++;
        
        if (board.checkWin(huPlayer)) {
            return { score: -10 };
        } else if (board.checkWin(aiPlayer)) {
            return { score: 10 };
        } else if (board.isFull() || depth === 0) {
            return { score: 0 };
        }

        const spots = board.getEmptySquares();
        // Move ordering for pruning efficiency
        spots.sort((a, b) => {
            const weights = [3, 2, 3, 2, 4, 2, 3, 2, 3];
            return weights[b] - weights[a];
        });

        let bestMove = { score: player === aiPlayer ? -Infinity : Infinity };

        for (let spot of spots) {
            let childNode = {
                board: null,
                player: player === aiPlayer ? huPlayer : aiPlayer,
                depth: currentDepth + 1,
                children: [],
                score: null,
                move: spot
            };
            node.children.push(childNode);

            board.makeMove(spot, player);
            childNode.board = board.cells.slice();
            
            let res = this.minimax(board, player === aiPlayer ? huPlayer : aiPlayer, depth - 1, alpha, beta, aiPlayer, huPlayer, currentDepth + 1, childNode);
            childNode.score = res.score;
            
            board.cells[spot] = spot; // backtrack

            if (player === aiPlayer) {
                if (res.score > bestMove.score) {
                    bestMove = { score: res.score, index: spot };
                }
                alpha = Math.max(alpha, res.score);
            } else {
                if (res.score < bestMove.score) {
                    bestMove = { score: res.score, index: spot };
                }
                beta = Math.min(beta, res.score);
            }

            if (alpha >= beta) break;
        }

        // Mark the best move for this node
        if (bestMove.index !== undefined) {
            const bestChild = node.children.find(c => c.move === bestMove.index);
            if (bestChild) {
                bestChild.isBest = true;
            }
        }

        return bestMove;
    }
}
