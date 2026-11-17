const API_BASE_URL = "/api/channel3/v1";

async function request(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  const data = await response.json();

  if (!response.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.map((item) => item.msg).filter(Boolean).join(", ")
      : data.detail;
    throw new Error(detail || `Channel3 request failed (${response.status}).`);
  }

  return data;
}

export async function searchProducts({ query, minPrice, maxPrice, signal }) {
  const filters = {};

  if (minPrice !== undefined || maxPrice !== undefined) {
    filters.price = {};

    if (minPrice !== undefined) {
      filters.price.min_price = minPrice;
    }

    if (maxPrice !== undefined) {
      filters.price.max_price = maxPrice;
    }
  }

  const data = await request("/search", {
    method: "POST",
    body: {
      query,
      limit: 24,
      ...(Object.keys(filters).length > 0 ? { filters } : {}),
    },
    signal,
  });

  if (!Array.isArray(data.products)) {
    throw new Error("Channel3 returned an unexpected product response.");
  }

  return data.products;
}

export function getProduct(id, { signal } = {}) {
  return request(`/products/${encodeURIComponent(id)}`, { signal });
}

export function getProductImage(product) {
  const image =
    product.images?.find((item) => item.is_main_image) ?? product.images?.[0];
  return image?.cleaned_url || image?.url || "";
}

export function getProductBrand(product) {
  return product.brands?.map((brand) => brand.name).filter(Boolean).join(", ")
    || "Independent brand";
}

export function getBestOffer(product) {
  const offers = (product.offers ?? [])
    .filter((offer) => Number.isFinite(offer.price?.price))
    .sort((a, b) => a.price.price - b.price.price);

  return offers[0] ?? null;
}

export function formatPrice(price) {
  if (!Number.isFinite(price?.price)) {
    return "Price unavailable";
  }

  const currency = /^[A-Z]{3}$/.test(price.currency ?? "")
    ? price.currency
    : "USD";

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(price.price);
}
