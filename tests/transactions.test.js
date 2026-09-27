import { test } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./helpers.js";

test("GET /transactions returns all rows", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/transactions`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.equal(body.length, 131);
    } finally {
        await close();
    }
});

test("GET /transactions/:id returns correct row", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/transactions/2`)
        const body = await res.json();

        assert.equal(res.status, 200)
        assert.equal(body.id, 2)
    } finally {
        await close()
    }
})

test("GET /transactions/:id returns correct on invalid request", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/transactions/900`);

        assert.equal(res.status, 404);
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
        assert.equal(body.length, 25);
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
        assert.equal(body.length, 27);
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
        assert.equal(body.length, 9);
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

test("DELETE /transactions/:id returns correct status on valid request", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/transactions/3`, {
            method: "DELETE",
        });

        assert.equal(res.status, 204);
    } finally {
        await close();
    }
})

test("DELETE /transactions/:id actually removes the row", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const createRes = await fetch(`${baseUrl}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 5, desc: "to delete", date: "2026-09-24", category_id: 2 }),
        });
        const { id } = await createRes.json();

        const before = await (await fetch(`${baseUrl}/transactions`)).json();
        assert.ok(before.some((t) => t.id === id));

        const delRes = await fetch(`${baseUrl}/transactions/${id}`, { method: "DELETE" });
        assert.equal(delRes.status, 204);

        const after = await (await fetch(`${baseUrl}/transactions`)).json();
        assert.ok(!after.some((t) => t.id === id));
        assert.equal(after.length, before.length - 1);
    } finally {
        await close();
    }
});

test("DELETE /transactions/:id returns correct status on invalid request", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/transactions/999`, {
        method: "DELETE",
        });

        const body = await res.json()

        assert.equal(res.status, 404);
        assert.deepEqual(body, { error: "Transaction does not exist" });
    } finally {
        await close();
    }
});

test("PUT /transactions/:id rejects missing fields in body", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/transactions/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });

        const body = await res.json();

        assert.equal(res.status, 400);
        assert.ok(Array.isArray(body.error));
        assert.ok(body.error.length > 0);
    } finally {
        await close();
    }
})

test("PUT /transactions/:id returns correct after invalid transaction", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/transactions/999`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 900, desc: "house", date: "1990-03-01", category_id: 2 }),
        });

        const body = await res.json();

        assert.equal(res.status, 404);
        assert.deepEqual(body, { error: "Transaction does not exist" });
    } finally {
        await close();
    }
});

test("PUT /transactions/:id returns correct after valid transaction", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/transactions/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 900, desc: "house", date: "1990-03-01", category_id: 2 }),
        });

        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { id: 1, amount: 900, desc: "house", date: "1990-03-01", category_id: 2 });
    } finally {
        await close();
    }
});

test("PUT /transactions/:id rejects invalid field types", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const before = await (await fetch(`${baseUrl}/transactions/1`)).json();

        const res = await fetch(`${baseUrl}/transactions/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: "abc", desc: "house", date: "1990-03-01", category_id: 2 }),
        });
        const body = await res.json();

        assert.equal(res.status, 400);
        assert.ok(Array.isArray(body.error));
        assert.ok(body.error.length > 0);
        assert.ok(body.error.some((issue) => issue.path.includes("amount")));

        const after = await (await fetch(`${baseUrl}/transactions/1`)).json();
        assert.deepEqual(after, before);
    } finally {
        await close();
    }
});

test("PUT /transactions/:id rejects non-integer amount", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/transactions/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 1.5, desc: "house", date: "1990-03-01", category_id: 2 }),
        });
        const body = await res.json();

        assert.equal(res.status, 400);
        assert.ok(body.error.some((issue) => issue.path.includes("amount")));
    } finally {
        await close();
    }
});

test("PUT /transactions/:id rejects non-existent category_id", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/transactions/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 900, desc: "house", date: "1990-03-01", category_id: 999 }),
        });
        const body = await res.json();

        assert.equal(res.status, 400);
        assert.deepEqual(body, { error: "Category 999 does not exist." });
    } finally {
        await close();
    }
});

test("POST /transactions returns validation issues in error body", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: "thirty", desc: "Coffee", date: "2026-09-23", category_id: 2 }),
        });
        const body = await res.json();

        assert.equal(res.status, 400);
        assert.ok(Array.isArray(body.error));
        assert.ok(body.error.some((issue) => issue.path.includes("amount")));
    } finally {
        await close();
    }
});

test("POST /transactions rejects empty desc", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 30, desc: "", date: "2026-09-23", category_id: 1 }),
        });
        const body = await res.json();

        assert.equal(res.status, 400);
        assert.ok(body.error.some((issue) => issue.path.includes("desc")));
    } finally {
        await close();
    }
});

test("POST /transactions rejects invalid date", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        for (const date of ["not-a-date", "2026/09/23", "2026-02-30"]) {
            const res = await fetch(`${baseUrl}/transactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: 30, desc: "Coffee", date, category_id: 1 }),
            });
            const body = await res.json();

            assert.equal(res.status, 400, `expected 400 for date "${date}"`);
            assert.ok(body.error.some((issue) => issue.path.includes("date")));
        }
    } finally {
        await close();
    }
});

test("POST /transactions accepts a negative amount", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/transactions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: -25, desc: "Refund", date: "2026-09-23", category_id: 1 }),
        });
        const body = await res.json();

        assert.equal(res.status, 201);
        assert.equal(body.amount, -25);
    } finally {
        await close();
    }
});

test("PUT /transactions/:id accepts amount=0", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/transactions/2`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 0, desc: "free", date: "2026-09-18", category_id: 3 }),
        });
        assert.equal(res.status, 200);

        const row = await (await fetch(`${baseUrl}/transactions/2`)).json();
        assert.equal(row.amount, 0);
        assert.equal(row.desc, "free");
    } finally {
        await close();
    }
});

test("PUT /transactions/:id rejects empty desc", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const before = await (await fetch(`${baseUrl}/transactions/1`)).json();

        const res = await fetch(`${baseUrl}/transactions/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 900, desc: "", date: "1990-03-01", category_id: 2 }),
        });
        assert.equal(res.status, 400);

        const after = await (await fetch(`${baseUrl}/transactions/1`)).json();
        assert.deepEqual(after, before);
    } finally {
        await close();
    }
});

test("PUT /transactions/:id rejects invalid date", async () => {
    const { baseUrl, close } = await startTestServer();
    try {
        const before = await (await fetch(`${baseUrl}/transactions/1`)).json();

        const res = await fetch(`${baseUrl}/transactions/1`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: 900, desc: "house", date: "not-a-date", category_id: 2 }),
        });
        const body = await res.json();

        assert.equal(res.status, 400);
        assert.ok(body.error.some((issue) => issue.path.includes("date")));

        const after = await (await fetch(`${baseUrl}/transactions/1`)).json();
        assert.deepEqual(after, before);
    } finally {
        await close();
    }
});
