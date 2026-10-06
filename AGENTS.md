# monofrontend — workspace root

npm workspace monorepo wrapping two independently-deployed Next.js apps that
share a backend and a chunk of reusable code:

```
monofrontend/
├── package.json          workspace root — "workspaces": ["admin", "frontend", "shared"]
├── admin/                shop-admin dashboard (Next.js) — the older, larger app
├── frontend/             customer-facing storefront (Next.js) — newer, being built out
└── shared/                reusable package both apps depend on — see shared/AGENTS.md
```

The FastAPI/Python backend lives one level up at `../backend`, **outside**
this JS workspace entirely — nothing here concerns it.

`admin` and `frontend` are still fully independent Next.js apps: separate
`package.json`, separate build, separate deploy target. The workspace only
changes *where shared source lives* and *how it's imported* — it does not
merge the two apps into one build.

## Install / run

Always run `npm install` from **this root**, never from inside `admin/` or
`frontend/` individually — npm workspaces hoists dependencies to one root
`node_modules` (per-app `node_modules` only appears if that app pins a
version that conflicts with the hoisted one).

```bash
npm install                          # from monofrontend/
npm run dev:admin                    # or: cd admin && npm run dev
npm run dev:frontend
npm run build:admin
```

## `shared/` — read `shared/AGENTS.md` before touching it

Both apps depend on it as `@deep-ecommerce/shared` (workspace-linked, not
published — `npm ls @deep-ecommerce/shared --workspaces` should show it
`deduped -> ./shared` under both apps). Each app also maps it explicitly in
`tsconfig.json`:

```json
"paths": {
  "@/*": ["./*"],
  "@deep-ecommerce/shared/*": ["../shared/*"]
}
```

Two non-obvious things WILL break silently if forgotten — both cost a long
debugging session to find the first time, so they're written down here
instead of just in git history:

1. **Every import inside `shared/` must be a relative path (`../../lib/utils`),
   never `@/lib/utils`.** `shared` has no bundler of its own — its code gets
   compiled by whichever app imports it, via that app's Next config
   (`transpilePackages: ["@deep-ecommerce/shared"]`). That app's webpack/
   Turbopack only knows *its own* tsconfig `paths`, not a nested package's,
   so a `@/`-style import inside `shared/` would silently resolve against
   the wrong project root (or not resolve at all).

2. **Every app's `app/globals.css` needs `@source "../../shared";`** (Tailwind
   v4 directive). Tailwind only scans source files inside the current app's
   own folder for class names to compile — it never looks into a sibling
   workspace package on its own. Without this, components in `shared/`
   render with zero Tailwind styling: no crash, no build error, nothing in
   any log — utility classes are just silently absent from the compiled CSS.
   The tell, if this regresses: accessibility-only text like `sr-only`
   labels ("Toggle Sidebar", "Toggle theme") showing up as *visible* text
   next to icons instead of being invisible — that's `.sr-only` itself never
   having been generated.

If either of these seems to be the problem again: check the compiled CSS
directly (`grep sr-only .next/static/chunks/*.css` after a fresh
`next build`) rather than trusting `tsc`/`next build` exit codes alone —
both of those stay green even when Tailwind silently drops classes; only the
actual generated CSS tells you the truth.

## `components/` vs `common/` — the reuse boundary

- `shared/components/{ui,cui}` — portable UI assets with **zero app-domain
  knowledge**. A button, a table primitive, a native-select — things you'd
  paste into any project. If a component imports auth context, permissions,
  or knows about "products"/"shops"/"orders" as concepts, it does not belong
  here.
- `admin/common/` and (eventually) `frontend/common/` — stay **per-app**.
  This is where domain composition happens: `ProductTable`, `CategoryDropdown`,
  `ProductForm` all know about admin's shop/permission model and are not
  portable as-is, even though they're built out of `shared/components`.

When in doubt: "would this make sense in a customer storefront with zero
changes?" — yes → `shared/`. No → stays in that app's `common/`.

## Conventions this codebase already follows (apply these without being asked)

- **Sync prop → state without an effect**: when a component needs to reset
  local state whenever a prop changes reference (e.g. server refetch), do it
  during render, not in a `useEffect` + `setState`:
  ```tsx
  const [prevX, setPrevX] = useState(x);
  const [state, setState] = useState(x);
  if (x !== prevX) { setPrevX(x); setState(x); }
  ```
  This repo treats calling `setState` synchronously inside a `useEffect` body
  as a lint error (`react-hooks/set-state-in-effect`) — use the render-time
  adjustment pattern instead. Used throughout: `ProductTable`,
  `CategoryDropdown`, `OrderItemTable`, `SheetContent`'s width-reset logic.
- **Permission strings** follow `resource:action` (`product:create`,
  `order:update`, `category:delete`, `shop:*` for shop-admin-everything).
  Defined in the backend's `ShopPermissionEnum`/`SitePermissionEnum`; the
  frontend's `hasShopPermission`/`canInShop` mirror the same check for UI
  purposes only — the backend re-checks everything, the frontend check is
  just to avoid flashing controls a user can't use.
- **Backend response envelope** is always `{success, detail, data, total?}`
  (`src/api/core/response.py::api_response`). `listRecords()` uses this for
  every list endpoint; zero matching rows is a **valid** result (`data: []`,
  `total: 0`), not an error — don't reintroduce a "no results = 400" check.
- **Don't let a fetch error replace a whole page/component.** Pass the error
  down as a prop and show it as an inline banner (see `ProductTable`'s
  `loadError`/`error` state, cleared automatically on the next successful
  mutation) — keep the surrounding UI (create button, table shell) usable
  even when the initial load failed.
- **Empty state vs error state are different things.** A table with zero
  rows should show a plain "No X found" message via the shared `Table`'s
  `emptyState` prop — never conflate "genuinely empty" with "failed to load."
