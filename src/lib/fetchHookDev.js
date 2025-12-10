// dev-only fetch hook: при импорте логирует все fetch к вашему Supabase проекту.
// Импортируйте динамически в index.js только в development.
(function installFetchHook() {
  if (typeof window === 'undefined') return;
  const origFetch = window.fetch.bind(window);
  window.__fetchTiming = window.__fetchTiming || [];
  window.fetch = async function(resource, init) {
    const url = (typeof resource === 'string') ? resource : resource?.url || '';
    const isTarget = url.includes('wozpvwahlgrdeyypomfx.supabase.co');
    if (!isTarget) return origFetch(resource, init);
    const start = performance.now();
    const response = await origFetch(resource, init);
    let text = '';
    try { text = await response.clone().text(); } catch (e) { text = '<read failed>'; }
    const duration = Math.round(performance.now() - start);
    const headers = {};
    try { response.headers.forEach((v,k)=>headers[k]=v); } catch(e){}
    const size = (typeof text === 'string') ? text.length : 0;
    const log = {
      url,
      status: response.status,
      duration_ms: duration,
      response_size_bytes: size,
      x_envoy_upstream_service_time: headers['x-envoy-upstream-service-time'] || null,
      sb_request_id: headers['sb-request-id'] || null,
    };
    console.log('Supabase fetch timing:', log);
    window.__fetchTiming.push(log);
    return response;
  };
  console.log('[dev] fetchHook for supabase installed');
})();
