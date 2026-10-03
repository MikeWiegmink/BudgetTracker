const PUBLIC_API_URL = "http://localhost:8080";

const API_URL =
    typeof window === "undefined"
        ? (process.env.INTERNAL_API_URL ?? PUBLIC_API_URL)
        : PUBLIC_API_URL;

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

export async function addTransaction(desc, amount, date, category_id) {
    const res = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desc, amount, date, category_id }),
    });

    if (!res.ok) {
        throw new Error(`Failed to add transaction (status ${res.status})`);
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

export async function editTransaction(id, desc, amount, date, category_id) {
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

export async function addCategory(name) {
    const res = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    })

    if (!res.ok) {
        throw new Error(`Failed to add category (status ${res.status})`);
    }

    return res.json()
}

export async function editCategory(id, name) {
    const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });

    if (!res.ok) {
        throw new Error(`Failed to edit category (status ${res.status})`)
    }

    return res.json()
}

export async function deleteCategoryById(id) {
    const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE"
    })

    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Failed to delete category (status ${res.status})`)
    }
}