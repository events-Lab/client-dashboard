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
| `/orders` | Orders from the API for the signed-in customer |
| `/account` | Account details |
| `/login` | Sign-in (`customer@eventslab.com` / `customer123`) |

Catalog, orders, auth, and free-event join use the Events Lab API via RTK Query (`src/lib/api`, `NEXT_PUBLIC_API_URL` default `http://localhost:4000/api`). The cart stays in `localStorage` (`src/lib/commerce`) until checkout posts `POST /orders`. Start the backend before `npm run dev`.

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

## Deploy

Vercel builds this repository on its own. The builder does not have the sibling `shared-compoenents` checkout, so install vendors that package before `next build`.

`vercel.json` sets the install command to `bash scripts/vercel-install.sh`. When `VERCEL` is set, the script:

1. Clones the default branch of [shared-compoenents](https://github.com/events-Lab/shared-compoenents) into `vendor/shared-compoenents` (`git clone --depth 1`). The repository has to be public; the clone sends no token.
2. Rewrites `@events-lab/shared-components` from `file:../shared-compoenents` to `file:vendor/shared-compoenents`.
3. Runs `npm install --include=dev`.

Vercel then runs `next build`. `vendor/` is in `.gitignore` and exists only on the builder. Running the script on a laptop, with `VERCEL` unset, only runs `npm install` and leaves the sibling dependency as it is.

`next.config.ts` sets `outputFileTracingRoot` to this app when the sibling shared package is not on disk, so the production trace stays inside the deployment.

A shared UI change is not in this deployment until the app is built again. The clone reads the default branch at install time.

1. Push `shared-compoenents` when `src` there changed.
2. Push this repo. Vercel installs, clones that default branch, and builds production.
3. Push `admin-dashboard` the same way when that app should ship the same shared change. Each repo deploys only itself.
