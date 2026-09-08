/** Keep technical error details; remove identity, payloads and URL parameters. */
function redact(value: unknown, key = '', depth = 0): unknown {
  if (depth > 12) return '[Filtered]';
  if (/^(event_id|trace_id|span_id|parent_span_id)$/i.test(key)) return value;
  if (/password|secret|token|authorization|cookie|email|phone|address|api.?key/i.test(key)) return '[Filtered]';
  if (typeof value === 'string') {
    const text = /^(url|filename|abs_path|transaction)$/i.test(key) ? value.replace(/[?#].*$/, '') : value;
    return text
      .replace(/https?:\/\/[^\s"'<>]+/g, (url) => url.replace(/[?#].*$/, ''))
      .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[Filtered]')
      .replace(/(?:\+33|0)[1-9](?:[ .-]?\d{2}){4}/g, '[Filtered]')
      .replace(/Bearer\s+\S+/gi, 'Bearer [Filtered]')
      .replace(/((?:password|token|secret|api_key)\s*[:=]\s*)[^\s,;]+/gi, '$1[Filtered]');
  }
  if (Array.isArray(value)) return value.map((item) => redact(item, key, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, redact(item, name, depth + 1)]));
  }
  return value;
}

export function scrubEvent<T extends object>(event: T): T {
  const clean = { ...event } as Record<string, unknown>;
  delete clean.user;
  delete clean.breadcrumbs;
  delete clean.extra;
  delete clean.server_name;
  if (clean.request && typeof clean.request === 'object') {
    const request = clean.request as Record<string, unknown>;
    clean.request = { method: request.method, url: request.url };
  }
  return redact(clean) as T;
}
