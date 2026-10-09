import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import next from 'next';

process.env.ECNU_API_KEY = '';

test('an unconfigured AI service returns 503', async (t) => {
  const app = next({ dev: false, hostname: '127.0.0.1', port: 0 });
  await app.prepare();
  const server = http.createServer(app.getRequestHandler());
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await app.close();
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${base}/api/ai/transform`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Test article', mode: 'official' }),
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'AI service is not configured' });
});
