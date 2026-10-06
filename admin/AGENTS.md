<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# admin — shop-admin dashboard

This app is part of the `monofrontend` workspace — **read `../AGENTS.md`
first** (workspace structure, the `shared/` package rules, and the coding
conventions this codebase follows). It's not optional context; the two
gotchas documented there (relative imports inside `shared/`, and Tailwind's
`@source` directive) have each caused a full debugging session when
forgotten.

This app depends on `@deep-ecommerce/shared` (see `../shared/AGENTS.md` for
what's in it and how to add to it) for UI primitives, the Table kit, API
fetch helpers, and cross-cutting types. `common/` here stays admin-specific —
domain composition (`ProductTable`, `CategoryDropdown`, `ProductForm`,
permission checks via `useAuth`/`canInShop`) that isn't portable to the
customer-facing `frontend` app as-is.

## Homepage layout — `/banners`

`app/(dashboard)/banners` + `common/home/` manage the storefront homepage
(backend: `/home-section/*`, `/banner/*`, permission `homepage:manage`).
`HomeLayoutManager` lists sections (drag to reorder, switch to hide),
`SectionForm` edits per-type settings (`homeMeta.ts` decides which fields
each type shows), `BannerManager`/`BannerForm` manage a section's banners
(image + rich text + link, drag to reorder). Two backend conventions to
remember: sections use plain **JSON bodies** (no file) where an omitted key
means "leave unchanged" and `null` clears an optional field; banners are
**multipart** (they upload an image). FastAPI drops an empty form string as
"not sent", so to clear a banner's text/link/alt on update the form sends a
single space, which the backend trims to empty.

Banner `background` is a plain CSS string (a `#rrggbb` or a two-stop
`linear-gradient(...)`) edited with the shared `GradientPicker`
(`shared/components/cui/`, helpers in `shared/lib/gradient.ts`). The backend
accepts only those two exact shapes (it ends up in an inline style on the
storefront). No background → the storefront uses the theme's `bg-card`;
text colour on a custom background is picked automatically (white/dark) from
the colours' luminance.
