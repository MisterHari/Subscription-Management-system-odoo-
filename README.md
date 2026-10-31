# Brightloop — Clarity in Every Cycle

**Subscription management and revenue insights, in one dashboard.**

Brightloop is a hackathon MVP for managing customers, subscriptions, billing cycles, and invoices. Its **Prism Pulse** frontend uses colorful gradients and geometric elements to make subscription data easier to explore. The dashboard also highlights past-due subscriptions, upcoming renewals, and a simple momentum indicator.

> **Project status:** The standalone frontend is available in `subscriptly_prism_pulse.html` and works with sample data. The Express API and PostgreSQL database described below are the **planned architecture**, not bundled completed components. The HTML file still uses the earlier Subscriptly branding in places.

## Features

- **Dashboard:** revenue summary, recurring run rate, active subscriptions, customer count, and charts.
- **Revenue Leak Radar:** flags subscriptions with `past-due` status.
- **What's Next:** displays the next renewal from active subscription records.
- **Momentum Score:** illustrative health indicator, **not** a financial forecast.
- **Customers:** create, view, edit, search, and delete customer records.
- **Subscriptions:** track customer, plan, monthly/yearly cycle, amount, next billing date, and status.
- **Invoices:** create, view, update payment status, and delete invoices.
- **Demo mode:** explore the interface without setting up a server.

## Tech stack

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | HTML5, CSS3, vanilla JavaScript | Responsive UI, forms, charts, API requests |
| Charts | Chart.js via CDN | Dashboard visualization |
| Backend (planned) | Node.js + Express | REST API, validation, business logic |
| Database (planned) | PostgreSQL | Persistent customers, subscriptions, invoices |
| Database client (planned) | `pg` | Parameterized SQL queries |

## System architecture

```mermaid
flowchart TD
    U[User / Browser] --> F[Prism Pulse frontend<br/>HTML + CSS + JavaScript]
    F -->|HTTP / JSON| A[Node.js + Express REST API]
    A --> V[Validation and business rules]
    V --> P[(PostgreSQL)]
    A -->|JSON responses| F
    F --> C[Dashboard charts and insights]
```

**Data flow:** A user submits a form → the frontend calls an `/api/...` endpoint → Express validates the request → PostgreSQL stores or retrieves the record → the API returns JSON → the frontend refreshes its tables and insights.

**MVP boundary:** Subscription and invoice records are managed manually. This project does **not** include payment gateway integration, automated charging, authentication, or real payment processing.

### Planned database model

```mermaid
erDiagram
    CUSTOMERS ||--o{ SUBSCRIPTIONS : has
    CUSTOMERS ||--o{ INVOICES : receives
    CUSTOMERS {
        int id PK
        varchar name
        varchar email UK
        varchar company
        date joined
    }
    SUBSCRIPTIONS {
        int id PK
        int customer_id FK
        varchar plan
        varchar cycle
        numeric amount
        date next_billing
        varchar status
    }
    INVOICES {
        int id PK
        int customer_id FK
        date issue_date
        date due_date
        numeric amount
        varchar status
    }
```

Suggested statuses: subscriptions `active`, `trial`, `past-due`, `cancelled`; invoices `draft`, `pending`, `paid`, `overdue`. Use `NUMERIC(12,2)` for monetary values in PostgreSQL. The current frontend expects amount values in **INR** and displays `₹`.

### API contract

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/customers` | List customers |
| POST | `/api/customers` | Add customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |
| GET | `/api/subscriptions` | List subscriptions |
| POST | `/api/subscriptions` | Add subscription |
| PUT | `/api/subscriptions/:id` | Update subscription |
| DELETE | `/api/subscriptions/:id` | Delete subscription |
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Add invoice |
| PUT | `/api/invoices/:id` | Update invoice or payment status |
| DELETE | `/api/invoices/:id` | Delete invoice |
| GET | `/api/dashboard` | Optional future aggregated metrics endpoint |

The current frontend **loads** `/api/customers`, `/api/subscriptions`, and `/api/invoices` as JSON arrays and calculates dashboard summaries in the browser. `/api/dashboard` is optional for the initial integration.

**Important response format:** Return **camelCase** properties to match the existing JavaScript. Convert SQL `customer_id` → `customerId`, `next_billing` → `nextBilling`, `issue_date` → `issueDate`, and `due_date` → `dueDate`. `POST` and `PUT` should return the saved object including its `id`.

Example subscription:

```json
{
  "id": 101,
  "customerId": 1,
  "plan": "Pro",
  "cycle": "Monthly",
  "amount": 1499,
  "nextBilling": "2026-11-12",
  "status": "active"
}
```

Customer objects should have `id`, `name`, `email`, `company`, `joined` (and optionally `spent`). Invoice objects should have `id`, `customerId`, `issueDate`, `dueDate`, `amount`, and `status`.

## Getting started

### 1. Run the frontend in demo mode

Open `subscriptly_prism_pulse.html` in a browser. No Node.js or PostgreSQL setup is needed to explore sample data. Chart.js requires internet access to load from its CDN.

### 2. Set up the planned backend

After adding the backend files, from the backend folder:

```bash
npm init -y
npm install express pg cors dotenv
```

Create a PostgreSQL database named `brightloop` and add tables based on the schema above. Put connection settings in a local `.env` file, for example:

```dotenv
PORT=3000
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/brightloop
```

> Never commit `.env` or database credentials to GitHub. Use a `.gitignore` containing `.env` and `node_modules/`.

Implement the API endpoints, enable CORS for local development, and start your Express server with your chosen entry point (for example, `node server.js`). The backend entry point and SQL migration files still need to be created.

### 3. Connect the frontend

Inside `subscriptly_prism_pulse.html`, find:

```js
const API_BASE_URL = "";
const USE_DEMO_FALLBACK = true;
```

Update to:

```js
const API_BASE_URL = "http://localhost:3000";
const USE_DEMO_FALLBACK = true;
```

With fallback enabled, the frontend can show demo data if the API is unavailable. Set it to `false` when testing whether the live backend really works. Test create/edit/delete operations and refresh the page to confirm data persists in PostgreSQL.

## Suggested repository structure (target)

```text
brightloop/
│
├── subscriptly_prism_pulse.html # to be changed
│
├── backend/
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── customer.controller.js
│   │   │   ├── subscription.controller.js
│   │   │   └── invoice.controller.js
│   │   │
│   │   ├── routes/
│   │   │   ├── customer.routes.js
│   │   │   ├── subscription.routes.js
│   │   │   └── invoice.routes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── error.middleware.js
│   │   │   └── not-found.middleware.js
│   │   │
│   │   ├── utils/
│   │   │   └── async-handler.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
└── README.md
```

## Three-person MVP to-do list

Split work by ownership so everyone can work in parallel. **Priority: make one full CRUD flow work end-to-end before polishing extras.**

### Person 1 — Frontend & UX

- [ ] Update visible branding from Subscriptly to **Brightloop**.
- [ ] Check navigation and responsive layout on desktop/mobile.
- [ ] Set `API_BASE_URL` and connect all three frontend data lists.
- [ ] Test customer, subscription, and invoice forms against the API.
- [ ] Verify dashboard cards, radar, renewal, and momentum display real fetched data.

### Person 2 — Backend & API

- [ ] Create Express server, enable CORS, and load `.env` settings.
- [ ] Implement customer CRUD routes.
- [ ] Implement subscription CRUD routes.
- [ ] Implement invoice CRUD routes and status updates.
- [ ] Return consistent JSON, proper HTTP status codes, and readable errors.

### Person 3 — PostgreSQL, Integration & Demo

- [ ] Create database and `schema.sql` with foreign keys.
- [ ] Add a few realistic sample records for all three tables.
- [ ] Connect Express to PostgreSQL using `pg` and parameterized queries.
- [ ] Test all API endpoints and persistence after refresh.
- [ ] Prepare a short demo: create customer → add subscription → generate invoice → mark paid → show dashboard.

### Final team checklist

- [ ] Frontend opens without JavaScript errors.
- [ ] API runs and database connects successfully.
- [ ] CRUD works for customers, subscriptions, and invoices.
- [ ] Invalid input and missing records show useful errors.
- [ ] Dashboard reflects stored data; distinguish demo-only chart values from real metrics.
- [ ] `.env` and `node_modules/` are excluded from Git.
- [ ] Each teammate can explain their part during the presentation.

## Known MVP limitations

- Revenue charts in the current frontend use illustrative data rather than database-derived historical totals.
- The Momentum Score is a heuristic, not a validated business KPI.
- Demo mode changes are not persisted across reloads.
- There is no login, role-based access, payment processing, or scheduled invoice generation.
- Production deployment would require stronger validation, access controls, and security review.

## Hackathon pitch

> **Brightloop — Clarity in Every Cycle.** A colorful subscription command center that helps small teams manage customers and invoices, spot overdue subscriptions, and see what's coming next — without getting lost in spreadsheets.

## License

No license has been selected yet. Add a `LICENSE` file if the team decides to publish the project under an open-source license.
