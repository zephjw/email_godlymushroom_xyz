import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

let serverProcess;
let baseUrl;

async function findAvailablePort() {
  const probe = createServer();
  await new Promise((resolve, reject) => {
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', resolve);
  });
  const address = probe.address();
  await new Promise((resolve, reject) => {
    probe.close((error) => (error ? reject(error) : resolve()));
  });
  if (!address || typeof address === 'string') {
    throw new Error('Could not determine an available local port');
  }
  return address.port;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Server exited during startup with code ${serverProcess.exitCode}`);
    }
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error('Server did not become ready within five seconds');
}

beforeAll(async () => {
  const port = await findAvailablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  serverProcess = spawn(process.execPath, ['src/server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'test', PORT: String(port) },
    stdio: 'ignore',
  });
  await waitForServer();
}, 10000);

afterAll(async () => {
  if (serverProcess && serverProcess.exitCode === null) {
    await new Promise((resolve) => {
      serverProcess.once('exit', resolve);
      serverProcess.kill('SIGTERM');
    });
  }
});

describe('Webmail Server HTTP Endpoints', () => {
  it('serves a healthy status response', async () => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });

  it('serves the index.html page on root', async () => {
    const response = await fetch(`${baseUrl}/`);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('Webmail');
    expect(text).toContain('godlymushroom.xyz');
  });

  it('rejects mailbox access without an authenticated session', async () => {
    const response = await fetch(`${baseUrl}/api/emails`);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: 'Your session has expired',
    });
  });

  it('rejects email send without an authenticated session', async () => {
    const response = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'test@example.com', subject: 'Hi', text: 'Body' }),
    });
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: 'Your session has expired',
    });
  });

  it('returns 400 for invalid login payload', async () => {
    const response = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad@otherdomain.com', password: '' }),
    });
    expect(response.status).toBe(400);
  });
});
