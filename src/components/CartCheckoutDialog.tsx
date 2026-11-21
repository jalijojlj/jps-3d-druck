import { useEffect, useRef, useState } from 'react';
import {
  X,
  Trash2,
  Minus,
  Plus,
  CheckCircle2,
  Copy,
  Check,
  CreditCard,
  Banknote,
  Truck,
  Store,
  Lock,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { SHOP_CONFIG } from '../config';
import { formatPrice, generateOrderId, submitOrder } from '../lib/orders';
import { attachDialogLightDismissFallback, attachFormValidationAria } from '../lib/dialogUtils';
import type { CartItem, DeliveryMethod, Order, PaymentMethod } from '../types';

interface CartCheckoutDialogProps {
  open: boolean;
  initialStep: 'cart' | 'checkout';
  items: CartItem[];
  sellerUnlocked: boolean;
  onUnlockSeller: () => void;
  onClose: () => void;
  onUpdateQty: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  onOrderCreated: (order: Order) => void;
}

export function CartCheckoutDialog({
  open,
  initialStep,
  items,
  sellerUnlocked,
  onUnlockSeller,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
}: CartCheckoutDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [delivery, setDelivery] = useState<DeliveryMethod>('shipping');
  const [street, setStreet] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal');

  // Seller cash confirmation right inside checkout
  const [sellerCodeInput, setSellerCodeInput] = useState('');
  const [markPaidNow, setMarkPaidNow] = useState(false);
  const [sellerPinError, setSellerPinError] = useState(false);

  const [contactError, setContactError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      setStep(items.length === 0 ? 'cart' : initialStep);
      setContactError('');
      setCompletedOrder(null);
      setMarkPaidNow(false);
      setSellerPinError(false);
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, initialStep]);

  useEffect(() => {
    return attachDialogLightDismissFallback(dialogRef.current);
  }, []);

  useEffect(() => {
    if (step === 'checkout') {
      return attachFormValidationAria(formRef.current);
    }
  }, [step]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping =
    delivery === 'pickup' || subtotal >= SHOP_CONFIG.freeShippingFrom || subtotal === 0
      ? 0
      : SHOP_CONFIG.shippingCost;
  const total = subtotal + shipping;

  const isSellerAuthorized = sellerUnlocked || sellerCodeInput.trim() === SHOP_CONFIG.sellerPin;

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      window.setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleUnlockPin = () => {
    if (sellerCodeInput.trim() === SHOP_CONFIG.sellerPin) {
      setSellerPinError(false);
      onUnlockSeller();
      setMarkPaidNow(true);
    } else {
      setSellerPinError(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactError('');

    if (!email.trim() && !phone.trim()) {
      setContactError('Bitte gib entweder deine E-Mail-Adresse oder deine Telefonnummer an.');
      return;
    }

    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    setSubmitting(true);
    const newOrder: Order = {
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      items: [...items],
      subtotal,
      shipping,
      total,
      paymentMethod,
      paid: paymentMethod === 'cash' && isSellerAuthorized && markPaidNow,
      customer: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        delivery,
        street: delivery === 'shipping' ? street.trim() : '',
        zip: delivery === 'shipping' ? zip.trim() : '',
        city: delivery === 'shipping' ? city.trim() : '',
        notes: notes.trim(),
      },
    };

    const result = await submitOrder(newOrder);
    setSubmitting(false);
    setCompletedOrder(result.order);
    onOrderCreated(result.order);
    onClearCart();
    setStep('success');
  };

  const handleNativeClose = () => {
    if (dialogRef.current) dialogRef.current.returnValue = '';
    onClose();
  };

  const paypalMeDirectLink =
    SHOP_CONFIG.paypalMeUrl && completedOrder
      ? `${SHOP_CONFIG.paypalMeUrl.replace(/\/$/, '')}/${completedOrder.total.toFixed(2)}EUR`
      : '';

  return (
    <dialog
      ref={dialogRef}
      className="modal-dialog checkout-modal"
      aria-labelledby="checkout-modal-title"
      onClose={handleNativeClose}
      {...({ closedby: 'any' } as Record<string, string>)}
    >
      <div className="checkout-modal-inner">
        <header className="modal-header">
          <div className="modal-header-left">
            {step === 'checkout' && (
              <button
                type="button"
                className="icon-btn"
                aria-label="Zurück zum Warenkorb"
                onClick={() => setStep('cart')}
              >
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
            )}
            <h2 id="checkout-modal-title">
              {step === 'cart' && `Warenkorb (${items.reduce((s, i) => s + i.quantity, 0)})`}
              {step === 'checkout' && 'Bestellung abschließen'}
              {step === 'success' && 'Vielen Dank für deine Bestellung!'}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn inline"
            aria-label="Dialog schließen"
            onClick={() => dialogRef.current?.close()}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {/* STEP 1: CART */}
        {step === 'cart' && (
          <div className="checkout-body">
            {items.length === 0 ? (
              <div className="empty-state">
                <p>Dein Warenkorb ist noch leer.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => dialogRef.current?.close()}
                >
                  Produkte entdecken
                </button>
              </div>
            ) : (
              <>
                <ul className="cart-list">
                  {items.map((item) => (
                    <li key={item.cartId} className="cart-item">
                      <img src={item.image} alt={item.name} width={72} height={72} />
                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <span className="cart-item-meta">Farbe: {item.colorName}</span>
                        {item.details && <span className="cart-item-meta">{item.details}</span>}
                        <div className="cart-item-controls">
                          <div className="qty-stepper compact">
                            <button
                              type="button"
                              aria-label="Weniger"
                              onClick={() => onUpdateQty(item.cartId, -1)}
                            >
                              <Minus size={14} aria-hidden="true" />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              aria-label="Mehr"
                              onClick={() => onUpdateQty(item.cartId, 1)}
                            >
                              <Plus size={14} aria-hidden="true" />
                            </button>
                          </div>
                          <span className="cart-item-price">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <button
                            type="button"
                            className="icon-btn danger"
                            aria-label={`${item.name} entfernen`}
                            onClick={() => onRemoveItem(item.cartId)}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="summary-box">
                  <div className="summary-row">
                    <span>Zwischensumme</span>
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>
                  <div className="summary-row muted">
                    <span>Versand (ab {formatPrice(SHOP_CONFIG.freeShippingFrom)} frei · Abholung 0 €)</span>
                    <span>
                      {subtotal >= SHOP_CONFIG.freeShippingFrom
                        ? 'Kostenlos'
                        : `ab ${formatPrice(0)}`}
                    </span>
                  </div>
                </div>

                <div className="modal-footer-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-full"
                    onClick={() => setStep('checkout')}
                  >
                    Weiter zu Adresse &amp; Zahlung
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 2: CHECKOUT FORM */}
        {step === 'checkout' && (
          <form ref={formRef} className="checkout-body" onSubmit={handleSubmit} noValidate>
            <div className="form-section">
              <h3>1. Deine Kontaktdaten</h3>
              <p className="field-note">
                Bitte gib deinen Namen und <strong>E-Mail oder Telefonnummer</strong> an (eins von beiden reicht).
              </p>

              <div className="field">
                <label htmlFor="order-name">Vor- und Nachname *</label>
                <input
                  id="order-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-error="order-name-error"
                  placeholder="Max Mustermann"
                  autoFocus
                />
                <div id="order-name-error" className="error-msg">
                  <span role="img" aria-label="Fehler">⚠</span> Bitte gib deinen Namen ein.
                </div>
              </div>

              <div className="form-row-2">
                <div className="field">
                  <label htmlFor="order-email">E-Mail-Adresse</label>
                  <span id="order-email-hint" className="hint">Optional, wenn Telefon angegeben</span>
                  <input
                    id="order-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    aria-describedby="order-email-hint"
                    data-error="order-email-error"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (contactError) setContactError('');
                    }}
                    placeholder="name@beispiel.de"
                  />
                  <div id="order-email-error" className="error-msg">
                    <span role="img" aria-label="Fehler">⚠</span> Bitte eine gültige E-Mail-Adresse eingeben.
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="order-phone">Telefon / WhatsApp</label>
                  <span id="order-phone-hint" className="hint">Optional, wenn E-Mail angegeben</span>
                  <input
                    id="order-phone"
                    name="tel"
                    type="tel"
                    autoComplete="tel"
                    aria-describedby="order-phone-hint"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (contactError) setContactError('');
                    }}
                    placeholder="0176 12345678"
                  />
                </div>
              </div>

              {contactError && (
                <div className="alert-error" role="alert">
                  {contactError}
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>2. Versand oder Abholung</h3>
              <div className="choice-grid">
                <button
                  type="button"
                  className={`choice-card ${delivery === 'shipping' ? 'is-selected' : ''}`}
                  onClick={() => setDelivery('shipping')}
                >
                  <Truck size={20} aria-hidden="true" />
                  <div>
                    <strong>Versand nach Hause</strong>
                    <span>
                      {subtotal >= SHOP_CONFIG.freeShippingFrom
                        ? 'Kostenloser Versand'
                        : `+ ${formatPrice(SHOP_CONFIG.shippingCost)} Versand`}
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`choice-card ${delivery === 'pickup' ? 'is-selected' : ''}`}
                  onClick={() => setDelivery('pickup')}
                >
                  <Store size={20} aria-hidden="true" />
                  <div>
                    <strong>Abholung am Stand</strong>
                    <span>Kostenlos (0,00 €)</span>
                  </div>
                </button>
              </div>

              {delivery === 'shipping' && (
                <div className="address-fields">
                  <div className="field">
                    <label htmlFor="order-street">Straße und Hausnummer *</label>
                    <input
                      id="order-street"
                      name="street-address"
                      type="text"
                      autoComplete="street-address"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      data-error="order-street-error"
                      placeholder="Musterstraße 12"
                    />
                    <div id="order-street-error" className="error-msg">
                      <span role="img" aria-label="Fehler">⚠</span> Bitte Straße und Hausnummer angeben.
                    </div>
                  </div>
                  <div className="form-row-zip-city">
                    <div className="field">
                      <label htmlFor="order-zip">PLZ *</label>
                      <input
                        id="order-zip"
                        name="postal-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        required
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        data-error="order-zip-error"
                        placeholder="12345"
                      />
                      <div id="order-zip-error" className="error-msg">
                        <span role="img" aria-label="Fehler">⚠</span> PLZ fehlt.
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="order-city">Ort *</label>
                      <input
                        id="order-city"
                        name="address-level2"
                        type="text"
                        autoComplete="address-level2"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        data-error="order-city-error"
                        placeholder="Musterstadt"
                      />
                      <div id="order-city-error" className="error-msg">
                        <span role="img" aria-label="Fehler">⚠</span> Ort fehlt.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>3. Zahlungsart</h3>
              <div className="choice-grid">
                <button
                  type="button"
                  className={`choice-card ${paymentMethod === 'paypal' ? 'is-selected' : ''}`}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  <CreditCard size={20} aria-hidden="true" />
                  <div>
                    <strong>PayPal</strong>
                    <span>Einfach an unsere PayPal-E-Mail senden</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={`choice-card ${paymentMethod === 'cash' ? 'is-selected' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <Banknote size={20} aria-hidden="true" />
                  <div>
                    <strong>Bar am Stand</strong>
                    <span>Direkt vor Ort in bar bezahlen</span>
                  </div>
                </button>
              </div>

              {paymentMethod === 'cash' && (
                <div className="seller-cash-box">
                  {isSellerAuthorized ? (
                    <label className="paid-checkbox-row">
                      <input
                        type="checkbox"
                        checked={markPaidNow}
                        onChange={(e) => setMarkPaidNow(e.target.checked)}
                      />
                      <span>
                        <strong>Verkäufer-Bestätigung:</strong> Betrag ({formatPrice(total)}) wurde
                        sofort bar bezahlt ✓
                      </span>
                    </label>
                  ) : (
                    <details className="seller-code-details">
                      <summary>
                        <Lock size={14} aria-hidden="true" /> Für Verkäufer: Barzahlung direkt als
                        bezahlt abhaken
                      </summary>
                      <div className="seller-code-row">
                        <input
                          type="password"
                          inputMode="numeric"
                          placeholder="Verkäufer-Code"
                          value={sellerCodeInput}
                          onChange={(e) => {
                            setSellerCodeInput(e.target.value);
                            setSellerPinError(false);
                          }}
                        />
                        <button type="button" className="btn btn-secondary" onClick={handleUnlockPin}>
                          Freischalten
                        </button>
                      </div>
                      {sellerPinError && (
                        <span className="pin-error">Falscher Code.</span>
                      )}
                    </details>
                  )}
                </div>
              )}
            </div>

            <div className="form-section">
              <div className="field">
                <label htmlFor="order-notes">Notiz / Sonderwunsch (optional)</label>
                <textarea
                  id="order-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="z. B. besondere Farbkombination, Geschenkverpackung..."
                />
              </div>
            </div>

            <div className="summary-box">
              <ul className="checkout-items-mini">
                {items.map((item) => (
                  <li key={item.cartId}>
                    <span>
                      <strong>{item.quantity}×</strong> {item.name} ({item.colorName})
                      {item.details ? ` — ${item.details}` : ''}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="summary-row">
                <span>Zwischensumme</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Versand</span>
                <span>{shipping === 0 ? 'Kostenlos' : formatPrice(shipping)}</span>
              </div>
              <div className="summary-row total">
                <span>Gesamtbetrag</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>

            <div className="modal-footer-actions">
              <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                {submitting
                  ? 'Bestellung wird gespeichert...'
                  : `Verbindlich bestellen (${formatPrice(total)})`}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && completedOrder && (
          <div className="checkout-body success-view">
            <div className="success-icon">
              <CheckCircle2 size={44} aria-hidden="true" />
            </div>
            <p className="order-number-pill">
              Bestellnummer: <strong>{completedOrder.id}</strong>
            </p>

            {completedOrder.paid ? (
              <div className="status-banner paid">
                ✓ Bar am Stand bezahlt — vielen Dank! Wir legen direkt los.
              </div>
            ) : completedOrder.paymentMethod === 'paypal' ? (
              <div className="paypal-box">
                <h3>Jetzt bequem per PayPal bezahlen</h3>
                <p>
                  Bitte sende <strong>{formatPrice(completedOrder.total)}</strong> per PayPal an
                  folgende E-Mail-Adresse und gib deine Bestellnummer als Verwendungszweck an:
                </p>

                <div className="copy-row">
                  <div>
                    <small>PayPal-E-Mail</small>
                    <strong>{SHOP_CONFIG.paypalEmail}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopy(SHOP_CONFIG.paypalEmail, 'email')}
                  >
                    {copiedField === 'email' ? (
                      <>
                        <Check size={15} aria-hidden="true" /> Kopiert
                      </>
                    ) : (
                      <>
                        <Copy size={15} aria-hidden="true" /> Kopieren
                      </>
                    )}
                  </button>
                </div>

                <div className="copy-row">
                  <div>
                    <small>Verwendungszweck</small>
                    <strong>{completedOrder.id}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopy(completedOrder.id, 'ref')}
                  >
                    {copiedField === 'ref' ? (
                      <>
                        <Check size={15} aria-hidden="true" /> Kopiert
                      </>
                    ) : (
                      <>
                        <Copy size={15} aria-hidden="true" /> Kopieren
                      </>
                    )}
                  </button>
                </div>

                {paypalMeDirectLink && (
                  <a
                    href={paypalMeDirectLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-full"
                    style={{ marginTop: '0.75rem' }}
                  >
                    Direkt zu PayPal.me ({formatPrice(completedOrder.total)}){' '}
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                )}
              </div>
            ) : (
              <div className="status-banner pending">
                Barzahlung am Stand ausgewählt ({formatPrice(completedOrder.total)}). Zeige einfach
                deine Bestellnummer <strong>{completedOrder.id}</strong> vor!
              </div>
            )}

            <div className="order-recap">
              <h4>Deine Bestellung</h4>
              <ul>
                {completedOrder.items.map((item) => (
                  <li key={item.cartId}>
                    <span>
                      {item.quantity}× {item.name} ({item.colorName})
                      {item.details ? ` — ${item.details}` : ''}
                    </span>
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-full"
              onClick={() => dialogRef.current?.close()}
            >
              Fertig &amp; zurück zum Shop
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
