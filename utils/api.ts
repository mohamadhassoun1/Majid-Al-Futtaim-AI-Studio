// utils/api.ts

// IMPORTANT: This URL points to your locally running backend server.
const BASE_URL = 'http://localhost:3001';

const apiRequest = async (method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: object) => {
    // For GET requests, the path will already be a full query string like "?path=data/all"
    const isGetWithParams = method === 'GET' && path.startsWith('?');
    // For other requests, the path is relative e.g. /login or /items/item_123
    const url = isGetWithParams ? `${BASE_URL}${path}&_=${Date.now()}` : `${BASE_URL}${path}`;
    
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        // For 204 No Content, we don't expect a JSON body
        if (response.status === 204) {
            return null;
        }
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API ${method} Error:`, error);
        // Provide a more user-friendly message for common network failures
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Network error: Could not connect to the local backend. Is it running?');
        }
        throw error;
    }
};

export const apiGet = (path: string) => apiRequest('GET', path);
export const apiPost = (path: string, body: object) => apiRequest('POST', path, body);
export const apiPut = (path: string, body: object) => apiRequest('PUT', path, body);
export const apiDelete = (path: string) => apiRequest('DELETE', path);
