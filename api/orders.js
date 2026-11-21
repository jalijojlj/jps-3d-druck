const DEFAULT_BACKEND_URL = 'https://clarity-likewise-emotions-cups.trycloudflare.com';
const DEFAULT_BACKEND_SECRET = 'jps3d-stand-2026-x9k2';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || DEFAULT_BACKEND_URL;
  const isMiniPcBackend = !process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const authHeaders = isMiniPcBackend
    ? { 'X-JPS-Secret': process.env.JPS_ORDER_SECRET || DEFAULT_BACKEND_SECRET }
    : {};

  try {
    if (req.method === 'GET') {
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: authHeaders,
        redirect: 'follow',
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return res.status(502).json({
          connected: false,
          error: 'Backend lieferte kein gültiges JSON zurück.',
          orders: [],
        });
      }
      return res.status(200).json({
        connected: true,
        orders: Array.isArray(data.orders) ? data.orders : [],
        settings: data.settings || null,
      });
    }

    if (req.method === 'POST' || req.method === 'PATCH') {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const bodyToSend = {
        ...payload,
        action: payload.action || (req.method === 'PATCH' ? 'updateStatus' : 'create'),
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': isMiniPcBackend ? 'application/json' : 'text/plain;charset=utf-8',
          ...authHeaders,
        },
        body: JSON.stringify(bodyToSend),
        redirect: 'follow',
      });

      const text = await response.text();
      let data = { ok: response.ok };
      try {
        data = JSON.parse(text);
      } catch {
        // Fallback if non-JSON
      }

      return res.status(response.ok ? 200 : 502).json({
        connected: response.ok,
        ...data,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({
      connected: false,
      error: err instanceof Error ? err.message : 'Unbekannter Serverfehler',
    });
  }
}
