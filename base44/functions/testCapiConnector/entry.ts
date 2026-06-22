import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

async function sha256Hex(message) {
  const buf = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizeStr(s) { return String(s || '').trim().toLowerCase(); }
function normalizePhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) digits = '1' + digits;
  return digits;
}

async function buildCapiUserData(d) {
  const ud = {};
  if (d.email_hash) ud.em = [d.email_hash];
  else if (d.email) ud.em = [await sha256Hex(normalizeStr(d.email))];
  if (d.phone_hash) ud.ph = [d.phone_hash];
  else if (d.mobile) ud.ph = [await sha256Hex(normalizePhone(d.mobile))];
  if (d.first_name_hash) ud.fn = [d.first_name_hash];
  else if (d.first_name) ud.fn = [await sha256Hex(normalizeStr(d.first_name))];
  if (d.last_name_hash) ud.ln = [d.last_name_hash];
  else if (d.last_name) ud.ln = [await sha256Hex(normalizeStr(d.last_name))];
  if (d.city_hash) ud.ct = [d.city_hash];
  else if (d.city) ud.ct = [await sha256Hex(normalizeStr(d.city))];
  if (d.state_hash) ud.st = [d.state_hash];
  else if (d.state) ud.st = [await sha256Hex(normalizeStr(d.state))];
  if (d.zip_hash) ud.zp = [d.zip_hash];
  else if (d.zip) ud.zp = [await sha256Hex(normalizeStr(d.zip))];
  if (d.country_hash) ud.country = [d.country_hash];
  else if (d.country) ud.country = [await sha256Hex(normalizeStr(d.country))];
  if (d.ip_address || d.ipaddress) ud.client_ip_address = d.ip_address || d.ipaddress;
  if (d.user_agent) ud.client_user_agent = d.user_agent;
  if (d.fbc) ud.fbc = d.fbc;
  if (d.fbp) ud.fbp = d.fbp;
  if (d.external_id_hash) ud.external_id = d.external_id_hash;
  else if (d.external_id) ud.external_id = await sha256Hex(normalizeStr(d.external_id));
  return ud;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { connector_id, test_payload, event_name } = body;

  if (!connector_id) {
    return Response.json({ error: 'connector_id is required' }, { status: 400 });
  }

  const db = base44.asServiceRole;
  const connectors = await db.entities.ApiConnector.filter({ id: connector_id });
  const conn = connectors[0];
  if (!conn) return Response.json({ error: 'Connector not found' }, { status: 404 });
  if (conn.kind !== 'facebook_capi') return Response.json({ error: 'Connector is not a Facebook CAPI type' }, { status: 400 });

  const eventName = event_name || conn.lead_event_name || 'Lead';
  const leadData = test_payload || {};
  const apiVer = conn.fb_api_version || 'v21.0';
  const pixel = conn.fb_pixel_id;
  const token = conn.fb_access_token;
  if (!pixel || !token) return Response.json({ error: 'Pixel ID and access token are required' }, { status: 400 });

  const url = `https://graph.facebook.com/${apiVer}/${pixel}/events?access_token=${token}`;
  const userData = await buildCapiUserData(leadData);
  const requestBody = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: conn.action_source || 'website',
      event_source_url: leadData.optin_url || leadData.optinurl || '',
      event_id: leadData.event_id || 'test-event',
      user_data: userData,
      custom_data: {
        brand: leadData.supplier_brand || leadData.brand || '',
        supplier: leadData.supplier_name || '',
        lead_status: 'test',
      },
    }],
  };
  if (conn.fb_test_event_code) requestBody.test_event_code = conn.fb_test_event_code;

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    const text = await resp.text();
    let fbResult;
    try { fbResult = JSON.parse(text); } catch { fbResult = { raw: text }; }

    return Response.json({
      request_body: requestBody,
      fb_response: fbResult,
      http_status: resp.status,
      fbtrace_id: fbResult.fbtrace_id || '',
      target_url: url,
    });
  } catch (err) {
    return Response.json({ error: err.message, request_body: requestBody }, { status: 500 });
  }
});