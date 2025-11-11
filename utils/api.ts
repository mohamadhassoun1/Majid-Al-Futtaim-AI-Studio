
// utils/api.ts

// IMPORTANT: Replace this placeholder with the actual URL of your deployed Render Web Service.
const BASE_URL = 'https://maf-inventory-backend.onrender.com';

const apiRequest = async (method: 'GET' | 'POST', path: string, body?: object) => {
    // For GET requests, the path will already be a full query string like "?path=data/all"
    const url = method === 'GET' ? `${BASE_URL}${path}&_=${Date.now()}` : `${BASE_URL}${path}`;
    
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body && method === 'POST') {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API ${method} Error:`, error);
        // Provide a more user-friendly message for common network failures
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Network error: Could not connect to the server. Please check your internet connection.');
        }
        throw error;
    }
};

export const apiGet = (path: string) => apiRequest('GET', path);
export const apiPost = (path: string, body: object) => apiRequest('POST', path, body);
