var origBoard;
var huPlayer;
var aiPlayer;
const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
];

const cells = document.querySelectorAll('.cell');

function chooseSymbol(symbol) {
    huPlayer = symbol;
    aiPlayer = (symbol === 'X') ? 'O' : 'X'; // Assign opposite to AI
    
    document.querySelector(".choose-symbol").style.display = "none"; // Hide the symbol selection
    startGame(); // Start the game after selection
}

function startGame() {
    // Show symbol selection if called by replay button
    if (!huPlayer || !aiPlayer) {
        document.querySelector(".choose-symbol").style.display = "flex"; // Show symbol selection
        return; // Exit the function to wait for symbol selection
    }

    document.querySelector(".endgame").style.display = "none";
    origBoard = Array.from(Array(9).keys());
    for (var i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].classList.remove('cell-clicked'); // Remove animation class
        cells[i].addEventListener('click', turnClick, false);
    }

    // If AI is starting (when player chooses 'O')
    if (aiPlayer === 'X') {
        turn(bestSpot(), aiPlayer); // AI goes first
    }
}

function turnClick(square) {
    if (typeof origBoard[square.target.id] == 'number') {
        turn(square.target.id, huPlayer);
        square.target.classList.add('cell-clicked'); // Add animation class
        if (!checkWin(origBoard, huPlayer) && !checkTie()) {
            setTimeout(() => {
                turn(bestSpot(), aiPlayer);
                checkTie();
            }, 500); // Delay added here for AI move
        }
    }
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;
    let gameWon = checkWin(origBoard, player);
    if (gameWon) gameOver(gameWon);
}

function checkWin(board, player) {
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winCombos.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    for (let index of winCombos[gameWon.index]) {
        document.getElementById(index).style.backgroundColor =
            gameWon.player == huPlayer ? "blue" : "red";
    }
    for (var i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }
    declareWinner(gameWon.player == huPlayer ? "You win!" : "You lose.");
}

function declareWinner(who) {
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = who;
    document.querySelector(".endgame").classList.add('show'); // Ensure endgame box shows with animation
}

function emptySquares() {
    return origBoard.filter(s => typeof s == 'number');
}

function bestSpot() {
    return minimax(origBoard, aiPlayer).index;
}

function checkTie() {
    if (!checkWin(origBoard, huPlayer) && emptySquares().length == 0) {
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "green";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Tie Game!");
        return true;
    }
    return false;
}

function minimax(newboard, player) {
    var spots = emptySquares(newboard);

    if (checkWin(newboard, huPlayer))
        return { score: -10 };
    else if (checkWin(newboard, aiPlayer))
        return { score: 10 };
    else if (spots.length === 0)
        return { score: 0 };

    var moves = [];
    for (var i = 0; i < spots.length; i++) {
        var move = {};
        move.index = newboard[spots[i]];
        newboard[spots[i]] = player;
        var res = minimax(newboard, player === aiPlayer ? huPlayer : aiPlayer);
        move.score = res.score;
        newboard[spots[i]] = move.index;
        moves.push(move);
    }

    return player === aiPlayer ?
        moves.reduce((best, move) => move.score > best.score ? move : best) :
        moves.reduce((best, move) => move.score < best.score ? move : best);
}
