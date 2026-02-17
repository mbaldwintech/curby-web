# Web App Changes

## Task #10: Error Boundaries and Security Headers

### Error Boundaries (Phase 0.2)

Added Next.js App Router error boundary and not-found pages at two levels:

- **Root level** (`src/app/error.tsx`, `src/app/not-found.tsx`): Catch-all for the entire app. Uses plain HTML/Tailwind styling since they sit outside the admin layout.
- **Admin level** (`src/app/admin/(protected)/error.tsx`, `src/app/admin/(protected)/not-found.tsx`): Admin-specific error handling within the sidebar layout. Uses existing `Button` component from `@core/components` and shows error digest IDs for debugging.

### Security Headers (Phase 0.3)

Added security headers via `next.config.ts` `headers()` function, applied to all routes:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` - Forces HTTPS
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` - Restricts browser APIs

**Files added:**

- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/admin/(protected)/error.tsx`
- `src/app/admin/(protected)/not-found.tsx`

**Files modified:**

- `next.config.ts`

## Task #11: SEO Foundations

### Route Handlers (Phase 0.4)

- `src/app/robots.ts`: Allows crawlers on public pages, disallows `/admin/` and `/api/`
- `src/app/sitemap.ts`: Lists landing page, privacy policy, and terms pages with change frequencies

### Metadata & JSON-LD (Phase 1.16)

- Updated root layout with `metadataBase` (`https://getcurby.app`) and title template `%s | Curby`
- Added page-specific metadata to landing page with canonical URL
- Added JSON-LD structured data on landing page: Organization schema + SoftwareApplication schema
- Updated legal page titles to use the template system (e.g., "Privacy Policy | Curby")

**Files added:**

- `src/app/robots.ts`
- `src/app/sitemap.ts`

**Files modified:**

- `src/app/layout.tsx`
- `src/app/(public)/page.tsx`
- `src/app/(public)/legal/privacy/page.tsx`
- `src/app/(public)/legal/terms/page.tsx`

## Task #12: Break Up God Components

### Profile Details Split (Phase 0.1)

Refactored `profile-details.component.tsx` (1,456 lines) by extracting tab content into 3 dedicated components. Consolidated the original 4 tabs (User Data, Activity, Moderation, System) into 3 by merging System into Moderation.

- `profile-items-tab.component.tsx`: Devices, Items, and Saved Items tables
- `profile-activity-tab.component.tsx`: False Takings, Events, Curby Coins, Notifications, Submitted Reports
- `profile-moderation-tab.component.tsx`: Reported Items, Item Reviews, User Reviews, Tutorial Views, T&C/Privacy Acceptances, Feedback

Main file reduced from 1,456 to ~885 lines.

### Data Table Split (Phase 0.1)

Refactored `data-table.tsx` (1,569 lines) into 7 focused modules:

- `data-table-types.ts`: All type definitions (CustomColumnDef, DataTableProps, DataTableRef, RowMenuItem, etc.)
- `data-table-filters.tsx`: Filter component factories (paged-autocomplete and distinct filters)
- `data-table-row.tsx`: Row components (DraggableRow, ActionsCell, ExpandIconButton, TruncatedCellContent, getAlignment)
- `data-table-column-header.tsx`: DraggableColumnHeader with drag-and-drop support
- `data-table-toolbar.tsx`: DataTableToolbar (search, column visibility, filter reset, refresh)
- `data-table-pagination.tsx`: DataTablePagination component
- `data-table.tsx`: Core table logic, state management, column building, and composition (~889 lines)

All exports are re-exported through `data-table.tsx` for full backward compatibility via the barrel export.

**Files added:**

- `src/features/users/components/profile-items-tab.component.tsx`
- `src/features/users/components/profile-activity-tab.component.tsx`
- `src/features/users/components/profile-moderation-tab.component.tsx`
- `src/core/components/base/data-table-types.ts`
- `src/core/components/base/data-table-filters.tsx`
- `src/core/components/base/data-table-row.tsx`
- `src/core/components/base/data-table-column-header.tsx`
- `src/core/components/base/data-table-toolbar.tsx`
- `src/core/components/base/data-table-pagination.tsx`

**Files modified:**

- `src/features/users/components/profile-details.component.tsx`
- `src/features/users/components/index.ts`
- `src/core/components/base/data-table.tsx`

## Task #13: Web Performance — Server Components and Code Splitting

### Server Component Conversion (Phase 1.11)

Converted the public layout from a fully client-side component to a server component with a client island:

- Extracted scroll-tracking header into `StickyHeader` client component (`src/app/(public)/sticky-header.tsx`)
- Made `layout.tsx` a server component (removed `'use client'` directive)
- Footer renders server-side with client component islands (LogoHorizontal, ThemeToggle)

### Code Splitting (Phase 1.12)

- Lazy-loaded recharts in the moderation dashboard via `next/dynamic` with `ssr: false`
- Extracted `ModerationTrendsChart` component to isolate the recharts dependency
- Added `loading.tsx` skeleton at `src/app/admin/(protected)/` for route transitions
- LeafletMap already uses internal dynamic imports — no changes needed

**Files added:**

- `src/app/(public)/sticky-header.tsx`
- `src/app/admin/(protected)/loading.tsx`
- `src/app/admin/(protected)/moderation/moderation-trends-chart.tsx`

**Files modified:**

- `src/app/(public)/layout.tsx`
- `src/app/admin/(protected)/moderation/page.tsx`

## Task #14: Web Code Quality

### Sentry Setup (Phase 1.10)

- Installed `@sentry/nextjs`
- Created `sentry.client.config.ts` (with replay sampling) and `sentry.server.config.ts`
- Wrapped `next.config.ts` with `withSentryConfig` (org: curby-llc, project: curby-web)
- Uses `NEXT_PUBLIC_SENTRY_DSN` env var (placeholder — set before deploying)

### Icon Consolidation (Phase 1.14)

Standardized on `lucide-react` as the sole icon library for data-table and core components:

- Replaced all `@tabler/icons-react` imports in 5 files (data-table.tsx, data-table-row.tsx, data-table-toolbar.tsx, data-table-pagination.tsx, drag-handle.tsx)
- Replaced all `react-icons` imports in `icon.component.tsx` with `lucide-react` equivalents
- Removed `@tabler/icons-react` from dependencies
- Note: `react-icons` still used in 3 broadcast components (app-preview, broadcast-editor, broadcast-media) — full removal deferred

### Dependency Cleanup (Phase 1.15)

- Removed `react-hot-toast` from package.json (0 imports; codebase uses `sonner`)

### React Query Configuration (Phase 1.1-web)

Configured `QueryClient` defaults in `app-providers.component.tsx`:

- `staleTime: 5 * 60_000` (5 minutes)
- `retry: 1`
- `refetchOnWindowFocus: false`

### Structured Logger (Phase 1.13-web)

Created `src/core/utils/logger.util.ts`:

- `createLogger(context)` factory returning `debug`, `info`, `warn`, `error` methods
- Structured format: `[LEVEL] [Context] message`
- Environment-aware: debug/info suppressed in production
- Exported via barrel at `@core/utils`
- Note: 227 console statements remain across 78 files — migration is a follow-up task

**Files added:**

- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `src/core/utils/logger.util.ts`

**Files modified:**

- `next.config.ts`
- `package.json` (removed react-hot-toast, @tabler/icons-react; added @sentry/nextjs)
- `src/core/components/base/data-table.tsx`
- `src/core/components/base/data-table-row.tsx`
- `src/core/components/base/data-table-toolbar.tsx`
- `src/core/components/base/data-table-pagination.tsx`
- `src/core/components/base/drag-handle.tsx`
- `src/core/components/icon.component.tsx`
- `src/core/providers/app-providers.component.tsx`
- `src/core/utils/index.ts`

## Task #15: Testing Infrastructure for Web

### Vitest Setup (Phase 1.20-web)

- Installed `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@vitejs/plugin-react`
- Created `vitest.config.ts` with path aliases matching `tsconfig.json` and jsdom environment
- Created `vitest.setup.ts` with jest-dom matchers
- Added `test` and `test:watch` scripts to `package.json`
- Wrote first test file: `logger.util.test.ts` (5 tests — all passing)

**Files added:**

- `vitest.config.ts`
- `vitest.setup.ts`
- `src/core/utils/logger.util.test.ts`

**Files modified:**

- `package.json` (added test scripts and dev dependencies)
