import { useEffect, useRef, useState } from 'react';
import { X, ShoppingBag, Zap, Minus, Plus } from 'lucide-react';
import { applyPriceMultiplier, FILAMENT_COLORS } from '../config';
import { formatPrice } from '../lib/orders';
import { attachDialogLightDismissFallback } from '../lib/dialogUtils';
import type { Product } from '../data/products';
import type { CartItem } from '../types';

interface ProductModalProps {
  product: Product | null;
  priceMultiplier: number;
  onClose: () => void;
  onAddToCart: (item: CartItem, openCheckout?: boolean) => void;
}

export function ProductModal({ product, priceMultiplier, onClose, onAddToCart }: ProductModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [variantIndex, setVariantIndex] = useState(0);
  const [customColorName, setCustomColorName] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (product) {
      setVariantIndex(0);
      setCustomColorName(product.variants[0]?.colorName ?? 'Cremeweiß');
      setQuantity(1);
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [product]);

  useEffect(() => {
    return attachDialogLightDismissFallback(dialogRef.current);
  }, []);

  const handleNativeClose = () => {
    if (dialogRef.current) {
      dialogRef.current.returnValue = '';
    }
    onClose();
  };

  const activeVariant = product?.variants[variantIndex] ?? product?.variants[0];
  const effectivePrice = product ? applyPriceMultiplier(product.price, priceMultiplier) : 0;

  const handleConfirm = (openCheckout: boolean) => {
    if (!product || !activeVariant) return;
    const chosenColor = customColorName || activeVariant.colorName;

    onAddToCart(
      {
        cartId: `${product.id}-${chosenColor}`,
        productId: product.id,
        name: product.name,
        price: effectivePrice,
        quantity,
        image: activeVariant.image,
        colorName: chosenColor,
      },
      openCheckout
    );
    dialogRef.current?.close();
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal-dialog product-modal"
      aria-labelledby="product-modal-title"
      onClose={handleNativeClose}
      {...({ closedby: 'any' } as Record<string, string>)}
    >
      {product && activeVariant && (
        <div className="product-modal-inner">
          <button
            type="button"
            className="modal-close-btn"
            aria-label="Produktdetails schließen"
            onClick={() => dialogRef.current?.close()}
          >
            <X size={20} aria-hidden="true" />
          </button>

          <div className="product-modal-media">
            <img
              src={activeVariant.image}
              alt={`${product.name} in ${activeVariant.colorName}`}
              width={600}
              height={600}
            />
            {product.variants.length > 1 && (
              <div className="modal-thumbs">
                {product.variants.map((v, idx) => (
                  <button
                    key={v.image}
                    type="button"
                    className={`modal-thumb-btn ${idx === variantIndex ? 'is-active' : ''}`}
                    onClick={() => {
                      setVariantIndex(idx);
                      setCustomColorName(v.colorName);
                    }}
                  >
                    <img src={v.image} alt={v.colorName} width={72} height={72} />
                    <span>{v.colorName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-modal-body">
            {product.badge && <span className="product-badge">{product.badge}</span>}
            <h2 id="product-modal-title">{product.name}</h2>
            <div className="modal-price">{formatPrice(effectivePrice)}</div>
            <p className="modal-desc">{product.description}</p>

            <div className="config-group">
              <span className="config-label">
                Wunschfarbe: <strong>{customColorName}</strong>
              </span>
              <p className="field-note">
                Alle Produkte drucken wir auch gerne in deiner persönlichen Wunschfarbe:
              </p>
              <div className="color-swatches">
                {FILAMENT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    title={color.name}
                    aria-label={`Farbe ${color.name}`}
                    aria-pressed={customColorName === color.name}
                    className={`color-swatch ${customColorName === color.name ? 'is-selected' : ''}`}
                    style={{
                      backgroundColor: color.hex,
                      borderColor: color.border || 'transparent',
                    }}
                    onClick={() => setCustomColorName(color.name)}
                  />
                ))}
              </div>
            </div>

            <div className="config-group">
              <span className="config-label">Menge</span>
              <div className="qty-stepper">
                <button
                  type="button"
                  aria-label="Menge verringern"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus size={16} aria-hidden="true" />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  aria-label="Menge erhöhen"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleConfirm(false)}
              >
                <ShoppingBag size={18} aria-hidden="true" /> In den Warenkorb
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleConfirm(true)}
              >
                <Zap size={18} aria-hidden="true" /> Direkt bestellen
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
