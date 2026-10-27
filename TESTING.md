# TESTING.md

> **Project:** FixMyStreet — Civic Issue Reporting and Tracking Platform  
> **Course:** IT643 — Software Design and Testing | DAU  
> **Evaluation Reference:** Project Evaluation PDF  

---

## 1. Business-Rule Verification Table

| Rule | Test file:line | If untested — what stops you |
| :--- | :--- | :--- |
| **Rule 1 — Citizens can access only their own reports:** A Citizen can view and access only the IssueReport records they submitted; requests for another citizen's report are rejected with 403 Forbidden. | `server/tests/business_rules.api.test.js:76` | Fully tested. (Unit test also at `server/src/modules/reports/report.service.test.js:29`). |
| **Rule 2 — Only Admins can review and manage reports:** Only an authenticated user with the Administrator role can verify, reject, assign departments, or update report status. | `server/tests/business_rules.api.test.js:112` | Fully tested. (Unit test also at `server/src/modules/reports/report.service.test.js:81`). |
| **Rule 3 — Report status must follow the agreed workflow:** Report status transitions must strictly follow `SUBMITTED -> UNDER_REVIEW -> VERIFIED -> ASSIGNED -> IN_PROGRESS -> RESOLVED` (or `REJECTED`). Disallowed transitions are rejected without altering stored state. | `server/tests/business_rules.api.test.js:147` | Fully tested. (Unit tests also at `server/src/modules/reports/report.workflow.test.js:8` and `server/src/modules/reports/report.service.test.js:92`). |
| **Rule 4 — Department assignment must reference a valid department:** An Administrator can assign an IssueReport only to an existing, valid Department; nonexistent department IDs are rejected with 404 Not Found. | `server/tests/business_rules.api.test.js:179` | Fully tested. (Unit test also at `server/src/modules/reports/report.service.test.js:131`). |
| **Rule 5 — Notifications must reflect real report events:** When an agreed report milestone occurs, the system creates an in-app Notification referencing the exact report delivered exclusively to the owning Citizen. | `server/tests/business_rules.api.test.js:229` | Fully tested. (Unit test also at `server/src/modules/reports/report.service.test.js:144`). |

---

## 2. Evaluation Summary

* **How many of your five rules are tested:** All 5 of our five business rules are tested with automated unit and integration tests.
* **One test you would call weak, and why:** One test we would call weak is `GET /health returns 200 with status ok` in `server/tests/auth.api.test.js:26`, because it only asserts that the HTTP server is alive and returning a 200 status code with an uptime property, without verifying whether downstream database connections or disk persistence are actually healthy or operational.

---

## 3. Test Suite Execution Evidence

All test suites were executed and verified locally using isolated in-memory test databases:

### Backend Test Suite (Jest + Supertest)
* **Command:** `npm run test:server`
* **Test Suites:** 6 passed, 6 total
* **Tests:** 42 passed, 42 total
* **Verified Coverage Areas:**
  * `tests/business_rules.api.test.js`: End-to-end API verification of Rules 1 through 5.
  * `tests/auth.api.test.js`: Registration, login, profile, and deployment health check endpoints.
  * `src/modules/reports/report.service.test.js`: Domain service business logic for ownership isolation, admin permissions, and notification triggers.
  * `src/modules/reports/report.workflow.test.js`: Pure state transition machine testing allowed vs. disallowed lifecycle transitions.
  * `src/shared/middleware/auth.middleware.test.js`: JWT token verification and role authorization middleware.
  * `src/modules/auth/auth.service.test.js`: Password hashing, duplicate email detection, and credential validation.

### Frontend Test Suite (Vitest + React Testing Library)
* **Command:** `npm run test:client`
* **Test Suites:** 2 passed, 2 total
* **Tests:** 5 passed, 5 total
* **Verified Coverage Areas:**
  * `src/test/Navbar.test.jsx`: Role-aware UI rendering for unauthenticated visitors, citizens, and administrators.
  * `src/test/Login.test.jsx`: Form input handling, validation feedback, and invalid credential error alert display.
