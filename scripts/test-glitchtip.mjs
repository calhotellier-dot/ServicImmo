import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/monitoring/privacy.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { scrubEvent } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));

test('removes identity, payloads and URL tokens while retaining technical details', () => {
  const event = {
    event_id: '0612345678abcdef0612345678abcdef',
    user: { email: 'person@example.com', ip_address: '192.0.2.1' },
    request: { method: 'POST', url: 'https://example.com/api?token=SECRET#private', data: { password: 'SECRET' }, headers: { authorization: 'Bearer SECRET' }, cookies: 'SECRET' },
    breadcrumbs: [{ message: 'private data' }],
    extra: { form: { name: 'Private Person' } },
    exception: { values: [{ type: 'Error', value: 'Failed for person@example.com token=SECRET', stacktrace: { frames: [{ filename: 'https://example.com/app.js?token=SECRET', lineno: 42 }] } }] },
    contexts: { custom: { nested: { access_token: 'SECRET' } } },
  };
  const original = JSON.stringify(event);
  const clean = scrubEvent(event);
  const serialized = JSON.stringify(clean);
  for (const forbidden of ['SECRET', 'person@example.com', '192.0.2.1', 'Private Person', 'private data']) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
  assert.equal(clean.event_id, event.event_id);
  assert.deepEqual(clean.request, { method: 'POST', url: 'https://example.com/api' });
  assert.equal(clean.exception.values[0].stacktrace.frames[0].lineno, 42);
  assert.equal(clean.exception.values[0].type, 'Error');
  assert.equal(clean.user, undefined);
  assert.equal(JSON.stringify(event), original, 'must not mutate the original event');
});

test('handles deep or cyclic context without crashing error reporting', () => {
  const event = { message: 'Technical error', contexts: {} };
  event.contexts.self = event;
  assert.doesNotThrow(() => JSON.stringify(scrubEvent(event)));
});
