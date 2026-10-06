<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# frontend — customer-facing storefront

This app is part of the `monofrontend` workspace — **read `../AGENTS.md`
first** (workspace structure, the `shared/` package rules, and the coding
conventions this codebase follows). It's not optional context; the two
gotchas documented there (relative imports inside `shared/`, and Tailwind's
`@source` directive) have each caused a full debugging session when
forgotten.

This app reuses `@deep-ecommerce/shared` (see `../shared/AGENTS.md`) for UI
primitives, API fetch helpers, and cross-cutting types (`product_types`,
`order_types`, etc.) that already mirror the same backend `admin` talks to.
Domain composition (product listing, cart, checkout) lives in this app's own
`common/`, the same way `admin/common/` does it — don't assume anything
admin-specific (auth/shop/permissions model) carries over; this app's user
flow (customer, not shop-admin) is a different shape.

## What's here

```
app/
├── page.tsx                home
├── product/
│   ├── page.tsx             listing — filters/search/sort/pagination via URL searchParams
│   └── [id]/page.tsx        detail — gallery, variant picker, related products
├── cart/page.tsx            real backend cart, grouped by shop, item selection → checkout
├── checkout/page.tsx        order form (fallback full page)
├── login/page.tsx           auth modal (fallback full page)
├── account/page.tsx         profile + theme + logout (requires sign-in)
├── @modal/(.)checkout/      checkout as an intercepted parallel-route modal
├── @modal/(.)login/         auth as an intercepted parallel-route modal
└── api/[...slug]/route.ts   generic proxy — now attaches the customer access
                             token when present (added once real auth existed;
                             public product/category browsing never needed it)

providers/auth/              independent of admin's — own cookie names
                             (customer_access_token/customer_refresh_token),
                             same BFF/session shape as admin's (see below)

common/
├── auth/                    AuthModal (email OTP, login+register tabs),
│                            requestAuth.ts (module-level "open the login
│                            modal and resume this exact call after" bridge)
├── cart/CartProvider.tsx    backend-backed external store (useSyncExternalStore) —
│                            the API has NO guest cart at all, so this is a pure
│                            server mirror now, not localStorage
├── order/OrderForm.tsx      checkout form — address + place order
├── data/                    products.ts, categories.ts (server) +
│                            *.client.ts siblings (cart, address, user, order —
│                            browser-side, go through the /api proxy)
├── header/                  Header, CategoryMegaMenu (desktop), MobileCategoryModal, SearchBar
├── home/                    HomeSections (section-type → component registry),
│                            HeroBanner, FeaturedProducts, BannerRow, BannerCarousel, BannerItem
├── layout/SiteChrome.tsx    client wrapper holding the mobile-category-modal open state
│                            shared between Header and MobileBottomNav (siblings under the
│                            server RootLayout, which can't hold that state itself)
├── nav/MobileBottomNav.tsx  fixed bottom bar: Home / Categories / Cart / Account / WhatsApp
└── product/                 everything product-browsing: ProductCard/Grid/Gallery,
                             VariantSelector, ShopFilters, MobileFilterSheet,
                             CategoryFilterList, SortDropdown, Pagination — one folder,
                             not split across product/ and shop/, since shop listing and
                             product detail are the same domain
```

## Homepage — admin-controlled sections

`app/page.tsx` renders nothing itself: it fetches `GET /home-section/public`
(`common/data/home.ts`) and hands the ordered list to
`common/home/HomeSections.tsx`, which maps each section `type` (`hero`,
`carousel`, `banner_row`, `featured_products`, `product_list`) to a
component. Admin owns order, visibility and per-section settings (see
`admin/common/home/`). Adding a new kind = a value in the backend's
`HomeSectionType` + one `case` in `renderSection`; unknown types are skipped,
not crashed on. If the layout endpoint is *unreachable* the page falls back
to `DEFAULT_HOME_SECTIONS` — an admin-emptied layout is a valid result and
renders empty.

Banner sizing: a section's single `width`×`height` (px) only defines the
**aspect ratio** (plus a max-width); every banner stays `w-full`, so it's
fluid on every screen. `banner_row` shows `columns` per row on desktop but
at most 2 on phones. A banner's click action is a stretched `<Link>`
*sibling* of its rich text (not a wrapper), so rich text containing links
stays valid HTML. Banner rich text is admin-authored HTML rendered via
`dangerouslySetInnerHTML` (same trust level as product descriptions).

## Auth — email OTP only, no guest cart

The backend has **no password auth and no guest cart** for customers —
every cart/order call requires a signed-in session, and sign-in is
email + a 6-digit code (`register-otp/send|verify`, `login-otp/send|verify`
in the backend's `authRoute.py`; there's no dev bypass, a real code is
emailed). `providers/auth/` mirrors `admin/providers/auth/`'s shape exactly
(cookie-config module, server-only `session.ts` with a `cache()`-memoized
`getCurrentUser()`, a client `AuthProvider` seeded with the SSR-resolved
user) but is entirely independent — its own cookie names, no shared code,
per `shared/AGENTS.md`'s existing "auth stays app-local" rule.

The login/register UI is one component (`common/auth/AuthModal.tsx`) shown
either as an intercepted parallel-route modal (`app/@modal/(.)login/`,
matching admin's `@modal` convention) or a plain full page (`app/login/`)
for direct navigation/refresh. Any component can trigger it —
`requestAuth(router, onSuccess)` (`common/auth/requestAuth.ts`) pushes
`/login` and stashes a callback to resume once the OTP verifies; this is
the same module-level-singleton shape `LoaderContext.tsx` already uses, not
a new pattern. **Don't** have that stored callback re-invoke a memoized
function that itself checks `isAuthenticated` (e.g. `CartProvider`'s own
`addItem`) — it closes over that render's stale `false` and loops forever
re-opening the modal. Call the raw mutation directly instead (see
`CartProvider.addItem`'s comment).

## ⚠️ `/user/update` invalidates the current session — never call it mid-flow

The backend bumps `User.token_version` on every `PUT /user/update` and
calls `invalidate_user_session()`, which kills **both** the access and
refresh token immediately — and the `/refresh` endpoint can't recover from
this either, since it re-signs the token_version baked into the *old*
refresh token, not the DB's current value. Concretely: call `/user/update`,
and the very next authenticated request 401s with "Session expired."

This bit the checkout flow directly: `OrderForm` originally called
`/user/update` first (to fill in `full_name`/`phone`, which OTP
registration never collects) — but since that's true for essentially every
first-time customer, it broke checkout on the very next call. Fixed by
**never touching `/user/update` during checkout** — the shipping address's
own `person_name`/`phone` fields (`AddressDetail`) carry that contact info
into the order snapshot instead, with no session risk. The settings page
(`app/account/page.tsx`) is the one place that legitimately calls
`/user/update`, and it treats the resulting invalidation as an expected
outcome — it shows "Saved — please sign in again" and immediately calls
`requestAuth()`, rather than pretending the session survived.

## Cart &amp; checkout — real backend, not localStorage

`common/cart/CartProvider.tsx` is a `useSyncExternalStore`-based external
store (server mirror, refetches on sign-in/out) — see its own comments for
why a plain `useState`+`useEffect` would trip this repo's
`set-state-in-effect` lint rule the wrong way. A cart is keyed per
`(user, shop, status)` on the backend, so one customer can have several
active carts (marketplace model) — `useCart()` always exposes a *list* of
carts, never a single one, and `app/cart/page.tsx` groups items by shop.

Checkout (`common/order/OrderForm.tsx`) uses the backend's cart-mode order
creation (`POST /order/create` with `cart_item_ids`), which auto-cleans up
checked-out items server-side but requires the user to have a default
`UserAddress` first — the form upserts one from the entered shipping fields
before creating the order. Manual-mode order creation (raw `items` array +
inline address, no cart) also exists on the backend but isn't used here —
cart-mode needs no client-side cart cleanup and reuses the saved address
next time, which manual-mode doesn't.

The listing route is `/product`, not `/shop` — product detail already had to
live under `/product/[id]` (that's what the backend's `GET /product/read/{id}`
gives you), so the listing page joins it there too instead of splitting
"browse products" across two top-level route folders for no reason.

## Category filtering — two different mechanisms, on purpose

There are **two** distinct ways a category selection reaches the product
list, because they solve different problems:

1. **Precise, any-depth navigation** (mega menu, mobile category modal,
   product-page breadcrumb) — passes a single category id of *any* level via
   `?category=<id>`. `common/data/products.ts` resolves this through
   `GET /product/related-category/{id}`, which walks the exact subtree below
   that node server-side (`get_category_subtree_ids` in the backend). Click
   a leaf ("iPhones") → only that leaf. Click a root ("Hardware") → its
   whole subtree.

2. **The sidebar's flat, root-only, multi-select checkbox filter**
   (`CategoryFilterList` inside `ShopFilters`/`MobileFilterSheet`) —
   deliberately only lists **root** (level-1) categories, matching the
   reference design. Selecting several roots at once passes
   `?rootCategory=<id>,<id>,...`, resolved via
   `deepFilters=[["category.root_id", [id, id, ...]]]` on `/product/list`
   directly — **not** `category_id`. That matters: the backend rejects
   assigning a product to any non-leaf category at creation time
   (`create_product`: "Please select a sub-category... Parent categories are
   not allowed"), so `category_id` is *always* a leaf. `root_id` is the one
   field every leaf already carries that identifies "which top-level tree
   do I belong to" — that's what makes a root checkbox match its entire
   subtree in one query, and what makes multiple roots OR together in a
   single `deepFilters` call instead of needing N requests.

Applying the sidebar filter clears any `?category=` selection (and vice
versa via a fresh `Link`) — they're two different filters, not meant to
silently intersect.

`buildListQuery` (`shared/api/listQuery.ts`) is the one place that knows how
to encode either style into the backend's querystring format — reach for
`columnFilters` for a direct column on the queried model (e.g.
`is_active`), and `deepFilters` only when the filter actually crosses a
relation.

## Known gaps — deliberate, not overlooked

- **No star ratings anywhere.** There is no review/rating model in the
  backend at all — showing stars would be fabricated data.
- **Sort options are deliberately limited to `newest`/`price-asc`/`price-desc`.**
  Price sort does **not** go through the backend's generic sort mechanism
  (`resolve_column` + plain `.join()`) — that path has no de-duplication
  guard, and a join on `ProductVariant` for a product with more than one
  variant would return it once per variant, corrupting `total`.
  `productRoute.py`'s `_extract_price_sort` (backend-owned, not this app's
  code) intercepts a `sort=["price"|"min_price"|"max_price","asc"|"desc"]`
  request and orders by a correlated subquery instead of a join, so it
  can't fan out rows regardless of variant count. Any *other* column sort
  still goes through the generic path, so stick to real `Product` columns
  (`name`, `created_at`) there.
- **`NEXT_PUBLIC_WHATSAPP_NUMBER`** (read in `MobileBottomNav`) is a
  placeholder value — set the real number before shipping.
- **`ProductCard`'s image `src` is currently commented out on purpose** —
  not a bug, don't "fix" it back — images were disabled while working in a
  public/shared environment. Re-enable (`src={image}`) when that's no
  longer a concern.

## Loading states

- **Skeletons**: `shared/components/cui/loader/` — `CardSkeleton`,
  `HeaderSkeleton`, `SideMenuSkeleton`, `MenuSkeleton`, `DropdownSkeleton`,
  `BodySkeleton`. Each is a thin composition over the base
  `components/ui/skeleton.tsx` atom, takes `className` to size it like
  you'd size the real thing it stands in for (none of them force a fixed
  width/height that fights your layout), and a count/lines prop where
  repetition makes sense. Reach for one of these before hand-rolling
  another one-off `<Skeleton>` grid.
- **Infinite scroll**: `shared/hooks/useInfiniteScroll.ts` (plain
  IntersectionObserver-based "did this element scroll into view" hook, no
  package) + `shared/components/cui/InfiniteScroll.tsx` (wraps an
  already-rendered list, handles the load-more trigger and end-of-list
  message). Both are domain-agnostic — reusable for any paginated model, not
  just products. `common/product/ProductListClient.tsx` is the example
  usage: SSR renders page 1 (`app/product/page.tsx`), then
  `common/data/products.client.ts` fetches subsequent pages through the
  `/api/[...slug]` proxy as the user scrolls. `common/data/productQuery.ts`
  holds the actual filter → URL logic in one pure, isomorphic place so both
  the server fetch (`products.ts`) and the client fetch
  (`products.client.ts`) build the identical querystring without
  duplicating it — and so a client component can never accidentally pull
  `shared/api/server.ts` into the browser bundle by importing the wrong file.

## Shared package fix made to support this

`shared/api/client.ts`'s `fetching()` had a real bug: its own docstring
promised extra envelope fields ("e.g. `data`, `total`") pass through as
`res.<field>`, but the return statement never actually spread `payload` —
only `data`/`detail` came through. Infinite scroll needs `total` from a
client-side call to know when to stop, which is what surfaced it. Fixed by
spreading `...payload` into the returned object — benefits `admin` too, not
just this feature.

## Backend changes made to support this

`backend/src/api/routers/product/productRoute.py` got two fixes while
building this, both load-bearing for the storefront:

- `minPrice`/`maxPrice` query params on `/product/list` and
  `/product/related-category/{id}` — `Product.min_price`/`max_price` are
  Python `@property` values computed from variants after fetch, not real
  columns, so the generic `numberRange` filter can't reach them. Filters via
  an `EXISTS` subquery against `ProductVariant` instead.
- `searchFields` included `"sku"`, which doesn't exist on `Product` (it's on
  `ProductVariant`) — `getattr(Product, "sku")` raised `AttributeError` the
  moment anyone searched. Changed to the dotted path `"variants.sku"`.
