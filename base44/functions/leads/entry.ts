// Public lead intake endpoint (/functions/leads)
// Delegates the ENTIRE lead-processing pipeline to processLead so there is
// a single source of truth. processLead handles: API-key auth, HLR, custom
// calculations, TrustedForm gate, required-fields gate, LeadByte connector
// filters & field conditions (with DQ routing), revenue capture, Facebook
// CAPI + Deliveries firing on all triggers, duplicate handling, response
// mapping, and outbound webhooks.
//
// This wrapper handles CORS and injects the supplier API key from headers
// into the payload (as _supplier_key) so processLead can find it. Uses fetch
// (not functions.invoke) to have full control over non-200 responses.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY, X_KEY, Authorization',
};

Deno.serve(async (req) => {
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (method === 'GET') return Response.json({ status: 'ok' }, { status: 200, headers: CORS_HEADERS });
  if (method !== 'POST') return Response.json({ Response: 'Error', reason: 'Method not allowed' }, { status: 405, headers: CORS_HEADERS });

  try {
    const body = await req.json();
    const payload = body.payload || body;

    // Extract API key from headers and inject into payload so processLead can authenticate.
    // processLead already checks payload._supplier_key, payload['X-API-KEY'], and payload['X_KEY'].
    let supplierKeyRaw =
      req.headers.get('X-API-KEY') ||
      req.headers.get('X_KEY') ||
      req.headers.get('x-api-key') ||
      req.headers.get('x_key') ||
      null;
    if (!supplierKeyRaw) {
      const authHeader = req.headers.get('Authorization') || '';
      if (authHeader.startsWith('Basic ')) {
        const decoded = atob(authHeader.slice(6));
        supplierKeyRaw = decoded.split(':')[0] || null;
      }
    }
    if (supplierKeyRaw && !payload._supplier_key) {
      payload._supplier_key = supplierKeyRaw;
    }

    // Delegate the entire pipeline to processLead — single source of truth.
    // Use fetch directly (not functions.invoke) so we have full control over
    // the response, including non-200 status codes (e.g. 401 for invalid API keys).
    // Forward original headers so createClientFromRequest works in processLead.
    const processLeadUrl = new URL('/functions/processLead', req.url).href;
    const fwdHeaders = {};
    for (const [k, v] of req.headers.entries()) {
      if (k === 'host' || k === 'content-length' || k === 'content-type') continue;
      fwdHeaders[k] = v;
    }
    fwdHeaders['Content-Type'] = 'application/json';

    const upstreamResp = await fetch(processLeadUrl, {
      method: 'POST',
      headers: fwdHeaders,
      body: JSON.stringify(payload),
    });
    const respText = await upstreamResp.text();
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-KEY, X_KEY, Authorization',
    };
    let respBody;
    try { respBody = JSON.parse(respText); } catch { respBody = { Response: 'Error', reason: respText || 'Empty response from pipeline' }; }
    return Response.json(respBody, { status: upstreamResp.status, headers: corsHeaders });
  } catch (err) {
    return Response.json({ Response: 'Error', reason: 'Internal processing error' }, { status: 200, headers: CORS_HEADERS });
  }
});