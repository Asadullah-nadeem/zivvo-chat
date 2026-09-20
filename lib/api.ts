import { config } from './config';

export interface LoginResponse {
    token: string;
    username: string;
    expiresIn?: string;
}

export interface HealthResponse {
    status: string;
    uptime: number;
    timestamp: string;
}

/**
 * Check if the backend API server is reachable
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const res = await fetch(`${config.apiUrl}/health`, {
            signal: controller.signal,
            cache: 'no-store'
        });
        clearTimeout(timeoutId);
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * Login user via Node.js API
 */
export async function loginUser(username: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${config.apiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username.trim() }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errData.error || `Server responded with status ${response.status}`
            };
        }

        const data: LoginResponse = await response.json();
        return { success: true, token: data.token };
    } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
            return { success: false, error: 'Connection to server timed out. Please check if backend is running.' };
        }
        return { success: false, error: 'Unable to connect to backend server. Make sure Node.js server (port 5000) is running.' };
    }
}

/**
 * Verify JWT Token against backend
 */
export async function verifyToken(token: string): Promise<boolean> {
    try {
        const res = await fetch(`${config.apiUrl}/verify`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store'
        });
        return res.ok;
    } catch {
        return false;
    }
}
