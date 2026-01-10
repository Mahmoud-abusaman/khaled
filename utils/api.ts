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

export async function createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    return fetchAPI<MenuItem>('/menu', {
        method: 'POST',
        body: JSON.stringify(item),
    });
}

export async function updateMenuItem(id: string, item: Partial<MenuItem>): Promise<MenuItem> {
    return fetchAPI<MenuItem>(`/menu/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item),
    });
}

export async function deleteMenuItem(id: string): Promise<void> {
    await fetchAPI(`/menu/${id}`, {
        method: 'DELETE',
    });
}

// Invoices API
export async function fetchInvoices(): Promise<Invoice[]> {
    return fetchAPI<Invoice[]>('/invoices');
}

export async function createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    // Transform items to match backend expectation if necessary
    // Backend expects: { menuItem: <id>, name, price, quantity, ... }
    const payload = {
        ...invoice,
        items: invoice.items.map(item => ({
            ...item,
            menuItem: item.id // Pass the item ID as the reference
        }))
    };

    return fetchAPI<Invoice>('/invoices', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function deleteInvoice(id: string): Promise<void> {
    await fetchAPI(`/invoices/${id}`, {
        method: 'DELETE',
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
