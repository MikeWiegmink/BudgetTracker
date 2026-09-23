import { createServer } from 'node:http';
import app from '../src/server.js';

export async function startTestServer() {
    const server = createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const { port } = server.address();

    return {
        baseUrl: `http://localhost:${port}`,
        close: () => new Promise((resolve) => server.close(resolve)),
    };
}
