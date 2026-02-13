Create a new admin page for "$ARGUMENTS".

Follow the existing admin page patterns:
1. Create the page at `src/app/admin/(protected)/<page-name>/page.tsx`
2. If it needs a detail view, create `src/app/admin/(protected)/<page-name>/[id]/page.tsx`
3. Create feature components in `src/features/<feature-name>/components/`
4. Create any hooks in `src/features/<feature-name>/hooks/`
5. Follow the existing data table patterns (TanStack React Table) for list pages
6. Follow the existing detail panel or detail page patterns for individual records
7. Add route protection rules to `src/middleware.ts` if not already covered
8. Use shadcn/ui components and Tailwind for styling

Look at existing admin pages (e.g., events, tutorials, users) for reference patterns before building.
Ask the user what columns/fields should be shown and what actions should be available.
