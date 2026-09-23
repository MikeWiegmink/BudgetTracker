import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers.js';

test('GET /health returns ok status', async () => {
    const { baseUrl, close } = await startTestServer();

    try {
        const res = await fetch(`${baseUrl}/health`);
        const body = await res.json();

        assert.equal(res.status, 200);
        assert.deepEqual(body, { status: 'ok' });
    } finally {
        await close();
    }
});
