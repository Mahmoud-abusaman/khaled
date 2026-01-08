import { MenuItem, Invoice } from '../types';

// Use relative URL in production, absolute in development
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch ${endpoint}:`, error);
        throw error;
    }
}

// Menu API
export async function fetchMenu(): Promise<MenuItem[]> {
    return fetchAPI<MenuItem[]>('/menu');
}

export async function saveMenu(menu: MenuItem[]): Promise<void> {
    await fetchAPI('/menu', {
        method: 'POST',
        body: JSON.stringify(menu),
    });
}

// Invoices API
export async function fetchInvoices(): Promise<Invoice[]> {
    return fetchAPI<Invoice[]>('/invoices');
}

export async function saveInvoices(invoices: Invoice[]): Promise<void> {
    await fetchAPI('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoices),
    });
}

// Health check
export async function checkServerHealth(): Promise<boolean> {
    try {
        await fetchAPI('/health');
        return true;
    } catch {
        return false;
    }
}
