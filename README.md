# Client dashboard

Storefront for Events Lab clients. People browse the marketplace, open events and products, and check out. UI comes from [`@events-lab/shared-components`](https://github.com/events-Lab/shared-compoenents).

Runs at [http://localhost:3001](http://localhost:3001).

## Routes

| Path | What it does |
| --- | --- |
| `/` | Home: featured products, upcoming events, seats left |
| `/marketplace` | Search and filter products and events. `/shop` redirects here |
| `/marketplace/products/[id]` | Product detail |
| `/events`, `/events/[id]` | Event list and detail |
| `/cart` | Cart lines, quantities, promo |
| `/checkout` | Checkout, outside the storefront shell |
| `/orders` | Orders saved in this browser |
| `/account` | Account details |
| `/login` | Sign-in form |

Catalog data is mock data in `src/lib/catalog`. The cart and orders live in `localStorage` through `src/lib/commerce`. Free events join in place; paid events and products become cart lines.

The storefront shell is `StorefrontShell` from the shared package (`src/app/(dashboard)/layout.tsx`). Checkout uses its own layout.

## Events Lab layout

This app is one of three repositories in the [events-Lab](https://github.com/events-Lab) organization:

| Repository | Local folder | Role |
| --- | --- | --- |
| [shared-compoenents](https://github.com/events-Lab/shared-compoenents) | `shared-compoenents` | `@events-lab/shared-components` |
| [admin-dashboard](https://github.com/events-Lab/admin-dashboard) | `admin-dashboard` | operator app, port 3000 |
| [client-dashboard](https://github.com/events-Lab/client-dashboard) | `client-dashboard` | this app, port 3001 |

The parent `events-lab` folder is a local npm workspace. It is not a fourth GitHub repo. Clone the three repositories as siblings. The shared folder must stay spelled `shared-compoenents`; `package.json` points at `file:../shared-compoenents`.

```bash
mkdir events-lab && cd events-lab
git clone https://github.com/events-Lab/shared-compoenents.git
git clone https://github.com/events-Lab/admin-dashboard.git
git clone https://github.com/events-Lab/client-dashboard.git
```

Put this `package.json` in `events-lab`, then install from there so React is hoisted once and the shared package is linked:

```json
{
  "name": "events-lab",
  "private": true,
  "workspaces": [
    "shared-compoenents",
    "admin-dashboard",
    "client-dashboard"
  ],
  "scripts": {
    "dev:admin": "npm run dev -w admin-dashboard",
    "dev:client": "npm run dev -w client-dashboard",
    "build": "npm run build -w admin-dashboard && npm run build -w client-dashboard",
    "typecheck": "npm run typecheck -w @events-lab/shared-components"
  }
}
```

```bash
npm install
npm run dev:client
```

From this repo alone, after the sibling shared package is present: `npm run dev`, `npm run build`, `npm run lint`.

Next.js compiles the shared package via `transpilePackages` in `next.config.ts`. Theme tokens load from `@events-lab/shared-components/theme.css` in `src/app/globals.css`. Stack: Next.js 16, React 19, Tailwind CSS 4.
