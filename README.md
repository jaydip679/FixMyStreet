# FixMyStreet

FixMyStreet is a community-driven civic issue reporting and municipal management web application. It empowers citizens to report civic infrastructure defects (such as potholes, overflowing garbage, broken streetlights, water leakage, and public property damage) with photographic evidence and geographic locations. Municipal administrators can verify reports, assign them to functional departments, and track resolutions through a deterministic lifecycle.

---

## Live URL

* **Production Deployed Web App:** `https://fixmystreet-client.vercel.app` *(or configured live host)*
* **Backend API Base URL:** `https://fixmystreet-api.onrender.com/api`
* **Health Check Endpoint:** `https://fixmystreet-api.onrender.com/health`

---

## How to Run Locally in $\le 5$ Commands

Follow these five commands from your terminal (requires Node.js v18+ and a local or Atlas MongoDB URI):

```bash
# 1. Clone the repository
git clone https://github.com/jaydip679/FixMyStreet.git

# 2. Navigate to project root
cd FixMyStreet

# 3. Install all dependencies across server and client workspaces
npm install

# 4. (Optional) Seed demo users, municipal departments, and sample reports
npm run seed

# 5. Start both backend and frontend applications concurrently
npm run dev
```

* Frontend runs at: `http://localhost:5173`
* Backend API runs at: `http://localhost:5000`

---

## Default Evaluation Accounts

When running the seeded database, log in with:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@fixmystreet.local` | `password123` | Submit reports, view own submissions, receive in-app notifications |
| **Administrator** | `admin@fixmystreet.gov` | `admin123` | Triage incoming reports, assign municipal departments, manage status |

---

## Running Automated Tests

All tests run in isolated environments with zero external dependencies:

```bash
# Run backend unit and API integration tests (Jest + Supertest with in-memory MongoDB)
npm run test:server

# Run frontend component tests (Vitest + React Testing Library)
npm run test:client

# Build frontend production bundle
npm run build
```

---

## Project Deliverables (IT643 — Software Design and Testing)

* [`UBIQUITOUS_LANGUAGE.md`](file:///UBIQUITOUS_LANGUAGE.md): Domain terminology table with code citations and flagged ambiguities.
* [`DESIGN.md`](file:///DESIGN.md): The 5 business rules, 3 design decisions with before/after comparisons, 1 architectural boundary, and AI tool disclosure.
* [`TESTING.md`](file:///TESTING.md): Business rule verification mapping, rule test count, and analysis of weak tests.
