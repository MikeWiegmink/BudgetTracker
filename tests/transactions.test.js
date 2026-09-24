import { test } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers.js";

test("GET /transactions returns all rows", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/transactions`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.equal(body.length, 8);
    } finally {
        await close();
    }
});

test("GET /transactions filters by category_id", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/transactions?category_id=3`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.equal(body.length, 3);
        assert.ok(body.every((t) => t.category_id === 3));
    } finally {
        await close();
    }
});

test("GET /transactions filters by date", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/transactions?date=2026-09`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.equal(body.length, 5);
        assert.ok(body.every((t) => t.date.includes("2026-09")));
    } finally {
        await close();
    }
});

test("GET /transactions filters by date and category_id combined", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/transactions?date=2026-09&category_id=3`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.equal(body.length, 3);
        assert.ok(body.every((t) => t.category_id === 3 && t.date.includes("2026-09")));
    } finally {
        await close();
    }
});

test("GET /transactions returns empty array when no rows match", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/transactions?category_id=999`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, []);
    } finally {
        await close();
    }
});

test("POST /transactions creates a new transaction", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: 30,
                desc: "Coffee",
                date: "2026-09-23",
                category_id: 1,
            }),
        });
        const body = await res.json();

        assert.equal(res.status, 201);
        assert.equal(body.amount, 30);
        assert.equal(body.desc, "Coffee");
        assert.equal(body.date, "2026-09-23");
        assert.equal(body.category_id, 1);
        assert.equal(typeof body.id, "number");
    } finally {
        await close();
    }
});

test("POST /transactions rejects missing required fields", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: 30,
                desc: "Coffee",
                date: "2026-09-23",
            }),
        });

        assert.equal(res.status, 400);
    } finally {
        await close();
    }
});

test("POST /transactions rejects invalid field types", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: "thirty",
                desc: "Coffee",
                date: "2026-09-23",
                category_id: 1,
            }),
        });

        assert.equal(res.status, 400);
    } finally {
        await close();
    }
});

test("POST /transactions rejects non-existent category_id", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: 30,
                desc: "Coffee",
                date: "2026-09-23",
                category_id: 999,
            }),
        });
        const body = await res.json();

        assert.equal(res.status, 400);
        assert.deepEqual(body, { error: "Category 999 does not exist." });
    } finally {
        await close();
    }
});

test("DELETE /transactions returns correct status on valid request", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/transactions?id=3`, {
            method: "DELETE",
        });

        assert.equal(res.status, 204);
    } finally {
        await close();
    }
})

test("DELETE /transactions returns correct status on invalid request", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/transactions?id=999`, {
        method: "DELETE",
        });

        const body = await res.json()

        assert.equal(res.status, 404);
        assert.deepEqual(body, { error: "Transaction does not exist " });
    } finally {
        await close();
    }
});

test("DELETE /transactions returns correct status on missing parameter", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/transactions`, {
        method: "DELETE",
        });

        const body = await res.json();

        assert.equal(res.status, 400);
        assert.deepEqual(body, { error: "No id provided" });
    } finally {
        await close();
    }
});


