var origBoard;
var huPlayer = 'red';
var aiPlayer = 'yellow';
isPlayerTurn = true;

startGame();

function startGame() {
    origBoard = Array.from(Array(6), () => Array(7).fill(null));
    for (var i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', turnClick, false);
    }
}

function turnClick(square) {
    if (!isPlayerTurn)
        return ;

    const squareId = square.target.id;
    const col = squareId % 7; 
    // Find the lowest available empty row in this column
    const row = getLowestEmptyRow(col);
    
    if (row !== null) { // If there's an empty spot in the column
        const squareIdToFill = row * 7 + col; // Calculate the cell's ID to be filled
        turn(squareIdToFill, huPlayer); // Perform the player's turn
        isPlayerTurn = false;

        setTimeout(() => {
            turnAi();
        }, 500);
    }
}
// Function to get the lowest empty row in a column
function getLowestEmptyRow(col) {
    // Start checking from the bottom row (row index 5) upwards
    for (let row = 5; row >= 0; row--) {
        if (origBoard[row][col] === null) {
            return row; // Return the first empty row
        }
    }
    return null; // Return null if the column is full
}

function turn(squareId, player) {
    const row = Math.floor(squareId / 7); // Get the row index
    const col = squareId % 7; // Get the column index
    origBoard[row][col] = player; // Update the board array

    const square = document.getElementById(squareId); // Get the clicked square element

    // Set the color based on the player
    if (player === aiPlayer) {
        square.style.backgroundColor = '#ff77e1'; // Set the square to red for huPlayer
    } else if (player === huPlayer) {
        square.style.backgroundColor = '#50fa7b'; // Set the square to yellow for aiPlayer
    }

    // Add the pulse animation class to the square
    square.classList.add('piece-pulse');

    // Remove the animation class after it finishes (optional, for repeated animations)
    setTimeout(() => {
        square.classList.remove('piece-pulse');
    }, 500); // Match the duration of the pulse animation

    // Disable further clicks on this cell
    square.removeEventListener('click', turnClick, false);
    // Example of alternating turns (if you want to implement AI turn or switch players)
    // turnAI();
}

function turnAi() {
    let col, row;

    // Find a random column with an empty spot
    do {
        col = Math.floor(Math.random() * 7); // Randomly choose a column between 0 and 6
        row = getLowestEmptyRow(col); // Check if there's an empty row in this column
    } while (row === null); // If the column is full, keep trying another one

    const squareIdToFill = row * 7 + col; // Calculate the cell's ID to be filled
    turn(squareIdToFill, aiPlayer); // Perform the AI's turn

    // Re-enable the player's turn after AI has moved
    isPlayerTurn = true;
}