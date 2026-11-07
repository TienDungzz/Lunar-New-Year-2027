import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveContentConfig, mergeContent, fetchContent } from '../src/lib/contentApi.mjs';
const wishes = JSON.parse(await readFile(new URL('../src/data/wishes.json', import.meta.url), 'utf8'));

test('eight unique, fully bilingual wishes', () => {
  assert.equal(wishes.length, 8);
  assert.equal(new Set(wishes.map(w => w.id)).size, 8);
  wishes.forEach((w,i) => {
    assert.equal(w.id, `wish-${String(i+1).padStart(2,'0')}`);
    for (const lang of ['vi','en']) for (const field of ['title','body']) assert.ok(w[field][lang].trim());
  });
});
test('request configuration rejects duplicate IDs, credentials and unsafe schemes', () => {
  const origin = 'https://tet.example';
  for (const search of ['', '?i=a&i=b', '?i=../../foo', '?i=%20']) assert.equal(resolveContentConfig(search, '/api/{id}', 'i', origin).url, null);
  for (const endpoint of ['javascript:alert(1)', 'https://user:pass@api.example/{id}', '/api/{id}/{id}', 'http://api.example/{id}', '/api#fragment']) assert.equal(resolveContentConfig('?i=abc', endpoint, 'i', origin).url, null);
  assert.equal(resolveContentConfig('?i=abc', '/api?other=1', 'i', origin).url, 'https://tet.example/api?other=1&i=abc');
  assert.equal(resolveContentConfig('?i=abc', '/api/{id}', 'i', origin).url, 'https://tet.example/api/abc');
  assert.notEqual(resolveContentConfig('?i=a','/api/{id}','i',origin).namespace, resolveContentConfig('?i=a','/other/{id}','i',origin).namespace);
});
test('merges by ID and field, preserves English defaults and ignores unknown IDs', () => {
  const merged = mergeContent({ data: { schemaVersion: 1, wishes: {
    'wish-08': { title: { vi: 'Lời mới', en: '' }, body: { vi: '<script>text only</script>', en: 'x'.repeat(8001) } },
    'unknown': { body: { vi: 'ignored' } },
    'wish-12': { title: { vi: 'Retired wish' } },
  } } }, wishes);
  assert.equal(merged.length, 8);
  assert.equal(merged[7].title.vi, 'Lời mới');
  assert.equal(merged[7].title.en, wishes[7].title.en);
  assert.equal(merged[7].body.en, wishes[7].body.en);
  assert.equal(merged[7].body.vi, '<script>text only</script>');
  assert.equal(wishes[7].title.vi, 'Bạn bè');
  assert.throws(() => mergeContent({ schemaVersion: 2, wishes: {} }, wishes));
  assert.throws(() => mergeContent([], wishes));
});
test('loads JSON without credentials; rejects invalid HTTP, media and oversized body', async () => {
  const fetcher = async (_url, options) => {
    assert.equal(options.credentials, 'omit'); assert.equal(options.cache, 'no-store');
    return new Response(JSON.stringify({ schemaVersion: 1, wishes: {} }), { headers: { 'content-type': 'application/json' } });
  };
  assert.deepEqual(await fetchContent('https://api.example', wishes, { fetcher }), wishes);
  for (const response of [new Response('{}', { status: 500 }), new Response('{}', { headers: { 'content-type': 'text/html' } }), new Response('a'.repeat(512001), { headers: { 'content-type': 'application/json' } })]) {
    await assert.rejects(fetchContent('/api', wishes, { fetcher: async () => response }));
  }
});
test('timeout and cancellation abort a pending request', async () => {
  const fetcher = (_url, { signal }) => new Promise((_resolve, reject) => {
    if (signal.aborted) reject(new DOMException('Aborted', 'AbortError'));
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  });
  await assert.rejects(fetchContent('/api', wishes, { timeout: 10, fetcher }), { name: 'AbortError' });
  const controller = new AbortController();
  const pending = fetchContent('/api', wishes, { signal: controller.signal, fetcher });
  controller.abort(); await assert.rejects(pending, { name: 'AbortError' });
});

