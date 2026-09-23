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