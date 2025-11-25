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
 * Always use 7 levels for realistic tree appearance
 * @param {number} photoCount - Number of photos uploaded
 * @returns {number} Number of branch levels (always 7)
 */
function getBranchLevels(photoCount) {
    return 7; // Fixed 7 levels for realistic zigzag appearance
}

/**
 * Generate SVG Christmas tree - PURE SVG (everything in one coordinate system)
 * @param {number} photoCount - Number of photos to determine tree size
 * @param {Array} photoData - Photo data array
 * @param {Array} positions - Ornament positions
 * @returns {SVGElement} Complete SVG with tree, ornaments, and strings
 */
function generateTree(photoCount, photoData = [], positions = []) {
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

    // Main gradient for branches
    const branchGradient = document.createElementNS(svgNS, "linearGradient");
    branchGradient.setAttribute("id", "branchGradient");
    branchGradient.setAttribute("x1", "0%");
    branchGradient.setAttribute("y1", "0%");
    branchGradient.setAttribute("x2", "100%");
    branchGradient.setAttribute("y2", "0%");

    const bStop1 = document.createElementNS(svgNS, "stop");
    bStop1.setAttribute("offset", "0%");
    bStop1.setAttribute("style", "stop-color:#b0005e;stop-opacity:1"); // Dark Telekom Magenta

    const bStop2 = document.createElementNS(svgNS, "stop");
    bStop2.setAttribute("offset", "50%");
    bStop2.setAttribute("style", "stop-color:#e20074;stop-opacity:1"); // Telekom Magenta

    const bStop3 = document.createElementNS(svgNS, "stop");
    bStop3.setAttribute("offset", "100%");
    bStop3.setAttribute("style", "stop-color:#ff1a8c;stop-opacity:1"); // Light Telekom Magenta

    branchGradient.appendChild(bStop1);
    branchGradient.appendChild(bStop2);
    branchGradient.appendChild(bStop3);
    defs.appendChild(branchGradient);

    // Trunk gradient
    const trunkGradient = document.createElementNS(svgNS, "linearGradient");
    trunkGradient.setAttribute("id", "trunkGradient");
    trunkGradient.setAttribute("x1", "0%");
    trunkGradient.setAttribute("y1", "0%");
    trunkGradient.setAttribute("x2", "100%");
    trunkGradient.setAttribute("y2", "0%");

    const trunkStop1 = document.createElementNS(svgNS, "stop");
    trunkStop1.setAttribute("offset", "0%");
    trunkStop1.setAttribute("style", "stop-color:#1a1a1a;stop-opacity:1"); // Telekom Dark

    const trunkStop2 = document.createElementNS(svgNS, "stop");
    trunkStop2.setAttribute("offset", "50%");
    trunkStop2.setAttribute("style", "stop-color:#262626;stop-opacity:1"); // Telekom Gray

    const trunkStop3 = document.createElementNS(svgNS, "stop");
    trunkStop3.setAttribute("offset", "100%");
    trunkStop3.setAttribute("style", "stop-color:#404040;stop-opacity:1"); // Telekom Light Gray

    trunkGradient.appendChild(trunkStop1);
    trunkGradient.appendChild(trunkStop2);
    trunkGradient.appendChild(trunkStop3);
    defs.appendChild(trunkGradient);

    svg.appendChild(defs);

    // Create tree trunk (central vertical line)
    const trunkWidth = width * 0.08;
    const trunkHeight = height * 0.15;
    const centerX = width / 2;

    const trunk = document.createElementNS(svgNS, "rect");
    trunk.setAttribute("x", centerX - trunkWidth / 2);
    trunk.setAttribute("y", starOffset + height - trunkHeight);
    trunk.setAttribute("width", trunkWidth);
    trunk.setAttribute("height", trunkHeight);
    trunk.setAttribute("fill", "url(#trunkGradient)");
    trunk.setAttribute("class", "tree-trunk");
    trunk.setAttribute("rx", "3");

    // Create 7 layered triangles for realistic tree
    const foliageGroup = document.createElementNS(svgNS, "g");
    foliageGroup.setAttribute("class", "tree-foliage");

    const branchHeight = (height - trunkHeight) / levels;
    const triangleBounds = []; // Store triangle bounds for ornament placement

    for (let i = 0; i < levels; i++) {
        // CRITICAL: Width INCREASES from top (i=0) to bottom (i=6)
        const levelWidth = width * (0.15 + (i * 0.11)); // Top: 0.15*width, Bottom: 0.92*width
        const levelTop = starOffset + i * branchHeight * 0.88;
        const levelBottom = levelTop + branchHeight * 1.35;
        const leftX = (width - levelWidth) / 2;
        const rightX = (width + levelWidth) / 2;

        // Create wavy polygon with 7 points for realistic appearance (Option B)
        const waviness = levelWidth * 0.08; // 8% waviness
        const midY = (levelTop + levelBottom) / 2;

        // 7-point polygon with natural irregularities
        const polygonPoints = [
            `${centerX},${levelTop}`, // Top center
            `${leftX + levelWidth * 0.15},${levelTop + (levelBottom - levelTop) * 0.35}`, // Upper left with indent
            `${leftX - waviness},${midY}`, // Mid left bulge
            `${leftX + levelWidth * 0.1},${levelBottom - (levelBottom - levelTop) * 0.2}`, // Lower left indent
            `${leftX},${levelBottom}`, // Bottom left
            `${rightX},${levelBottom}`, // Bottom right
            `${rightX - levelWidth * 0.1},${levelBottom - (levelBottom - levelTop) * 0.2}`, // Lower right indent
            `${rightX + waviness},${midY}`, // Mid right bulge
            `${rightX - levelWidth * 0.15},${levelTop + (levelBottom - levelTop) * 0.35}` // Upper right indent
        ];

        const foliage = document.createElementNS(svgNS, "polygon");
        foliage.setAttribute("points", polygonPoints.join(" "));
        foliage.setAttribute("fill", "url(#branchGradient)");
        foliage.setAttribute("opacity", "0.9");
        foliage.setAttribute("class", `foliage-level-${i}`);

        foliageGroup.appendChild(foliage);

        // Option C: Add small branch details (8-12 per level)
        const branchCount = 8 + Math.floor(i * 0.5); // More branches on lower levels
        const branchSize = levelWidth * 0.08;

        for (let b = 0; b < branchCount; b++) {
            const side = b % 2 === 0 ? -1 : 1; // Alternate sides
            const yPos = levelTop + ((levelBottom - levelTop) / branchCount) * b + (levelBottom - levelTop) * 0.1;
            const xBase = side === -1 ? leftX : rightX;
            const xTip = xBase + (side * branchSize * 1.2);
            const xMid = xBase + (side * branchSize * 0.6);

            // Small triangular branch detail
            const branchPoints = `
                ${xBase},${yPos}
                ${xTip},${yPos + branchSize * 0.4}
                ${xMid},${yPos + branchSize * 0.8}
            `;

            const branchDetail = document.createElementNS(svgNS, "polygon");
            branchDetail.setAttribute("points", branchPoints);
            branchDetail.setAttribute("fill", "url(#branchGradient)");
            branchDetail.setAttribute("opacity", "0.85");
            branchDetail.setAttribute("class", `branch-detail-${i}-${b}`);

            foliageGroup.appendChild(branchDetail);
        }

        // Store bounds for ornament placement (use original triangle bounds for positioning)
        triangleBounds.push({
            level: i,
            topY: levelTop,
            bottomY: levelBottom,
            leftX: leftX,
            rightX: rightX,
            centerX: centerX,
            width: levelWidth
        });
    }

    // Create star on top
    const star = document.createElementNS(svgNS, "polygon");
    const starSize = 25;
    const starPoints = [];
    for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * starSize;
        const y = 20 + Math.sin(angle) * starSize;
        starPoints.push(`${x},${y}`);
    }
    star.setAttribute("points", starPoints.join(" "));
    star.setAttribute("fill", "#ffffff"); // Telekom White
    star.setAttribute("class", "tree-star");

    // Create clipPaths for round ornaments
    for (let i = 0; i < photoData.length; i++) {
        const clipPath = document.createElementNS(svgNS, "clipPath");
        clipPath.setAttribute("id", `ornament-clip-${i}`);
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", positions[i].radius);
        circle.setAttribute("cy", positions[i].radius);
        circle.setAttribute("r", positions[i].radius);
        clipPath.appendChild(circle);
        defs.appendChild(clipPath);
    }

    // Hanging strings group
    const stringsGroup = document.createElementNS(svgNS, "g");
    stringsGroup.setAttribute("class", "ornament-strings");

    // Ornaments group
    const ornamentsGroup = document.createElementNS(svgNS, "g");
    ornamentsGroup.setAttribute("class", "ornaments");

    // Add each ornament with its string
    photoData.forEach((photo, index) => {
        if (index >= positions.length) return;

        const pos = positions[index];

        // String from attachment point to ornament center
        const string = document.createElementNS(svgNS, "line");
        string.setAttribute("x1", pos.hangX);
        string.setAttribute("y1", pos.hangY);
        string.setAttribute("x2", pos.x);
        string.setAttribute("y2", pos.y);
        string.setAttribute("stroke", "rgba(139, 69, 19, 0.6)");
        string.setAttribute("stroke-width", "1.5");
        string.setAttribute("class", "ornament-string");
        stringsGroup.appendChild(string);

        // Ornament group (for transform)
        const ornamentGroup = document.createElementNS(svgNS, "g");
        ornamentGroup.setAttribute("transform", `translate(${pos.x - pos.radius}, ${pos.y - pos.radius}) rotate(${pos.rotation} ${pos.radius} ${pos.radius})`);
        ornamentGroup.setAttribute("class", "ornament");
        ornamentGroup.setAttribute("data-index", index);

        // Photo image (clipped to circle)
        const image = document.createElementNS(svgNS, "image");
        image.setAttributeNS("http://www.w3.org/1999/xlink", "href", photo.imageData);
        image.setAttribute("x", 0);
        image.setAttribute("y", 0);
        image.setAttribute("width", pos.radius * 2);
        image.setAttribute("height", pos.radius * 2);
        image.setAttribute("clip-path", `url(#ornament-clip-${index})`);
        image.setAttribute("class", "ornament-image");
        ornamentGroup.appendChild(image);

        // Border circle (magenta/white alternating - Telekom branding)
        const border = document.createElementNS(svgNS, "circle");
        border.setAttribute("cx", pos.radius);
        border.setAttribute("cy", pos.radius);
        border.setAttribute("r", pos.radius);
        border.setAttribute("fill", "none");
        border.setAttribute("stroke", index % 2 === 0 ? "#e20074" : "#ffffff"); // Telekom Magenta/White
        border.setAttribute("stroke-width", "3");
        border.setAttribute("class", "ornament-border");
        ornamentGroup.appendChild(border);

        ornamentsGroup.appendChild(ornamentGroup);
    });

    // Append in correct order (back to front)
    svg.appendChild(trunk);          // 1. Trunk
    svg.appendChild(foliageGroup);   // 2. Green foliage
    svg.appendChild(stringsGroup);   // 3. Strings
    svg.appendChild(ornamentsGroup); // 4. Ornaments
    svg.appendChild(star);           // 5. Star (front)

    // Store triangle bounds in SVG for later access
    svg.triangleBounds = triangleBounds;

    return svg;
}

/**
 * Generate photo positions within triangle bounds
 * Uses seeded random to ensure consistent positions for all viewers
 * @param {number} photoCount - Number of photos
 * @param {Array} triangleBounds - Array of triangle boundaries
 * @param {number} seed - Seed for random number generator
 * @returns {Array} Array of position objects {x, y, rotation, radius, hangX, hangY}
 */
function generatePhotoPositions(photoCount, triangleBounds, seed) {
    const rng = seededRandom(seed);
    const positions = [];
    const ornamentRadius = 15; // Base radius - reduced for better proportions
    const maxAttempts = 100;

    if (!triangleBounds || triangleBounds.length === 0) {
        console.error('No triangle bounds available for positioning!');
        return positions;
    }

    for (let i = 0; i < photoCount; i++) {
        let attempts = 0;
        let validPosition = null;

        while (attempts < maxAttempts && !validPosition) {
            // Select a random triangle level (seeded)
            const triangleIndex = Math.floor(rng() * triangleBounds.length);
            const triangle = triangleBounds[triangleIndex];

            // Random Y position within triangle
            const yProgress = rng(); // 0-1
            const y = triangle.topY + (yProgress * (triangle.bottomY - triangle.topY));

            // Calculate width at this Y (triangle narrows towards top)
            const triangleHeight = triangle.bottomY - triangle.topY;
            const yFromTop = y - triangle.topY;
            const widthAtY = triangle.width * (yFromTop / triangleHeight);

            // Random X position within width at this Y
            const xProgress = (rng() - 0.5); // -0.5 to +0.5
            const x = triangle.centerX + (xProgress * widthAtY * 0.7); // 0.7 factor for safety margin

            // Random size variation
            const size = ornamentRadius + (rng() - 0.5) * 8; // ±4px variation

            const newPosition = { x, y, radius: size };

            // Check collision with existing positions
            let hasCollision = false;
            for (const pos of positions) {
                const dist = Math.sqrt(Math.pow(newPosition.x - pos.x, 2) + Math.pow(newPosition.y - pos.y, 2));
                if (dist < (newPosition.radius + pos.radius + 5)) { // 5px minimum spacing
                    hasCollision = true;
                    break;
                }
            }

            if (!hasCollision) {
                // String hangs from a point slightly above
                const hangDistance = 8;
                validPosition = {
                    x: x,
                    y: y,
                    hangX: x,
                    hangY: y - hangDistance,
                    rotation: (rng() - 0.5) * 15, // -7.5° to +7.5°
                    radius: size
                };
            }

            attempts++;
        }

        if (validPosition) {
            positions.push(validPosition);
        } else {
            // Fallback: force placement
            const triangle = triangleBounds[i % triangleBounds.length];
            const yProgress = (i / photoCount);
            const y = triangle.topY + (yProgress * (triangle.bottomY - triangle.topY));
            positions.push({
                x: triangle.centerX,
                y: y,
                hangX: triangle.centerX,
                hangY: y - 8,
                rotation: (rng() - 0.5) * 15,
                radius: ornamentRadius
            });
        }
    }

    return positions;
}

/**
 * Helper: Calculate point on quadratic bezier curve
 * @param {number} t - Parameter (0-1)
 * @param {Object} branch - Branch with startX, startY, controlX, controlY, endX, endY
 * @returns {Object} {x, y}
 */
function getPointOnBranch(t, branch) {
    const x = (1-t)*(1-t)*branch.startX + 2*(1-t)*t*branch.controlX + t*t*branch.endX;
    const y = (1-t)*(1-t)*branch.startY + 2*(1-t)*t*branch.controlY + t*t*branch.endY;
    return { x, y };
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
