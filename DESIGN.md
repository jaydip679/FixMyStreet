# DESIGN.md

> **Project:** FixMyStreet — Civic Issue Reporting and Tracking Platform  
> **Course:** IT643 — Software Design and Testing | DAU  
> **Evaluation Reference:** Project Evaluation PDF  

---

## 1. Five Business Rules Enforced by the Product (in Plain English)

1. **Rule 1 — Citizen Report Ownership:** A **Citizen** can view and access only the **IssueReport** records they submitted. Any authenticated request by a Citizen attempting to view or retrieve another Citizen's private report is rejected with HTTP `403 Forbidden`.
2. **Rule 2 — Administrator-Only Triage & Management:** Only an authenticated user possessing the **Administrator** role may verify reports, reject reports, assign a **Department**, or update report status. Any Citizen attempting an administrative action is rejected with HTTP `403 Forbidden`.
3. **Rule 3 — Deterministic Report Lifecycle Transitions:** An **IssueReport** status may change only through explicitly allowed transitions:
   $$\text{SUBMITTED} \longrightarrow \text{UNDER\_REVIEW} \longrightarrow \text{VERIFIED} \longrightarrow \text{ASSIGNED} \longrightarrow \text{IN\_PROGRESS} \longrightarrow \text{RESOLVED}$$
   *(with $\text{UNDER\_REVIEW} \longrightarrow \text{REJECTED}$ as the terminal rejection path requiring a mandatory **RejectionReason**)*. Any request attempting an invalid jump (e.g., `SUBMITTED` directly to `RESOLVED`) is rejected with HTTP `400 Bad Request`, and the stored status remains unchanged.
4. **Rule 4 — Department Assignment Referential Integrity:** An Administrator may assign an IssueReport only to a **Department** that exists in the system. Submitting a nonexistent department identifier is rejected with HTTP `404 Not Found`.
5. **Rule 5 — Event-Driven In-App Notifications:** When an agreed report milestone occurs (submission, verification, rejection, department assignment, work started, or resolution), the system creates an in-app **Notification** referencing the exact report and delivered specifically to the Citizen who owns that report, never to unrelated users.

---

## 2. Three Meaningful Design Decisions

### Decision 1: Pure State Machine Extraction for Lifecycle Transitions
* **Principle Applied:** **Single Responsibility Principle (SRP)** & **Dependency Inversion Principle (DIP)**.
* **Code Location:** [`server/src/modules/reports/report.workflow.js:15-46`](file:///d:/theLastbug/server/src/modules/reports/report.workflow.js#L15-L46)
* **What it looked like before, and why we changed it:**
  * *Before:* In early drafting, status transition checks were embedded directly inside the Express HTTP controller. When an admin sent a PATCH request, the controller queried the document, performed ad-hoc `if/else` checks against string literals, mutated the Mongoose document, and returned a response.
  * *Why changed:* This coupled HTTP request handling with state machine business rules and database mutations. Testing an invalid transition required spinning up an Express server and MongoDB. We extracted `report.workflow.js` as a pure, zero-dependency domain module with an immutable `ALLOWED_TRANSITIONS` lookup table and a pure `validateTransition()` function. As a result, the transition logic has single responsibility, zero external dependencies, and can be unit-tested in isolation in milliseconds without Express or MongoDB.

### Decision 2: Repository Layer Encapsulation of Report Persistence
* **Principle Applied:** **Information Hiding & Separation of Concerns (Architectural Boundary)**.
* **Code Location:** [`server/src/modules/reports/report.repository.js:3-37`](file:///d:/theLastbug/server/src/modules/reports/report.repository.js#L3-L37)
* **What it looked like before, and why we changed it:**
  * *Before:* `report.service.js` directly called Mongoose methods (`IssueReport.findOne({...})`, `.populate('citizen', 'name email')`, `.populate('assignedDepartment')`, `.sort({ createdAt: -1 })`).
  * *Why changed:* Direct calls to Mongoose query builders spread database query syntax throughout the business service layer. Unit testing `ReportService` required mocking complex chainable Mongoose query APIs (`find().sort().populate()`), making tests brittle and slow. We encapsulated all data access behind `ReportRepository`, presenting domain-meaningful methods (`findByCitizenId`, `findAllReports`, `saveReport`). This allows `ReportService` to receive mock repositories effortlessly in unit tests and keeps database query semantics hidden behind a clean boundary.

### Decision 3: Decoupled In-App Notification Service
* **Principle Applied:** **Open/Closed Principle (OCP)** & **High Cohesion**.
* **Code Location:** [`server/src/modules/notifications/notification.service.js:4-31`](file:///d:/theLastbug/server/src/modules/notifications/notification.service.js#L4-L31)
* **What it looked like before, and why we changed it:**
  * *Before:* Notification creation was originally planned as direct writes to a notifications collection inside the report status controller after every update.
  * *Why changed:* Writing notifications directly inside report update handlers violated cohesion and created shotgun surgery: adding a new notification event or modifying notification message templates required modifying the report controller. We introduced `NotificationService.notifyCitizen()` as a dedicated domain collaborator. `ReportService` invokes `notifyCitizen()` by passing domain events (`NotificationEvents.REPORT_VERIFIED`, etc.), cleanly decoupling notification generation from report lifecycle management and enabling future notification delivery channels (such as email or SMS) without touching report logic.

---

## 3. One Architectural Boundary

* **Boundary Definition:** The boundary separates the core domain business logic in [`server/src/modules/reports/report.service.js`](file:///d:/theLastbug/server/src/modules/reports/report.service.js) from external persistence and notification infrastructure ([`report.repository.js`](file:///d:/theLastbug/server/src/modules/reports/report.repository.js), [`department.service.js`](file:///d:/theLastbug/server/src/modules/departments/department.service.js), and [`notification.service.js`](file:///d:/theLastbug/server/src/modules/notifications/notification.service.js)).
* **Dependency it Protects Against:** It protects the core civic business rules—citizen ownership isolation (Rule 1), administrative role verification (Rule 2), lifecycle state invariants (Rule 3), department validation (Rule 4), and notification event dispatching (Rule 5)—from **Mongoose and MongoDB database driver dependencies**.
* **Concrete Verification:** In [`server/src/modules/reports/report.service.test.js`](file:///d:/theLastbug/server/src/modules/reports/report.service.test.js), all five business rules are verified using pure in-memory mock collaborators without establishing any network connection to MongoDB or importing Mongoose driver objects.

---

## 4. AI Tool Disclosure

### Tools Used
* **Antigravity (Google DeepMind Agentic Coding Assistant)**: Used for scaffolding repository structure, writing initial boilerplate, executing automated test suites, analyzing course lecture PDFs for code smell patterns, and verifying alignment with instructor requirements.

### Rejected AI Suggestion and Rationale
* **Rejected AI Suggestion:** During initial architecture planning, the AI assistant suggested implementing a distributed event-driven microservices architecture utilizing an Apache Kafka message broker for report events and integrating an automated Convolutional Neural Network (CNN) deep-learning model to detect potholes from uploaded photos.
* **Why We Rejected It:** The team rejected this suggestion because:
  1. It fundamentally violates the core objective of the IT643 course: the project is an evaluation of **software design principles, refactoring, and automated testing**, not a commercial startup competition.
  2. Introducing Kafka, Dockerized microservices, and deep-learning containers introduces severe operational complexity, risks deployment failure, and makes it impossible to satisfy the instructor's mandatory requirement that the application run locally in **$\le 5$ commands**.
  3. A clean, modular monolith with an in-memory test database, deterministic state machine, and in-app notifications provides a far clearer, more defensible codebase that every team member can thoroughly explain during the viva.
