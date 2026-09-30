import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers.js';

test('GET /categories returns all categories', async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/categories`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.equal(body.length, 5)
        assert.deepEqual(body, [
          { id: 1, name: "groceries" },
          { id: 2, name: "savings" },
          { id: 3, name: "subscriptions" },
          { id: 4, name: "entertainment" },
          { id: 5, name: "transport" },
        ]);
    } finally {
        await close();
    }
});

test('GET /categories/:1 returns correct category', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories/1`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { id: 1, name: "groceries" });

    } finally {
        await close()
    }
})

test('GET /categories/:3 returns correct category', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories/3`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { id: 3, name: "subscriptions" });
    } finally {
        await close();
    }
});

test('GET /categories/:id where id not exists returns error', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories/6`);
        const body = await res.json();

        assert.equal(res.status, 404);
        assert.deepEqual(body, { error: "Not found" });
    } finally {
        await close();
    }
});

test('POST /categories creates a new category', async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'utilities' }),
        });
        const body = await res.json();

        assert.equal(res.status, 201);
        assert.equal(body.name, 'utilities');
        assert.equal(typeof body.id, 'number');
    } finally {
        await close();
    }
});

test("GET /categories/:6 returns correct category", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories/6`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { id: 6, name: "utilities" });
    } finally {
        await close();
    }
});

test("POST /categories rejects invalid name", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: 45 }),
        });

        assert.equal(res.status, 400);
    } finally {
        await close();
    }
});

test("POST /categories rejects duplicate", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "utilities" }),
        });
        const body = await res.json();

        assert.equal(res.status, 409);
        assert.deepEqual(body, { error: 'Category already exists' })

    } finally {
        await close();
    }
});

test("DELETE /categories/:id returns correct status on valid request", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories/6`, {
            method: "DELETE",
        });

        assert.equal(res.status, 204);
    } finally {
        await close();
    }
})

test("DELETE /categories/:id rejects deleting a category used by transactions", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories/1`, {
            method: "DELETE",
        });
        const body = await res.json();

        assert.equal(res.status, 409);
        assert.deepEqual(body, { error: "Category is used by existing transactions" });

        const check = await fetch(`${baseUrl}/categories`);
        const categories = await check.json();
        assert.ok(categories.some((c) => c.id === 1));
    } finally {
        await close();
    }
})

test("PUT /categories/:id returns correct status on valid edit", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories/3`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "car" }),
        });
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { id: 3, name: "car" });
    } finally {
        await close();
    }
});

test("PUT /categories/:id returns correct status on (invalid) taken name", async () => {
  const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories/2`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "groceries" }),
        });
        const body = await res.json();

        assert.equal(res.status, 409);
        assert.deepEqual(body, { error: "Name is already taken" });
    } finally {
        await close();
    }
});

test("GET /categories return correct row after PUT", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories/3`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { id: 3, name: "car"})
    } finally {
        await close();
    }
})

test("DELETE /categories/:id returns correct status on invalid request", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories/6`, {
            method: "DELETE",
        });
        const body = await res.json()

        assert.equal(res.status, 404);
        assert.deepEqual(body, { error: "Category does not exist" })
    } finally {
        await close();
    }
});

test("PUT /categories/:id rejects request with missing name in body", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        const body = await res.json();

        assert.equal(res.status, 400);
    } finally {
        await close();
    }
});

test("PUT /categories/:id returns 404 when category does not exist", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/categories/999`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "whatever" }),
        });
        const body = await res.json();

        assert.equal(res.status, 404);
        assert.deepEqual(body, { error: "Category does not exist" });
    } finally {
        await close();
    }
});
