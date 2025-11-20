/**
 * Netlify Function: Photo Upload to GitHub
 *
 * Deploy: netlify deploy --prod
 * Set environment variables in Netlify dashboard
 */

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle OPTIONS for CORS
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { imageData } = JSON.parse(event.body);

        if (!imageData) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing imageData' })
            };
        }

        // Validate image format
        if (!imageData.startsWith('data:image/jpeg;base64,') && !imageData.startsWith('data:image/png;base64,')) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid image format' })
            };
        }

        // Check size
        const sizeEstimate = (imageData.length * 0.75) / 1024;
        if (sizeEstimate > 200) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Image too large. Max 200KB' })
            };
        }

        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_REPO = process.env.GITHUB_REPO;

        if (!GITHUB_TOKEN || !GITHUB_REPO) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }

        const [owner, repo] = GITHUB_REPO.split('/');
        const path = 'data/photos.json';

        // Get current file
        const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const getResponse = await fetch(getFileUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Xmastree-App'
            }
        });

        let photoData;
        let currentSHA = null;

        if (getResponse.ok) {
            const fileData = await getResponse.json();
            currentSHA = fileData.sha;
            const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
            photoData = JSON.parse(content);
        } else if (getResponse.status === 404) {
            photoData = {
                photos: [],
                metadata: {
                    totalCount: 0,
                    maxPhotos: 130,
                    lastUpdated: new Date().toISOString()
                }
            };
        } else {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to fetch from GitHub' })
            };
        }

        // Check limit
        if (photoData.photos.length >= photoData.metadata.maxPhotos) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Tree is full' })
            };
        }

        // Add photo
        const newPhoto = {
            id: generateUUID(),
            imageData: imageData,
            uploadedAt: new Date().toISOString(),
            timestamp: Date.now()
        };

        photoData.photos.push(newPhoto);
        photoData.metadata.totalCount = photoData.photos.length;
        photoData.metadata.lastUpdated = new Date().toISOString();

        // Commit to GitHub
        const newContent = JSON.stringify(photoData, null, 2);
        const encodedContent = Buffer.from(newContent).toString('base64');

        const commitData = {
            message: `Add photo ${photoData.photos.length} to Christmas tree 🎄`,
            content: encodedContent,
            branch: process.env.GITHUB_BRANCH || 'main'
        };

        if (currentSHA) {
            commitData.sha = currentSHA;
        }

        const putResponse = await fetch(getFileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Xmastree-App'
            },
            body: JSON.stringify(commitData)
        });

        if (!putResponse.ok) {
            const errorText = await putResponse.text();
            console.error('GitHub error:', errorText);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to commit to GitHub' })
            };
        }

        const result = await putResponse.json();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                photoCount: photoData.photos.length,
                message: 'Foto erfolgreich hochgeladen!',
                commit: result.commit.sha
            })
        };

    } catch (error) {
        console.error('Upload error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error', message: error.message })
        };
    }
};

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
