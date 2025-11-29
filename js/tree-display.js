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
 * Load photo data from JSON file or localStorage
 * @returns {Promise<Object>} Photo data
 */
async function loadPhotoData() {
    let jsonData = null;
    let localData = null;

    // Try to load from JSON file
    try {
        const response = await fetch('./data/photos.json?t=' + Date.now());
        if (response.ok) {
            jsonData = await response.json();
        }
    } catch (error) {
        console.log('Could not load from JSON file:', error.message);
    }

    // Try to load from localStorage
    try {
        const stored = localStorage.getItem('treePhotoData');
        if (stored) {
            localData = JSON.parse(stored);
        }
    } catch (error) {
        console.log('Could not load from localStorage:', error.message);
    }

    // Use the data source with more photos, or localStorage if both have same count
    let photoData = null;
    if (!jsonData && !localData) {
        // No data found, return empty structure
        photoData = {
            photos: [],
            metadata: {
                totalCount: 0,
                maxPhotos: 130,
                lastUpdated: new Date().toISOString()
            }
        };
    } else if (!jsonData) {
        photoData = localData;
    } else if (!localData) {
        photoData = jsonData;
    } else {
        // Both exist, use the one with more photos (or newer timestamp)
        if (localData.photos.length > jsonData.photos.length) {
            photoData = localData;
            console.log('Using localStorage data (more photos)');
        } else if (localData.photos.length === jsonData.photos.length) {
            const localTime = new Date(localData.metadata.lastUpdated).getTime();
            const jsonTime = new Date(jsonData.metadata.lastUpdated).getTime();
            photoData = localTime > jsonTime ? localData : jsonData;
        } else {
            photoData = jsonData;
        }
    }

    return photoData;
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

    // Add tree star at top
    const star = createTreeStar();
    container.appendChild(star);

    // Generate all 130 ornament positions
    const allPositions = generateAllOrnamentPositions();

    // Get seed for today to determine which ornaments get photos
    const seed = getTodaySeed();
    const photoCount = photoData.photos.length;

    // Get which ornament indices should have photos
    const photoOrnamentIndices = getPhotoOrnamentAssignment(photoCount, seed);
    const photoOrnamentSet = new Set(photoOrnamentIndices);

    // Create photo index mapping
    const ornamentToPhotoMap = new Map();
    photoOrnamentIndices.forEach((ornamentIndex, photoIndex) => {
        ornamentToPhotoMap.set(ornamentIndex, photoIndex);
    });

    // Create ornaments container
    const ornamentsContainer = document.createElement('div');
    ornamentsContainer.className = 'ornaments-container';
    ornamentsContainer.style.position = 'relative';
    ornamentsContainer.style.width = '600px';
    ornamentsContainer.style.height = '800px';
    ornamentsContainer.style.margin = '0 auto';

    // Render all ornaments
    allPositions.forEach((position) => {
        let ornament;

        if (photoOrnamentSet.has(position.index)) {
            // This ornament has a photo
            const photoIndex = ornamentToPhotoMap.get(position.index);
            const photo = photoData.photos[photoIndex];
            ornament = createPhotoOrnament(photo, position, photoIndex, isNewPhoto && photoIndex === photoCount - 1);
        } else {
            // This ornament is empty (placeholder)
            ornament = createEmptyOrnament(position);
        }

        ornamentsContainer.appendChild(ornament);
    });

    container.appendChild(ornamentsContainer);
}

/**
 * Create a photo ornament element (filled with a photo)
 * @param {Object} photo - Photo data
 * @param {Object} position - Position data {x, y, size, row, index}
 * @param {number} photoIndex - Photo index
 * @param {boolean} isNew - Whether this is a newly added photo
 * @returns {HTMLElement} Ornament element
 */
function createPhotoOrnament(photo, position, photoIndex, isNew = false) {
    const ornament = document.createElement('div');
    ornament.className = 'ornament ornament-photo';
    if (isNew) {
        ornament.classList.add('ornament-new');
    }

    // Position the ornament
    ornament.style.position = 'absolute';
    ornament.style.left = `${position.x}px`;
    ornament.style.top = `${position.y}px`;
    ornament.style.width = `${position.size}px`;
    ornament.style.height = `${position.size}px`;
    ornament.style.transform = 'translate(-50%, -50%)';

    // Create image
    const img = document.createElement('img');
    img.src = photo.imageData;
    img.alt = 'Team member';
    img.className = 'ornament-image';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';

    // Create border (alternating gold/silver)
    const border = document.createElement('div');
    border.className = photoIndex % 2 === 0 ? 'ornament-border-gold' : 'ornament-border-silver';
    border.style.position = 'absolute';
    border.style.top = '0';
    border.style.left = '0';
    border.style.right = '0';
    border.style.bottom = '0';
    border.style.borderRadius = '50%';
    border.style.border = '3px solid';
    border.style.borderColor = photoIndex % 2 === 0 ? '#FFD700' : '#C0C0C0';
    border.style.pointerEvents = 'none';

    ornament.appendChild(img);
    ornament.appendChild(border);

    return ornament;
}

/**
 * Create an empty ornament element (placeholder)
 * @param {Object} position - Position data {x, y, size, row, index}
 * @returns {HTMLElement} Ornament element
 */
function createEmptyOrnament(position) {
    const ornament = document.createElement('div');
    ornament.className = 'ornament ornament-empty';

    // Position the ornament
    ornament.style.position = 'absolute';
    ornament.style.left = `${position.x}px`;
    ornament.style.top = `${position.y}px`;
    ornament.style.width = `${position.size}px`;
    ornament.style.height = `${position.size}px`;
    ornament.style.transform = 'translate(-50%, -50%)';

    // Create the sphere background
    ornament.style.borderRadius = '50%';
    ornament.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))';
    ornament.style.border = '2px solid rgba(255,255,255,0.3)';
    ornament.style.backdropFilter = 'blur(5px)';
    ornament.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)';

    // Add a subtle star or snowflake icon
    const icon = document.createElement('div');
    icon.innerHTML = position.row % 3 === 0 ? '❄️' : (position.row % 3 === 1 ? '✨' : '⭐');
    icon.style.fontSize = `${position.size * 0.4}px`;
    icon.style.position = 'absolute';
    icon.style.top = '50%';
    icon.style.left = '50%';
    icon.style.transform = 'translate(-50%, -50%)';
    icon.style.opacity = '0.4';

    ornament.appendChild(icon);

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
