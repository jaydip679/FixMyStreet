# Ubiquitous Language: FixMyStreet

> **Project:** FixMyStreet — Civic Issue Reporting and Tracking Platform  
> **Course:** IT643 — Software Design and Testing | DAU  
> **Evaluation Reference:** Project Evaluation PDF (Lab ⅔ Format)  
> **Status:** Synchronized with Production Implementation  

---

## 1. Domain Vocabulary

| Term | Definition | Aliases to avoid | Named in code at |
| :--- | :--- | :--- | :--- |
| **IssueReport** | The core digital aggregate representing a civic infrastructure problem submitted by a citizen with category, description, and location. | Ticket, Complaint, Grievance, Bug, Case | `server/src/modules/reports/report.model.js:46` |
| **Citizen** | A registered public resident or visitor who submits and tracks their own civic issue reports. | User, Customer, Client, End-User | `server/src/modules/users/user.model.js:5` |
| **Administrator** | An authorized municipal official with supervisory permissions to triage, verify, reject, assign departments, and resolve reports. | Admin, Superuser, Manager, Moderator | `server/src/modules/users/user.model.js:6` |
| **Department** | A municipal operational division (e.g., PWD, Sanitation, Electrical, Water) responsible for repairing specific categories of public defects. | Agency, Bureau, Unit, Team, Role | `server/src/modules/departments/department.model.js:3` |
| **IssueCategory** | Standardized classification of civic defects (`POTHOLE`, `GARBAGE`, `STREETLIGHT`, `WATER_LEAKAGE`, `INFRASTRUCTURE_OTHER`). | Type, ProblemType, Tag, Label | `server/src/modules/reports/report.model.js:4` |
| **Location** | The physical location of an infrastructure problem, comprising a mandatory street address and optional GPS coordinates. | Place, Pin, Coords, Position | `server/src/modules/reports/report.model.js:12` |
| **ReportStatus** | The discrete lifecycle state of an IssueReport (`SUBMITTED`, `UNDER_REVIEW`, `VERIFIED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`). | State, Condition, Stage, Phase | `server/src/modules/reports/report.workflow.js:3` |
| **Notification** | An in-app event alert generated when an agreed report lifecycle milestone occurs, delivered exclusively to the owning citizen. | Alert, Message, Push, Ping | `server/src/modules/notifications/notification.model.js:13` |
| **RejectionReason** | The mandatory explanatory rationale recorded by an Administrator when rejecting an invalid or out-of-jurisdiction report. | DenialCause, DeclineNote, Reason | `server/src/modules/reports/report.model.js:101` |
| **ResolutionNotes** | Remarks and details documented upon completion of physical remediation when transitioning an issue to `RESOLVED`. | FixDetails, CompletionRemarks, Proof | `server/src/modules/reports/report.model.js:106` |

---

## 2. Flagged Ambiguities

In accordance with course evaluation requirements, the following table documents all semantic ambiguities where one word carries two meanings, or two words refer to the same concept, along with the canonical term that wins and the rationale.

### Ambiguity 1: "Report" vs. "Ticket" vs. "Complaint"
* **The conflict:** Two words mean one concept. Citizens call their submission a *"complaint"*, software engineers colloquially call it a *"ticket"*, and municipal administrators call it an *"issue"*.
* **Winning term:** **`IssueReport`**
* **Reason:** "Ticket" reduces civic problems to IT helpdesk jargon. "Complaint" carries negative bureaucratic connotations. "IssueReport" denotes an objective, factual civic defect document with evidentiary location and description.

### Ambiguity 2: "Department" as an Organizational Entity vs. "Department" as a Login Role
* **The conflict:** One word means two things. In municipal government, a department is an administrative entity; in naive software systems, developers often create separate login roles for each department (`Role: PWD_OFFICER`, `Role: SANITATION_WORKER`).
* **Winning term:** **`Department` is strictly an assignable data entity; login roles are strictly `Citizen` and `Admin`.**
* **Reason:** Creating separate login roles for departments causes role explosion and coupling. FixMyStreet restricts system authentication to exactly two roles: `CITIZEN` and `ADMIN`. Department assignment is an attribute of the `IssueReport`, not an authentication credential.

### Ambiguity 3: "Resolved" vs. "Closed" vs. "Done"
* **The conflict:** Two words mean one concept, and one word ("Done") means two different things. A field worker considers a repair "done" when asphalt is poured; an administrator considers an issue "done" when verification is complete.
* **Winning term:** **`RESOLVED`**
* **Reason:** "Done" is ambiguous and uninformative. `RESOLVED` explicitly designates that physical remediation has occurred and resolution notes have been recorded, terminating active field workflows.

### Ambiguity 4: "Assignee" (Department vs. Individual Worker)
* **The conflict:** One word means two things. Assigning an issue can mean transferring jurisdiction to an organizational unit (e.g., Public Works Department) or delegating to an individual laborer.
* **Winning term:** **`assignedDepartment` (Entity Reference) and `assignedWorker` (Descriptive Field)**
* **Reason:** Legal accountability belongs to the Department, whereas physical execution is performed by a designated worker or crew. Separating the two fields prevents orphaned tasks when field crews rotate.

### Ambiguity 5: "User" vs. "Citizen"
* **The conflict:** One word means two things. In technical frameworks, every account in the database is a "User" (including Administrators). In the civic domain, the end-user reporting problems is a "Citizen".
* **Winning term:** **`Citizen` for the reporting persona; `User` only for the underlying technical authentication record.**
* **Reason:** Applying ubiquitous language requires reflecting the problem domain: public residents are citizens exercising civic responsibility, not commercial "users" or "customers".
