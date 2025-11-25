/**
 * SVG Christmas Tree Generator
 * Generates a dynamic Christmas tree that grows based on the number of photos
 */

/**
 * Calculate tree height based on photo count
 * @param {number} photoCount - Number of photos uploaded
 * @returns {number} Tree height in pixels
 */
function calculateTreeHeight(photoCount) {
    const minHeight = 300; // Increased from 200 for better visibility
    const maxHeight = 800;
    const maxPhotos = 130;
    return minHeight + (photoCount / maxPhotos) * (maxHeight - minHeight);
}

/**
 * Calculate number of branch levels based on photo count
 * @param {number} photoCount - Number of photos uploaded
 * @returns {number} Number of branch levels
 */
function getBranchLevels(photoCount) {
    if (photoCount <= 20) return 3;
    if (photoCount <= 70) return 5;
    return 7;
}

/**
 * Generate SVG Christmas tree
 * @param {number} photoCount - Number of photos to determine tree size
 * @returns {string} SVG markup for the tree
 */
function generateTree(photoCount) {
    const height = calculateTreeHeight(photoCount);
    const width = height * 0.6;
    const levels = getBranchLevels(photoCount);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");

    // Add space at top for star (40px) and bottom for trunk
    const starOffset = 40;
    const totalHeight = height + starOffset + 50;
    svg.setAttribute("viewBox", `0 0 ${width} ${totalHeight}`);
    svg.setAttribute("class", "christmas-tree");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // Create defs for filters and gradients
    const defs = document.createElementNS(svgNS, "defs");

    // Gradient for tree
    const gradient = document.createElementNS(svgNS, "linearGradient");
    gradient.setAttribute("id", "treeGradient");
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "100%");
    gradient.setAttribute("y2", "0%");

    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("style", "stop-color:#2D5016;stop-opacity:1");

    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "50%");
    stop2.setAttribute("style", "stop-color:#3D6B1F;stop-opacity:1");

    const stop3 = document.createElementNS(svgNS, "stop");
    stop3.setAttribute("offset", "100%");
    stop3.setAttribute("style", "stop-color:#4A7C28;stop-opacity:1");

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    defs.appendChild(gradient);

    // Glitter filter for ornaments
    const filter = document.createElementNS(svgNS, "filter");
    filter.setAttribute("id", "glitter");

    const feTurbulence = document.createElementNS(svgNS, "feTurbulence");
    feTurbulence.setAttribute("type", "fractalNoise");
    feTurbulence.setAttribute("baseFrequency", "0.9");
    feTurbulence.setAttribute("numOctaves", "3");
    feTurbulence.setAttribute("result", "noise");

    const feDisplacementMap = document.createElementNS(svgNS, "feDisplacementMap");
    feDisplacementMap.setAttribute("in", "SourceGraphic");
    feDisplacementMap.setAttribute("in2", "noise");
    feDisplacementMap.setAttribute("scale", "2");

    filter.appendChild(feTurbulence);
    filter.appendChild(feDisplacementMap);
    defs.appendChild(filter);

    svg.appendChild(defs);

    // Create tree trunk (offset by starOffset)
    const trunkWidth = width * 0.1;
    const trunkHeight = height * 0.15;
    const trunk = document.createElementNS(svgNS, "rect");
    trunk.setAttribute("x", (width - trunkWidth) / 2);
    trunk.setAttribute("y", starOffset + height - trunkHeight);
    trunk.setAttribute("width", trunkWidth);
    trunk.setAttribute("height", trunkHeight);
    trunk.setAttribute("fill", "#4A3728");
    trunk.setAttribute("class", "tree-trunk");

    // Create tree branches (triangular sections, offset by starOffset)
    const branchGroup = document.createElementNS(svgNS, "g");
    branchGroup.setAttribute("class", "tree-branches");

    const branchHeight = (height - trunkHeight) / levels;

    for (let i = 0; i < levels; i++) {
        const levelWidth = width * (0.9 - (i * 0.08));
        const levelTop = starOffset + i * branchHeight * 0.85;
        const levelBottom = levelTop + branchHeight * 1.2;

        const points = `
            ${width / 2},${levelTop}
            ${(width - levelWidth) / 2},${levelBottom}
            ${(width + levelWidth) / 2},${levelBottom}
        `;

        const branch = document.createElementNS(svgNS, "polygon");
        branch.setAttribute("points", points);
        branch.setAttribute("fill", "url(#treeGradient)");
        branch.setAttribute("class", `branch-level-${i}`);
        branch.setAttribute("data-level", i);

        branchGroup.appendChild(branch);
    }

    // Create star on top (positioned at top of viewBox)
    const star = document.createElementNS(svgNS, "polygon");
    const starSize = 25;
    const starPoints = [];
    for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = width / 2 + Math.cos(angle) * starSize;
        const y = 20 + Math.sin(angle) * starSize; // Positioned at top with some padding
        starPoints.push(`${x},${y}`);
    }
    star.setAttribute("points", starPoints.join(" "));
    star.setAttribute("fill", "#FFD700");
    star.setAttribute("class", "tree-star");

    svg.appendChild(branchGroup);
    svg.appendChild(trunk);
    svg.appendChild(star);

    return svg;
}

/**
 * Generate photo positions on the tree
 * Uses seeded random to ensure consistent positions for all viewers
 * @param {number} photoCount - Number of photos
 * @param {number} treeHeight - Height of the tree
 * @param {number} treeWidth - Width of the tree
 * @param {number} seed - Seed for random number generator
 * @returns {Array} Array of position objects {x, y, rotation, size}
 */
function generatePhotoPositions(photoCount, treeHeight, treeWidth, seed) {
    const rng = seededRandom(seed);
    const positions = [];
    const ornamentRadius = 25; // Base radius
    const maxAttempts = 100;

    const trunkHeight = treeHeight * 0.15;
    const availableHeight = treeHeight - trunkHeight;

    for (let i = 0; i < photoCount; i++) {
        let attempts = 0;
        let validPosition = null;

        while (attempts < maxAttempts && !validPosition) {
            // Random position within tree bounds
            const yProgress = rng();
            const y = yProgress * availableHeight;

            // Calculate tree width at this height (triangle shape)
            const widthAtHeight = treeWidth * (1 - yProgress * 0.7);
            const centerX = treeWidth / 2;
            const xOffset = (rng() - 0.5) * widthAtHeight * 0.8;
            const x = centerX + xOffset;

            // Random rotation
            const rotation = (rng() - 0.5) * 10; // -5° to +5°

            // Random size variation
            const size = ornamentRadius + (rng() - 0.5) * 10; // ±5px variation

            const newPosition = { x, y, rotation, radius: size };

            // Check collision with existing positions
            let hasCollision = false;
            for (const pos of positions) {
                if (circlesCollide(newPosition, pos, 10)) {
                    hasCollision = true;
                    break;
                }
            }

            if (!hasCollision) {
                validPosition = newPosition;
            }

            attempts++;
        }

        // If we couldn't find a valid position, just place it anyway
        if (validPosition) {
            positions.push(validPosition);
        } else {
            // Fallback: place in spiral pattern
            const angle = i * 2.4;
            const radius = (i % 10) * 20;
            positions.push({
                x: treeWidth / 2 + Math.cos(angle) * radius,
                y: (i / photoCount) * availableHeight,
                rotation: (rng() - 0.5) * 10,
                radius: ornamentRadius
            });
        }
    }

    return positions;
}

/**
 * Get branch positions for more accurate ornament placement
 * @param {number} levels - Number of branch levels
 * @param {number} treeHeight - Tree height
 * @param {number} treeWidth - Tree width
 * @returns {Array} Array of branch bounds {yTop, yBottom, widthLeft, widthRight}
 */
function getBranchBounds(levels, treeHeight, treeWidth) {
    const bounds = [];
    const trunkHeight = treeHeight * 0.15;
    const branchHeight = (treeHeight - trunkHeight) / levels;

    for (let i = 0; i < levels; i++) {
        const levelWidth = treeWidth * (0.9 - (i * 0.08));
        const levelTop = i * branchHeight * 0.85;
        const levelBottom = levelTop + branchHeight * 1.2;

        bounds.push({
            yTop: levelTop,
            yBottom: levelBottom,
            widthLeft: (treeWidth - levelWidth) / 2,
            widthRight: (treeWidth + levelWidth) / 2
        });
    }

    return bounds;
}
