import type { Order, PaymentMethod } from '../types';

const STORAGE_KEY = 'jps_3d_orders_v1';
const WEBHOOK_OVERRIDE_KEY = 'jps_3d_sheets_webhook_v1';

export function formatPrice(amount: number): string {
  return amount.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
  });
}

export function generateOrderId(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `JPS-${dd}${mm}-${rand}`;
}

export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Ignore storage quota errors
  }
}

export function getWebhookOverride(): string {
  try {
    return localStorage.getItem(WEBHOOK_OVERRIDE_KEY) || '';
  } catch {
    return '';
  }
}

export function setWebhookOverride(url: string): void {
  try {
    const trimmed = url.trim();
    if (trimmed) {
      localStorage.setItem(WEBHOOK_OVERRIDE_KEY, trimmed);
    } else {
      localStorage.removeItem(WEBHOOK_OVERRIDE_KEY);
    }
  } catch {
    // Ignore
  }
}

export async function submitOrder(order: Order): Promise<{
  order: Order;
  syncedToSheets: boolean;
  message?: string;
}> {
  let syncedToSheets = false;
  let message: string | undefined;

  const customWebhook = getWebhookOverride();

  try {
    if (customWebhook) {
      const resp = await fetch(customWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'create', order }),
      });
      if (resp.ok) syncedToSheets = true;
    } else {
      const resp = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', order }),
      });
      if (resp.ok) {
        const data = await resp.json();
        syncedToSheets = Boolean(data.connected && !data.error);
        message = data.message;
      }
    }
  } catch {
    // Fallback cleanly to local storage
  }

  const finalOrder: Order = { ...order, syncedToSheets };
  const existing = getLocalOrders().filter((o) => o.id !== finalOrder.id);
  saveLocalOrders([finalOrder, ...existing]);

  return { order: finalOrder, syncedToSheets, message };
}

export async function fetchAllOrders(): Promise<{
  orders: Order[];
  connected: boolean;
}> {
  const local = getLocalOrders();
  const customWebhook = getWebhookOverride();

  try {
    const resp = await fetch(customWebhook || '/api/orders', { method: 'GET' });
    if (resp.ok) {
      const data = await resp.json();
      const connected = customWebhook ? true : Boolean(data.connected);
      if (connected && Array.isArray(data.orders)) {
        // Merge remote + any unsynced local orders
        const remoteMap = new Map<string, Order>();
        for (const o of data.orders) {
          remoteMap.set(o.id, { ...o, syncedToSheets: true });
        }
        for (const l of local) {
          if (!remoteMap.has(l.id)) {
            remoteMap.set(l.id, l);
          }
        }
        const merged = Array.from(remoteMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        saveLocalOrders(merged);
        return { orders: merged, connected: true };
      }
      return { orders: local, connected: false };
    }
  } catch {
    // Offline or local dev without Vercel API
  }

  return { orders: local, connected: false };
}

export async function updateOrderPaidStatus(
  orderId: string,
  paid: boolean,
  paymentMethod?: PaymentMethod
): Promise<Order[]> {
  const updatedLocal = getLocalOrders().map((o) =>
    o.id === orderId ? { ...o, paid, paymentMethod: paymentMethod ?? o.paymentMethod } : o
  );
  saveLocalOrders(updatedLocal);

  const customWebhook = getWebhookOverride();
  try {
    if (customWebhook) {
      await fetch(customWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateStatus', orderId, paid, paymentMethod }),
      });
    } else {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', orderId, paid, paymentMethod }),
      });
    }
  } catch {
    // Already saved locally
  }

  return updatedLocal;
}

export function exportOrdersAsCsv(orders: Order[]): void {
  const headers = [
    'Bestell-Nr',
    'Datum',
    'Bezahlt',
    'Zahlungsart',
    'Summe (EUR)',
    'Name',
    'E-Mail',
    'Telefon',
    'Lieferart',
    'Adresse',
    'Artikel',
    'Notiz',
  ];

  const escapeCsv = (val: string | number) => {
    const s = String(val ?? '');
    return `"${s.replace(/"/g, '""')}"`;
  };

  const rows = orders.map((o) => {
    const addr =
      o.customer.delivery === 'pickup'
        ? 'Abholung am Stand'
        : [o.customer.street, `${o.customer.zip} ${o.customer.city}`].filter(Boolean).join(', ');
    const items = o.items
      .map((i) => `${i.quantity}x ${i.name} (${i.colorName}${i.details ? ', ' + i.details : ''})`)
      .join(' | ');
    return [
      o.id,
      new Date(o.createdAt).toLocaleString('de-DE'),
      o.paid ? 'JA' : 'OFFEN',
      o.paymentMethod === 'cash' ? 'Bar am Stand' : 'PayPal',
      o.total.toFixed(2).replace('.', ','),
      o.customer.name,
      o.customer.email,
      o.customer.phone,
      o.customer.delivery === 'pickup' ? 'Abholung am Stand' : 'Versand',
      addr,
      items,
      o.customer.notes,
    ]
      .map(escapeCsv)
      .join(';');
  });

  const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `JPS-3D-Bestellungen-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
