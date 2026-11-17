import { useState } from "react";
import {
  formatPrice,
  getBestOffer,
  getProductBrand,
  getProductImage,
} from "../services/channel3API";

function ProductCard({ product, onViewDetails, isFavorite, onToggleFavorite }) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getProductImage(product);
  const bestOffer = getBestOffer(product);
  const category = product.category?.title || "Apparel";

  return (
    <article className="product-card">
      <div className="product-image">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={product.images?.[0]?.alt_text || product.title}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="image-placeholder">Product image unavailable</div>
        )}

        <button
          className="favorite-button"
          type="button"
          onClick={() => onToggleFavorite(product.id)}
          aria-label={isFavorite ? `Remove ${product.title} from favorites` : `Add ${product.title} to favorites`}
          aria-pressed={isFavorite}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-info">
        <p className="product-category">{category}</p>
        <p className="product-brand">{getProductBrand(product)}</p>
        <h3>{product.title}</h3>
        <p className="product-price">
          {bestOffer ? `From ${formatPrice(bestOffer.price)}` : "Price unavailable"}
        </p>
        <button
          className="details-button"
          type="button"
          onClick={() => onViewDetails(product.id)}
        >
          View product
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
