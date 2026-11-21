/**
 * Google Apps Script für JPS 3D Druck Bestell-Webseite
 *
 * EINRICHTUNG (2 Minuten):
 * 1. Öffne Google Sheets (https://sheets.new) und erstelle eine neue Tabelle z.B. "3D-Druck Bestellungen".
 * 2. Klicke oben im Menü auf: Erweiterungen -> Apps Script
 * 3. Lösche den vorhandenen Code und füge dieses komplette Script ein.
 * 4. Klicke oben rechts auf "Bereitstellen" -> "Neue Bereitstellung".
 * 5. Typ auswählen: "Web-App"
 *    - Ausführen als: "Ich"
 *    - Zugriff: "Jeder"
 * 6. Klicke auf "Bereitstellen" und erlaube den Zugriff.
 * 7. Kopiere die Web-App-URL (endet auf /exec) und trage sie in Vercel als
 *    Environment Variable "GOOGLE_SHEETS_WEBHOOK_URL" ein (oder direkt im Admin-Menü der Webseite).
 */

const SPREADSHEET_ID = '1UKULoyYdh0dklWaA2ixIM6Ff67bPj7SG0G-deQg66UA';
const SHEET_NAME = 'Bestellungen';
const HEADERS = [
  'Bestell-Nr',
  'Zeitstempel',
  'Bezahlt',
  'Zahlungsart',
  'Summe (€)',
  'Name',
  'E-Mail',
  'Telefon',
  'Lieferart',
  'Adresse',
  'Artikel (Kurz)',
  'Notiz',
  'RohdatenJSON',
];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#f3efe9');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet() {
  const sheet = getOrCreateSheet();
  const rows = sheet.getDataRange().getValues();
  const orders = [];

  for (let i = 1; i < rows.length; i++) {
    const rawJson = rows[i][12];
    if (rawJson) {
      try {
        const parsed = JSON.parse(rawJson);
        // Synchronisiere Bezahlt-Status aus Spalte C (falls manuell im Sheet geändert)
        parsed.paid = rows[i][2] === 'JA' || rows[i][2] === true;
        orders.push(parsed);
        continue;
      } catch (e) {}
    }
    if (rows[i][0]) {
      orders.push({
        id: String(rows[i][0]),
        createdAt: String(rows[i][1]),
        paid: rows[i][2] === 'JA',
        paymentMethod: rows[i][3] === 'Bar am Stand' ? 'cash' : 'paypal',
        total: Number(rows[i][4]) || 0,
        customer: {
          name: String(rows[i][5] || ''),
          email: String(rows[i][6] || ''),
          phone: String(rows[i][7] || ''),
          delivery: rows[i][8] === 'Abholung am Stand' ? 'pickup' : 'shipping',
          address: String(rows[i][9] || ''),
          notes: String(rows[i][11] || ''),
        },
        itemsSummary: String(rows[i][10] || ''),
        items: [],
      });
    }
  }

  orders.reverse();
  return ContentService.createTextOutput(JSON.stringify({ ok: true, orders })).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doPost(e) {
  const sheet = getOrCreateSheet();
  const data = JSON.parse(e.postData.contents);

  if (data.action === 'updateStatus') {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(data.orderId)) {
        const paidLabel = data.paid ? 'JA' : 'OFFEN';
        sheet.getRange(i + 1, 3).setValue(paidLabel);
        if (data.paymentMethod) {
          sheet.getRange(i + 1, 4).setValue(data.paymentMethod === 'cash' ? 'Bar am Stand' : 'PayPal');
        }
        // Update JSON blob too
        if (rows[i][12]) {
          try {
            const parsed = JSON.parse(rows[i][12]);
            parsed.paid = Boolean(data.paid);
            if (data.paymentMethod) parsed.paymentMethod = data.paymentMethod;
            sheet.getRange(i + 1, 13).setValue(JSON.stringify(parsed));
          } catch (err) {}
        }
        return ContentService.createTextOutput(JSON.stringify({ ok: true, updated: true })).setMimeType(
          ContentService.MimeType.JSON
        );
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Bestellung nicht gefunden' })).setMimeType(
      ContentService.MimeType.JSON
    );
  }

  const order = data.order || data;
  const itemsText = (order.items || [])
    .map((item) => `${item.quantity}x ${item.name}${item.details ? ' (' + item.details + ')' : ''}`)
    .join(' | ');

  const fullAddress =
    order.customer.delivery === 'pickup'
      ? 'Abholung am Stand'
      : [order.customer.street, `${order.customer.zip} ${order.customer.city}`].filter(Boolean).join(', ');

  sheet.appendRow([
    order.id,
    new Date(order.createdAt).toLocaleString('de-DE'),
    order.paid ? 'JA' : 'OFFEN',
    order.paymentMethod === 'cash' ? 'Bar am Stand' : 'PayPal',
    Number(order.total).toFixed(2),
    order.customer.name,
    order.customer.email || '',
    order.customer.phone || '',
    order.customer.delivery === 'pickup' ? 'Abholung am Stand' : 'Versand',
    fullAddress,
    itemsText,
    order.customer.notes || '',
    JSON.stringify(order),
  ]);

  return ContentService.createTextOutput(JSON.stringify({ ok: true, orderId: order.id })).setMimeType(
    ContentService.MimeType.JSON
  );
}
