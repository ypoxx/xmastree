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
 * Generate SVG Christmas tree with radial branches
 * @param {number} photoCount - Number of photos to determine tree size
 * @returns {Object} { svg: SVGElement, branches: Array of branch data }
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

    // Main gradient for branches
    const branchGradient = document.createElementNS(svgNS, "linearGradient");
    branchGradient.setAttribute("id", "branchGradient");
    branchGradient.setAttribute("x1", "0%");
    branchGradient.setAttribute("y1", "0%");
    branchGradient.setAttribute("x2", "100%");
    branchGradient.setAttribute("y2", "0%");

    const bStop1 = document.createElementNS(svgNS, "stop");
    bStop1.setAttribute("offset", "0%");
    bStop1.setAttribute("style", "stop-color:#2D5016;stop-opacity:1");

    const bStop2 = document.createElementNS(svgNS, "stop");
    bStop2.setAttribute("offset", "50%");
    bStop2.setAttribute("style", "stop-color:#3D6B1F;stop-opacity:1");

    const bStop3 = document.createElementNS(svgNS, "stop");
    bStop3.setAttribute("offset", "100%");
    bStop3.setAttribute("style", "stop-color:#4A7C28;stop-opacity:1");

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

    // NEUE ARCHITEKTUR: Radiale Äste vom Stamm
    const branchGroup = document.createElementNS(svgNS, "g");
    branchGroup.setAttribute("class", "tree-branches");

    const branchData = []; // Store branch coordinates for ornament placement
    const trunkTopY = starOffset + height - trunkHeight;
    const availableTreeHeight = height - trunkHeight;

    // Calculate branches per level (more photos = more branches)
    const branchesPerLevel = Math.min(8 + Math.floor(photoCount / 20), 14);

    // Create branches for each level
    for (let level = 0; level < levels; level++) {
        // Y position for this level (spiral down the trunk)
        const levelProgress = level / (levels - 1 || 1);
        const levelY = starOffset + (levelProgress * availableTreeHeight * 0.85);

        // Branch length grows as we go down
        const baseBranchLength = width * 0.25;
        const branchLength = baseBranchLength * (0.5 + levelProgress * 0.5);

        // Number of branches at this level (more at bottom)
        const numBranches = Math.floor(branchesPerLevel * (0.6 + levelProgress * 0.4));

        // Create branches spiraling around trunk
        for (let b = 0; b < numBranches; b++) {
            // Spiral angle (offset each level for natural look)
            const angleOffset = level * 0.4; // Slight rotation per level
            const angle = (b / numBranches) * Math.PI * 2 + angleOffset;

            // Start at trunk center
            const startX = centerX;
            const startY = levelY;

            // End point (radial from center)
            const endX = centerX + Math.cos(angle) * branchLength;
            const endY = levelY + Math.sin(angle) * branchLength * 0.3; // Slight vertical spread

            // Control point for bezier curve (makes branch droop down)
            const controlX = startX + Math.cos(angle) * branchLength * 0.6;
            const controlY = startY + branchLength * 0.15; // Droop down

            // Create branch as quadratic bezier path
            const branchPath = document.createElementNS(svgNS, "path");
            const d = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
            branchPath.setAttribute("d", d);
            branchPath.setAttribute("stroke", "url(#branchGradient)");
            branchPath.setAttribute("stroke-width", 3 + level * 0.5);
            branchPath.setAttribute("fill", "none");
            branchPath.setAttribute("stroke-linecap", "round");
            branchPath.setAttribute("class", `branch branch-level-${level}`);
            branchPath.setAttribute("opacity", 0.9);

            branchGroup.appendChild(branchPath);

            // Store branch data for ornament placement
            branchData.push({
                id: `${level}-${b}`,
                level: level,
                startX, startY,
                endX, endY,
                controlX, controlY,
                length: branchLength,
                angle: angle
            });

            // Add needle details to branch (small green strokes)
            const needleCount = Math.floor(branchLength / 8);
            for (let n = 0; n < needleCount; n++) {
                const t = n / needleCount; // Position along branch (0-1)

                // Point on bezier curve
                const px = (1-t)*(1-t)*startX + 2*(1-t)*t*controlX + t*t*endX;
                const py = (1-t)*(1-t)*startY + 2*(1-t)*t*controlY + t*t*endY;

                // Small needle strokes perpendicular to branch
                const needleAngle = angle + Math.PI / 2;
                const needleLength = 3 + Math.random() * 3;
                const needleEndX = px + Math.cos(needleAngle) * needleLength;
                const needleEndY = py + Math.sin(needleAngle) * needleLength;

                const needle = document.createElementNS(svgNS, "line");
                needle.setAttribute("x1", px);
                needle.setAttribute("y1", py);
                needle.setAttribute("x2", needleEndX);
                needle.setAttribute("y2", needleEndY);
                needle.setAttribute("stroke", "#4A7C28");
                needle.setAttribute("stroke-width", 1);
                needle.setAttribute("opacity", 0.6);
                needle.setAttribute("class", "tree-needle");

                branchGroup.appendChild(needle);
            }
        }
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
    star.setAttribute("fill", "#FFD700");
    star.setAttribute("class", "tree-star");

    svg.appendChild(branchGroup);
    svg.appendChild(trunk);
    svg.appendChild(star);

    // Store branch data in SVG for later access
    svg.branchData = branchData;

    return svg;
}

/**
 * Generate photo positions along tree branches
 * Uses seeded random to ensure consistent positions for all viewers
 * CRITICAL: Ornaments are placed ALONG branches, not randomly in space!
 * @param {number} photoCount - Number of photos
 * @param {Array} branchData - Array of branch objects with coordinates
 * @param {number} seed - Seed for random number generator
 * @returns {Array} Array of position objects {x, y, rotation, size, branchId, hangX, hangY}
 */
function generatePhotoPositions(photoCount, branchData, seed) {
    const rng = seededRandom(seed);
    const positions = [];
    const ornamentRadius = 25; // Base radius

    if (!branchData || branchData.length === 0) {
        console.error('No branch data available for positioning!');
        return positions;
    }

    // Distribute photos across branches
    for (let i = 0; i < photoCount; i++) {
        // Select a random branch (seeded)
        const branchIndex = Math.floor(rng() * branchData.length);
        const branch = branchData[branchIndex];

        // Position along branch (0 = start at trunk, 1 = end of branch)
        // Prefer positions 0.4-0.9 along branch (not too close to trunk, not at very tip)
        const t = 0.4 + rng() * 0.5;

        // Calculate point on bezier curve: P(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
        const x = (1-t)*(1-t)*branch.startX + 2*(1-t)*t*branch.controlX + t*t*branch.endX;
        const y = (1-t)*(1-t)*branch.startY + 2*(1-t)*t*branch.controlY + t*t*branch.endY;

        // Ornament hangs DOWN from the branch
        const hangDistance = 5 + ornamentRadius; // String length + ornament radius
        const ornamentY = y + hangDistance;

        // Random rotation
        const rotation = (rng() - 0.5) * 15; // -7.5° to +7.5° for swing

        // Random size variation
        const size = ornamentRadius + (rng() - 0.5) * 8; // ±4px variation

        positions.push({
            x: x,              // Ornament X position
            y: ornamentY,      // Ornament Y position (below branch)
            hangX: x,          // Where string attaches to branch
            hangY: y,          // Where string attaches to branch
            rotation: rotation,
            radius: size,
            branchId: branch.id,
            branchLevel: branch.level
        });
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
