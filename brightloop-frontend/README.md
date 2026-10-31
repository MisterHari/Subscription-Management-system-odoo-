# Brightloop v11 — React frontend

## v11: Automatic discount rules

Admin-only discount configuration supports percentage/fixed amount, minimum quantity/purchase, product-specific or whole-subscription scope, start/end dates, enabled state and usage limits. On demo billing, eligible discounts are applied automatically before configured taxes. Each invoice stores applied discount IDs and calculated discount/tax/total; usage counts increment only for newly created invoices. Expired and exhausted rules do not apply. Usage limit `0` means unlimited. Multiple eligible rules stack sequentially in saved order and are capped at the invoice subtotal (demo policy; the brief does not define stacking).

**Important:** This is a browser-local demo. Scheduling, authorization, atomic usage limits, invoice uniqueness, tax correctness and payment processing require the Node.js/PostgreSQL backend. Do not use frontend-only role checks for real customer data.

## Run

```bash
npm install
npm run dev
```

Visit http://localhost:5173/login. Admin demo: `admin@cus.com` / `Admin@1234`; customer demo: `test@cus.com` / `Text@1234`.

# Brightloop v10 — Automated Billing & Invoice Review

# Brightloop v9 — Quotation and subscription workflow

## New in v9
- **Quotation templates**: Admin and staff create reusable templates with plan, product, quantity, unit price and validity in days.
- **Create quotation from template**: Open **Quotations → Create quotation from template**; choose a customer and template, start and expiry dates, payment terms, quantity and product variant.
- **Calculated preview**: Product line amount, tax estimate and total update automatically.
- **Subscription lifecycle**: Creating a quotation creates a subscription in `Quotation` status, with a generated subscription number in demo mode, quotation validity and product line data.
- Existing Draft / Quotation / Confirmed / Active / Closed statuses remain available on the Subscriptions page.

## Run
```bash
npm install
npm run dev
```
Open `http://localhost:5173/login`.

## Demo accounts
- Admin: `admin@cus.com` / `Admin@1234`
- Customer: `test@cus.com` / `Text@1234`
- Staff: Created by admin in Team Access (demo temporary password `Staff@1234`).

## API mode
The new quotation creation page reads `GET /customers`, `/plans`, `/products`, `/quotations`, `/taxes` and submits `POST /subscriptions`. Adjust the API contract to your backend as needed.

## Important limitations
This is a **React frontend demo** with browser-local persistence. The server must enforce ownership and RBAC, validate status transitions and quotation expiry, generate collision-safe subscription numbers, recalculate totals, and schedule recurring billing. The PDF does not prescribe the exact transition triggers; v9 retains manual status changes for demonstration. The preview does not apply discount rules; invoice generation handles them in the existing demo engine.

# Brightloop v8 — Product and Plan Management

Admin-only product and plan configuration is now included. Products support name, type, sales and cost prices, notes, and multiple variants with price adjustments (e.g., Odoo +₹560). Plans link to products and support daily, weekly, monthly, or yearly billing, minimum quantity, availability dates, automatic closure, early closure, pause, and renewal permissions.

## Start

```bash
npm install
npm run dev
```

Open http://localhost:5173/login. Demo admin: `admin@cus.com` / `Admin@1234`. Demo customer: `test@cus.com` / `Text@1234`.

**Important:** This is a frontend demo. Browser-local data, credentials, and simulated billing are not production security or reliable scheduled billing. Node.js/PostgreSQL must enforce role permissions, pricing, lifecycle rules and scheduled invoices.

---

# brightloop v3 — React Frontend

React + Vite frontend based on the supplied **Subscription Management System** requirements.

## Start

```bash
npm install
npm run dev
```

Open http://localhost:5173. Demo mode uses localStorage. Set `.env` with `VITE_API_URL=http://localhost:3000/api` and switch to API mode to connect your Express backend.

## Features

- Products and variants; plan pricing, daily/weekly/monthly/yearly frequency, min quantity, availability and closure flags.
- Subscription number, customer, plan, start/expiry, terms, quantity and lifecycle states. Plan-derived price and product ID in demo mode.
- **Automation page:** browser simulation generates draft invoices from active subscription billing dates, calculates eligible discounts and tax rules, computes totals, avoids duplicate billing keys and closes expired subscriptions where configured.
- Invoices are **not manually created**. Review, confirm, cancel and print generated invoices.
- Payments recorded against invoices; demo updates invoice to Paid when fully covered and prevents overpayment.
- Admin configuration for tax and discount rules; dashboard summaries.

## IMPORTANT — frontend simulation vs real automation

**This is a frontend deliverable, not a production billing engine.** In demo mode the invoice simulation runs on page load/refresh; it does not execute when the browser is closed. Demo uses browser-local data and a capped catch-up loop (500 periods). Do not use it to bill real customers.

The production Node.js backend must implement a persistent scheduler/worker, transactions, unique `(subscription_id,billing_period)` constraint, durable invoice numbering, correct proration/renewal rules, tax jurisdiction/rate handling, discount usage concurrency, and audit logs. Backend must enforce roles (the role selector is only a UI preview), authentication/password reset, invoice sending, and customer data isolation.

## Suggested API contract

- `GET /api/dashboard` returns summary fields.
- `GET /api/billing/status` returns `{created,closed,checked}` from the actual backend scheduler.
- `GET /api/{products,plans,customers,subscriptions,quotations,invoices,payments,discounts,taxes,staff}` returns arrays.
- `POST /api/{resource}`, `PATCH /api/{resource}/:id`, `DELETE /api/{resource}/:id` for permitted resources. **No POST /api/invoices from the frontend.**
- `PATCH /api/invoices/:id` for permitted invoice actions; validate transitions on server.

## Requirements caveats

The PDF specifies automatic tax/discount application and invoice generation, but does **not** define tax jurisdiction, tax stacking, rounding, billing-day end-of-month behavior, or partial payment policies. The demo uses illustrative rules: percentage discounts on subtotal, tax on discounted subtotal, 2-decimal rounding, and end-of-month clamping. These require business decisions before production.

Manual payment entry is retained because the PDF explicitly calls for recording payments; automatic bank integration is not required.


## Authentication (new)
Routes: `/login`, `/signup`, `/forgot-password`, `/reset-password?token=...`.
This frontend **does not store an administrator password or create a default admin**. The Node.js backend must seed a single administrator account from server-side environment variables and hashed password, never exposed to the browser. Customer signup always creates a customer role; only the admin can create staff.

Backend API contract (required; not implemented by this frontend):
- `POST /api/auth/signup` `{name,email,password}` (unique normalized email, customer role only)
- `POST /api/auth/login` `{email,password}` → `{user:{id,name,email,role}}` and secure HttpOnly session cookie
- `GET /api/auth/me` → `{user}` or 401
- `POST /api/auth/logout` → clear session
- `POST /api/auth/forgot-password` `{email}` → generic success; email one-time reset URL `https://YOUR_FRONTEND/reset-password?token=...`
- `POST /api/auth/reset-password` `{token,password}` → invalidate token and existing sessions

The backend must enforce password strength (>8 chars, uppercase, lowercase, special), unique emails, rate limits, password hashing, short-lived hashed reset tokens, email delivery, CSRF protection for cookie auth, and role authorization for every API endpoint. Configure CORS for the frontend origin with credentials. No real login/reset email can work without these backend endpoints. Demo resource data is not an authorization boundary.


## Demo sign-in accounts (frontend demonstration only)

- Customer: `test@cus.com` / `Text@1234` — subscriptions, invoices, and billing pages only; read-only subscription and invoice records.
- Admin: `admin@cus.com` / `Admin@1234` — full frontend access.

These credentials are deliberately embedded in the React source **for local demonstration only**. They are not secure production accounts and must not be used as real authentication. The route guards and sidebar are UI restrictions, **not server-side authorization**. Production must authenticate on the backend, hash passwords, enforce per-user data ownership and roles for every API endpoint, and implement real password-reset emails. Demo records are shared browser-local sample data, not private customer records.


## v6 Role permissions
Admin `admin@cus.com` / `Admin@1234`: all modules and staff management.
Customer `test@cus.com` / `Text@1234`: own subscriptions, invoices and billing.
Admin can create demo staff accounts in Team access. Demo staff initial password: `Staff@1234` (local browser demonstration only; do not deploy). Staff can access day-to-day operations but not staff, products, plans, taxes or discounts.

**Security:** demo accounts and staff passwords are browser-local and insecure. Backend must authenticate, hash passwords, authorize every endpoint and filter by authenticated customer ID. The demo customer data is seeded locally and not a production isolation guarantee.


## v7 Product & Plan management
Admin Product editor supports multiple named brand variants and their price adjustments (for example Odoo +₹560). Admin Plan editor chooses an existing product from a dropdown and sets plan price, billing frequency, minimum quantity, availability and auto-close / early-close / pause / renewal permissions. Plan and product records persist in demo localStorage; API mode requires corresponding backend endpoints. The billing engine is a browser simulation, not a server scheduler. Do not use demo authentication for production.


## v10 changes
- Invoices are generated from active subscriptions in demo mode on billing-page load/refresh, never entered manually.
- Automatic subtotal, discount, tax and total calculations are based on admin rules.
- Draft invoices can be confirmed or cancelled; confirmed invoices can be cancelled or sent; paid invoices can be sent or printed.
- Invoice printing opens an invoice-specific printable document.
- Send is wired to `POST /api/invoices/:id/send` in API mode; demo mode explicitly reports that email was not sent.
- The billing screen explains idempotency safeguards and demo limitations.

**Production requirement:** Node.js scheduled worker, PostgreSQL unique `(subscription_id,billing_period)` constraint, transactional processing, retry/error logging, email service, server-enforced permissions. Frontend demo is not a background billing service.


## v12: Payments and outstanding invoices

- `/payments` (admin/staff): record a payment against an existing confirmed invoice, with method, amount, date, and reference note. Supports partial payments and validates against the outstanding balance.
- `/invoices`: automatic payment ledger with Paid, Partial, Unpaid, Overdue, Draft and Cancelled views, filters and invoice balances.
- Customers see only records belonging to their customer ID; customer-facing forms are read-only.
- Payments use the existing `GET /api/payments`, `POST /api/payments`, and `GET /api/invoices` endpoints in API mode.
- The backend must independently enforce customer ownership, role permissions, valid payments, transactional updates and reliable overdue calculations.
- **Demo mode does not transfer money** and is not a payment gateway or bank reconciliation system.


## v13 — Finance analytics

- **Analytics** sidebar route (`/reports`) for Admin and Staff; customers are denied access.
- Date-range filters, active subscription count, payments received in selected period, total outstanding balance, overdue invoice count and amount.
- Revenue-by-month visualization, invoice status filters, search, 10-row client-side pagination and CSV export.
- Demo mode calculates reports from local demo records; values are not production financial data.
- API mode expects `GET /api/reports/overview?from=YYYY-MM-DD&to=YYYY-MM-DD` and `GET /api/reports/invoices?from=...&to=...&page=1&limit=100`. The overview response should contain `activeSubscriptions`, `revenueReceived`, `outstandingAmount`, `overdueInvoices`, `overdueAmount`, `paymentsCount`, and `monthly: [{month,revenue}]`. The invoice response should contain an array or `{data:[...]}` with invoice/customer/paid/outstanding fields.
- **Performance:** The frontend uses pagination on demo records only. For thousands of rows, the backend must implement server-side filtering, aggregation, pagination and indexed SQL queries. A sub-two-second response target has not been measured or verified.
- Scheduled billing, authentication and access control still require a secure backend.


## v14 — Sign-in page introduction

The sign-in page now introduces Brightloop as a subscription management platform, highlighting subscription management, recurring billing, and financial visibility. The existing authentication context, login submission, role-aware navigation, signup, and password reset flows remain in place. Demo credentials are not shown on the page.
