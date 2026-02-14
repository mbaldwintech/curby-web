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
