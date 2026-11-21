export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    if (req.method === 'GET') {
      return res.status(200).json({
        connected: false,
        orders: [],
        message: 'GOOGLE_SHEETS_WEBHOOK_URL ist noch nicht in Vercel hinterlegt. Bestellungen werden lokal im Browser gespeichert.',
      });
    }
    return res.status(200).json({
      connected: false,
      savedLocallyOnly: true,
      message: 'Bestellung lokal gespeichert (Google Sheets noch nicht verbunden).',
    });
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(webhookUrl, {
        method: 'GET',
        redirect: 'follow',
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return res.status(502).json({
          connected: true,
          error: 'Google Sheets lieferte kein gültiges JSON zurück.',
          orders: [],
        });
      }
      return res.status(200).json({
        connected: true,
        orders: Array.isArray(data.orders) ? data.orders : [],
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
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(bodyToSend),
        redirect: 'follow',
      });

      const text = await response.text();
      let data = { ok: response.ok };
      try {
        data = JSON.parse(text);
      } catch {
        // Apps Script sometimes returns HTML on redirect edge cases
      }

      return res.status(200).json({
        connected: true,
        ...data,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({
      connected: true,
      error: err instanceof Error ? err.message : 'Unbekannter Serverfehler',
    });
  }
}
