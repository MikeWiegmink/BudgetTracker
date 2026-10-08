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

test("GET /summary wrong parameter 1", async () => {
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

test("GET /summary wrong parameter 2", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?category_id=Test`);
        const body = await res.json();

        assert.equal(res.status, 400);
        assert.deepEqual(body, { error: "category_id must be an integer" })
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
        assert.deepEqual(body, { month: "2026-09", start_date: null, end_date: null, total: 1293, average: 47.89, max: 219 })
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
        assert.deepEqual(body, { month: null, start_date: null, end_date: null, total: 776, average: 38.8, max: 68 })
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
        assert.deepEqual(body, { month: "2026-08", start_date: null, end_date: null, total: 105, average: 26.25, max: 40 })
    } finally {
        await close()
    }
})

test("GET /summary returns correct start_date & end_date with category_id", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?start_date=2026-08-01&end_date=2026-09-30&category_id=1`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { month: null, start_date: "2026-08-01", end_date: "2026-09-30", total: 259, average: 37, max: 68 })
    } finally {
        await close()
    }
})

test("GET /summary returns correct only start_date with category_id", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?start_date=2026-11-01&category_id=1`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { month: null, start_date: "2026-11-01", end_date: null, total: 145, average: 36.25, max: 65 })
    } finally {
        await close()
    }
})

test("GET /summary returns correct only end_date with category_id", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?end_date=2026-06-30&category_id=2`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { month: null, start_date: null, end_date: "2026-06-30", total: 879, average: 146.5, max: 234 })
    } finally {
        await close()
    }
})

test("GET /summary includes transactions on the start_date and end_date boundaries", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?start_date=2026-08-12&end_date=2026-08-12&category_id=1`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { month: null, start_date: "2026-08-12", end_date: "2026-08-12", total: 20, average: 20, max: 20 })
    } finally {
        await close()
    }
})

test("GET /summary combines date, start_date, end_date & category_id", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?date=2026-09&start_date=2026-09-01&end_date=2026-09-15&category_id=1`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { month: "2026-09", start_date: "2026-09-01", end_date: "2026-09-15", total: 106, average: 53, max: 68 })
    } finally {
        await close()
    }
})

test("GET /summary works with only start_date and end_date (no category_id)", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?start_date=2026-10-08&end_date=2026-10-08`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { month: null, start_date: "2026-10-08", end_date: "2026-10-08", total: 185, average: 92.5, max: 111 })
    } finally {
        await close()
    }
})

test("GET /summary rejects an invalid start_date", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?start_date=abc&category_id=1`);
        const body = await res.json();

        assert.equal(res.status, 400);
        assert.deepEqual(body, { error: "Invalid start_date or end_date format, expected YYYY-MM-DD" })
    } finally {
        await close()
    }
})

test("GET /summary rejects an invalid end_date", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?end_date=2026-09&category_id=1`);
        const body = await res.json();

        assert.equal(res.status, 400);
        assert.deepEqual(body, { error: "Invalid start_date or end_date format, expected YYYY-MM-DD" })
    } finally {
        await close()
    }
})

test("GET /summary returns 404 when no transactions fall in the date range", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?start_date=2030-01-01&end_date=2030-12-31&category_id=1`);
        const body = await res.json();

        assert.equal(res.status, 404);
        assert.deepEqual(body, { error: "No transactions found" })
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