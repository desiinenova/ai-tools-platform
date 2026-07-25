# Performance notes

Running list of performance-related observations from the frontend UI/UX pass. Deliberately not acted on beyond a few low-risk fixes — the plan is a dedicated end-to-end (frontend + backend) performance pass after the visual redesign is complete, driven by measurements rather than assumptions. Add to this list as new observations come up; don't fix from it directly without re-verifying against real measurements first.

## Already applied (low-risk, done during the UI pass)

- `ToolCard`'s tool-name click now uses a real `next/link` `Link` instead of only a `router.push` in an `onClick`, so Next.js prefetches tool detail pages the same way it already does for every other nav link.
- `useRoles` / `useCategories` / `useTags` now set a long local `staleTime` (`Infinity` for roles — no mutation path exists for them at all; 5 minutes for categories/tags, which are mutable but already invalidate explicitly on their own mutations). Global `QueryClient` defaults in `Providers.tsx` were left untouched.

## Investigated and rejected

- **Turbopack for `next dev`**: tested directly. Confirmed via a live-edit probe (bypassing nginx, hitting the Next dev server in-container) that Turbopack's file watcher does not reliably detect changes to files bind-mounted from the Windows host in this Docker Desktop/WSL2 setup — a revert to a file wasn't picked up even after a logged recompile. Reverted. The existing `next.config.ts` webpack `watchOptions.poll` config remains necessary and untouched.

## Open — revisit in the dedicated performance phase

- **Global React Query config**: `refetchOnWindowFocus` is left at its default (`true`) with one flat 30s `staleTime` in `Providers.tsx`, applying to session identity (`useCurrentUser`) and the tools list, not just reference data. Worth measuring how much refetch chatter this actually causes before tuning further.
- **Login round-trip chain**: `login()` does CSRF-cookie fetch → login POST → (2FA challenge POST) → then the dashboard's own `/api/user` fetch on mount, since the login response doesn't include the user payload. Each step is sequential and blocks the next. A real fix means the backend's `/api/login` response including the user — a joint frontend+backend change, not frontend-only.
- **`useCurrentUser` re-render fan-out**: called independently in ~7 components (`ToolCard`, `ToolDetailsPage`, `ToolForm`, `DashboardPage`, `ProfilePage`, `TwoFactorSettings`, `AdminLayout`) instead of being read once from `dashboard/layout.tsx` (which already fetches it) and passed down. React Query dedupes the network call, but every one of those components independently subscribes to the query, so any `["user"]` invalidation re-renders all of them. Deferred — not enough measured benefit yet to justify the added complexity of threading it through context/props.
- **Dashboard's dual tools fetch**: `DashboardPage` fires two independent `/api/tools` requests in parallel (`myTools`, `recommendedTools` with different filters), then filters client-side to exclude own tools from "recommended." Low urgency at current data volume.
- **Dev-mode on-demand compilation**: first visit to any route in a dev session takes 3-6s to compile (`next dev`'s lazy per-route compilation), confirmed via container logs. This is dev-server-only — a production build pre-compiles everything — and isn't fixable without breaking file-watching in this environment (see Turbopack above). Not a production concern; noted for awareness only, not actionable.
