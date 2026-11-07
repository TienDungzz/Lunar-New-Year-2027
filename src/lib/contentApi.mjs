const validId = /^[A-Za-z0-9_-]{1,128}$/;
export function resolveContentConfig(search, endpoint = '', parameter = 'i', origin = 'http://localhost') {
  const param = /^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(parameter) ? parameter : 'i';
  const ids = new URLSearchParams(search).getAll(param);
  if (!endpoint || ids.length !== 1 || !validId.test(ids[0])) return { url: null, namespace: 'default' };
  const id = ids[0];
  const placeholders = (endpoint.match(/\{id\}/g) || []).length;
  if (placeholders > 1) return { url: null, namespace: 'default' };
  try {
    const template = new URL(endpoint.replace('{id}', encodeURIComponent(id)), origin);
    if (!['http:', 'https:'].includes(template.protocol) || template.username || template.password || template.hash) throw Error('Invalid endpoint');
    if (origin.startsWith('https:') && template.protocol === 'http:') throw Error('Mixed content');
    if (!placeholders) template.searchParams.set(param, id);
    const source = new URL(endpoint.replace('{id}', '_content_id_'), origin).href;
    return { url: template.href, namespace: `api:${id}:${source}` };
  } catch { return { url: null, namespace: 'default' }; }
}
export function mergeContent(payload, defaults) {
  const root = payload && typeof payload === 'object' && !Array.isArray(payload) ? (payload.data ?? payload) : null;
  if (!root || root.schemaVersion !== 1 || !root.wishes || typeof root.wishes !== 'object' || Array.isArray(root.wishes)) throw Error('Invalid content schema');
  return defaults.map(wish => {
    const result = { ...wish, title: { ...wish.title }, body: { ...wish.body } };
    const incoming = root.wishes[wish.id];
    if (!incoming || typeof incoming !== 'object') return result;
    for (const field of ['title', 'body']) for (const lang of ['vi', 'en']) {
      const value = incoming[field]?.[lang];
      if (typeof value === 'string' && value.trim() && value.length <= (field === 'title' ? 160 : 8000)) result[field][lang] = value.trim();
    }
    return result;
  });
}
/** @param {string} url @param {any[]} defaults @param {{signal?: AbortSignal, timeout?: number, fetcher?: typeof fetch}} options */
export async function fetchContent(url, defaults, { signal, timeout = 8000, fetcher = fetch } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, timeout);
  let reader;
  try {
    const response = await fetcher(url, { signal: controller.signal, headers: { Accept: 'application/json' }, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' });
    if (!response.ok || !/^application\/(?:json|[\w.+-]+\+json)(?:\s*;|$)/i.test(response.headers.get('content-type') || '')) throw Error('Invalid response');
    if (!response.body) throw Error('Empty response');
    reader = response.body.getReader();
    const chunks = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 512000) { controller.abort(); throw Error('Response too large'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return mergeContent(JSON.parse(new TextDecoder().decode(bytes)), defaults);
  } finally {
    clearTimeout(timer); signal?.removeEventListener('abort', abort);
    reader?.releaseLock();
  }
}
