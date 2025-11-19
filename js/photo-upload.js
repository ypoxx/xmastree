/**
 * Photo Upload Handler
 * Manages photo upload, processing, and storage
 */

const MAX_PHOTOS = 130;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const COOKIE_NAME = 'xmas_tree_uploaded';
const COOKIE_EXPIRY_DATE = new Date('2025-12-31');

/**
 * Initialize upload page
 */
function initUpload() {
    checkUploadStatus();
    setupEventListeners();
    updatePhotoCount();
}

/**
 * Check if user has already uploaded
 */
function checkUploadStatus() {
    const hasUploaded = getCookie(COOKIE_NAME);

    if (hasUploaded) {
        showAlreadyUploaded();
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const fileInput = document.getElementById('photo-input');
    const cameraButton = document.getElementById('camera-button');
    const uploadButton = document.getElementById('upload-button');
    const uploadForm = document.getElementById('upload-form');

    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    if (cameraButton) {
        cameraButton.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }
}

/**
 * Handle file selection
 * @param {Event} event - Change event
 */
async function handleFileSelect(event) {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file
    if (!file.type.match('image.*')) {
        showMessage('Bitte wähle ein Bild aus (JPEG oder PNG)', 'error');
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        showMessage('Bild ist zu groß. Maximal 5MB erlaubt.', 'error');
        return;
    }

    try {
        // Show loading state
        showMessage('Bild wird vorbereitet...', 'info');

        // Compress and convert image
        const compressedImage = await compressImage(file, 400, 0.8);

        // Show preview
        showPreview(compressedImage);

        // Enable upload button
        const uploadButton = document.getElementById('upload-button');
        if (uploadButton) {
            uploadButton.disabled = false;
        }

        showMessage('Bild bereit zum Hochladen!', 'success');
    } catch (error) {
        console.error('Error processing image:', error);
        showMessage('Fehler beim Verarbeiten des Bildes', 'error');
    }
}

/**
 * Show image preview
 * @param {string} imageData - Base64 image data
 */
function showPreview(imageData) {
    const preview = document.getElementById('preview');
    const previewImg = document.getElementById('preview-img');

    if (preview && previewImg) {
        previewImg.src = imageData;
        preview.style.display = 'block';
    }
}

/**
 * Handle photo upload
 * @param {Event} event - Submit event
 */
async function handleUpload(event) {
    event.preventDefault();

    const hasUploaded = getCookie(COOKIE_NAME);
    if (hasUploaded) {
        showMessage('Du hast bereits ein Foto hochgeladen!', 'error');
        return;
    }

    const previewImg = document.getElementById('preview-img');
    if (!previewImg || !previewImg.src) {
        showMessage('Bitte wähle zuerst ein Foto aus', 'error');
        return;
    }

    const uploadButton = document.getElementById('upload-button');
    if (uploadButton) {
        uploadButton.disabled = true;
        uploadButton.textContent = 'Wird hochgeladen...';
    }

    try {
        // Load current photo data
        const photoData = await loadPhotoData();

        // Check if limit reached
        if (photoData.photos.length >= MAX_PHOTOS) {
            showMessage('Der Baum ist voll! Es können keine weiteren Fotos hochgeladen werden.', 'error');
            return;
        }

        // Create new photo entry
        const newPhoto = {
            id: generateUUID(),
            imageData: previewImg.src,
            uploadedAt: new Date().toISOString(),
            timestamp: Date.now()
        };

        // Add to photos array
        photoData.photos.push(newPhoto);
        photoData.metadata.totalCount = photoData.photos.length;
        photoData.metadata.lastUpdated = new Date().toISOString();

        // Save to JSON file
        await savePhotoData(photoData);

        // Set cookie to prevent multiple uploads
        const daysUntilExpiry = Math.ceil((COOKIE_EXPIRY_DATE - new Date()) / (1000 * 60 * 60 * 24));
        setCookie(COOKIE_NAME, 'true', daysUntilExpiry);

        // Show success
        showSuccess();

    } catch (error) {
        console.error('Error uploading photo:', error);
        showMessage('Fehler beim Hochladen. Bitte versuche es erneut.', 'error');

        if (uploadButton) {
            uploadButton.disabled = false;
            uploadButton.textContent = 'Foto hochladen';
        }
    }
}

/**
 * Load photo data from JSON
 * @returns {Promise<Object>} Photo data
 */
async function loadPhotoData() {
    try {
        const response = await fetch('./data/photos.json?t=' + Date.now());
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.log('No existing photo data, creating new');
    }

    // Return default structure
    return {
        photos: [],
        metadata: {
            totalCount: 0,
            maxPhotos: MAX_PHOTOS,
            lastUpdated: new Date().toISOString()
        }
    };
}

/**
 * Save photo data to JSON
 * Note: This is a simplified version. In production, this would need
 * to use GitHub API or a serverless function to commit changes.
 * @param {Object} photoData - Photo data to save
 */
async function savePhotoData(photoData) {
    // For local development/testing, save to localStorage as fallback
    localStorage.setItem('treePhotoData', JSON.stringify(photoData));

    // In production, this would make a request to GitHub API or serverless function
    // Example with GitHub API:
    /*
    const token = 'YOUR_GITHUB_TOKEN';
    const repo = 'username/weihnachtsbaum';
    const path = 'data/photos.json';

    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: 'Add new photo',
            content: btoa(JSON.stringify(photoData, null, 2)),
            sha: currentFileSHA // Need to get this first with GET request
        })
    });
    */

    // For now, show instructions to user
    console.log('Photo data to save:', photoData);

    // Simulate async operation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
}

/**
 * Update photo count display
 */
async function updatePhotoCount() {
    const photoData = await loadPhotoData();
    const countElement = document.getElementById('current-count');

    if (countElement) {
        countElement.textContent = `${photoData.metadata.totalCount} / ${MAX_PHOTOS}`;
    }
}

/**
 * Show message to user
 * @param {string} message - Message text
 * @param {string} type - Message type (success, error, info)
 */
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');

    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message message-${type}`;
        messageDiv.style.display = 'block';

        // Auto-hide after 5 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
}

/**
 * Show success state
 */
function showSuccess() {
    const uploadForm = document.getElementById('upload-form');
    const successDiv = document.getElementById('success-message');

    if (uploadForm) {
        uploadForm.style.display = 'none';
    }

    if (successDiv) {
        successDiv.style.display = 'block';
    } else {
        showMessage('Foto erfolgreich hochgeladen! 🎄', 'success');
    }

    // Update count
    updatePhotoCount();
}

/**
 * Show already uploaded state
 */
function showAlreadyUploaded() {
    const uploadForm = document.getElementById('upload-form');
    const alreadyUploadedDiv = document.getElementById('already-uploaded');

    if (uploadForm) {
        uploadForm.style.display = 'none';
    }

    if (alreadyUploadedDiv) {
        alreadyUploadedDiv.style.display = 'block';
    } else {
        showMessage('Du hast bereits ein Foto hochgeladen!', 'info');
    }
}

/**
 * View the tree (navigate to display page)
 */
function viewTree() {
    window.location.href = './index.html';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUpload);
} else {
    initUpload();
}
