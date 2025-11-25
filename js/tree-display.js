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
 * Render the complete tree with photos - PURE SVG SOLUTION
 * @param {Object} photoData - Photo data from JSON
 * @param {boolean} isNewPhoto - Whether a new photo was just added
 */
function renderTree(photoData, isNewPhoto = false) {
    const container = document.getElementById('tree-container');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    const photoCount = photoData.photos.length;

    // Generate tree with empty ornaments first to get triangle bounds
    const emptyTree = generateTree(photoCount, [], []);
    const triangleBounds = emptyTree.triangleBounds || [];

    // Generate photo positions using today's seed and triangle bounds
    const seed = getTodaySeed();
    const positions = generatePhotoPositions(photoCount, triangleBounds, seed);

    // Now generate complete tree with photos and positions
    const treeSVG = generateTree(photoCount, photoData.photos, positions);
    container.appendChild(treeSVG);

    // Add animation class to tree if it's growing
    if (isNewPhoto) {
        treeSVG.classList.add('tree-growing');
        setTimeout(() => treeSVG.classList.remove('tree-growing'), 500);
    }
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
