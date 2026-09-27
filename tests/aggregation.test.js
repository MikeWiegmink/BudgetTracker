import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers.js';

test("GET /summary missing parameter", async () => {
    const { baseUrl, close } = await startTestServer()

    try {
        const res = await fetch(`${baseUrl}/summary`);
        const body = await res.json();

        assert.equal(res.status, 400);
        assert.deepEqual(body, { error: "No parameters provided" })
    } finally {
        await close();
    }
})

test("GET /summary wrong parameter", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?date=01-01-2026`);
        const body = await res.json();

        assert.equal(res.status, 400);
        assert.deepEqual(body, { error: "Invalid date format, expected YYYY-MM or YYYY-MM-DD" })
    } finally {
        await close();
    }
})

test("GET /summary no transactions in month", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?date=2024-09`);
        const body = await res.json();

        assert.equal(res.status, 404);
        assert.deepEqual(body, { error: "No transactions found in that month" })
    } finally {
        await close();
    }
})

test("GET /summary returns correct only date", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?date=2026-09`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { month: "2026-09", total: 1293, average: 47.89, max: 219 })
    } finally {
        await close()
    }
})

test("GET /summary returns correct only category_id (no date -> month is null)", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?category_id=1`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { month: null, total: 776, average: 38.8, max: 68 })
    } finally {
        await close()
    }
})

test("GET /summary returns correct date & category_id", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?date=2026-08&category_id=1`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { month: "2026-08", total: 105, average: 26.25, max: 40 })
    } finally {
        await close()
    }
})

test("GET /commoncategory missing parameter", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/commoncategory`);
        const body = await res.json();

        assert.equal(res.status, 400);
        assert.deepEqual(body, { error: "No parameters provided"});
    } finally {
        await close();
    }
})

test("GET /commoncategory wrong parameter", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/commoncategory?date=29-09-2026`);
        const body = await res.json();
        
        assert.equal(res.status, 400);
        assert.deepEqual(body, { error: "Invalid date format, expected YYYY-MM or YYYY-MM-DD" });
    } finally {
        await close();
    }
})

test("GET /commoncategory returns correct 1", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/commoncategory?date=2026-06-05`)
        const body = await res.json();
        
        assert.equal(res.status, 200)
        assert.deepEqual(body, {
            month: '2026-06',
            categories: [
                { name: 'savings', count: 6 },
                { name: 'transport', count: 3 },
                { name: 'subscriptions', count: 3 },
                { name: 'entertainment', count: 2 },
                { name: 'groceries', count: 2 }
            ]
        })
    } finally {
        await close();
    }
})

test("GET /commoncategory returns correct 2", async() => {
    const { baseUrl, close } = await startTestServer();
    try {
        const res = await fetch(`${baseUrl}/commoncategory?date=2026-07`)
        const body = await res.json();

        assert.equal(res.status, 200)
        assert.deepEqual(body, {
            month: '2026-07',
            categories: [
                { name: 'entertainment', count: 9 },
                { name: 'transport', count: 6 },
                { name: 'savings', count: 6 },
                { name: 'subscriptions', count: 3 },
                { name: 'groceries', count: 2 }
            ]
        })
    } finally {
        await close()
    }
})