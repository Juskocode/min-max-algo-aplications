const cells = document.querySelectorAll('.cell');

// Function to highlight the column on hover
cells.forEach(cell => {
    cell.addEventListener('mouseenter', () => {
        const columnIndex = cell.cellIndex;
        const outlineColor = '#f7ddec'; // Neon pink outline for hover effect

        // Apply only the border effect to the circular cells in the column that have no background color
        for (let i = 0; i < cells.length; i++) {
            if (cells[i].cellIndex === columnIndex) {
                // Check if the cell has no background color (assume unoccupied cells have an empty background)
                if (!cells[i].style.backgroundColor || cells[i].style.backgroundColor === 'transparent') {
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
