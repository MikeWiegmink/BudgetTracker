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
        assert.deepEqual(body, {month: "2026-09", total: 305, average: 61, max: 100 })
    } finally {
        await close()
    }
})

test("GET /summary returns correct only category_id", async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/summary?category_id=1`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { total: 120, average: 40, max: 60 })
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
        assert.deepEqual(body, { month: "2026-08", total: 60, average: 30, max: 40 })
    } finally {
        await close()
    }
})

