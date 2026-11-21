export interface FilamentColor {
  id: string;
  name: string;
  hex: string;
  border?: string;
}

export interface FontOption {
  id: string;
  name: string;
  subtitle: string;
  cssFamily: string;
  exampleImage: string;
  exampleCaption: string;
  widthRatio: number; // Approx width per character relative to height
}

export const SHOP_CONFIG = {
  brandName: 'JPS 3D Druck',
  tagline: 'Handgefertigte 3D-Deko & persönliche Wunsch-Schriftzüge',
  standNotice: 'Direkt am Stand bestellen oder bequem nach Hause liefern lassen',
  paypalEmail: 'kindgottes175@gmail.com',
  // Optional: falls du einen PayPal.me-Link hast, hier eintragen (z.B. 'https://paypal.me/deinname')
  paypalMeUrl: '',
  // Kurzer Verkäufer-Code für den Stand-Modus (Bar-Bezahlung direkt als "Bezahlt" abhaken & Bestellübersicht öffnen)
  sellerPin: '2026',
  // Globaler Preisfaktor: 0.70 = 30 % günstiger, 1.0 = Basispreis, 1.10 = +10 % (auch live im Stand-Modus änderbar!)
  priceMultiplier: 0.7,
  shippingCost: 4.9,
  freeShippingFrom: 45,
};

export function applyPriceMultiplier(basePrice: number, multiplier = SHOP_CONFIG.priceMultiplier): number {
  const scaled = basePrice * multiplier;
  // Auf glatte 0,50 € runden (ideal für Wechselgeld am Stand)
  return Math.max(1, Math.round(scaled * 2) / 2);
}

export const FILAMENT_COLORS: FilamentColor[] = [
  { id: 'creme', name: 'Cremeweiß', hex: '#F3EFE6', border: '#D6CFC2' },
  { id: 'weiss', name: 'Reinweiß', hex: '#FFFFFF', border: '#D4D4D8' },
  { id: 'schwarz', name: 'Mattschwarz', hex: '#1F1F23' },
  { id: 'rosa', name: 'Altrosa', hex: '#E6A1B0' },
  { id: 'beige', name: 'Sand / Beige', hex: '#D8C7AE' },
  { id: 'karamell', name: 'Karamell / Holz', hex: '#B47D54' },
  { id: 'braun', name: 'Dunkelbraun', hex: '#4E3629' },
  { id: 'oliv', name: 'Olivgrün', hex: '#556142' },
  { id: 'bordeaux', name: 'Bordeaux', hex: '#5B1D24' },
  { id: 'hellblau', name: 'Pastellblau', hex: '#8CC5E3' },
  { id: 'gold', name: 'Senfgold', hex: '#D89E38' },
];

export const LETTERING_HEIGHTS = [
  { cm: 10, label: '10 cm', note: 'Kompakt (Regal & Tisch)', priceFactor: 1.0 },
  { cm: 12, label: '12 cm', note: 'Beliebter Standard', priceFactor: 1.25 },
  { cm: 15, label: '15 cm', note: 'Großer Hingucker', priceFactor: 1.55 },
] as const;

export const LETTERING_THICKNESSES = [
  { cm: 1, label: '1 cm', note: 'Schlank & leicht', priceAdd: 0 },
  { cm: 2, label: '2 cm', note: 'Steht frei & stabil', priceAdd: 3.0 },
  { cm: 3, label: '3 cm', note: 'Massiver 3D-Effekt', priceAdd: 6.0 },
] as const;

export const LETTERING_FONTS: FontOption[] = [
  {
    id: 'serif',
    name: 'Klassisch Serif',
    subtitle: 'Wie Beispiel „trust“ — zeitlos & elegant',
    cssFamily: "'Playfair Display', Georgia, serif",
    exampleImage: '/products/schrift-trust-schwarz.jpg',
    exampleCaption: 'Beispiel: „trust“ in Mattschwarz',
    widthRatio: 0.62,
  },
  {
    id: 'script',
    name: 'Schreibschrift',
    subtitle: 'Wie Beispiel „blessed“ — modern & verbunden',
    cssFamily: "'Pacifico', cursive",
    exampleImage: '/products/schrift-blessed-schwarz.jpg',
    exampleCaption: 'Beispiel: „blessed“ in Mattschwarz',
    widthRatio: 0.56,
  },
  {
    id: 'bubble',
    name: '3D-Bubble Buchstaben',
    subtitle: 'Wie Beispiel „LEA“ — weich & voluminös',
    cssFamily: "'Fredoka', sans-serif",
    exampleImage: '/products/schrift-lea-bubble.jpg',
    exampleCaption: 'Beispiel: „LEA“ in Reinweiß',
    widthRatio: 0.72,
  },
  {
    id: 'modern',
    name: 'Modern Clean',
    subtitle: 'Klare Linien — perfekt für Namen & Zitate',
    cssFamily: "'Montserrat', sans-serif",
    exampleImage: '/products/schrift-trust-schwarz.jpg',
    exampleCaption: 'Klarer moderner 3D-Look',
    widthRatio: 0.68,
  },
];

export function calculateLetteringPrice(
  text: string,
  heightCm: number,
  thicknessCm: number,
  multiplier = SHOP_CONFIG.priceMultiplier
): number {
  const cleanChars = text.replace(/\s+/g, '').length;
  const effectiveChars = Math.max(2, cleanChars);
  const heightMeta = LETTERING_HEIGHTS.find((h) => h.cm === heightCm) ?? LETTERING_HEIGHTS[0];
  const thickMeta = LETTERING_THICKNESSES.find((t) => t.cm === thicknessCm) ?? LETTERING_THICKNESSES[0];

  const base = 7.0 + effectiveChars * 1.4;
  const raw = (base * heightMeta.priceFactor + thickMeta.priceAdd) * multiplier;
  return Math.max(3, Math.round(raw * 2) / 2); // Auf 0,50 € runden
}

export function estimateLetteringWidthCm(text: string, heightCm: number, fontId: string): number {
  const font = LETTERING_FONTS.find((f) => f.id === fontId) ?? LETTERING_FONTS[0];
  const len = Math.max(1, text.trim().length);
  return Math.max(6, Math.round(len * heightCm * font.widthRatio));
}
