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

export async function getCategoryById(id) {
    const res = await fetch(`${API_URL}/categories/${id}`);

    if (!res.ok) {
        throw new Error(`Failed to fetch category (status ${res.status})`);
    }

    return res.json();
}

export async function deleteTransactionById(id) {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error(`Failed to delete transaction (status ${res.status})`);
    }
}

export async function editTransactionById(id, desc, amount, date, category_id) {
    const res = await fetch(`${API_URL}/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desc, amount, date, category_id }),
    });

    if (!res.ok) {
        throw new Error(`Failed to edit transaction (status ${res.status})`);
    }

    return res.json();
}
