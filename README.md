# JPS 3D Druck — Stand- & Bestell-Webseite

Moderne, mobilfreundliche Bestell-Webseite für deinen 3D-Druck-Stand — komplett vorbereitet für **Vercel** + **Google Sheets**.

## Features
- **Individueller 3D-Schriftzug-Konfigurator**: Wunschtext, 4 Schriftarten (inkl. echte Beispielfotos `trust`, `blessed`, `LEA`), Standard-Höhen (`10 / 12 / 15 cm`), Standard-Dicken (`1 / 2 / 3 cm`), automatische + anpassbare Breite, 11 Wunschfarben und Live-3D-Vorschau.
- **Komplettes Produktsortiment**: Alle 28 Produkte (aus deinen 46 optimierten Produktfotos) in den Kategorien *Vasen*, *Organizer & Bad*, *Alltag & Gadgets* und *Saison & Deko* mit Farbvarianten und Wunschfarben.
- **Warenkorb & Direktbestellung**: E-Mail **oder** Telefonnummer (eins von beiden genügt), Versandadresse oder Abholung am Stand.
- **PayPal & Bar am Stand**:
  - PayPal-Übersicht mit 1-Klick-Kopieren für E-Mail & Bestellnummer.
  - **Stand-Modus (Verkäufer-Code, Standard: `2026`)**: Direkt im Checkout oder in der Bestell-Übersicht oben rechts („Stand“) kannst du Bestellungen mit 1 Klick als **„Bezahlt ✓“** abhaken und als CSV exportieren.

---

## 1. Preise, PayPal & Verkäufer-Code anpassen
- **PayPal-E-Mail, Versandkosten, Verkäufer-PIN & Schriftzug-Preise**: [`src/config.ts`](src/config.ts)
- **Einzelne Produktpreise & Beschreibungen**: [`src/data/products.ts`](src/data/products.ts)

---

## 2. Google Sheets verbinden (2 Minuten)
1. Öffne [sheets.new](https://sheets.new) und nenne die Tabelle z. B. `3D-Druck Bestellungen`.
2. Klicke im Menü auf **Erweiterungen → Apps Script**.
3. Kopiere den gesamten Inhalt aus [`docs/google-apps-script.js`](docs/google-apps-script.js) hinein und speichere.
4. Klicke oben rechts auf **Bereitstellen → Neue Bereitstellung**:
   - Typ: **Web-App**
   - Ausführen als: **Ich**
   - Zugriff: **Jeder**
5. Kopiere die Web-App-URL (endet auf `/exec`).
6. Trage diese URL in **Vercel** unter *Settings → Environment Variables* ein:
   - Name: `GOOGLE_SHEETS_WEBHOOK_URL`
   - Value: `https://script.google.com/macros/s/.../exec`
   *(Alternativ kannst du die URL auch direkt im „Stand“-Menü der Webseite einfügen.)*

---

## 3. Auf Vercel live schalten
Option A (über GitHub + Vercel):
1. Projekt in ein GitHub-Repo pushen.
2. Auf [vercel.com](https://vercel.com) → **Add New Project** → Repo auswählen → **Deploy**.
3. Unter *Settings → Environment Variables* `GOOGLE_SHEETS_WEBHOOK_URL` eintragen und einmal redeployen.

Option B (direkt per CLI):
```bash
npx vercel
```

## Lokal starten
```bash
npm install
npm run dev
```
