# ThreadScope

ThreadScope is a React single-page apparel discovery app powered by the
[Channel3 product API](https://channel3.ai/docs). Search clothing and
accessories, compare retailer offers, inspect product details, sort and filter
results, and save favorites.

## Features

- Search a live product catalog by clothing style, brand, or item.
- Focus searches by apparel category and filter by minimum/maximum price.
- Sort results by relevance, price, or product name.
- Open product details, compare retailer availability, and follow shop links.
- Save and remove favorites; saved product IDs persist in the browser.
- Navigate between search, product detail, and saved-find views.

## Routes

- `/` — apparel search
- `/product/:id` — product details and retailer offers
- `/favorites` — saved products

## Run locally

1. Add `CHANNEL3_API_KEY=your_api_key` to `.env.local` (or copy the variable
   name from `.env.example`).
2. Restart the Vite dev server after changing the key.
3. Run `npm run dev`.

The Vite dev/preview server proxies Channel3 requests and adds the API key
server-side. Do not use a `VITE_` prefix or commit `.env.local`. For production
hosting, configure an equivalent server-side proxy with `CHANNEL3_API_KEY`.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run lint` — run ESLint

## Team workflow

Use feature branches and pull requests; do not commit directly to `main`.
Use descriptive Conventional Commit messages such as `feat: add apparel search`
or `fix: handle missing product images`.
