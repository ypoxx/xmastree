/**
 * Netlify Function: Delete All Photos
 *
 * This endpoint clears all photos from photos.json in GitHub
 * DANGEROUS: This action is irreversible!
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
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const GITHUB_REPO = process.env.GITHUB_REPO;
        const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

        if (!GITHUB_TOKEN || !GITHUB_REPO) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }

        const [owner, repo] = GITHUB_REPO.split('/');
        const path = 'data/photos.json';

        // Fetch current file to get its SHA
        const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const getResponse = await fetch(getFileUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Xmastree-App'
            }
        });

        if (!getResponse.ok) {
            console.error('GitHub API error (GET):', await getResponse.text());
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to fetch from GitHub' })
            };
        }

        const fileData = await getResponse.json();
        const currentSha = fileData.sha;

        // Create empty photo data structure
        const emptyPhotoData = {
            photos: [],
            metadata: {
                totalCount: 0,
                maxPhotos: 130,
                lastUpdated: new Date().toISOString()
            }
        };

        const content = JSON.stringify(emptyPhotoData, null, 2);
        const base64Content = Buffer.from(content).toString('base64');

        // Update file with empty data
        const updateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Xmastree-App',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: '🗑️ Admin: Delete all photos',
                content: base64Content,
                sha: currentSha,
                branch: GITHUB_BRANCH
            })
        });

        if (!updateResponse.ok) {
            console.error('GitHub API error (PUT):', await updateResponse.text());
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to update GitHub repository' })
            };
        }

        const result = await updateResponse.json();

        // Return success
        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                message: 'All photos deleted successfully',
                commit: result.commit.sha
            })
        };

    } catch (error) {
        console.error('Delete all photos error:', error);
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
