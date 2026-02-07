# PHASE 2 — Epics, Acceptance Criteria, Definition of Done (FINAL)

---

## EPIC 1: Authentication, Roles & Permissions

**Functional Requirements**

* Users authenticate via third-party auth provider (Clerk).
* Support 5 distinct roles: `super_admin`, `manager`, `admin`, `org_manager`, `sales_person`.
* Platform roles (`super_admin`, `manager`) have system-wide access.
* Organization roles (`admin`, `org_manager`, `sales_person`) are scoped to single org.
* Fine-grained permission checks enforced at API and UI level.
* Role upgrade/downgrade flows managed by appropriate authorities.

**Acceptance Criteria**

* User can sign up and log in successfully.
* Each role has correct access permissions verified.
* `super_admin` can access platform-wide admin endpoints.
* `manager` can view/manage orgs but cannot change pricing/infrastructure.
* `admin` can manage org settings, billing, and invites.
* `org_manager` can view team analytics but cannot modify billing.
* `sales_person` can only access personal meetings and feedback.
* Invalid access attempts return 403 Forbidden.
* UI conditionally renders features based on user role.

**Definition of Done**

* Centralized RBAC middleware implemented.
* Permission matrix documented and reviewed.
* Role checks enforce boundaries at every protected endpoint.
* Unit tests cover all role-based access scenarios.
* Frontend guards prevent unauthorized UI access.

---

## EPIC 2: Organization Setup & Management

**Functional Requirements**

* New organizations can be created (by `super_admin` or self-service signup).
* Organization has unique identifier, name, and settings.
* `admin` role assigned to organization creator.
* `admin` can invite users to organization via email.
* Invited users join with specified role (`org_manager` or `sales_person`).
* User belongs to exactly one organization.
* Organization can be paused or archived by `super_admin`.

**Acceptance Criteria**

* Organization creation flow completes successfully.
* First user becomes `admin` automatically.
* `admin` can send email invitations with role selection.
* Invited user receives email and can accept invite.
* User-organization relationship enforced in all queries.
* Organization settings (name, metadata) can be updated by `admin`.
* Archived organizations block new activity but preserve data.

**Definition of Done**

* Organization CRUD endpoints functional.
* Invite flow end-to-end tested.
* Email delivery confirmed.
* One-org-per-user constraint enforced at database level.
* UI for org creation and management completed.
* Role assignment during invite validated.

---

## EPIC 3: Superadmin System Configuration

**Functional Requirements**

* `super_admin` can configure global pricing (default: $2/hour).
* `super_admin` can set max live-analysis concurrency limits.
* `super_admin` can enable/disable features per organization.
* `super_admin` can view global usage metrics across all orgs.
* `super_admin` can manually credit or debit organization balances.
* All configuration changes are audit-logged.

**Acceptance Criteria**

* Superadmin dashboard loads and displays global stats.
* Pricing changes apply only to new usage (not retroactive).
* Feature flags correctly enable/disable functionality per org.
* Organization can be paused, blocking all billable activity.
* Manual balance adjustments reflect immediately in org wallet.
* Audit log captures timestamp, admin user, action, and affected org.

**Definition of Done**

* Protected routes enforce `super_admin` role.
* Configuration values persisted in database.
* No organization can override global hard limits.
* Audit log queryable and exportable.
* UI provides clear controls for all config options.
* Tests verify privilege escalation is impossible.

---

## EPIC 4: Billing, Wallet & Hard Stop Enforcement

**Functional Requirements**

* Each organization has a prepaid wallet with balance.
* Usage is metered at $2 per hour of analyzed meeting time.
* Balance is deducted in real-time as meetings are analyzed.
* Hard stop: when balance reaches zero, no new meetings can be joined.
* Bot invite functionality disabled when funds exhausted.
* Email and UI warnings triggered at thresholds (80%, 95% depletion).
* `admin` can view detailed usage ledger with timestamps and costs.
* `super_admin` can override balance restrictions.

**Acceptance Criteria**

* Meeting analysis stops immediately when balance reaches zero.
* Bot cannot join new meetings without sufficient balance.
* Real-time balance updates reflected in UI.
* Warning emails sent at 80% and 95% depletion.
* Usage ledger shows all transactions with meeting references.
* Cost calculation matches meeting duration accurately.
* `super_admin` override allows analysis even at zero balance.
* No negative balances possible under normal operation.

**Definition of Done**

* Atomic usage deduction implemented (no race conditions).
* Wallet balance enforced before every billable action.
* Billing logic unit-tested with edge cases.
* Email notification system functional.
* Ledger API endpoint optimized for large datasets.
* Dashboard displays current balance and usage trends.

---

## EPIC 5: Organization Knowledge Base

**Functional Requirements**

* `admin` can upload documents (text, PDF, Markdown).
* `admin` can add, edit, and delete competitor information.
* Uploaded content is stored securely and indexed for AI retrieval (RAG).
* Knowledge base is strictly scoped to organization (no cross-org leakage).
* Vector embeddings generated for semantic search.
* AI analysis and suggestions reference knowledge base content.

**Acceptance Criteria**

* `admin` can upload, view, and delete documents via UI.
* Document metadata persisted (filename, upload date, size).
* Competitor entries include name, strengths, weaknesses, differentiators.
* Vector embeddings created automatically on upload.
* AI responses cite relevant knowledge base sections.
* `org_manager` and `sales_person` can view but not modify knowledge base.
* No user can access another organization's knowledge base.

**Definition of Done**

* File storage integration completed (S3 or equivalent).
* Metadata and file references stored in database.
* Vector database configured and operational (Pinecone, Weaviate, or MongoDB Atlas).
* RAG pipeline tested with sample queries.
* Access control verified for all roles.
* UI screens for upload and management completed.

---

## EPIC 6: Meeting Bot & Transcript Ingestion

**Functional Requirements**

* System generates bot invite link or calendar integration.
* Bot joins supported meeting platforms (Zoom, Google Meet).
* Bot captures live audio stream or accesses transcript API.
* Transcript stored with speaker labels and timestamps.
* Meeting associated with organization and participating users.
* Meeting duration tracked accurately for billing.
* Bot leaves meeting automatically when ended.

**Acceptance Criteria**

* Bot successfully joins meeting via link.
* Transcript data persisted with timestamp and speaker attribution.
* Meeting record created with organization ID and user list.
* Duration calculated from join to leave timestamps.
* Transcript viewable in UI after meeting ends.
* Error handling prevents data loss on connection failure.
* Bot does not join if organization balance is zero.

**Definition of Done**

* Meeting lifecycle managed end-to-end (join, capture, leave, store).
* Transcript storage schema validated.
* Error handling and retry logic implemented.
* Logging captures all bot activity.
* Integration tested with Zoom and Google Meet.
* API endpoints for meeting CRUD completed.

---

## EPIC 7: Post-Call AI Sales Analysis

**Functional Requirements**

* Analyze completed meeting transcript automatically.
* Detect sales mistakes (weak discovery, poor objection handling, excessive talk ratio).
* Identify missed opportunities aligned with sales best practices.
* Generate improvement suggestions grounded in organization knowledge base.
* Produce structured feedback with transcript timestamps.
* Score calls across dimensions (clarity, value articulation, objection handling).
* Analysis references competitor data when relevant.

**Acceptance Criteria**

* Analysis runs automatically within 5 minutes of meeting end.
* Feedback includes specific transcript excerpts with timestamps.
* Suggestions are actionable and contextual to conversation.
* Scoring is consistent and reproducible.
* Analysis uses organization knowledge base for grounding.
* Output visible in UI with clear structure.
* Failed analysis triggers retry mechanism.

**Definition of Done**

* AI analysis pipeline implemented and tested.
* Deterministic output schema defined and validated.
* Feedback and scores stored in database linked to meeting.
* Retry logic handles transient failures.
* RAG integration confirmed with knowledge base.
* Performance benchmarks met (latency, accuracy).

---

## EPIC 8: Live Call AI Suggestions

**Functional Requirements**

* Stream transcript chunks during live meeting.
* Perform near-real-time analysis on streaming data.
* Surface actionable suggestion cards to UI during call.
* Suggestions are concise (1-2 sentences max).
* Prompts aligned with sales best practices and org knowledge.
* Low-latency delivery (sub-5 second target).
* Suggestions update as conversation progresses.

**Acceptance Criteria**

* Suggestions appear in UI during active meeting.
* Latency remains within 5-second threshold from transcript to suggestion.
* Suggestions reference current conversation context.
* System degrades gracefully if live analysis fails (no crash).
* Multiple concurrent live meetings supported per organization.
* Suggestions logged for post-call review.

**Definition of Done**

* Streaming transcript pipeline operational.
* WebSocket or equivalent real-time transport implemented.
* UI renders suggestion cards without blocking.
* Monitoring and alerting configured for latency.
* Load testing confirms multi-meeting concurrency.
* Fallback behavior tested (live analysis disabled).

---

## EPIC 9: Mock Sales Call with AI Agent

**Functional Requirements**

* `sales_person` can initiate a mock sales call.
* AI agent acts as buyer persona (prospect, skeptical buyer, technical evaluator).
* Scenario selection available (cold call, objection-heavy, product demo).
* Mock call generates transcript without external meeting platform.
* AI evaluates performance and provides post-call feedback.
* Mock calls optionally excluded from billing or discounted.
* Transcript and feedback stored for review.

**Acceptance Criteria**

* Mock call starts and runs without requiring Zoom/Google Meet.
* AI buyer persona responds realistically based on selected scenario.
* Transcript generated with speaker labels (User, AI Buyer).
* Feedback quality matches real-call analysis standards.
* Mock call accessible only to `sales_person` and `org_manager` roles.
* Billing configuration allows free or discounted mock calls.

**Definition of Done**

* AI agent prompt templates created for each persona.
* Mock call flow implemented (voice or text-based).
* Transcript and feedback stored in database.
* Billing logic excludes or discounts mock calls as configured.
* UI provides scenario selection and call initiation.
* Tests validate persona behavior and feedback accuracy.

---

## EPIC 10: Coaching & Improvement Tracking

**Functional Requirements**

* Track recurring mistakes per `sales_person` across meetings.
* Calculate improvement trends over time (week-over-week, month-over-month).
* Highlight "top 3 focus areas" for each sales person.
* `org_manager` can view team-level aggregated insights.
* Metrics persist across meetings and update incrementally.
* Visual trends displayed on dashboard (charts/graphs).

**Acceptance Criteria**

* Recurring mistakes identified and categorized.
* Improvement trends visible per sales person.
* "Top 3 focus areas" updated after each meeting.
* `org_manager` sees aggregated team performance.
* Historical data does not degrade with volume.
* Charts load within acceptable time.

**Definition of Done**

* Aggregation logic implemented and optimized.
* Analytics cached to prevent repeated computation.
* Data ownership enforced (sales person cannot see peers' details).
* UI displays trends with appropriate visualizations.
* Tests verify trend calculation accuracy.
* Performance validated with large datasets.

---

## EPIC 11: Dashboards & Reporting

**Functional Requirements**

* `sales_person` can view personal meeting feedback and improvement trends.
* `org_manager` can view team performance and coaching insights.
* `admin` can view organization usage, billing ledger, and knowledge base.
* `manager` can view all organizations and their high-level stats.
* `super_admin` can view global platform metrics and usage.
* Historical meeting data accessible with filters and pagination.
* Permissions strictly enforce data visibility per role.

**Acceptance Criteria**

* Each role sees only appropriate data.
* Meeting list loads with pagination and filtering (date, user, score).
* Feedback is readable, structured, and linked to transcripts.
* Usage dashboard shows balance, consumption, and trends.
* Permissions enforced on all API endpoints and UI views.
* Data loads within 3 seconds for typical queries.
* No data leakage across organizations confirmed.

**Definition of Done**

* UI screens completed for all 5 roles.
* API endpoints optimized with indexing and caching.
* Pagination implemented for all list views.
* Role-based access verified with automated tests.
* Performance benchmarks met for data loading.
* Export functionality available for reports (CSV/PDF).

