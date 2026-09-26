import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers.js';

test("GET /summary missing parameter", async () => {
    const { baseUrl, close } = await startTestServer()

    try {
        const res = await fetch(`${baseUrl}/summary`);
        const body = await res.json();

        assert.equal(res.status, 400);
        assert.deepEqual(body, { error: "No date provided" })
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

test("GET /summary returns correct", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?date=2026-09`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, {month: "2026-09", total: 305, average: 61 })
    } finally {
        await close()
    }
})