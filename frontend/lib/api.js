// lib/api.js
const API_URL = "http://localhost:8080";

export async function getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/transactions${query ? `?${query}` : ""}`;

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Failed to fetch transactions (status ${res.status})`);
    }

    return res.json();
}

export async function getCategories() {
    const url = `${API_URL}/categories`;
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Failed to fetch categories (status ${res.status})`);
    }

    return res.json()
}