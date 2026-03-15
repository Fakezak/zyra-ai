// netlify/functions/proxy-swap.js
const fetch = require('node-fetch');

// Your actual Zyra AI API endpoint
const ZYRA_API_URL = 'https://zyra-ai-api.netlify.app/.netlify/functions/swap';

exports.handler = async (event) => {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://zyra-a.netlify.app',
                'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Max-Age': '86400',
            },
            body: '',
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': 'https://zyra-a.netlify.app',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        // Log the request (for debugging)
        console.log('Proxy function called');
        
        // Parse the multipart form data
        // Note: Netlify Functions automatically parse multipart/form-data
        // The body is already a Buffer, and we can forward it directly
        
        // Forward the request to the actual Zyra API
        const response = await fetch(ZYRA_API_URL, {
            method: 'POST',
            headers: {
                // Forward relevant headers
                'X-API-Key': event.headers['x-api-key'] || '',
                'Content-Type': event.headers['content-type'] || 'multipart/form-data',
            },
            body: event.isBase64Encoded 
                ? Buffer.from(event.body, 'base64')
                : event.body,
        });

        // Get the response data
        const responseData = await response.buffer();
        const contentType = response.headers.get('content-type') || 'video/mp4';

        // Return the response with CORS headers
        return {
            statusCode: response.status,
            headers: {
                'Access-Control-Allow-Origin': 'https://zyra-a.netlify.app',
                'Content-Type': contentType,
                'Content-Length': responseData.length.toString(),
            },
            body: responseData.toString('base64'),
            isBase64Encoded: true,
        };

    } catch (error) {
        console.error('Proxy error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': 'https://zyra-a.netlify.app',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                error: 'Failed to process request',
                message: error.message 
            }),
        };
    }
};
