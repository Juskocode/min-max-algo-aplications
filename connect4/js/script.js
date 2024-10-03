const ROWS = 6;
const COLS = 7;
const WIN_LENGTH = 4;
var origBoard;
var huPlayer = 'red';
var aiPlayer = 'yellow';
var isPlayerTurn = true;

var boardMask = Array(COLS).fill(0); // Bitmask to track filled positions for each column
var huPlayerMask = Array(COLS).fill(0); // Bitmask for human player
var aiPlayerMask = Array(COLS).fill(0); // Bitmask for AI player

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

    if (player === huPlayer) {
        huPlayerMask[col] |= (1 << row); // Update human player bitmask for the column
    } else {
        aiPlayerMask[col] |= (1 << row); // Update AI player bitmask for the column
    }

    boardMask[col] |= (1 << row); // Update the filled position bitmask for the column

    setTimeout(() => {
        // Check for win or tie
        if (checkWin(col, player === huPlayer ? huPlayerMask : aiPlayerMask)) {
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

function checkWin(col, playerMask) {
    const colMask = playerMask[col];

    // Vertical check
    if (checkDirection(colMask, 1)) return true;

    // Horizontal check
    let horizontal = 0;
    for (let i = Math.max(0, col - WIN_LENGTH + 1); i < Math.min(COLS, col + WIN_LENGTH); i++) {
        horizontal <<= 1;
        horizontal |= (playerMask[i] >> (ROWS - 1));
    }
    if (checkDirection(horizontal, 1)) return true;

    // Diagonal (\) check
    let diagonal1 = 0;
    for (let i = -WIN_LENGTH + 1; i < WIN_LENGTH; i++) {
        const c = col + i;
        if (c >= 0 && c < COLS) {
            diagonal1 <<= 1;
            diagonal1 |= (playerMask[c] >> Math.max(0, i));
        }
    }
    if (checkDirection(diagonal1, 1)) return true;

    // Diagonal (/) check
    let diagonal2 = 0;
    for (let i = -WIN_LENGTH + 1; i < WIN_LENGTH; i++) {
        const c = col + i;
        if (c >= 0 && c < COLS) {
            diagonal2 <<= 1;
            diagonal2 |= (playerMask[c] >> Math.max(0, -i));
        }
    }
    if (checkDirection(diagonal2, 1)) return true;

    return false;
}

function checkDirection(mask, shift) {
    return (mask & (mask >> shift) & (mask >> 2 * shift) & (mask >> 3 * shift)) !== 0;
}

function checkTie() {
    return origBoard.flat().every(cell => cell !== null);
}

function resetBoard() {
    origBoard = Array.from(Array(ROWS), () => Array(COLS).fill(null));
    boardMask = Array(COLS).fill(0);
    huPlayerMask = Array(COLS).fill(0);
    aiPlayerMask = Array(COLS).fill(0);
    //startGame();
}


function showEndGameModal(message) {
    const modal = document.getElementById('endgame-modal');
    modal.style.display = 'flex'; // Show the modal
    modal.querySelector('p').innerText = message; // Set the message
    resetBoard();
}
