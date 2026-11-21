export type PaymentMethod = 'paypal' | 'cash';
export type DeliveryMethod = 'shipping' | 'pickup';

export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  colorName: string;
  details?: string; // e.g., Schriftart, Höhe, Dicke, Breite
  isCustomLettering?: boolean;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  delivery: DeliveryMethod;
  street: string;
  zip: string;
  city: string;
  notes: string;
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  paid: boolean;
  customer: OrderCustomer;
  syncedToSheets?: boolean;
}
