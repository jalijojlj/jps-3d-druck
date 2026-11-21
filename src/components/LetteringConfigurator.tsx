import { useState } from 'react';
import { Sparkles, ShoppingBag, Zap, Ruler, Check } from 'lucide-react';
import {
  FILAMENT_COLORS,
  LETTERING_FONTS,
  LETTERING_HEIGHTS,
  LETTERING_THICKNESSES,
  calculateLetteringPrice,
  estimateLetteringWidthCm,
} from '../config';
import { formatPrice } from '../lib/orders';
import type { CartItem } from '../types';

interface LetteringConfiguratorProps {
  onAddToCart: (item: CartItem, openCheckout?: boolean) => void;
}

const EXAMPLES = [
  {
    label: '„trust“ (Serif)',
    text: 'trust',
    fontId: 'serif',
    colorId: 'schwarz',
    image: '/products/schrift-trust-schwarz.jpg',
  },
  {
    label: '„blessed“ (Schreibschrift)',
    text: 'blessed',
    fontId: 'script',
    colorId: 'schwarz',
    image: '/products/schrift-blessed-schwarz.jpg',
  },
  {
    label: '„LEA“ (3D-Bubble)',
    text: 'LEA',
    fontId: 'bubble',
    colorId: 'weiss',
    image: '/products/schrift-lea-bubble.jpg',
  },
];

export function LetteringConfigurator({ onAddToCart }: LetteringConfiguratorProps) {
  const [text, setText] = useState('trust');
  const [fontId, setFontId] = useState<string>('serif');
  const [heightCm, setHeightCm] = useState<number>(12);
  const [thicknessCm, setThicknessCm] = useState<number>(2);
  const [customWidthCm, setCustomWidthCm] = useState<string>('');
  const [colorId, setColorId] = useState<string>('schwarz');
  const [addedFeedback, setAddedFeedback] = useState(false);

  const selectedFont = LETTERING_FONTS.find((f) => f.id === fontId) ?? LETTERING_FONTS[0];
  const selectedColor = FILAMENT_COLORS.find((c) => c.id === colorId) ?? FILAMENT_COLORS[2];
  const displayText = text.trim() || 'Dein Text';
  const estimatedWidth = estimateLetteringWidthCm(displayText, heightCm, fontId);
  const finalWidthLabel = customWidthCm.trim()
    ? `${customWidthCm.trim()} cm (Wunschbreite)`
    : `ca. ${estimatedWidth} cm`;
  const price = calculateLetteringPrice(displayText, heightCm, thicknessCm);

  // Build layered 3D extrusion shadow based on thickness (1, 2, or 3 cm)
  const depthLayers = thicknessCm === 1 ? 3 : thicknessCm === 2 ? 6 : 10;
  const isLightColor = colorId === 'weiss' || colorId === 'creme' || colorId === 'beige';
  const sideShadowColor = isLightColor ? '#b9b0a2' : '#0f0e0d';
  const textShadow3D = [
    ...Array.from({ length: depthLayers }, (_, i) => `${i + 1}px ${i + 1}px 0 ${sideShadowColor}`),
    `${depthLayers + 6}px ${depthLayers + 10}px 18px rgba(28, 25, 23, 0.22)`,
  ].join(', ');

  const handleAdd = (openCheckout: boolean) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const item: CartItem = {
      cartId: `lettering-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId: 'custom-lettering',
      name: `3D-Schriftzug „${cleanText}“`,
      price,
      quantity: 1,
      image: selectedFont.exampleImage,
      colorName: selectedColor.name,
      details: `${selectedFont.name} · Höhe ${heightCm} cm · Dicke ${thicknessCm} cm · Breite ${finalWidthLabel}`,
      isCustomLettering: true,
    };

    onAddToCart(item, openCheckout);
    if (!openCheckout) {
      setAddedFeedback(true);
      window.setTimeout(() => setAddedFeedback(false), 1800);
    }
  };

  return (
    <section id="schriftzug" className="lettering-section" aria-labelledby="lettering-heading">
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">
            <Sparkles size={15} aria-hidden="true" /> Personalisiert auf Wunsch
          </span>
          <h2 id="lettering-heading">Dein individueller 3D-Schriftzug</h2>
          <p className="section-subtitle">
            Namen, Lieblingswörter oder Statements — wähle Schriftart, Standard-Maße und Wunschfarbe
            mit direkter Live-Vorschau.
          </p>
        </div>

        <div className="lettering-grid">
          {/* Left: Live 3D Preview + Real Photo Examples */}
          <div className="lettering-preview-col">
            <div className="preview-stage" aria-live="polite">
              <div className="preview-stage-badge">Live 3D-Vorschau</div>
              <div
                className="preview-text-3d"
                style={{
                  fontFamily: selectedFont.cssFamily,
                  color: selectedColor.hex,
                  textShadow: textShadow3D,
                  WebkitTextStroke: isLightColor ? '0.6px rgba(28,25,23,0.18)' : 'none',
                  fontSize:
                    displayText.length > 14
                      ? 'clamp(1.7rem, 4vw, 2.6rem)'
                      : displayText.length > 8
                        ? 'clamp(2.2rem, 5vw, 3.4rem)'
                        : 'clamp(2.8rem, 6vw, 4.4rem)',
                }}
              >
                {displayText}
              </div>

              <div className="preview-dimensions-bar">
                <span>
                  <Ruler size={14} aria-hidden="true" /> Höhe: <strong>{heightCm} cm</strong>
                </span>
                <span>
                  Dicke: <strong>{thicknessCm} cm</strong>
                </span>
                <span>
                  Breite: <strong>{finalWidthLabel}</strong>
                </span>
              </div>
            </div>

            <div className="example-photos-block">
              <p className="example-photos-title">Echte Druck-Beispiele (zum Testen antippen):</p>
              <div className="example-photos-grid">
                {EXAMPLES.map((ex) => {
                  const active = fontId === ex.fontId && text === ex.text;
                  return (
                    <button
                      key={ex.label}
                      type="button"
                      className={`example-photo-card ${active ? 'is-active' : ''}`}
                      onClick={() => {
                        setText(ex.text);
                        setFontId(ex.fontId);
                        setColorId(ex.colorId);
                      }}
                    >
                      <img
                        src={ex.image}
                        alt={`3D-Druck Beispiel ${ex.label}`}
                        width={260}
                        height={260}
                        loading="lazy"
                      />
                      <span>{ex.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Configurator Controls */}
          <div className="lettering-controls-col">
            <div className="config-card">
              <div className="config-group">
                <label htmlFor="lettering-text" className="config-label">
                  1. Dein Wunschtext
                </label>
                <input
                  id="lettering-text"
                  type="text"
                  maxLength={24}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="z. B. trust, blessed, LEA, Home..."
                  className="text-input-lg"
                />
                <span className="field-note">Maximal 24 Zeichen · Sonderzeichen &amp; Namen möglich</span>
              </div>

              <div className="config-group">
                <span className="config-label">2. Schriftart wählen</span>
                <div className="font-options-grid">
                  {LETTERING_FONTS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      className={`font-option-btn ${fontId === font.id ? 'is-selected' : ''}`}
                      onClick={() => setFontId(font.id)}
                    >
                      <span className="font-option-sample" style={{ fontFamily: font.cssFamily }}>
                        {text.trim().slice(0, 10) || 'Beispiel'}
                      </span>
                      <span className="font-option-name">{font.name}</span>
                      <span className="font-option-sub">{font.subtitle}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="config-row-2">
                <div className="config-group">
                  <span className="config-label">3. Höhe (Standard)</span>
                  <div className="pill-options">
                    {LETTERING_HEIGHTS.map((h) => (
                      <button
                        key={h.cm}
                        type="button"
                        className={`pill-btn ${heightCm === h.cm ? 'is-selected' : ''}`}
                        onClick={() => setHeightCm(h.cm)}
                      >
                        <strong>{h.label}</strong>
                        <small>{h.note}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="config-group">
                  <span className="config-label">4. Dicke / Tiefe (Standard)</span>
                  <div className="pill-options">
                    {LETTERING_THICKNESSES.map((t) => (
                      <button
                        key={t.cm}
                        type="button"
                        className={`pill-btn ${thicknessCm === t.cm ? 'is-selected' : ''}`}
                        onClick={() => setThicknessCm(t.cm)}
                      >
                        <strong>{t.label}</strong>
                        <small>{t.note}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="config-group">
                <label htmlFor="custom-width" className="config-label">
                  5. Breite (optional anpassen)
                </label>
                <div className="width-input-row">
                  <input
                    id="custom-width"
                    type="number"
                    min={6}
                    max={60}
                    value={customWidthCm}
                    onChange={(e) => setCustomWidthCm(e.target.value)}
                    placeholder={`Automatisch ca. ${estimatedWidth} cm`}
                    className="text-input"
                  />
                  <span className="width-unit">cm</span>
                </div>
              </div>

              <div className="config-group">
                <span className="config-label">
                  6. Wunschfarbe: <strong>{selectedColor.name}</strong>
                </span>
                <div className="color-swatches">
                  {FILAMENT_COLORS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      title={color.name}
                      aria-label={`Farbe ${color.name}`}
                      aria-pressed={colorId === color.id}
                      className={`color-swatch ${colorId === color.id ? 'is-selected' : ''}`}
                      style={{
                        backgroundColor: color.hex,
                        borderColor: color.border || 'transparent',
                      }}
                      onClick={() => setColorId(color.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="config-summary-footer">
                <div>
                  <span className="price-label">Richtpreis</span>
                  <div className="price-value-lg">{formatPrice(price)}</div>
                </div>
                <div className="config-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={!text.trim()}
                    onClick={() => handleAdd(false)}
                  >
                    {addedFeedback ? (
                      <>
                        <Check size={18} aria-hidden="true" /> Hinzugefügt
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} aria-hidden="true" /> In den Warenkorb
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!text.trim()}
                    onClick={() => handleAdd(true)}
                  >
                    <Zap size={18} aria-hidden="true" /> Direkt bestellen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
