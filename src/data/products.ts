export type ProductCategory = 'vasen' | 'organizer' | 'gadgets' | 'deko';

export interface ProductVariant {
  colorName: string;
  colorHex: string;
  image: string;
  weightGrams?: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  shortDescription: string;
  description: string;
  dimensionsNote?: string;
  badge?: string;
  lifestyleImage?: string;
  lifestyleCaption?: string;
  variants: ProductVariant[];
}

export const CATEGORY_LABELS: Record<ProductCategory | 'alle', string> = {
  alle: 'Alle Produkte',
  vasen: 'Vasen',
  organizer: 'Organizer & Bad',
  gadgets: 'Alltag & Gadgets',
  deko: 'Saison & Deko',
};

export const PRODUCTS: Product[] = [
  // ==================== VASEN ====================
  {
    id: 'vase-siena',
    name: 'Rippen-Vase „Siena“',
    category: 'vasen',
    price: 14.9,
    shortDescription: 'Fein geriffelte Design-Vase mit modernem Schrägrand.',
    description:
      'Elegante 3D-gedruckte Vase mit feiner Rillenstruktur und asymmetrisch abgeschrägtem Hals. Ideal für Trockenblumen oder einzelne Zweige.',
    badge: 'Beliebt',
    variants: [
      { colorName: 'Altrosa', colorHex: '#E6A1B0', image: '/products/vase-siena-rosa.jpg', weightGrams: 130 },
    ],
  },
  {
    id: 'vase-alto',
    name: 'Säulen-Vase „Alto“',
    category: 'vasen',
    price: 15.9,
    shortDescription: 'Schlanke geriffelte Säulenvase mit breitem Standfuß.',
    description:
      'Minimalistische hohe Säulenvase mit architektonischem Sockel. Ein stilvoller Akzent auf Sideboards, Fensterbänken oder dem Esstisch.',
    variants: [
      { colorName: 'Altrosa', colorHex: '#E6A1B0', image: '/products/vase-alto-rosa.jpg', weightGrams: 139 },
      { colorName: 'Karamell', colorHex: '#B47D54', image: '/products/vase-alto-karamell.jpg', weightGrams: 138 },
    ],
  },
  {
    id: 'vase-toscana',
    name: 'Wellen-Vase „Toscana“',
    category: 'vasen',
    price: 19.9,
    shortDescription: 'Skulpturale Vase mit tiefen geschwungenen Lamellen.',
    description:
      'Ausdrucksstarke Design-Vase mit organischer Wellen-Optik, die je nach Lichteinfall faszinierende Schatten wirft.',
    badge: 'Bestseller',
    lifestyleImage: '/products/lifestyle-vase-toscana.jpg',
    lifestyleCaption: 'Mit Blumen',
    variants: [
      { colorName: 'Bordeaux (Groß)', colorHex: '#5B1D24', image: '/products/vase-toscana-bordeaux.jpg', weightGrams: 319 },
      { colorName: 'Taupe / Braun', colorHex: '#A68D77', image: '/products/vase-toscana-taupe.jpg', weightGrams: 165 },
    ],
  },
  {
    id: 'vase-noir',
    name: 'Cutout-Vase „Noir“',
    category: 'vasen',
    price: 19.9,
    shortDescription: 'Moderne Tropfen-Vase mit rundem Durchbruch.',
    description:
      'Minimalistische Skulptur-Vase in mattem Schwarz mit markanter Öffnung in der Mitte — auch ohne Blumen ein echtes Design-Objekt.',
    badge: 'Design-Highlight',
    variants: [
      { colorName: 'Mattschwarz', colorHex: '#1F1F23', image: '/products/vase-noir-schwarz.jpg', weightGrams: 187 },
    ],
  },
  {
    id: 'vase-elegance',
    name: 'Skulptur-Vase „Elegance“',
    category: 'vasen',
    price: 24.9,
    shortDescription: 'Große, bauchige Rippen-Vase in warmem Cremeweiß.',
    description:
      'Unser großes Flaggschiff-Modell mit sanft geschwungener Silhouette und feiner vertikaler Struktur für opulente Trockenblumen-Sträuße.',
    lifestyleImage: '/products/lifestyle-vase-elegance.jpg',
    lifestyleCaption: 'Mit Blumen',
    variants: [
      { colorName: 'Cremeweiß', colorHex: '#F3EFE6', image: '/products/vase-elegance-creme.jpg', weightGrams: 308 },
    ],
  },
  {
    id: 'vase-classico',
    name: 'Amphoren-Vase „Classico“',
    category: 'vasen',
    price: 21.9,
    shortDescription: 'Hohe geriffelte Vase im zeitlosen skandinavischen Stil.',
    description:
      'Stabile, voluminöse Vase mit klarer Linienführung und kräftigen Rippen. Passt perfekt in helle, moderne Wohnräume.',
    variants: [
      { colorName: 'Cremeweiß', colorHex: '#F3EFE6', image: '/products/vase-classico-creme.jpg', weightGrams: 241 },
    ],
  },
  {
    id: 'vase-natura',
    name: 'Relief-Vase „Natura“',
    category: 'vasen',
    price: 16.9,
    shortDescription: 'Kugelige Vase mit organischem Schuppen-Relief.',
    description:
      'Besondere Oberflächenstruktur inspiriert von Tannenzapfen und Blütenblättern — haptisch und optisch ein Hingucker.',
    variants: [
      { colorName: 'Cremeweiß', colorHex: '#F3EFE6', image: '/products/vase-natura-creme.jpg', weightGrams: 152 },
    ],
  },
  {
    id: 'vase-luna',
    name: 'Kugel-Vase „Luna“',
    category: 'vasen',
    price: 11.9,
    shortDescription: 'Kompakte runde Rippen-Vase für kleine Akzente.',
    description:
      'Handliche Kugel-Vase im Nordic-Look — perfekt als kleines Geschenk oder in Kombination mit weiteren Vasen.',
    variants: [
      { colorName: 'Cremeweiß', colorHex: '#F3EFE6', image: '/products/vase-luna-creme.jpg', weightGrams: 86 },
    ],
  },
  {
    id: 'vase-flora',
    name: 'Wellen-Vase „Flora“',
    category: 'vasen',
    price: 9.9,
    shortDescription: 'Gedrehte Mini-Vase mit blütenförmiger Öffnung.',
    description:
      'Zierliche Vase mit sanfter Spirale und gewelltem Rand — ideal für den Schreibtisch, das Regal oder das Gäste-WC.',
    variants: [
      { colorName: 'Olivgrün', colorHex: '#556142', image: '/products/vase-flora-oliv.jpg', weightGrams: 63 },
    ],
  },

  // ==================== ORGANIZER & BAD ====================
  {
    id: 'organizer-trio',
    name: '3-fach Stiftehalter „Trio“',
    category: 'organizer',
    price: 15.9,
    shortDescription: 'Abgestufter 3-Kammer-Organizer in feiner Rillenoptik.',
    description:
      'Schafft sofort Ordnung auf dem Schreibtisch oder Schminktisch: drei unterschiedlich hohe Fächer für Stifte, Pinsel, Scheren oder Kosmetik.',
    badge: 'Beliebt',
    lifestyleImage: '/products/lifestyle-organizer-trio.jpg',
    lifestyleCaption: 'Gefüllt mit Stiften',
    variants: [
      { colorName: 'Karamell', colorHex: '#B47D54', image: '/products/organizer-trio-karamell.jpg', weightGrams: 171 },
      { colorName: 'Altrosa', colorHex: '#E6A1B0', image: '/products/organizer-trio-rosa.jpg', weightGrams: 161 },
    ],
  },
  {
    id: 'bad-spa',
    name: 'Bad-Organizer „Spa“',
    category: 'organizer',
    price: 9.9,
    shortDescription: 'Praktischer 2-fach Halter für Wattepads & Wattestäbchen.',
    description:
      'Kompakter Bad-Helfer mit seitlichem Eingriff für Wattepads und separatem Fach für Wattestäbchen oder Haargummis.',
    badge: 'Tipp',
    lifestyleImage: '/products/lifestyle-bad-spa.jpg',
    lifestyleCaption: 'Mit Wattepads',
    variants: [
      { colorName: 'Cremeweiß', colorHex: '#F3EFE6', image: '/products/bad-spa-weiss.jpg', weightGrams: 58 },
      { colorName: 'Sand / Beige', colorHex: '#D8C7AE', image: '/products/bad-spa-beige.jpg', weightGrams: 64 },
      { colorName: 'Pfirsich / Rosa', colorHex: '#F0C5B6', image: '/products/bad-spa-pfirsich.jpg', weightGrams: 54 },
    ],
  },
  {
    id: 'organizer-studio',
    name: 'Tisch-Organizer „Studio“',
    category: 'organizer',
    price: 16.9,
    shortDescription: 'Eckiger 3-fach Desk-Organizer mit dunklem Kontrast-Sockel.',
    description:
      'Stabiler Schreibtisch-Organizer mit drei Fächern für Stifte, Fernbedienungen, Notizzettel oder Brillen.',
    variants: [
      { colorName: 'Creme / Schwarz', colorHex: '#D8C7AE', image: '/products/organizer-studio-creme.jpg', weightGrams: 174 },
    ],
  },
  {
    id: 'organizer-duo',
    name: '2-fach Organizer „Duo“',
    category: 'organizer',
    price: 11.9,
    shortDescription: 'Platzsparender, abgestufter 2-Kammer-Behälter.',
    description:
      'Schmaler, geriffelter Organizer mit zwei Fächern — ideal für Schreibtisch, Küche oder Bad.',
    variants: [
      { colorName: 'Olivgrün', colorHex: '#556142', image: '/products/organizer-duo-oliv.jpg', weightGrams: 92 },
      { colorName: 'Dunkelbraun', colorHex: '#4E3629', image: '/products/organizer-duo-braun.jpg', weightGrams: 88 },
    ],
  },
  {
    id: 'organizer-rondo',
    name: '4-fach Pinselhalter „Rondo“',
    category: 'organizer',
    price: 8.9,
    shortDescription: 'Runder Mini-Organizer mit 4 praktischen Fächern.',
    description:
      'Kompakter runder Halter für Make-up-Pinsel, Fineliner, Lippenbalsam oder Bastelwerkzeug.',
    variants: [
      { colorName: 'Karamell', colorHex: '#B47D54', image: '/products/organizer-rondo-karamell.jpg', weightGrams: 58 },
      { colorName: 'Altrosa', colorHex: '#E6A1B0', image: '/products/organizer-rondo-rosa.jpg', weightGrams: 60 },
    ],
  },
  {
    id: 'organizer-twin',
    name: '2-fach Becher „Twin“',
    category: 'organizer',
    price: 11.9,
    shortDescription: 'Zwillings-Becher in moderner 8-Form mit Rillenstruktur.',
    description:
      'Weich abgerundeter Doppelbecher für Stifte, Zahnbürsten oder Kosmetikpinsel.',
    variants: [
      { colorName: 'Altrosa', colorHex: '#E6A1B0', image: '/products/organizer-twin-rosa.jpg', weightGrams: 100 },
    ],
  },
  {
    id: 'organizer-aura',
    name: 'Schmuck- & Rollenständer „Aura“',
    category: 'organizer',
    price: 11.9,
    shortDescription: 'Ständer mit runder Ablageschale für Armbänder, Haargummis & Ringe.',
    description:
      'Minimalistischer Halter mit hoher Säule und praktischer Schale am Fuß — ideal für Scrunchies, Armbänder oder Schmuck.',
    lifestyleImage: '/products/lifestyle-organizer-aura.jpg',
    lifestyleCaption: 'Im Einsatz',
    variants: [
      { colorName: 'Reinweiß', colorHex: '#FFFFFF', image: '/products/organizer-aura-weiss.jpg', weightGrams: 88 },
      { colorName: 'Sand / Beige', colorHex: '#D8C7AE', image: '/products/organizer-aura-beige.jpg', weightGrams: 85 },
    ],
  },
  {
    id: 'organizer-wave',
    name: 'Servietten- & Briefhalter „Wave“',
    category: 'organizer',
    price: 13.9,
    shortDescription: 'Geriffelter Halter für Servietten, Briefe oder Kaffeefilter.',
    description:
      'Vielseitiger Tisch-Organizer im klaren Rillen-Design — macht auf dem Esstisch genauso eine gute Figur wie im Homeoffice.',
    variants: [
      { colorName: 'Reinweiß', colorHex: '#FFFFFF', image: '/products/organizer-wave-weiss.jpg', weightGrams: 125 },
      { colorName: 'Olivgrün', colorHex: '#556142', image: '/products/organizer-wave-oliv.jpg', weightGrams: 123 },
    ],
  },
  {
    id: 'organizer-dose-maxi',
    name: 'Aufbewahrungsdose „Maxi“ mit Deckel',
    category: 'organizer',
    price: 19.9,
    shortDescription: 'Große geriffelte Dose mit passgenauem Deckel.',
    description:
      'Geräumige Aufbewahrungsdose für Bad, Küche oder Schlafzimmer — alles verstaut und trotzdem dekorativ.',
    variants: [
      { colorName: 'Altrosa', colorHex: '#E6A1B0', image: '/products/organizer-dose-maxi-rosa.jpg', weightGrams: 286 },
    ],
  },
  {
    id: 'organizer-dose-mini',
    name: 'Dose „Mini“ mit Deckel & Knauf',
    category: 'organizer',
    price: 13.9,
    shortDescription: 'Geschwungene Aufbewahrungsdose mit kleinem Deckelknauf.',
    description:
      'Dekorative Dose für Schmuck, Wattestäbchen, Schlüssel oder kleine Schätze.',
    variants: [
      { colorName: 'Karamell', colorHex: '#B47D54', image: '/products/organizer-dose-mini-karamell.jpg', weightGrams: 131 },
    ],
  },
  {
    id: 'organizer-quadro',
    name: 'Übertopf / Behälter „Quadro“',
    category: 'organizer',
    price: 14.9,
    shortDescription: 'Großer eckiger Behälter mit abgerundeten Kanten.',
    description:
      'Vielseitig nutzbar als moderner Pflanzen-Übertopf, Küchenutensilien-Halter oder großer Desk-Organizer.',
    variants: [
      { colorName: 'Karamell', colorHex: '#B47D54', image: '/products/organizer-quadro-karamell.jpg', weightGrams: 152 },
    ],
  },
  {
    id: 'topf-botanica',
    name: 'Pflanztopf „Botanica“ (2-teilig)',
    category: 'organizer',
    price: 17.9,
    shortDescription: 'Zweifarbiger geriffelter Blumentopf mit herausnehmbarem Einsatz.',
    description:
      'Stilvoller zweifarbiger Topf für Kräuter, Sukkulenten oder Zimmerpflanzen — praktisch mit integriertem Inneneinsatz.',
    variants: [
      { colorName: 'Creme / Olivgrün', colorHex: '#556142', image: '/products/topf-botanica-creme-oliv.jpg', weightGrams: 211 },
    ],
  },

  // ==================== ALLTAG & GADGETS ====================
  {
    id: 'handyhalter-hex',
    name: 'Klappbarer Handyhalter „Hex“',
    category: 'gadgets',
    price: 9.9,
    shortDescription: 'Stabiler Smartphone-Ständer im Waben-Design — flach klappbar.',
    description:
      'Genialer Handy- & Mini-Tablet-Ständer für Schreibtisch, Küche oder unterwegs. Lässt sich komplett flach zusammenklappen und passt in jede Tasche.',
    badge: 'Bestseller',
    lifestyleImage: '/products/lifestyle-handyhalter-hex.jpg',
    lifestyleCaption: 'Mit Smartphone',
    variants: [
      { colorName: 'Weiß / Rosa', colorHex: '#E6A1B0', image: '/products/handyhalter-hex-rosa.jpg', weightGrams: 83 },
      { colorName: 'Weiß / Hellblau', colorHex: '#8CC5E3', image: '/products/handyhalter-hex-blau.jpg', weightGrams: 82 },
      { colorName: 'Sand / Beige', colorHex: '#D8C7AE', image: '/products/handyhalter-hex-beige.jpg', weightGrams: 83 },
    ],
  },
  {
    id: 'gadget-ausstecher',
    name: 'Plätzchen-Ausstecher Set (2-teilig)',
    category: 'gadgets',
    price: 4.9,
    shortDescription: 'Zweiteiliges Blumen-Ausstecher-Set mit Stempel-Einsatz.',
    description:
      'Liebevoll gestaltete Ausstechformen für Plätzchen, Fondant oder Knete — im praktischen 2er-Set.',
    variants: [
      { colorName: 'Altrosa', colorHex: '#E6A1B0', image: '/products/gadget-ausstecher-rosa.jpg', weightGrams: 15 },
      { colorName: 'Olivgrün', colorHex: '#556142', image: '/products/gadget-ausstecher-oliv.jpg', weightGrams: 14 },
    ],
  },
  {
    id: 'gadget-knopf',
    name: 'Möbelknopf / Wandhaken „Dot“',
    category: 'gadgets',
    price: 3.9,
    shortDescription: 'Weich gerundeter Knauf für Schubladen, Schränke oder Garderobe.',
    description:
      'Kleines Upgrade für Kommoden, Kinderzimmer-Möbel oder als minimalistischer Haken.',
    variants: [
      { colorName: 'Altrosa', colorHex: '#E6A1B0', image: '/products/gadget-knopf-rosa.jpg', weightGrams: 14 },
    ],
  },

  // ==================== SAISON & DEKO ====================
  {
    id: 'deko-tannenbaum',
    name: 'Lamellen-Tannenbaum „Nordic“',
    category: 'deko',
    price: 8.9,
    shortDescription: 'Moderner 3D-Deko-Tannenbaum in feiner Lamellen-Optik.',
    description:
      'Zeitlose Winter- und Weihnachtsdeko im skandinavischen Stil — wunderschön auf dem Fensterbrett oder Festtisch.',
    badge: 'Saison-Tipp',
    variants: [
      { colorName: 'Cremeweiß', colorHex: '#F3EFE6', image: '/products/deko-tannenbaum-creme.jpg', weightGrams: 55 },
    ],
  },
  {
    id: 'deko-rentier',
    name: 'Deko-Rentier „Rudolf“ (Strick-Optik)',
    category: 'deko',
    price: 7.9,
    shortDescription: 'Niedliches Rentier mit detailreicher Strick-Textur.',
    description:
      'Besonders charmante Winterfigur mit fein gedruckter Knit-Oberfläche — ein tolles Mitbringsel.',
    variants: [
      { colorName: 'Sand / Beige', colorHex: '#D8C7AE', image: '/products/deko-rentier-beige.jpg', weightGrams: 42 },
    ],
  },
  {
    id: 'deko-kugel',
    name: 'Sternen-Kugel „Winter“',
    category: 'deko',
    price: 5.9,
    shortDescription: 'Leichte Weihnachts-Deko-Kugel mit feinem Sternen-Relief.',
    description:
      'Bruchfeste 3D-gedruckte Deko-Kugel mit liebevollem Sternen- und Schneeflocken-Muster.',
    variants: [
      { colorName: 'Cremeweiß', colorHex: '#F3EFE6', image: '/products/deko-kugel-creme.jpg', weightGrams: 27 },
    ],
  },
  {
    id: 'deko-tropfen',
    name: 'Lamellen-Anhänger „Tropfen“',
    category: 'deko',
    price: 5.9,
    shortDescription: 'Filigraner 3D-Tropfen in warmem Senfgold.',
    description:
      'Leichter Design-Anhänger in moderner Lamellen-Bauweise für Zweige, Geschenke oder den Weihnachtsbaum.',
    variants: [
      { colorName: 'Senfgold', colorHex: '#D89E38', image: '/products/deko-tropfen-gold.jpg', weightGrams: 25 },
    ],
  },
];
