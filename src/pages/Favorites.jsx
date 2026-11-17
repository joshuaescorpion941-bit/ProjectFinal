import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getProduct } from "../services/channel3API";
import { useFavorites } from "../context/useFavorites";

function Favorites() {
  const navigate = useNavigate();
  const {
    favorites,
    toggleFavorite,
    notificationCount,
    clearNotifications,
  } = useFavorites();
  const favoritesKey = favorites.join(",");
  const [result, setResult] = useState({
    key: "",
    products: [],
    loading: false,
    error: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    Promise.all(favorites.map((id) => getProduct(id, { signal: controller.signal })))
      .then((products) => setResult({ key: favoritesKey, products, loading: false, error: "" }))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setResult({
            key: favoritesKey,
            products: [],
            loading: false,
            error: requestError.message,
          });
        }
      });

    return () => controller.abort();
  }, [favorites, favoritesKey]);

  const isCurrentResult = result.key === favoritesKey;
  const products = isCurrentResult ? result.products : [];
  const loading = favorites.length > 0 && (!isCurrentResult || result.loading);
  const error = isCurrentResult ? result.error : "";

  return (
    <main className="favorites-page">
      <section className="catalog">
        <div className="catalog-heading">
          <div>
            <h2>Saved finds</h2>
            <p>Your favorite pieces, ready when you are.</p>
          </div>
          <span>{favorites.length} saved</span>
        </div>

        {notificationCount > 0 && (
          <div className="favorites-notification" role="status" aria-live="polite">
            <span>
              {notificationCount} notification{notificationCount === 1 ? "" : "s"}
            </span>
            <button type="button" onClick={clearNotifications}>
              Mark as read
            </button>
          </div>
        )}

        {loading && <p className="status-message">Loading your saved products...</p>}
        {error && <p className="status-message error-message" role="alert">{error}</p>}

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favorites.includes(String(product.id))}
              onToggleFavorite={toggleFavorite}
              onViewDetails={(id) => navigate(`/product/${encodeURIComponent(id)}`)}
            />
          ))}

          {!loading && !error && favorites.length === 0 && (
            <div className="no-results">
              <h3>Your list is waiting</h3>
              <p>Search apparel and tap the heart to save pieces here.</p>
              <button onClick={() => navigate("/")}>Explore apparel</button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Favorites;
