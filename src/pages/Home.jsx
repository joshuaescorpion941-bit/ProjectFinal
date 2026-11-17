import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { searchProducts } from "../services/channel3API";
import { useFavorites } from "../context/useFavorites";

const styleCategories = [
  "All apparel",
  "Tops",
  "Dresses",
  "Outerwear",
  "Pants",
  "Shoes",
  "Bags",
  "Accessories",
];
const styleSuggestions = [
  "Linen shirts",
  "Relaxed denim",
  "Everyday dresses",
  "Lightweight layers",
  "Classic sneakers",
];

function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All apparel");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("relevance");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { favorites, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const sortedProducts = useMemo(() => {
    const results = [...products];

    if (sort === "price-low" || sort === "price-high") {
      results.sort((a, b) => {
        const priceA = a.offers?.reduce(
          (best, offer) => Math.min(best, offer.price?.price ?? Infinity),
          Infinity,
        ) ?? Infinity;
        const priceB = b.offers?.reduce(
          (best, offer) => Math.min(best, offer.price?.price ?? Infinity),
          Infinity,
        ) ?? Infinity;

        return sort === "price-low" ? priceA - priceB : priceB - priceA;
      });
    } else if (sort === "title") {
      results.sort((a, b) => a.title.localeCompare(b.title));
    }

    return results;
  }, [products, sort]);

  async function runSearch(searchText = query, searchCategory = category) {
    const minimum = minPrice === "" ? undefined : Number(minPrice);
    const maximum = maxPrice === "" ? undefined : Number(maxPrice);

    if (
      (minimum !== undefined && (!Number.isFinite(minimum) || minimum < 0)) ||
      (maximum !== undefined && (!Number.isFinite(maximum) || maximum < 0))
    ) {
      setError("Enter valid non-negative prices.");
      return;
    }

    if (minimum !== undefined && maximum !== undefined && minimum > maximum) {
      setError("Minimum price must be less than or equal to maximum price.");
      return;
    }

    const terms = [
      searchCategory === "All apparel" ? "clothing" : searchCategory,
      searchText.trim(),
    ].filter(Boolean);

    setLoading(true);
    setError("");

    try {
      setProducts(await searchProducts({
        query: terms.join(" "),
        minPrice: minimum,
        maxPrice: maximum,
      }));
      setHasSearched(true);
    } catch (requestError) {
      setError(requestError.message);
      setProducts([]);
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    return runSearch();
  }

  function handleSuggestion(suggestion) {
    setQuery(suggestion);
    setCategory("All apparel");
    void runSearch(suggestion, "All apparel");
  }

  return (
    <main className="home-page">
      <section className="hero">
        <p className="hero-label">A BETTER WAY TO FIND YOUR FIT</p>
        <h1>Wear what feels <span>you.</span></h1>
        <p>
          Explore clothing and accessories from brands and retailers across
          the web. Compare prices, save favorites, and find your next look.
        </p>
      </section>

      <section className="catalog">
        <div className="catalog-heading">
          <div>
            <h2>Find your next favorite</h2>
            <p>Search apparel from Channel3&apos;s live product catalog.</p>
          </div>
          {hasSearched && <span>{products.length} products</span>}
        </div>

        <form className="filters" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search linen shirt, denim jacket, sneakers..."
            aria-label="Search apparel"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            aria-label="Apparel category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {styleCategories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Min price"
            aria-label="Minimum price"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Max price"
            aria-label="Maximum price"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
          <button className="details-button search-button" type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <p className="status-message error-message" role="alert">{error}</p>}

        {hasSearched && products.length > 0 && (
          <div className="results-toolbar">
            <p>Showing {sortedProducts.length} finds</p>
            <label>
              Sort by
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="title">Name</option>
              </select>
            </label>
          </div>
        )}

        <div className="product-grid">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favorites.includes(String(product.id))}
              onToggleFavorite={toggleFavorite}
              onViewDetails={(id) => navigate(`/product/${encodeURIComponent(id)}`)}
            />
          ))}

          {!loading && hasSearched && products.length === 0 && !error && (
            <div className="no-results">
              <h3>No products found</h3>
              <p>Try a different search or adjust your filters.</p>
            </div>
          )}

          {!loading && !hasSearched && !error && (
            <div className="no-results search-prompt">
              <h3>Style ideas to get you started</h3>
              <p>Pick a suggestion, or search for any piece, color, or brand.</p>
              <div className="suggestion-list">
                {styleSuggestions.map((suggestion) => (
                  <button
                    className="suggestion-chip"
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Home;
