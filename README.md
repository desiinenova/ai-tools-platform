# AI Tools Platform

An internal platform that lets an organization's teams discover, organize, share, and moderate AI tools, with recommendations and permissions tailored to each user's role.

Built as a university project: Laravel serves a JSON API; Next.js is a separate frontend consuming it over HTTP. Neither framework's scaffolding/starter kits were used — both applications were built up deliberately, piece by piece.

## Tech stack

- **Backend:** Laravel 12, PHP 8.3, MySQL 8.4, Laravel Sanctum (SPA session auth), `pragmarx/google2fa` (TOTP)
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, TanStack React Query, Radix UI primitives, Tailwind CSS
- **Infrastructure:** Docker Compose (MySQL, PHP-FPM backend, Next.js dev server, Nginx reverse proxy)

## Prerequisites

- Docker and Docker Compose
- Nothing else — PHP, Node, and MySQL all run inside containers; you don't need any of them installed locally.

## Installation & setup

```bash
git clone <this-repository>
cd ai-tools-platform

# Environment files — both example files already contain matching defaults
# for local development, so copying them as-is works out of the box.
cp .env.example .env
cp backend/.env.example backend/.env

# Build and start every service (MySQL, backend, frontend, Nginx)
docker compose up -d --build
```

The backend container does **not** generate an app key or run migrations automatically on startup — do that once, after the containers are up:

```bash
docker exec ai-tools-backend php artisan key:generate
docker exec ai-tools-backend php artisan migrate --seed
```

`--seed` populates: all six roles, one demo user per role (see table below), a starter set of Categories and Tags. No AI Tools are seeded — the catalog starts empty.

Open **http://localhost:8080** — Nginx serves both the frontend and the API from this single origin (this matters for how Sanctum's cookie-based auth is configured; see `SANCTUM_STATEFUL_DOMAINS` in `backend/.env`).

### Seeded accounts

All seeded users share the password `password`.

| Email | Role |
|---|---|
| `owner@example.com` | Owner |
| `backend@example.com` | Backend Developer |
| `frontend@example.com` | Frontend Developer |
| `pm@example.com` | Project Manager |
| `qa@example.com` | QA |
| `designer@example.com` | Designer |

## Running the project day-to-day

```bash
docker compose up -d          # start everything
docker compose logs -f backend    # tail a specific service's logs
docker compose down           # stop everything (add -v to also drop the MySQL volume)
```

The frontend runs via `next dev` inside its container with the project directory bind-mounted, so both frontend and backend code changes are picked up live — no rebuild needed for ordinary development.

### Running tests

```bash
docker exec ai-tools-backend php artisan test
```

There is no automated frontend test suite; frontend changes are verified via TypeScript's compiler (`npx tsc --noEmit`) and ESLint (`npx eslint .`), both run inside the frontend container.

## Role system

Six roles exist, seeded by `RoleSeeder`: **Owner**, Backend Developer, Frontend Developer, Project Manager, QA, Designer.

**Each user has exactly one role** (`users.role_id`, a plain foreign key) — this is a deliberate simplification of the original brief's "many roles per user" language, made explicitly for this project's scope. It's a real constraint, not an oversight: adding multi-role support later would require a genuine schema migration (a `role_user` pivot table), not just a config change.

**Owner is the only administrative role**, and its authority is deliberately narrow:

- Owner can approve or reject any newly submitted AI Tool.
- Owner can create, edit, and delete Categories and Tags.
- Owner can edit or delete *any* tool, not just their own.
- **Owner does not manage user accounts** — there is no create/edit/delete/role-change UI or endpoint for users, by explicit design. This does mean there's no admin recovery path if a user loses both their 2FA device and their recovery codes (see below) — an accepted tradeoff for this project's scope.

Every other role can create tools and edit/delete only the tools they created themselves. All of this is enforced **server-side** via Laravel Policies (`ToolPolicy`, `CategoryPolicy`, `TagPolicy`) — the frontend's own permission checks (`lib/permissions.ts`) exist purely to hide actions the API would reject anyway, never as the actual security boundary.

## Using the platform

### Adding an AI tool

Any authenticated user can add a tool from **AI Tools → Add Tool**. The form covers: name, website URL, a short description, categories, recommended roles, tags, a Markdown documentation field (usage instructions, examples, code snippets — anything beyond the short description belongs here, not in Description), an optional official documentation link, and an image.

What happens after submitting depends on who submits it:

- **Owner-submitted tools are approved immediately** — Owner is the approver, so there's no one else to review their own submission.
- **Everyone else's tools start `pending`** and are visible only to their creator and to Owner, until Owner approves or rejects them from **Admin → Pending Tools**.
- Editing an already-approved (or rejected) tool sends it back to `pending` for re-review — unless the edit is made by Owner, whose edits never change a tool's status.

Tool names and website URLs must be unique (case-insensitively, and a trailing slash on a URL doesn't count as a different one) — this is checked regardless of a tool's current status, so you can't work around a duplicate by using a rejected or pending tool's name.

### Managing Categories and Tags

Owner-only, from **Admin → Categories** / **Admin → Tags**. Deleting a category or tag never deletes the tools using it — it's simply detached from them (enforced by `ON DELETE CASCADE` on the pivot tables' foreign keys, not application code).

### Two-factor authentication

From **Profile → Two-Factor Authentication**, any user can enable TOTP-based 2FA (compatible with Google Authenticator, Authy, or any standard authenticator app): scan the QR code (or enter the shown secret manually), confirm with a 6-digit code, then save the one-time recovery codes shown — they're displayed exactly once. Once enabled, login requires that code (or an unused recovery code) as a second step. Disabling 2FA requires re-entering your password.

## Project structure

```
backend/    Laravel 12 API (app/, database/migrations, routes/api.php, tests/)
frontend/   Next.js 15 App Router frontend (src/app, src/components, src/lib)
docker/     Dockerfiles and Nginx config
```

Within the backend, business logic is deliberately kept out of controllers where it has real shape: `app/Services/ToolWorkflowService.php` owns the approval/status state machine, `app/Services/TwoFactorAuthenticationService.php` owns 2FA enrollment/verification, and `app/Policies/*` own all authorization decisions.
