import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  formatPrice,
  getProduct,
  getProductBrand,
  getProductImage,
} from "../services/channel3API";
import { useFavorites } from "../context/useFavorites";

function ProductPortrait({ product }) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getProductImage(product);

  return (
    <div className="details-image">
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={product.images?.[0]?.alt_text || product.title}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="image-placeholder">Product image unavailable</div>
      )}
    </div>
  );
}

function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const [profile, setProfile] = useState({
    id: "",
    product: null,
    loading: true,
    error: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    getProduct(id, { signal: controller.signal })
      .then((product) => setProfile({ id, product, loading: false, error: "" }))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setProfile({ id, product: null, loading: false, error: requestError.message });
        }
      });

    return () => controller.abort();
  }, [id]);

  const loading = profile.id !== id || profile.loading;
  const product = profile.id === id ? profile.product : null;
  const error = profile.id === id ? profile.error : "";

  if (loading) {
    return <main className="details-page"><p className="status-message">Loading product details...</p></main>;
  }

  if (error || !product) {
    return (
      <main className="details-page">
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
        <div className="no-results">
          <h2>Product unavailable</h2>
          <p>{error || "This product could not be found."}</p>
          <button onClick={() => navigate("/")}>Search apparel</button>
        </div>
      </main>
    );
  }

  const isFavorite = favorites.includes(String(product.id));
  const colors = (product.colors ?? [])
    .map((color) => typeof color === "string" ? color : color.name || color.hex)
    .filter(Boolean)
    .join(", ");

  return (
    <main className="details-page">
      <button className="back-button" onClick={() => navigate(-1)}>← Back to search</button>

      <div className="details-container">
        <ProductPortrait key={product.id} product={product} />

        <section className="details-info">
          <p className="product-category">{product.category?.title || "Apparel"}</p>
          <p className="product-brand">{getProductBrand(product)}</p>
          <h1>{product.title}</h1>
          <p className="product-description">
            {product.description || "Product details are provided by the retailer."}
          </p>

          <div className="detail-specs">
            <div className="detail-spec">
              <span className="label">Category</span>
              <strong>{product.category?.title || "Apparel"}</strong>
            </div>
            <div className="detail-spec">
              <span className="label">For</span>
              <strong>{product.gender || product.age || "Everyone"}</strong>
            </div>
            <div className="detail-spec">
              <span className="label">Material</span>
              <strong>{product.materials?.join(", ") || "Not specified"}</strong>
            </div>
            <div className="detail-spec">
              <span className="label">Color</span>
              <strong>{colors || "See product options"}</strong>
            </div>
          </div>

          <h2 className="offers-heading">Shop this find</h2>
          <div className="offer-list">
            {product.offers?.length ? product.offers.map((offer, index) => (
              <div className="offer-card" key={`${offer.domain}-${index}`}>
                <div>
                  <strong>{offer.domain}</strong>
                  <p>{offer.availability || "Availability varies"}</p>
                </div>
                <div className="offer-action">
                  <strong>{formatPrice(offer.price)}</strong>
                  <a
                    className="buy-link"
                    href={offer.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Shop
                  </a>
                </div>
              </div>
            )) : (
              <div className="offer-card">
                <div>
                  <strong>No retailer offers available</strong>
                  <p>Check back later for current availability.</p>
                </div>
              </div>
            )}
          </div>

          {product.key_features?.length > 0 && (
            <ul className="product-features">
              {product.key_features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          )}

          <button
            className="favorite-button detail-favorite"
            type="button"
            onClick={() => toggleFavorite(product.id)}
            aria-pressed={isFavorite}
          >
            {isFavorite ? "♥ Remove from Favorites" : "♡ Save to Favorites"}
          </button>
        </section>
      </div>
    </main>
  );
}

export default Details;
