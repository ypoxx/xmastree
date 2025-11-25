/**
 * Christmas Tree Display - Main Display Logic
 * Handles rendering tree with photo ornaments and animations
 */

let currentPhotoData = null;
let pollInterval = null;

/**
 * Initialize the tree display
 */
async function initTreeDisplay() {
    try {
        await loadAndRenderTree();
        startPolling();
        setupRefreshButton();
    } catch (error) {
        console.error('Error initializing tree display:', error);
        showError('Fehler beim Laden des Weihnachtsbaums');
    }
}

/**
 * Setup manual refresh button
 */
function setupRefreshButton() {
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
        refreshButton.addEventListener('click', async () => {
            refreshButton.disabled = true;
            refreshButton.textContent = 'Lädt...';

            try {
                // Force reload by clearing cache
                await loadAndRenderTree();
                refreshButton.textContent = '✓ Aktualisiert!';
                setTimeout(() => {
                    refreshButton.textContent = 'Baum aktualisieren';
                    refreshButton.disabled = false;
                }, 2000);
            } catch (error) {
                refreshButton.textContent = 'Fehler - nochmal versuchen';
                refreshButton.disabled = false;
            }
        });
    }
}

/**
 * Load photo data and render the tree
 */
async function loadAndRenderTree() {
    const photoData = await loadPhotoData();

    // Check if data has changed
    if (JSON.stringify(photoData) !== JSON.stringify(currentPhotoData)) {
        const isNewPhoto = currentPhotoData && photoData.photos.length > currentPhotoData.photos.length;
        currentPhotoData = photoData;
        renderTree(photoData, isNewPhoto);
        updateMetadata(photoData.metadata);
    }
}

/**
 * Load photo data from API (live from GitHub) with fallbacks
 * Always loads latest data directly from GitHub via Netlify Function
 * @returns {Promise<Object>} Photo data
 */
async function loadPhotoData() {
    // PRIMARY: Try to load from API endpoint (live from GitHub)
    try {
        const response = await fetch('/api/photos?t=' + Date.now(), {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        if (response.ok) {
            const apiData = await response.json();
            console.log('✓ Loaded from API (GitHub):', apiData.metadata.totalCount, 'photos');

            // Clear localStorage to avoid confusion
            localStorage.removeItem('treePhotoData');

            return apiData;
        } else {
            console.warn('API returned', response.status, '- trying fallback');
        }
    } catch (error) {
        console.log('Could not load from API:', error.message, '- trying fallback');
    }

    // FALLBACK 1: Try static JSON file (for local development)
    try {
        const response = await fetch('./data/photos.json?t=' + Date.now());
        if (response.ok) {
            const jsonData = await response.json();
            console.log('✓ Loaded from static photos.json:', jsonData.metadata.totalCount, 'photos');
            localStorage.removeItem('treePhotoData');
            return jsonData;
        }
    } catch (error) {
        console.log('Could not load from JSON file:', error.message);
    }

    // FALLBACK 2: localStorage (local development only)
    try {
        const stored = localStorage.getItem('treePhotoData');
        if (stored) {
            const localData = JSON.parse(stored);
            console.warn('⚠ Using localStorage fallback:', localData.metadata.totalCount, 'photos');
            return localData;
        }
    } catch (error) {
        console.log('Could not load from localStorage:', error.message);
    }

    // Last resort: empty structure
    console.log('ℹ No photos found, returning empty tree');
    return {
        photos: [],
        metadata: {
            totalCount: 0,
            maxPhotos: 130,
            lastUpdated: new Date().toISOString()
        }
    };
}

/**
 * Render the complete tree with photos
 * @param {Object} photoData - Photo data from JSON
 * @param {boolean} isNewPhoto - Whether a new photo was just added
 */
function renderTree(photoData, isNewPhoto = false) {
    const container = document.getElementById('tree-container');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    const photoCount = photoData.photos.length;
    const treeHeight = calculateTreeHeight(photoCount);
    const treeWidth = treeHeight * 0.6;

    // Generate tree SVG (now returns object with branch data)
    const treeSVG = generateTree(photoCount);
    container.appendChild(treeSVG);

    // Get branch data from SVG
    const branchData = treeSVG.branchData || [];

    // Generate photo positions using today's seed and BRANCH DATA
    const seed = getTodaySeed();
    const positions = generatePhotoPositions(photoCount, branchData, seed);

    // Create SVG group for hanging strings (must be in SVG coordinate space)
    const svgNS = "http://www.w3.org/2000/svg";
    const stringsGroup = document.createElementNS(svgNS, "g");
    stringsGroup.setAttribute("class", "ornament-strings");

    // Draw hanging strings for each ornament
    positions.forEach((pos, index) => {
        // String from branch attachment point to ornament center
        const string = document.createElementNS(svgNS, "line");
        string.setAttribute("x1", pos.hangX);
        string.setAttribute("y1", pos.hangY);
        string.setAttribute("x2", pos.x);
        string.setAttribute("y2", pos.y);
        string.setAttribute("stroke", "rgba(139, 69, 19, 0.6)");
        string.setAttribute("stroke-width", "1");
        string.setAttribute("class", "ornament-string");
        stringsGroup.appendChild(string);
    });

    // Add strings to SVG (before ornaments so they appear behind)
    treeSVG.appendChild(stringsGroup);

    // Create photo ornaments
    const ornamentsContainer = document.createElement('div');
    ornamentsContainer.className = 'ornaments-container';
    ornamentsContainer.style.position = 'absolute';
    ornamentsContainer.style.top = '0';
    ornamentsContainer.style.left = '0';
    ornamentsContainer.style.width = '100%';
    ornamentsContainer.style.height = '100%';
    ornamentsContainer.style.pointerEvents = 'none';

    photoData.photos.forEach((photo, index) => {
        if (index < positions.length) {
            const ornament = createOrnament(photo, positions[index], index, isNewPhoto && index === photoCount - 1);
            ornamentsContainer.appendChild(ornament);
        }
    });

    container.appendChild(ornamentsContainer);

    // Add animation class to tree if it's growing
    if (isNewPhoto) {
        treeSVG.classList.add('tree-growing');
        setTimeout(() => treeSVG.classList.remove('tree-growing'), 500);
    }
}

/**
 * Create a photo ornament element
 * @param {Object} photo - Photo data
 * @param {Object} position - Position data {x, y, rotation, radius, hangX, hangY}
 * @param {number} index - Photo index
 * @param {boolean} isNew - Whether this is a newly added photo
 * @returns {HTMLElement} Ornament element
 */
function createOrnament(photo, position, index, isNew = false) {
    const ornament = document.createElement('div');
    ornament.className = 'ornament';
    if (isNew) {
        ornament.classList.add('ornament-new');
    }

    // Calculate position as percentage for responsiveness
    const photoCount = currentPhotoData.photos.length;
    const treeHeight = calculateTreeHeight(photoCount);
    const treeWidth = treeHeight * 0.6;
    const starOffset = 40;
    const totalHeight = treeHeight + starOffset + 50;

    // Position.x and position.y are already in SVG coordinate space
    // Convert to percentage of total SVG viewBox
    const leftPercent = (position.x / treeWidth) * 100;
    const topPercent = (position.y / totalHeight) * 100;

    ornament.style.left = `${leftPercent}%`;
    ornament.style.top = `${topPercent}%`;
    ornament.style.transform = `translate(-50%, -50%) rotate(${position.rotation}deg)`;
    ornament.style.setProperty('--rotation', `${position.rotation}deg`);
    ornament.style.setProperty('--i', index);
    ornament.style.width = `${position.radius * 2}px`;
    ornament.style.height = `${position.radius * 2}px`;

    // Create image
    const img = document.createElement('img');
    img.src = photo.imageData;
    img.alt = 'Team member';
    img.className = 'ornament-image';

    // Create border (alternating gold/silver)
    const border = document.createElement('div');
    border.className = index % 2 === 0 ? 'ornament-border-gold' : 'ornament-border-silver';

    // Create glitter overlay
    const glitter = document.createElement('div');
    glitter.className = 'ornament-glitter';

    ornament.appendChild(img);
    ornament.appendChild(border);
    ornament.appendChild(glitter);

    return ornament;
}

/**
 * Update metadata display
 * @param {Object} metadata - Metadata from JSON
 */
function updateMetadata(metadata) {
    const countElement = document.getElementById('photo-count');
    const lastUpdateElement = document.getElementById('last-update');

    if (countElement) {
        countElement.textContent = `${metadata.totalCount} / ${metadata.maxPhotos} Fotos`;
    }

    if (lastUpdateElement && metadata.lastUpdated) {
        const date = new Date(metadata.lastUpdated);
        lastUpdateElement.textContent = `Zuletzt aktualisiert: ${formatDate(date.getTime())}`;
    }
}

/**
 * Start polling for new photos
 */
function startPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
    }

    // Poll every 30 seconds
    pollInterval = setInterval(async () => {
        try {
            await loadAndRenderTree();
        } catch (error) {
            console.error('Error polling for updates:', error);
        }
    }, 30000);
}

/**
 * Stop polling
 */
function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    const container = document.getElementById('tree-container');
    if (!container) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
}

/**
 * Handle window resize
 */
function handleResize() {
    if (currentPhotoData) {
        renderTree(currentPhotoData, false);
    }
}

// Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 250);
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTreeDisplay);
} else {
    initTreeDisplay();
}

// Cleanup on page unload
window.addEventListener('beforeunload', stopPolling);
