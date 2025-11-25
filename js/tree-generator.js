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

    // Main gradient for tree (depth effect)
    const gradient = document.createElementNS(svgNS, "linearGradient");
    gradient.setAttribute("id", "treeGradient");
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "100%");
    gradient.setAttribute("y2", "0%");

    const stop1 = document.createElementNS(svgNS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("style", "stop-color:#1a3d0f;stop-opacity:1");

    const stop2 = document.createElementNS(svgNS, "stop");
    stop2.setAttribute("offset", "30%");
    stop2.setAttribute("style", "stop-color:#2D5016;stop-opacity:1");

    const stop3 = document.createElementNS(svgNS, "stop");
    stop3.setAttribute("offset", "50%");
    stop3.setAttribute("style", "stop-color:#3D6B1F;stop-opacity:1");

    const stop4 = document.createElementNS(svgNS, "stop");
    stop4.setAttribute("offset", "70%");
    stop4.setAttribute("style", "stop-color:#4A7C28;stop-opacity:1");

    const stop5 = document.createElementNS(svgNS, "stop");
    stop5.setAttribute("offset", "100%");
    stop5.setAttribute("style", "stop-color:#5a8c35;stop-opacity:1");

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    gradient.appendChild(stop4);
    gradient.appendChild(stop5);
    defs.appendChild(gradient);

    // Shadow gradient
    const shadowGradient = document.createElementNS(svgNS, "radialGradient");
    shadowGradient.setAttribute("id", "treeShadow");
    const shadowStop1 = document.createElementNS(svgNS, "stop");
    shadowStop1.setAttribute("offset", "0%");
    shadowStop1.setAttribute("style", "stop-color:#000000;stop-opacity:0.3");
    const shadowStop2 = document.createElementNS(svgNS, "stop");
    shadowStop2.setAttribute("offset", "100%");
    shadowStop2.setAttribute("style", "stop-color:#000000;stop-opacity:0");
    shadowGradient.appendChild(shadowStop1);
    shadowGradient.appendChild(shadowStop2);
    defs.appendChild(shadowGradient);

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

    // Create tree trunk with gradient (offset by starOffset)
    const trunkWidth = width * 0.12;
    const trunkHeight = height * 0.15;

    // Trunk gradient
    const trunkGradient = document.createElementNS(svgNS, "linearGradient");
    trunkGradient.setAttribute("id", "trunkGradient");
    trunkGradient.setAttribute("x1", "0%");
    trunkGradient.setAttribute("y1", "0%");
    trunkGradient.setAttribute("x2", "100%");
    trunkGradient.setAttribute("y2", "0%");

    const trunkStop1 = document.createElementNS(svgNS, "stop");
    trunkStop1.setAttribute("offset", "0%");
    trunkStop1.setAttribute("style", "stop-color:#3d2817;stop-opacity:1");

    const trunkStop2 = document.createElementNS(svgNS, "stop");
    trunkStop2.setAttribute("offset", "50%");
    trunkStop2.setAttribute("style", "stop-color:#4A3728;stop-opacity:1");

    const trunkStop3 = document.createElementNS(svgNS, "stop");
    trunkStop3.setAttribute("offset", "100%");
    trunkStop3.setAttribute("style", "stop-color:#5d4a3a;stop-opacity:1");

    trunkGradient.appendChild(trunkStop1);
    trunkGradient.appendChild(trunkStop2);
    trunkGradient.appendChild(trunkStop3);
    defs.appendChild(trunkGradient);

    const trunk = document.createElementNS(svgNS, "rect");
    trunk.setAttribute("x", (width - trunkWidth) / 2);
    trunk.setAttribute("y", starOffset + height - trunkHeight);
    trunk.setAttribute("width", trunkWidth);
    trunk.setAttribute("height", trunkHeight);
    trunk.setAttribute("fill", "url(#trunkGradient)");
    trunk.setAttribute("class", "tree-trunk");
    trunk.setAttribute("rx", "3");

    // Create tree branches (realistic multi-layered branches, offset by starOffset)
    const branchGroup = document.createElementNS(svgNS, "g");
    branchGroup.setAttribute("class", "tree-branches");

    const branchHeight = (height - trunkHeight) / levels;

    // Create multiple branch segments per level for realistic look
    for (let i = 0; i < levels; i++) {
        const levelWidth = width * (0.9 - (i * 0.08));
        const levelTop = starOffset + i * branchHeight * 0.85;
        const levelBottom = levelTop + branchHeight * 1.2;
        const levelMid = levelTop + branchHeight * 0.6;

        // Create 3 overlapping branch layers per level for depth
        const branchLayers = 3;

        for (let layer = 0; layer < branchLayers; layer++) {
            const layerOffset = layer * 8; // Offset each layer slightly
            const layerWidth = levelWidth - layerOffset;
            const layerTop = levelTop + layerOffset;

            // Main branch triangle with slightly jagged edges
            const points = `
                ${width / 2},${layerTop}
                ${(width - layerWidth) / 2},${levelBottom}
                ${(width + layerWidth) / 2},${levelBottom}
            `;

            const branch = document.createElementNS(svgNS, "polygon");
            branch.setAttribute("points", points);

            // Vary opacity for depth effect
            const opacity = 1 - (layer * 0.15);
            branch.setAttribute("fill", "url(#treeGradient)");
            branch.setAttribute("opacity", opacity);
            branch.setAttribute("class", `branch-level-${i} branch-layer-${layer}`);
            branch.setAttribute("data-level", i);

            branchGroup.appendChild(branch);
        }

        // Add individual branch tips for detail (5-7 tips per level)
        const numTips = 5 + (i % 3); // Vary between 5-7
        for (let tip = 0; tip < numTips; tip++) {
            const tipAngle = (tip / numTips) * Math.PI; // Spread across 180 degrees
            const tipX = width / 2 + Math.cos(tipAngle - Math.PI / 2) * levelWidth * 0.4;
            const tipY = levelMid + Math.sin(tipAngle * 0.5) * branchHeight * 0.3;
            const tipSize = 15 + (i * 3); // Tips get bigger as tree gets wider

            // Small triangular branch tip
            const tipPoints = `
                ${tipX},${tipY - tipSize}
                ${tipX - tipSize * 0.7},${tipY + tipSize * 0.5}
                ${tipX + tipSize * 0.7},${tipY + tipSize * 0.5}
            `;

            const branchTip = document.createElementNS(svgNS, "polygon");
            branchTip.setAttribute("points", tipPoints);
            branchTip.setAttribute("fill", "url(#treeGradient)");
            branchTip.setAttribute("opacity", "0.8");
            branchTip.setAttribute("class", `branch-tip branch-level-${i}`);

            branchGroup.appendChild(branchTip);
        }
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

    const starOffset = 40; // IMPORTANT: Account for star offset at top
    const trunkHeight = treeHeight * 0.15;
    const availableHeight = treeHeight - trunkHeight;

    for (let i = 0; i < photoCount; i++) {
        let attempts = 0;
        let validPosition = null;

        while (attempts < maxAttempts && !validPosition) {
            // Random position within tree bounds (0 = top, 1 = bottom)
            const yProgress = rng();
            // Position within available tree area, adding starOffset to account for star space
            const y = starOffset + (yProgress * availableHeight);

            // Calculate tree width at this height (triangular shape, narrower at top)
            // At top (yProgress=0): narrower, At bottom (yProgress=1): wider
            const widthAtHeight = treeWidth * (0.2 + yProgress * 0.7); // Start at 20% width, grow to 90%
            const centerX = treeWidth / 2;
            // Keep ornaments well within tree bounds (0.7 factor for safety margin)
            const xOffset = (rng() - 0.5) * widthAtHeight * 0.7;
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

        // If we couldn't find a valid position, use fallback
        if (validPosition) {
            positions.push(validPosition);
        } else {
            // Fallback: place in spiral pattern, accounting for starOffset
            const yProgress = (i / photoCount);
            const widthAtHeight = treeWidth * (0.2 + yProgress * 0.7);
            const angle = i * 2.4;
            const spiralRadius = Math.min((i % 10) * 15, widthAtHeight * 0.3);

            positions.push({
                x: treeWidth / 2 + Math.cos(angle) * spiralRadius,
                y: starOffset + (yProgress * availableHeight),
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
