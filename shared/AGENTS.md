# @deep-ecommerce/shared

Reusable, **domain-agnostic** code shared between `admin` and `frontend`.
Consumed as a workspace package (`@deep-ecommerce/shared`), not published —
see the root `AGENTS.md` for the workspace-level rules (relative imports
only, `@source` in each app's `globals.css`). This file is the local
contributor guide for working inside `shared/` itself.

## What's here

```
shared/
├── components/
│   ├── ui/           shadcn/ui primitives — button, input, dialog, sheet,
│   │                 native-select, card, sidebar, tooltip, ...
│   └── cui/           generic composed components — the Table kit (index.tsx
│                       + context/main/filters/headerAction), Icon,
│                       SortableList, DropdownList, ImagesField,
│                       AttributesField, InputDatePicker, drawer/, themeToggle/
├── hooks/              useIsMobile, useClickOutside, useDivDimensions, FullScreenDom
├── providers/
│   ├── theme/          light/dark + color/radius theme context (cookie-backed)
│   └── LoaderContext   global loading spinner / badge-loading state
├── utility/helpers.tsx  date/currency formatting, misc pure helpers
├── lib/utils.ts         cn() — the only thing here, deliberately
├── api/
│   ├── server.ts        backendFetch / authorizedFetch(List) / ApiError — server-only
│   └── client.ts         fetching() — client-side fetch wrapper for /api/* routes
└── types/                cross-cutting types mirroring backend response shapes:
                           product_types, order_types, media_types, table_types,
                           common_types
```

**Deliberately NOT here** (stayed in `admin/`): `AppSidebar.tsx`,
`components/cui/auth/*` (UserMenu, AuthCard, PasswordInput — all know about
`useAuth`/session), `providers/auth/*`, `lib/list.ts` (array helpers only
`common/` needs), `types/auth_types.ts`, `types/dashboard_types.ts`. If you're
about to move one of these into `shared`, stop — check first whether it
actually has zero app-specific dependencies (see the audit method below).

## The one hard rule: relative imports only

Every file in `shared/` must import its neighbors with relative paths:

```ts
// ✅ correct
import { cn } from "../../lib/utils";
import useDivDimensions from "../../../../hooks/useDivDimensions";

// ❌ will silently break when consumed via transpilePackages
import { cn } from "@/lib/utils";
```

Why: `shared` has no build step of its own. Each consuming app compiles it
in-place via Next's `transpilePackages`, using *that app's own* webpack/
Turbopack config — which only knows that app's own tsconfig `paths`, not a
nested package's. A `@/` import inside `shared` would resolve against
whichever app happens to be building it (wrong, or not at all), rather than
against `shared`'s own root.

`shared/tsconfig.json` has no path aliases for this exact reason — don't add
any. If it type-checks with `@/`, that's `shared/tsconfig.json`'s own
(unused-at-runtime) resolution fooling you locally; it will still break at
build time in a consuming app.

## Adding a new shadcn/ui component

`npx shadcn@latest add <name>` has no concept of a shared workspace package —
it only knows how to target a real app (reads that app's `components.json`,
tailwind setup, `@/` alias). So there's no one-command way to add directly
into `shared/`. The workflow:

1. `cd admin && npx shadcn@latest add <name>` (or `frontend` — either works,
   they use the same design tokens) — lands in `admin/components/ui/<name>.tsx`
   with normal `@/...` imports.
2. Move it: `mv admin/components/ui/<name>.tsx shared/components/ui/`.
3. Rewrite its internal `@/...` imports to relative paths (see rule above).
4. Delete the now-stale import in whichever app file was going to use it
   pointing at `@/components/ui/<name>`, repoint to
   `@deep-ecommerce/shared/components/ui/<name>`.

If this becomes frequent, it's worth scripting step 3 (a small script that
walks a file and rewrites `@/X` → the correct relative path based on the
file's new location — this exact logic was used once already to migrate the
whole initial batch; ask for it to be turned into a checked-in script rather
than re-deriving it by hand each time).

## Auditing whether something is safe to move here

Before moving a file from an app into `shared/`, grep its transitive `@/`
dependencies and confirm every single one is either already in `shared/` or
about to move with it:

```bash
grep -rhoE '@/[a-zA-Z0-9_./-]+' path/to/candidate | sort -u
```

If anything resolves to `providers/auth`, `lib/list`, `common/`, or any
app-specific type (`auth_types`, `dashboard_types`), it's not portable as-is
— either it stays put, or that dependency needs its own audit first.
