# Curby Web - Claude Code Instructions

## Project Overview

Curby Web is the **admin dashboard and public landing page** for Curby, a community-driven mobile marketplace for free curbside items. The web app provides admin/moderator tools for managing users, items, broadcasts, support tickets, and all platform content. Public-facing pages include the landing page and legal documents.

**Solo developer project** by Mike Baldwin. Curby LLC is being formed (Norfolk, VA).

## Repository Map

This repo (`curby-web`) is the **Next.js web app**. Related repos and resources:

| Repo/Resource | Path | Purpose |
|---|---|---|
| `curby` | `/Users/mbaldwin/Curby/curby` | React Native / Expo mobile app (iOS + Android) |
| `curby-web` (this repo) | `/Users/mbaldwin/Curby/curby-web` | Next.js 16 admin dashboard + public landing page |
| `curby-supabase` | `/Users/mbaldwin/Curby/curby-supabase` | Supabase project config, migrations, schema backups |
| Supabase project | `hbaiapsdvjjuxlgbogtz.supabase.co` | PostgreSQL + Auth + Edge Functions + Storage |

## Tech Stack

- **Framework**: Next.js 16 / React 19.1 (App Router, server + client components)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4.1 + Radix UI + shadcn/ui (new-york style)
- **State**: Redux Toolkit 2.9 (global state) + TanStack React Query 5 (server state)
- **Tables**: TanStack React Table 8
- **Forms**: React Hook Form 7 + Zod 4 validation
- **Maps**: Leaflet + react-leaflet
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React, Tabler Icons, React Icons
- **Theme**: next-themes (dark mode via class strategy, dark by default)
- **Fonts**: Poppins + Roboto Mono (Google Fonts)
- **Backend**: Supabase JS SDK 2.58 + @supabase/ssr 0.7
- **Build/Deploy**: Vercel (likely)

## Architecture & Patterns

### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # Public pages (landing, legal, auth)
│   ├── admin/              # Admin dashboard
│   │   ├── login/
│   │   ├── unauthorized/
│   │   └── (protected)/    # All admin pages (route group)
│   ├── layout.tsx          # Root layout with providers
│   ├── globals.css         # Tailwind + CSS custom properties
│   └── middleware.ts       # Route protection middleware
├── core/                   # Core business logic
│   ├── components/         # 22 shared UI components
│   ├── enumerations/       # 30+ TypeScript enums
│   ├── constants/
│   ├── hooks/              # 7+ shared hooks
│   ├── providers/          # AppProviders, ConfirmDialog, PortalQueue
│   ├── services/           # 45+ data services (one per entity)
│   ├── types/              # 59+ TypeScript interfaces
│   └── utils/              # 20+ utilities
├── features/               # Feature modules (16 features, self-contained)
│   ├── auth/
│   ├── broadcasts/
│   ├── curby-coins/
│   ├── devices/
│   ├── events/
│   ├── feedback/
│   ├── items/
│   ├── legal/
│   ├── media/
│   ├── moderation/
│   ├── notifications/
│   ├── support/
│   ├── tutorials/
│   └── users/
├── supa/                   # Supabase integration layer
│   ├── services/           # Auth, base service, storage service
│   ├── providers/          # Auth, Profile, Device providers
│   ├── hooks/
│   ├── hoc/                # Higher-order components
│   ├── types/
│   └── utils/              # client.ts, server.ts, protect-route.ts
└── store/                  # Redux store
    └── store.ts
```

### Key Patterns
- **Service Layer**: All data access through typed services. Never call Supabase directly from components.
- **One service per entity**: Each database table has a corresponding service, type file, and enumeration file.
- **Redux for UI/app state**: Profile, device, saved items, coin balance, notification count.
- **React Query for server state**: Data fetching, caching, refetching.
- **Feature modules**: Each feature is self-contained with its own components, hooks, services, slices, types. Redux slices live inside their feature module (unlike the mobile app where they're in core/).
- **shadcn/ui components**: Radix UI primitives styled with Tailwind. New UI components should follow this pattern.
- **Middleware for auth**: `middleware.ts` protects all `/admin/*` routes with role-based access.
- **Provider tree**: Root layout wraps with AppProviders → AuthProvider → ProfileProvider → DeviceProvider.

### Path Aliases
```
@app/*       → ./src/app/*
@core/*      → ./src/core/*
@supa/*      → ./src/supa/*
@store/*     → ./src/store/*
@features/*  → ./src/features/*
```

### Key Differences from Mobile Repo
- **No `@common/` alias** — shared components live in `@core/components/`
- **Redux slices live in feature modules** (e.g., `@features/users/slices/`) not in `@core/slices/`
- **Supabase client uses `@supabase/ssr`** with `createBrowserClient` (not AsyncStorage)
- **Redux store passes Supabase client as thunk extra argument**
- **Fewer Redux slices** (7 vs 11 in mobile — no userLocation, userBan, userSuspension, userWarning)

## Admin Route Structure

All admin pages are under `/admin/(protected)/`:
- `/admin/curby-coins/` — Coin transactions and types
- `/admin/devices/` — Device management
- `/admin/events/` — Event log and event types
- `/admin/feedback/` — User feedback
- `/admin/items/` — Item management and moderation
- `/admin/legal/` — Terms & conditions, privacy policy
- `/admin/media/` — Media management
- `/admin/moderation/` — User reviews, reports
- `/admin/notifications/` — Notification templates
- `/admin/profile/` — Admin profile settings
- `/admin/support/` — Support tickets
- `/admin/tutorials/` — Tutorial management
- `/admin/users/` — User management

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://hbaiapsdvjjuxlgbogtz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon key>
PORT=3000 (optional, set via cross-env)
```

## Development Commands

```bash
npm run dev             # Next.js dev server (port 3000)
npm run build           # Production build
npm run start           # Production server (port 3000)
npm run lint            # ESLint check
npm run format          # Prettier format
```

## Code Style

- **Prettier**: single quotes, 2-space indent, no trailing commas, semicolons, 120 char line width
- **ESLint**: TypeScript strict, React hooks rules, Prettier integration, Next.js core-web-vitals
- **Tailwind**: Class-based dark mode, CSS custom properties for theming
- **Naming conventions**:
  - Files: `kebab-case` with suffix (e.g., `item.service.ts`, `use-profile.hook.ts`, `user-role.enum.ts`, `item.type.ts`, `login-form.component.tsx`)
  - Components: PascalCase
  - Functions/variables: camelCase
  - Enums: PascalCase members
  - Types/interfaces: PascalCase with no `I` prefix
- **Imports**: Use path aliases (`@core/`, `@features/`, `@supa/`, etc.), never relative paths across module boundaries
- **File organization**: Group by feature. Each feature module is self-contained.

## Database Schema

See the mobile repo's CLAUDE.md at `/Users/mbaldwin/Curby/curby/CLAUDE.md` for the full database schema reference. Key tables: `profile`, `device`, `item`, `item_media`, `item_report`, `item_review`, `user_ban`, `user_suspension`, `user_warning`, `broadcast`, `notification`, `support_request`, `curby_coin_transaction`, `event_log`, `tutorial`, `terms_and_conditions`, `privacy_policy`.

Schema backups live in the mobile repo at `/Users/mbaldwin/Curby/curby/supabase-backup/` and migrations in `/Users/mbaldwin/Curby/curby-supabase/supabase/migrations/`.

## Jira Project

- **URL**: https://mbaldwintech.atlassian.net
- **Project key**: CURBY
- **Board**: KAN board (ID: 1) — simple/kanban style
- **Statuses**: To Do → In Progress → Done

### Team Members
| Name | Role/Focus |
|---|---|
| Michael Baldwin | Project owner, primary developer |
| Noah Smith | Contributor (App Settings — CURBY-22) |
| Ben Ceol | Contributor (T&C Editability — CURBY-23, Map fix — CURBY-35) |
| dominic.rohan86 | Contributor (Device Details — CURBY-29) |

### Working with Jira
- When picking up a ticket, transition it to "In Progress" before starting work.
- Reference the ticket key in branch names and commit messages (e.g., `CURBY-22`).
- Add a comment to the ticket summarizing what was done before transitioning to "Done".
- When creating new tickets, use issue type "Task" unless it's clearly a "Bug".

## Git Workflow

- **Main branch**: `main` (production-ready, PRs merge here)
- **Remote**: `origin` → `git@github_mdbaldwin1:mbaldwintech/curby-web.git`

### Branch Naming
```
CURBY-<ticket#>_<Short-Description>
```
Examples: `CURBY-22_App-Settings`, `CURBY-35_Fix-Map`

### Commit Messages
- Start with a brief description of what changed
- Reference the Jira ticket when applicable
- No strict conventional commit format — just clear, descriptive messages

## Important Notes for Claude

1. **Two repos share patterns but not code** — Types, enumerations, and services are duplicated between mobile and web. When modifying shared business logic, changes may need to be mirrored in the mobile repo.
2. **Supabase is the source of truth** — RLS policies are critical security — never suggest disabling them.
3. **No test suite exists** — Greenfield if tests are to be added.
4. **The web app is primarily an admin tool** — Public-facing pages are the landing page and legal docs.
5. **shadcn/ui pattern** — New UI components should use Radix UI primitives + Tailwind. Check existing components in `@core/components/` before creating new ones.
6. **Middleware protects admin routes** — Role-based access checking happens in `middleware.ts`. Roles checked: Admin, Moderator, Support.
7. **Server vs Client components** — Follow Next.js App Router patterns. Use `'use client'` only when needed (interactivity, hooks, browser APIs).

## When to Ask vs. Act

**Always ask (using AskUserQuestion) before:**
- Changing database schema, RLS policies, or edge functions — these affect both repos and production
- Choosing between multiple valid architectural approaches
- Deleting or significantly restructuring existing code
- Adding new dependencies
- Making changes that would need to be mirrored in the mobile repo (curby)
- Anything involving auth flows, role permissions, or security boundaries
- Implementing a feature from the roadmap (confirm scope and approach first)

**Fine to act without asking:**
- Bug fixes with a clear, singular solution
- Implementing something the user explicitly described in detail
- Code formatting, linting fixes, typo corrections
- Adding a component or page that follows an existing established pattern
- Reading files, exploring code, running non-destructive commands

**When in doubt, ask.** A 10-second clarification is better than a 10-minute redo.
