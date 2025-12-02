/**
 * Sphere-Based Christmas Tree Generator
 * Creates a Christmas tree from spheres arranged in a triangle shape
 */

const MAX_ORNAMENTS = 130;

/**
 * Generate all ornament positions in a triangle shape
 * Creates 130 fixed positions arranged as a Christmas tree
 * @returns {Array} Array of position objects {x, y, size, row, index}
 */
function generateAllOrnamentPositions() {
    const positions = [];
    const rows = 16; // Number of rows in the tree
    const baseWidth = 600; // Width at the base
    const treeHeight = 700; // Total tree height
    const rowSpacing = treeHeight / rows;
    const ornamentSize = 50; // Base ornament size in pixels

    let ornamentIndex = 0;

    // Generate rows from top to bottom
    for (let row = 0; row < rows; row++) {
        // Calculate how many ornaments in this row (increases as we go down)
        const ornamentsInRow = Math.min(row + 1, Math.ceil((MAX_ORNAMENTS - ornamentIndex) / (rows - row)));

        // Calculate width of this row (narrower at top, wider at bottom)
        const rowProgress = row / (rows - 1); // 0 at top, 1 at bottom
        const rowWidth = baseWidth * (0.1 + rowProgress * 0.9); // 10% at top, 100% at bottom

        // Calculate y position
        const y = row * rowSpacing + 100; // 100px offset for star at top

        // Distribute ornaments evenly across this row
        const spacing = rowWidth / (ornamentsInRow + 1);
        const startX = (baseWidth - rowWidth) / 2;

        for (let i = 0; i < ornamentsInRow && ornamentIndex < MAX_ORNAMENTS; i++) {
            const x = startX + spacing * (i + 1);

            // Add some size variation (larger at bottom)
            const sizeVariation = ornamentSize * (0.8 + rowProgress * 0.4);

            positions.push({
                x: x,
                y: y,
                size: sizeVariation,
                row: row,
                index: ornamentIndex
            });

            ornamentIndex++;
        }

        if (ornamentIndex >= MAX_ORNAMENTS) break;
    }

    return positions;
}

/**
 * Get ornament assignment for photos using seeded random
 * Determines which ornament positions get which photos
 * @param {number} photoCount - Number of photos uploaded
 * @param {number} seed - Seed for random number generator
 * @returns {Array} Array of ornament indices that should have photos
 */
function getPhotoOrnamentAssignment(photoCount, seed) {
    const rng = seededRandom(seed);
    const allIndices = Array.from({ length: MAX_ORNAMENTS }, (_, i) => i);

    // Shuffle indices using seeded random (Fisher-Yates shuffle)
    for (let i = allIndices.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
    }

    // Return first photoCount indices
    return allIndices.slice(0, photoCount);
}

/**
 * Create a simple star element for the tree top
 * @returns {HTMLElement} Star element
 */
function createTreeStar() {
    const star = document.createElement('div');
    star.className = 'tree-star-top';
    star.innerHTML = '⭐';
    star.style.position = 'absolute';
    star.style.top = '20px';
    star.style.left = '50%';
    star.style.transform = 'translateX(-50%)';
    star.style.fontSize = '60px';
    star.style.zIndex = '100';
    return star;
}
