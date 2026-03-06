const cells = document.querySelectorAll('.cell');

// Function to highlight the column on hover
cells.forEach(cell => {
    cell.addEventListener('mouseenter', () => {
        const columnIndex = cell.cellIndex;
        const outlineColor = '#f7ddec'; // Neon pink outline for hover effect

        // Apply only the border effect to the circular cells in the column that have no piece
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].cellIndex === columnIndex) {
                // Check if the cell has no piece (no red or yellow class)
                if (!cells[i].classList.contains('red') && !cells[i].classList.contains('yellow')) {
                    cells[i].style.outline = `2px solid ${outlineColor}`; // Apply neon outline to empty cells in the column
                    cells[i].style.boxShadow = `0 0 10px ${outlineColor}`; // Apply subtle neon glow around the border
                }
            }
        }
    });

    // Reset the style when the mouse leaves
    cell.addEventListener('mouseleave', () => {
        for (let i = 0; i < cells.length; i++) {
            cells[i].style.outline = ''; // Reset outline
            cells[i].style.boxShadow = ''; // Reset border glow
        }
    });
});
