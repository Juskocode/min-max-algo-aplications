const ROWS = 6;
const COLS = 7;
const WIN_LENGTH = 4;
var origBoard;
var huPlayer = 'red';
var aiPlayer = 'yellow';
var isPlayerTurn = true;

startGame();

function startGame() {
    origBoard = Array.from(Array(ROWS), () => Array(COLS).fill(null));
    for (var i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', turnClick, false);
    }

    // Hide the end game modal when starting a new game
    document.getElementById('endgame-modal').style.display = 'none';
}

function turnClick(square) {
    if (!isPlayerTurn) return;

    const squareId = square.target.id;
    const col = squareId % COLS;
    const row = getLowestEmptyRow(col);

    if (row !== null) {
        const squareIdToFill = row * COLS + col;
        turn(squareIdToFill, huPlayer);
        isPlayerTurn = false;

        setTimeout(() => {
            turnAi();
        }, 500);
    }
}

function getLowestEmptyRow(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (origBoard[row][col] === null) {
            return row;
        }
    }
    return null;
}

function turn(squareId, player) {
    const row = Math.floor(squareId / COLS);
    const col = squareId % COLS;
    origBoard[row][col] = player;

    const square = document.getElementById(squareId);
    square.style.backgroundColor = player === huPlayer ? '#50fa7b' : '#ff77e1';
    square.classList.add('piece-pulse');

    setTimeout(() => {
        square.classList.remove('piece-pulse');
    }, 500);

    square.removeEventListener('click', turnClick, false);

    setTimeout(() => {
        // Check for win or tie
        if (checkWin(row, col, player)) {
            showEndGameModal(`${player} wins!`);
            return;
        }

        if (checkTie()) {
            showEndGameModal("It's a tie!");
        }
    }, 500);
}

function turnAi() {
    let col, row;
    do {
        col = Math.floor(Math.random() * COLS);
        row = getLowestEmptyRow(col);
    } while (row === null);

    const squareIdToFill = row * COLS + col;
    turn(squareIdToFill, aiPlayer);

    isPlayerTurn = true;
}

function checkWin(row, col, player) {
    return checkDirection(row, col, player, 1, 0) || // Vertical check
           checkDirection(row, col, player, 0, 1) || // Horizontal check
           checkDirection(row, col, player, 1, 1) || // Diagonal (\) check
           checkDirection(row, col, player, 1, -1);  // Diagonal (/) check
}

function checkDirection(row, col, player, deltaRow, deltaCol) {
    let count = 1;

    // Check in the positive direction (deltaRow, deltaCol)
    count += countInDirection(row, col, player, deltaRow, deltaCol);
    // Check in the negative direction (-deltaRow, -deltaCol)
    count += countInDirection(row, col, player, -deltaRow, -deltaCol);

    return count >= WIN_LENGTH;
}

function countInDirection(row, col, player, deltaRow, deltaCol) {
    let r = row + deltaRow;
    let c = col + deltaCol;
    let count = 0;

    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && origBoard[r][c] === player) {
        count++;
        r += deltaRow;
        c += deltaCol;
    }

    return count;
}

function checkTie() {
    return origBoard.flat().every(cell => cell !== null);
}

function resetBoard() {
    origBoard = Array.from(Array(ROWS), () => Array(COLS).fill(null));
    isPlayerTurn = true; // Reset player turn
}

function showEndGameModal(message) {
    const modal = document.getElementById('endgame-modal');
    modal.style.display = 'flex'; // Show the modal
    modal.querySelector('p').innerText = message; // Set the message
    resetBoard();
}
