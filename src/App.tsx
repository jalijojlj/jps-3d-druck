import { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Lock,
  LockOpen,
  Search,
  CheckCircle2,
  Palette,
  Truck,
  Banknote,
} from 'lucide-react';
import { SHOP_CONFIG } from './config';
import { CATEGORY_LABELS, PRODUCTS, type Product, type ProductCategory } from './data/products';
import { formatPrice, getLocalOrders } from './lib/orders';
import { LetteringConfigurator } from './components/LetteringConfigurator';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartCheckoutDialog } from './components/CartCheckoutDialog';
import { AdminDialog } from './components/AdminDialog';
import type { CartItem, Order } from './types';

export function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState<ProductCategory | 'alle'>('alle');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const [cartOpen, setCartOpen] = useState(false);
  const [cartInitialStep, setCartInitialStep] = useState<'cart' | 'checkout'>('cart');

  const [adminOpen, setAdminOpen] = useState(false);
  const [sellerUnlocked, setSellerUnlocked] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => getLocalOrders());
  const [priceMultiplier, setPriceMultiplier] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jps_3d_price_mult_v1');
      if (saved) {
        const num = Number(saved);
        if (Number.isFinite(num) && num >= 0.2 && num <= 3) return num;
      }
    } catch {
      // ignore
    }
    return SHOP_CONFIG.priceMultiplier;
  });

  const handlePriceMultiplierChange = (mult: number) => {
    setPriceMultiplier(mult);
    try {
      localStorage.setItem('jps_3d_price_mult_v1', String(mult));
    } catch {
      // ignore
    }
  };

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const addToCart = (newItem: CartItem, openCheckout = false) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.cartId === newItem.cartId);
      if (existing) {
        return prev.map((i) =>
          i.cartId === newItem.cartId ? { ...i, quantity: i.quantity + newItem.quantity } : i
        );
      }
      return [...prev, newItem];
    });

    if (openCheckout) {
      setCartInitialStep('checkout');
      setCartOpen(true);
    } else {
      setToast(`„${newItem.name}“ wurde in den Warenkorb gelegt.`);
    }
  };

  const updateCartQty = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.cartId === cartId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeCartItem = (cartId: string) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCategory = category === 'alle' || p.category === category;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.variants.some((v) => v.colorName.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="page-shell">
      {/* HEADER */}
      <header className="site-header">
        <div className="container header-inner">
          <a href="#top" className="brand-link">
            <span className="brand-mark" aria-hidden="true">
              3D
            </span>
            <span className="brand-text">
              <strong>{SHOP_CONFIG.brandName}</strong>
              <small>Studio &amp; Stand-Shop</small>
            </span>
          </a>

          <nav className="main-nav" aria-label="Hauptnavigation">
            <a href="#schriftzug">3D-Schriftzug</a>
            <a href="#produkte">Produkte ({PRODUCTS.length})</a>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className={`seller-btn ${sellerUnlocked ? 'is-unlocked' : ''}`}
              onClick={() => setAdminOpen(true)}
              title="Stand-Modus & Bestellübersicht (Verkäufer)"
            >
              {sellerUnlocked ? (
                <LockOpen size={16} aria-hidden="true" />
              ) : (
                <Lock size={16} aria-hidden="true" />
              )}
              <span className="hide-xs">Stand</span>
            </button>

            <button
              type="button"
              className="cart-trigger-btn"
              onClick={() => {
                setCartInitialStep('cart');
                setCartOpen(true);
              }}
              aria-label={`Warenkorb öffnen (${cartCount} Artikel)`}
            >
              <ShoppingBag size={18} aria-hidden="true" />
              <span>Warenkorb</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-content">
              <span className="hero-pill">{SHOP_CONFIG.standNotice}</span>
              <h1>
                Moderne 3D-Deko &amp; <em>dein eigener</em> Schriftzug.
              </h1>
              <p className="hero-lead">
                Alle Vasen, Organizer, Gadgets und personalisierten 3D-Schriftzüge werden mit viel
                Liebe zum Detail gedruckt — in deiner Wunschfarbe und direkt zu dir nach Hause
                geliefert oder am Stand mitgenommen.
              </p>

              <div className="hero-cta-row">
                <a href="#schriftzug" className="btn btn-primary btn-lg">
                  <Sparkles size={18} aria-hidden="true" /> Schriftzug gestalten
                </a>
                <a href="#produkte" className="btn btn-secondary btn-lg">
                  Alle Produkte ansehen
                </a>
              </div>

              <ul className="hero-trust-list">
                <li>
                  <Palette size={16} aria-hidden="true" /> 11 Wunschfarben verfügbar
                </li>
                <li>
                  <Banknote size={16} aria-hidden="true" /> PayPal oder Bar am Stand
                </li>
                <li>
                  <Truck size={16} aria-hidden="true" /> Versand oder Abholung
                </li>
              </ul>
            </div>

            <div className="hero-visual">
              <div className="hero-collage">
                <figure className="hero-img-main">
                  <img
                    src="/products/vase-toscana-bordeaux.jpg"
                    alt="3D-gedruckte Wellen-Vase Toscana in Bordeaux"
                    width={640}
                    height={760}
                    fetchPriority="high"
                  />
                </figure>
                <figure className="hero-img-sub top">
                  <img
                    src="/products/schrift-blessed-schwarz.jpg"
                    alt="Individueller 3D-Schriftzug blessed"
                    width={320}
                    height={320}
                  />
                </figure>
                <figure className="hero-img-sub bottom">
                  <img
                    src="/products/vase-noir-schwarz.jpg"
                    alt="Moderne Cutout-Vase Noir in Mattschwarz"
                    width={320}
                    height={320}
                  />
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* CUSTOM 3D LETTERING CONFIGURATOR */}
        <LetteringConfigurator priceMultiplier={priceMultiplier} onAddToCart={addToCart} />

        {/* PRODUCT CATALOG */}
        <section id="produkte" className="catalog-section" aria-labelledby="catalog-heading">
          <div className="container">
            <div className="section-header">
              <span className="eyebrow">Sortiment</span>
              <h2 id="catalog-heading">Unsere 3D-gedruckten Produkte</h2>
              <p className="section-subtitle">
                Tippe auf ein Produkt, um weitere Farben zu sehen oder deine individuelle
                Wunschfarbe auszuwählen.
              </p>
            </div>

            <div className="catalog-controls">
              <div className="category-pills" role="tablist" aria-label="Produktkategorien">
                {(Object.keys(CATEGORY_LABELS) as Array<ProductCategory | 'alle'>).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={category === cat}
                    className={`cat-pill ${category === cat ? 'is-active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              <div className="search-box">
                <Search size={16} aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suchen (z. B. Vase, Handyhalter, Rosa...)"
                  aria-label="Produkte durchsuchen"
                />
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="empty-state">
                <p>Keine Produkte für „{searchQuery}“ gefunden.</p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setCategory('alle');
                    setSearchQuery('');
                  }}
                >
                  Filter zurücksetzen
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priceMultiplier={priceMultiplier}
                    onOpenDetail={setActiveProduct}
                    onQuickAdd={(item) => addToCart(item, false)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <strong>{SHOP_CONFIG.brandName}</strong>
            <p>
              Individueller 3D-Druck auf Bestellung · PayPal:{' '}
              <span>{SHOP_CONFIG.paypalEmail}</span>
            </p>
          </div>
          <button type="button" className="footer-admin-link" onClick={() => setAdminOpen(true)}>
            <Lock size={14} aria-hidden="true" /> Verkäufer / Stand-Übersicht
          </button>
        </div>
      </footer>

      {/* STICKY MOBILE CART BAR */}
      {cartCount > 0 && (
        <div className="mobile-cart-bar">
          <button
            type="button"
            className="mobile-cart-btn"
            onClick={() => {
              setCartInitialStep('cart');
              setCartOpen(true);
            }}
          >
            <span className="mobile-cart-left">
              <ShoppingBag size={18} aria-hidden="true" />
              <strong>
                {cartCount} {cartCount === 1 ? 'Artikel' : 'Artikel'}
              </strong>
            </span>
            <span className="mobile-cart-right">
              {formatPrice(cartSubtotal)} · Zur Kasse →
            </span>
          </button>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="toast-banner" role="status" aria-live="polite">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{toast}</span>
        </div>
      )}

      {/* MODALS */}
      <ProductModal
        product={activeProduct}
        priceMultiplier={priceMultiplier}
        onClose={() => setActiveProduct(null)}
        onAddToCart={addToCart}
      />

      <CartCheckoutDialog
        open={cartOpen}
        initialStep={cartInitialStep}
        items={cart}
        sellerUnlocked={sellerUnlocked}
        onUnlockSeller={() => setSellerUnlocked(true)}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateCartQty}
        onRemoveItem={removeCartItem}
        onClearCart={() => setCart([])}
        onOrderCreated={(newOrder) => setOrders((prev) => [newOrder, ...prev])}
      />

      <AdminDialog
        open={adminOpen}
        unlocked={sellerUnlocked}
        onUnlock={() => setSellerUnlocked(true)}
        onClose={() => setAdminOpen(false)}
        orders={orders}
        onOrdersUpdated={setOrders}
        priceMultiplier={priceMultiplier}
        onPriceMultiplierChange={handlePriceMultiplierChange}
      />
    </div>
  );
}

export default App;
