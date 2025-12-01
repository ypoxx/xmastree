/**
 * Netlify Function: Get Photos from GitHub
 *
 * This endpoint fetches photos.json directly from GitHub
 * so we always have the latest data without redeploying
 */

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    // Handle OPTIONS for CORS
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow GET
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
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

        // Fetch current file from GitHub
        const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const getResponse = await fetch(getFileUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Xmastree-App'
            }
        });

        let photoData;

        if (getResponse.ok) {
            const fileData = await getResponse.json();
            const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
            photoData = JSON.parse(content);
        } else if (getResponse.status === 404) {
            // File doesn't exist yet, return empty structure
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
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to fetch from GitHub' })
            };
        }

        // Return the photo data
        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            body: JSON.stringify(photoData)
        };

    } catch (error) {
        console.error('Get photos error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
