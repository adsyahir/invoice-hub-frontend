# InvoiceHub — Frontend

The web client for **InvoiceHub**, a multi-tenant B2B SaaS platform for invoicing and
payments. This app is the UI layer: organizations manage clients, issue invoices,
collect payments, and view reports, with a super-admin surface for platform-wide tenant
management.

> Built for Malaysian B2B billing out of the box — MYR currency, 8% SST tax handling,
> and `INV-YYYY-####` invoice numbering.

## Tech stack

| Concern            | Choice                                              |
| ------------------ | --------------------------------------------------- |
| Framework          | React 19 + TypeScript                               |
| Build tool         | Vite 8                                              |
| Routing            | React Router v7 (`createBrowserRouter`)             |
| Styling            | Tailwind CSS v4                                      |
| UI components      | shadcn/ui (`base-nova` style on `@base-ui/react`)   |
| Icons              | lucide-react                                         |
| Server state       | TanStack Query (React Query v5)                      |
| Client state       | Zustand v5                                           |
| Forms & validation | react-hook-form + Zod                               |
| HTTP client        | axios (with JWT auth + refresh-token interceptor)   |
| Charts             | Recharts                                             |
| Dates / format     | date-fns                                             |
| Font               | Geist (variable)                                     |

## Getting started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev
```

### Environment

Create a `.env` (or `.env.local`) file and point the client at your backend API:

```bash
VITE_API_URL=http://localhost:8100/api
```

The backend (Spring Boot) runs on port `8100` with a `/api` context path.

## Scripts

| Command           | What it does                                      |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Start Vite dev server with HMR                    |
| `npm run build`   | Type-check (`tsc -b`) then build for production   |
| `npm run preview` | Preview the production build locally              |
| `npm run lint`    | Run ESLint over the project                       |

## Project structure

```
src/
├── app/          # App providers (React Query client, theme)
├── components/
│   ├── ui/       # shadcn/ui primitives (base-nova)
│   ├── common/   # shared building blocks (PageHeader, EmptyState, pagination…)
│   ├── layout/   # app shell — sidebar, topbar, layouts
│   ├── invoices/ # invoice-specific components (form, line items, filters…)
│   ├── payments/ # payment dialogs (record, refund…)
│   ├── settings/ # org / team / billing settings
│   ├── dashboard/# stat cards, revenue chart
│   └── admin/    # super-admin components
├── config/       # nav config (role-filtered)
├── hooks/        # reusable hooks (pagination…)
├── lib/
│   ├── api/      # axios client + React Query hooks (the backend seam)
│   ├── mock/     # mock fixture data
│   ├── format.ts # currency / date formatters
│   └── utils.ts  # cn() helper
├── pages/        # route screens, grouped by domain
├── stores/       # Zustand stores (auth, ui)
└── types/        # domain type contracts (DTOs)
```

## Architecture notes

- **Backend seam.** Every screen reads data through a React Query hook in
  `src/lib/api/`. Each hook's `queryFn` is the single place where a real API call is
  wired in — components never touch data sources directly. Hooks not yet backed by the
  API return mock data from `src/lib/mock/` and are marked with `// TODO(backend)`.
- **Types are the contract.** `src/types/` mirrors the backend schema (Tenant, User,
  Client, Invoice, Payment, …) and doubles as the API DTO types. The public handle for
  entities is a `uuid` (used in URLs/API), matching the backend's dual-key model.
- **Auth & roles.** The Zustand auth store holds the current user, role, and tenant
  (populated at login/register/me). Routes and navigation are gated by role
  (`SUPER_ADMIN`, `TENANT_ADMIN`, `ACCOUNTANT`, …). The topbar includes a role switcher
  for previewing role-gated views.
- **Theming.** Light and dark tokens live in `src/index.css`; the theme toggle applies a
  `.dark` class on `<html>` and persists the choice.

## Features

- **Auth** — login, organization registration, forgot/reset password, accept invite.
- **Dashboard** — invoiced / paid / overdue stat cards, revenue chart, recent invoices,
  aging snapshot.
- **Invoices** — filterable data table, create/edit with live line-item math
  (subtotal / SST / total), detail view with audit log, send/void/duplicate actions.
- **Clients** — client directory and create/edit forms.
- **Payments** — payment table, record manual (offline) payments, refunds, partial
  payment / outstanding balance tracking.
- **Public payment page** — tokenized `/pay/:token` checkout with no app chrome
  (CARD / FPX / E-wallet), plus success and expired-link states.
- **Reports** — revenue and aging-bucket reports with CSV/PDF export.
- **Settings** — organization profile, team members with invites and role assignment,
  and billing / plan management.
- **Super admin** — platform-wide tenant list with plan, usage, and suspend/activate
  controls.

## Related

This is the frontend of a two-part project. The API is a separate **Spring Boot 4 /
Java 25 / PostgreSQL** service (`invoice-hub-backend`) with Flyway migrations and
JWT auth.
