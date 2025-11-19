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
    } catch (error) {
        console.error('Error initializing tree display:', error);
        showError('Fehler beim Laden des Weihnachtsbaums');
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
 * Load photo data from JSON file
 * @returns {Promise<Object>} Photo data
 */
async function loadPhotoData() {
    try {
        const response = await fetch('./data/photos.json?t=' + Date.now());
        if (!response.ok) {
            throw new Error('Failed to load photo data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading photo data:', error);
        // Return empty data structure if file doesn't exist yet
        return {
            photos: [],
            metadata: {
                totalCount: 0,
                maxPhotos: 130,
                lastUpdated: new Date().toISOString()
            }
        };
    }
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

    // Generate tree SVG
    const treeSVG = generateTree(photoCount);
    container.appendChild(treeSVG);

    // Generate photo positions using today's seed
    const seed = getTodaySeed();
    const positions = generatePhotoPositions(photoCount, treeHeight, treeWidth, seed);

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
 * @param {Object} position - Position data {x, y, rotation, radius}
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
    const container = document.getElementById('tree-container');
    const containerRect = container.getBoundingClientRect();

    ornament.style.left = `${(position.x / calculateTreeHeight(currentPhotoData.photos.length) * 0.6) * 100}%`;
    ornament.style.top = `${(position.y / calculateTreeHeight(currentPhotoData.photos.length)) * 100}%`;
    ornament.style.transform = `translate(-50%, -50%) rotate(${position.rotation}deg)`;
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
