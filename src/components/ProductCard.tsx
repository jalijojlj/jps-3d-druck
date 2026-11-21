import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { formatPrice } from '../lib/orders';
import type { Product } from '../data/products';
import type { CartItem } from '../types';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  onQuickAdd: (item: CartItem) => void;
}

export function ProductCard({ product, onOpenDetail, onQuickAdd }: ProductCardProps) {
  const [variantIdx, setVariantIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const variant = product.variants[variantIdx] ?? product.variants[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAdd({
      cartId: `${product.id}-${variant.colorName}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: variant.image,
      colorName: variant.colorName,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="product-card">
      <div
        className="product-card-media"
        role="button"
        tabIndex={0}
        onClick={() => onOpenDetail(product)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenDetail(product);
          }
        }}
        aria-label={`${product.name} Details ansehen`}
      >
        {product.badge && <span className="product-card-badge">{product.badge}</span>}
        <img
          src={variant.image}
          alt={`${product.name} in ${variant.colorName}`}
          width={420}
          height={420}
          loading="lazy"
        />
      </div>

      <div className="product-card-body">
        <div className="product-card-top">
          <h3 className="product-card-title">
            <button type="button" onClick={() => onOpenDetail(product)}>
              {product.name}
            </button>
          </h3>
          <span className="product-card-price">{formatPrice(product.price)}</span>
        </div>

        <p className="product-card-desc">{product.shortDescription}</p>

        <div className="product-card-footer">
          <div className="card-variants">
            {product.variants.map((v, idx) => (
              <button
                key={v.image}
                type="button"
                title={v.colorName}
                aria-label={`Variante ${v.colorName} anzeigen`}
                aria-pressed={idx === variantIdx}
                className={`mini-swatch ${idx === variantIdx ? 'is-active' : ''}`}
                style={{ backgroundColor: v.colorHex }}
                onClick={() => setVariantIdx(idx)}
              />
            ))}
            <span className="card-color-label">{variant.colorName}</span>
          </div>

          <button
            type="button"
            className={`quick-add-btn ${justAdded ? 'is-added' : ''}`}
            onClick={handleQuickAdd}
            aria-label={`${product.name} in den Warenkorb`}
          >
            {justAdded ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            <span>{justAdded ? 'Drin' : 'Warenkorb'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
