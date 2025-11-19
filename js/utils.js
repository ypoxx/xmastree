/**
 * Utility functions for Christmas Tree App
 */

/**
 * Mulberry32 seeded random number generator
 * Returns a function that generates deterministic pseudo-random numbers
 * @param {number} seed - Seed value for the random number generator
 * @returns {function} Function that returns random number between 0 and 1
 */
function seededRandom(seed) {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/**
 * Get current date as seed (YYYY-MM-DD format converted to number)
 * @returns {number} Seed based on current date
 */
function getTodaySeed() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    return parseInt(dateString, 10);
}

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Check if two circles collide
 * @param {object} circle1 - {x, y, radius}
 * @param {object} circle2 - {x, y, radius}
 * @param {number} minDistance - Minimum distance between circles
 * @returns {boolean} True if circles collide
 */
function circlesCollide(circle1, circle2, minDistance = 10) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDist = circle1.radius + circle2.radius + minDistance;
    return distance < minDist;
}

/**
 * Compress and resize image to Base64
 * @param {File} file - Image file
 * @param {number} maxSize - Maximum width/height in pixels
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<string>} Base64 encoded image
 */
function compressImage(file, maxSize = 400, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
            const img = new Image();

            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate dimensions for center crop
                let sourceX, sourceY, sourceSize;
                if (img.width > img.height) {
                    sourceSize = img.height;
                    sourceX = (img.width - img.height) / 2;
                    sourceY = 0;
                } else {
                    sourceSize = img.width;
                    sourceX = 0;
                    sourceY = (img.height - img.width) / 2;
                }

                // Set canvas size
                canvas.width = maxSize;
                canvas.height = maxSize;

                // Draw center-cropped and resized image
                ctx.drawImage(
                    img,
                    sourceX, sourceY, sourceSize, sourceSize,
                    0, 0, maxSize, maxSize
                );

                // Convert to Base64
                const base64 = canvas.toDataURL('image/jpeg', quality);
                resolve(base64);
            };

            img.onerror = reject;
            img.src = e.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Set a cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiry
 */
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

/**
 * Get a cookie value
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date string
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        seededRandom,
        getTodaySeed,
        generateUUID,
        circlesCollide,
        compressImage,
        setCookie,
        getCookie,
        formatDate
    };
}
