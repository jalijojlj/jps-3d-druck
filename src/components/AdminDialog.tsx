import { useEffect, useRef, useState } from 'react';
import {
  X,
  Lock,
  CheckCircle2,
  Clock,
  RefreshCw,
  Download,
  Cloud,
  CloudOff,
  Phone,
  Mail,
  MapPin,
  Settings,
} from 'lucide-react';
import { SHOP_CONFIG } from '../config';
import {
  exportOrdersAsCsv,
  fetchAllOrders,
  formatPrice,
  getWebhookOverride,
  setWebhookOverride,
  updateOrderPaidStatus,
} from '../lib/orders';
import { attachDialogLightDismissFallback } from '../lib/dialogUtils';
import type { Order } from '../types';

interface AdminDialogProps {
  open: boolean;
  unlocked: boolean;
  onUnlock: () => void;
  onClose: () => void;
  orders: Order[];
  onOrdersUpdated: (orders: Order[]) => void;
  priceMultiplier: number;
  onPriceMultiplierChange: (multiplier: number) => void;
}

export function AdminDialog({
  open,
  unlocked,
  onUnlock,
  onClose,
  orders,
  onOrdersUpdated,
  priceMultiplier,
  onPriceMultiplierChange,
}: AdminDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'paid'>('all');
  const [loading, setLoading] = useState(false);
  const [sheetsConnected, setSheetsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [webhookInput, setWebhookInput] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      setPinError(false);
      setWebhookInput(getWebhookOverride());
      if (!dialog.open) dialog.showModal();
      if (unlocked) {
        void handleRefresh();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, unlocked]);

  useEffect(() => {
    return attachDialogLightDismissFallback(dialogRef.current);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    const res = await fetchAllOrders();
    onOrdersUpdated(res.orders);
    setSheetsConnected(res.connected);
    setLoading(false);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === SHOP_CONFIG.sellerPin) {
      setPinError(false);
      setPinInput('');
      onUnlock();
      void handleRefresh();
    } else {
      setPinError(true);
    }
  };

  const handleTogglePaid = async (order: Order) => {
    const nextOrders = await updateOrderPaidStatus(order.id, !order.paid);
    onOrdersUpdated(nextOrders);
  };

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setWebhookOverride(webhookInput);
    setShowSettings(false);
    await handleRefresh();
  };

  const handleNativeClose = () => {
    if (dialogRef.current) dialogRef.current.returnValue = '';
    onClose();
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'open') return !o.paid;
    if (filter === 'paid') return o.paid;
    return true;
  });

  const paidTotal = orders.filter((o) => o.paid).reduce((s, o) => s + o.total, 0);
  const openTotal = orders.filter((o) => !o.paid).reduce((s, o) => s + o.total, 0);

  return (
    <dialog
      ref={dialogRef}
      className="modal-dialog admin-modal"
      aria-labelledby="admin-modal-title"
      onClose={handleNativeClose}
      {...({ closedby: 'any' } as Record<string, string>)}
    >
      <div className="admin-modal-inner">
        <header className="modal-header">
          <div className="modal-header-left">
            <Lock size={18} aria-hidden="true" />
            <h2 id="admin-modal-title">Stand-Modus &amp; Bestellungen</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn inline"
            aria-label="Stand-Modus schließen"
            onClick={() => dialogRef.current?.close()}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {!unlocked ? (
          <form className="admin-pin-screen" onSubmit={handlePinSubmit}>
            <p>Gib deinen kurzen Verkäufer-Code ein, um Bestellungen zu verwalten und Barzahlungen als bezahlt zu markieren.</p>
            <div className="pin-form-row">
              <input
                type="password"
                inputMode="numeric"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Verkäufer-Code"
                aria-label="Verkäufer-Code"
                autoFocus
              />
              <button type="submit" className="btn btn-primary">
                Öffnen
              </button>
            </div>
            {pinError && <p className="pin-error">Code stimmt nicht. (Standard: {SHOP_CONFIG.sellerPin})</p>}
          </form>
        ) : (
          <div className="admin-body">
            <div className="admin-toolbar">
              <div className={`sheets-pill ${sheetsConnected ? 'is-online' : 'is-local'}`}>
                {sheetsConnected ? (
                  <>
                    <Cloud size={15} aria-hidden="true" /> Server-Sync aktiv
                  </>
                ) : (
                  <>
                    <CloudOff size={15} aria-hidden="true" /> Lokaler Speicher
                  </>
                )}
              </div>

              <div className="admin-toolbar-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowSettings((s) => !s)}
                >
                  <Settings size={15} aria-hidden="true" /> Google Sheet URL
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw size={15} className={loading ? 'spin' : ''} aria-hidden="true" />{' '}
                  Aktualisieren
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => exportOrdersAsCsv(orders)}
                  disabled={orders.length === 0}
                >
                  <Download size={15} aria-hidden="true" /> CSV
                </button>
              </div>
            </div>

            {showSettings && (
              <form className="webhook-settings-box" onSubmit={handleSaveWebhook}>
                <label htmlFor="webhook-url">Google Apps Script Web-App URL (optional hier testen)</label>
                <p className="field-note">
                  Am besten dauerhaft in Vercel als <code>GOOGLE_SHEETS_WEBHOOK_URL</code> speichern
                  — oder hier direkt für dieses Gerät eintragen:
                </p>
                <div className="seller-code-row">
                  <input
                    id="webhook-url"
                    type="url"
                    value={webhookInput}
                    onChange={(e) => setWebhookInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    Speichern
                  </button>
                </div>
              </form>
            )}

            <div className="webhook-settings-box">
              <label>Preise live anpassen (aktuell: {Math.round((priceMultiplier - 1) * 100)}%)</label>
              <div className="admin-filter-tabs" style={{ flexWrap: 'wrap' }}>
                {[
                  { label: '-40 %', mult: 0.6 },
                  { label: '-30 % (Standard)', mult: 0.7 },
                  { label: '-20 %', mult: 0.8 },
                  { label: '-10 %', mult: 0.9 },
                  { label: 'Normal (0 %)', mult: 1.0 },
                  { label: '+10 %', mult: 1.1 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    className={Math.abs(priceMultiplier - opt.mult) < 0.005 ? 'is-active' : ''}
                    onClick={() => onPriceMultiplierChange(opt.mult)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="field-note">
                Alle Produkt- und Schriftzug-Preise passen sich sofort an (gerundet auf 0,50 €).
                Dauerhaft änderbar in <code>src/config.ts</code>.
              </p>
            </div>

            <div className="kpi-grid">
              <div className="kpi-card">
                <span>Bestellungen</span>
                <strong>{orders.length}</strong>
              </div>
              <div className="kpi-card success">
                <span>Bezahlt</span>
                <strong>{formatPrice(paidTotal)}</strong>
              </div>
              <div className="kpi-card warning">
                <span>Offen</span>
                <strong>{formatPrice(openTotal)}</strong>
              </div>
            </div>

            <div className="admin-filter-tabs">
              <button
                type="button"
                className={filter === 'all' ? 'is-active' : ''}
                onClick={() => setFilter('all')}
              >
                Alle ({orders.length})
              </button>
              <button
                type="button"
                className={filter === 'open' ? 'is-active' : ''}
                onClick={() => setFilter('open')}
              >
                Offen ({orders.filter((o) => !o.paid).length})
              </button>
              <button
                type="button"
                className={filter === 'paid' ? 'is-active' : ''}
                onClick={() => setFilter('paid')}
              >
                Bezahlt ({orders.filter((o) => o.paid).length})
              </button>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="empty-state compact">
                <p>Noch keine Bestellungen in dieser Ansicht.</p>
              </div>
            ) : (
              <div className="admin-orders-list">
                {filteredOrders.map((order) => (
                  <article
                    key={order.id}
                    className={`admin-order-card ${order.paid ? 'is-paid' : 'is-open'}`}
                  >
                    <div className="admin-order-top">
                      <div>
                        <span className="admin-order-id">{order.id}</span>
                        <span className="admin-order-date">
                          {new Date(order.createdAt).toLocaleString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="payment-tag">
                          {order.paymentMethod === 'cash' ? 'Bar am Stand' : 'PayPal'}
                        </span>
                      </div>
                      <strong className="admin-order-total">{formatPrice(order.total)}</strong>
                    </div>

                    <div className="admin-order-customer">
                      <strong>{order.customer.name}</strong>
                      <div className="contact-chips">
                        {order.customer.phone && (
                          <a href={`tel:${order.customer.phone}`}>
                            <Phone size={13} aria-hidden="true" /> {order.customer.phone}
                          </a>
                        )}
                        {order.customer.email && (
                          <a href={`mailto:${order.customer.email}`}>
                            <Mail size={13} aria-hidden="true" /> {order.customer.email}
                          </a>
                        )}
                      </div>
                      <div className="address-line">
                        <MapPin size={13} aria-hidden="true" />{' '}
                        {order.customer.delivery === 'pickup'
                          ? 'Abholung am Stand'
                          : `${order.customer.street}, ${order.customer.zip} ${order.customer.city}`}
                      </div>
                      {order.customer.notes && (
                        <p className="admin-order-note">Notiz: {order.customer.notes}</p>
                      )}
                    </div>

                    <ul className="admin-order-items">
                      {order.items.map((item, idx) => (
                        <li key={`${order.id}-${idx}`}>
                          <strong>{item.quantity}×</strong> {item.name} ·{' '}
                          <span>{item.colorName}</span>
                          {item.details && <small> ({item.details})</small>}
                        </li>
                      ))}
                    </ul>

                    <div className="admin-order-actions">
                      <button
                        type="button"
                        className={`btn-paid-toggle ${order.paid ? 'is-paid' : ''}`}
                        onClick={() => handleTogglePaid(order)}
                      >
                        {order.paid ? (
                          <>
                            <CheckCircle2 size={16} aria-hidden="true" /> Bezahlt ✓ (Rückgängig)
                          </>
                        ) : (
                          <>
                            <Clock size={16} aria-hidden="true" /> Als bezahlt markieren
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}
