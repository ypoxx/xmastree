/**
 * Vercel Serverless Function: Photo Upload to GitHub
 *
 * This function receives photo uploads and commits them to the GitHub repository.
 * Requires GITHUB_TOKEN environment variable to be set in Vercel.
 */

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Validate request body
        const { imageData } = req.body;

        if (!imageData) {
            return res.status(400).json({ error: 'Missing imageData' });
        }

        // Validate image data format
        if (!imageData.startsWith('data:image/jpeg;base64,') && !imageData.startsWith('data:image/png;base64,')) {
            return res.status(400).json({ error: 'Invalid image format. Only JPEG and PNG allowed.' });
        }

        // Check image size (rough estimate: base64 is ~33% larger than binary)
        const sizeEstimate = (imageData.length * 0.75) / 1024; // KB
        if (sizeEstimate > 200) { // 200KB limit
            return res.status(400).json({ error: 'Image too large. Maximum 200KB allowed.' });
        }

        // Get GitHub configuration from environment
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_REPO = process.env.GITHUB_REPO; // Format: "owner/repo"

        if (!GITHUB_TOKEN) {
            console.error('GITHUB_TOKEN not configured');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        if (!GITHUB_REPO) {
            console.error('GITHUB_REPO not configured');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const [owner, repo] = GITHUB_REPO.split('/');
        const path = 'data/photos.json';

        // Step 1: Get current file content and SHA
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

            // Decode base64 content
            const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
            photoData = JSON.parse(content);
        } else if (getResponse.status === 404) {
            // File doesn't exist yet, create new structure
            photoData = {
                photos: [],
                metadata: {
                    totalCount: 0,
                    maxPhotos: 130,
                    lastUpdated: new Date().toISOString()
                }
            };
        } else {
            console.error('GitHub API error:', await getResponse.text());
            return res.status(500).json({ error: 'Failed to fetch current data from GitHub' });
        }

        // Step 2: Check if limit reached
        if (photoData.photos.length >= photoData.metadata.maxPhotos) {
            return res.status(400).json({
                error: 'Tree is full',
                message: 'Der Baum ist voll! Es können keine weiteren Fotos hochgeladen werden.'
            });
        }

        // Step 3: Add new photo
        const newPhoto = {
            id: generateUUID(),
            imageData: imageData,
            uploadedAt: new Date().toISOString(),
            timestamp: Date.now()
        };

        photoData.photos.push(newPhoto);
        photoData.metadata.totalCount = photoData.photos.length;
        photoData.metadata.lastUpdated = new Date().toISOString();

        // Step 4: Commit to GitHub
        const newContent = JSON.stringify(photoData, null, 2);
        const encodedContent = Buffer.from(newContent).toString('base64');

        const commitData = {
            message: `Add photo ${photoData.photos.length} to Christmas tree 🎄`,
            content: encodedContent,
            branch: process.env.GITHUB_BRANCH || 'main'
        };

        // Include SHA if file exists
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
            console.error('GitHub commit error:', errorText);
            return res.status(500).json({
                error: 'Failed to commit to GitHub',
                details: errorText
            });
        }

        const result = await putResponse.json();

        // Success!
        return res.status(200).json({
            success: true,
            photoCount: photoData.photos.length,
            message: 'Foto erfolgreich hochgeladen!',
            commit: result.commit.sha
        });

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

/**
 * Generate UUID v4
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
