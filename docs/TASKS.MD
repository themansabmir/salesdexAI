## Epic_01: Authentication, Roles & Permissions

---

Task_Auth_01: Add Clerk backend SDK to API [SKIPPED - Used Custom JWT]
Task_Auth_02: Verify Clerk JWT on API requests [SKIPPED - Used Custom JWT]
Task_Auth_03: Add Clerk frontend SDK to Web App [SKIPPED - Used Custom JWT]
Task_Auth_04: Implement frontend auth state handling [DONE]
Task_Auth_05: Define role constants and enums [DONE]
Task_Auth_06: Define permission constants [DONE]
Task_Auth_07: Create role-to-permission mapping [DONE]
Task_Auth_08: Implement API organization context resolver [DONE]
Task_Auth_09: Implement API role guard middleware [DONE]
Task_Auth_10: Implement API permission guard middleware [DONE]
Task_Auth_11: Seed or identify super_admin users [DONE - First user is SUPER_ADMIN]
Task_Auth_12: Protect platform-level API routes [DONE]
Task_Auth_13: Protect organization-level API routes [DONE]
Task_Auth_14: Implement role upgrade and downgrade API [TODO]
Task_Auth_15: Add audit logging for role changes [TODO]
Task_Auth_16: Implement frontend route guards [DONE]
Task_Auth_17: Implement frontend conditional UI rendering [DONE]
Task_Auth_18: Add API tests for RBAC enforcement [TODO]
Task_Auth_19: Add frontend tests for access control [TODO]
Task_Auth_20: Document role and permission matrix [DONE - see use-permissions.ts and permissions.ts]

## Epic_02: Organization Setup & Management

---

Task_Org_01: Create organization creation API [DONE]
Task_Org_02: Auto-assign admin role to org creator [DONE]
Task_Org_03: Enforce one-organization-per-user rule [DONE]
Task_Org_04: Initialize wallet on organization creation [DONE]
Task_Org_05: Create organization retrieval API [DONE]
Task_Org_06: Update organization settings API [DONE]
Task_Org_07: Implement organization pause and archive API [DONE]
Task_Org_08: Add organization status enforcement middleware [DONE]
Task_Org_09: Implement invite user API [DONE]
Task_Org_10: Generate and store invitation token [DONE]
Task_Org_11: Send invitation email [DONE - Placeholder implementation]
Task_Org_12: Implement invite acceptance API [DONE]
Task_Org_13: Validate invite token and expiry [DONE]
Task_Org_14: List organization members API [DONE]
Task_Org_15: Update organization member role API [DONE]
Task_Org_16: Remove organization member API [DONE]
Task_Org_17: Prevent self-removal of sole admin [DONE]
Task_Org_18: Add audit logging for org membership changes [TODO]
Task_Org_19: Implement frontend org creation flow [DONE]
Task_Org_20: Implement frontend org management screen [DONE]







## Epic_03: Superadmin System Configuration

---

Task_Sys_01: Create system config model access layer [DONE]
Task_Sys_02: Implement system config read API [DONE]
Task_Sys_03: Implement system config update API [DONE]
Task_Sys_04: Enforce super_admin guard on system APIs [DONE]
Task_Sys_05: Configure global pricing setting [DONE]
Task_Sys_06: Configure live analysis concurrency limit [DONE]
Task_Sys_07: Implement feature flag configuration per org [DONE]
Task_Sys_08: Implement org pause control [DONE]
Task_Sys_09: Implement manual wallet credit API [DONE]
Task_Sys_10: Implement manual wallet debit API [DONE]
Task_Sys_11: Add audit logging for system config changes [DONE]
Task_Sys_12: Implement global usage metrics API [DONE]
Task_Sys_13: Implement superadmin dashboard UI shell [DONE]
Task_Sys_14: Display global metrics in dashboard [DONE]
Task_Sys_15: Implement org list and org detail views [TODO]
Task_Sys_16: Add org pause/unpause actions in UI [TODO]
Task_Sys_17: Add frontend guards for superadmin routes [DONE]
Task_Sys_18: Add tests for system config access control [TODO]


## Epic_04: Billing, Wallet & Hard Stop Enforcement

---

Task_Bill_01: Create wallet retrieval API [DONE]
Task_Bill_02: Create wallet transaction ledger API [DONE]
Task_Bill_03: Implement wallet credit logic [DONE]
Task_Bill_04: Implement wallet debit logic [DONE]
Task_Bill_05: Implement billing rate resolver [DONE]
Task_Bill_06: Calculate meeting cost from duration [DONE]
Task_Bill_07: Deduct balance on meeting completion [DONE]
Task_Bill_08: Implement hard stop billing guard [DONE]
Task_Bill_09: Disable bot invite on insufficient balance [DONE]
Task_Bill_10: Add billing status to meeting records [DONE]
Task_Bill_11: Implement super_admin billing override [DONE]
Task_Bill_12: Trigger low-balance warning events [DONE]
Task_Bill_13: Send low-balance warning emails [TODO]
Task_Bill_14: Display wallet balance in frontend [DONE]
Task_Bill_15: Display usage and cost trends [DONE]
Task_Bill_16: Prevent negative wallet balances [DONE]
Task_Bill_17: Add billing unit tests [TODO]

---

## Epic_05: Organization Knowledge Base

---

Task_KB_01: Create knowledge document upload API [DONE]
Task_KB_02: Store uploaded files securely [DONE]
Task_KB_03: Persist knowledge document metadata [DONE]
Task_KB_04: Implement knowledge document listing API [DONE]
Task_KB_05: Implement knowledge document deletion API [DONE]
Task_KB_06: Generate embeddings for uploaded documents [DONE]
Task_KB_07: Store embedding references [DONE]
Task_KB_08: Implement competitor CRUD API [DONE]
Task_KB_09: Enforce org-scoped access for knowledge base [DONE]
Task_KB_10: Integrate knowledge base with AI retrieval [DONE]
Task_KB_11: Add frontend knowledge base management UI [TODO]
Task_KB_12: Add frontend competitor management UI [TODO]
Task_KB_13: Add role-based access enforcement for KB UI [TODO]
Task_KB_14: Add tests for knowledge base access control [TODO]

---

## Epic_06: Meeting Bot & Transcript Ingestion

---

Task_Meet_01: Create meeting creation API
Description: Implement API to create meeting record with org and user context.

Task_Meet_02: Enforce billing guard on meeting creation
Description: Block meeting creation when wallet balance is insufficient.

Task_Meet_03: Generate bot invite link
Description: Generate and persist bot invite or join link for meeting.

Task_Meet_04: Implement bot join workflow
Description: Enable bot service to join meeting using invite link.

Task_Meet_05: Capture live transcript or audio stream
Description: Ingest transcript or audio chunks from meeting platform.

Task_Meet_06: Persist transcript chunks
Description: Store transcript entries with speaker labels and timestamps.

Task_Meet_07: Handle meeting start and end events
Description: Track join time, leave time, and meeting lifecycle events.

Task_Meet_08: Calculate meeting duration
Description: Compute meeting duration from start and end timestamps.

Task_Meet_09: Associate meeting with organization and users
Description: Persist organization and participant references on meeting.

Task_Meet_10: Trigger post-meeting billing
Description: Initiate billing workflow when meeting ends.

Task_Meet_11: Trigger post-call AI analysis
Description: Enqueue AI analysis job after meeting completion.

Task_Meet_12: Implement transcript retrieval API
Description: Fetch full transcript for authorized users.

Task_Meet_13: Implement meeting list API
Description: Fetch paginated list of meetings scoped to role and org.

Task_Meet_14: Implement meeting detail API
Description: Fetch meeting details including transcript and status.

Task_Meet_15: Add error handling for bot failures
Description: Gracefully handle bot join or stream failures without data loss.

Task_Meet_16: Log bot activity and failures
Description: Persist logs for bot joins, leaves, and errors.

Task_Meet_17: Add frontend meeting list UI
Description: Display meetings list with status and duration.

Task_Meet_18: Add frontend transcript viewer
Description: Render transcript with speaker labels and timestamps.

Task_Meet_19: Enforce access control for meeting data
Description: Ensure users only access meetings they are allowed to view.

Task_Meet_20: Add tests for meeting lifecycle
Description: Validate meeting creation, ingestion, and completion flows.







## Epic_07: Post-Call AI Sales Analysis

---

Task_AI_01: Define post-call analysis output schema
Description: Define strict JSON schema for AI analysis output including scores and feedback.

Task_AI_02: Create post-call analysis prompt template
Description: Create prompt template aligned with sales rubric and analysis schema.

Task_AI_03: Load meeting transcript for analysis
Description: Fetch and prepare full meeting transcript for AI processing.

Task_AI_04: Retrieve organization knowledge for grounding
Description: Load relevant org knowledge base and competitor data for RAG.

Task_AI_05: Execute post-call AI analysis
Description: Run AI inference using transcript and grounded context.

Task_AI_06: Validate AI output against schema
Description: Validate AI response structure and reject invalid outputs.

Task_AI_07: Persist AI analysis results
Description: Store summary, mistakes, improvements, and scores linked to meeting.

Task_AI_08: Link AI analysis to transcript timestamps
Description: Associate feedback items with transcript timestamps.

Task_AI_09: Implement retry logic for failed analysis
Description: Retry AI analysis on transient failures with backoff.

Task_AI_10: Expose AI analysis retrieval API
Description: Implement API to fetch post-call analysis for authorized users.

Task_AI_11: Add role-based access control for analysis data
Description: Enforce access rules for sales_person, org_manager, and admin.

Task_AI_12: Display post-call analysis in UI
Description: Render AI feedback, scores, and highlights in meeting review UI.

Task_AI_13: Add tests for post-call analysis pipeline
Description: Validate analysis execution, storage, and retrieval.

---

## Epic_08: Live Call AI Suggestions

---

Task_Live_01: Setup real-time transport layer
Description: Configure WebSocket or equivalent for live meeting communication.

Task_Live_02: Authenticate live connection
Description: Authenticate users joining live suggestion stream.

Task_Live_03: Stream transcript chunks to live pipeline
Description: Send real-time transcript chunks to AI suggestion service.

Task_Live_04: Maintain sliding transcript window
Description: Maintain rolling context window for live AI analysis.

Task_Live_05: Create live suggestion prompt template
Description: Define short prompt template for real-time suggestion generation.

Task_Live_06: Generate live AI suggestions
Description: Run AI inference to produce concise live suggestions.

Task_Live_07: Emit suggestion cards to frontend
Description: Push generated suggestions to connected clients.

Task_Live_08: Rate-limit live suggestions
Description: Prevent suggestion spam by enforcing emission limits.

Task_Live_09: Persist live suggestions for review
Description: Store live suggestions linked to meeting for post-call access.

Task_Live_10: Handle live analysis failure gracefully
Description: Disable live suggestions without affecting meeting flow.

Task_Live_11: Render live suggestion cards in UI
Description: Display real-time suggestion cards during active meeting.

Task_Live_12: Add latency monitoring for live suggestions
Description: Track and log suggestion latency metrics.

Task_Live_13: Enforce concurrency limits
Description: Enforce max concurrent live analysis sessions.

Task_Live_14: Add tests for live suggestion flow
Description: Validate streaming, generation, and delivery logic.

---

## Epic_09: Mock Sales Call with AI Agent

---

Task_Mock_01: Create mock call creation API
Description: Implement API to start a new mock sales session.

Task_Mock_02: Define buyer persona prompt templates
Description: Create AI buyer personas for different sales scenarios.

Task_Mock_03: Implement scenario selection logic
Description: Allow selection of mock call scenarios during initiation.

Task_Mock_04: Generate AI buyer responses
Description: Generate AI-driven buyer responses during mock call.

Task_Mock_05: Capture mock call transcript
Description: Record transcript for both user and AI buyer turns.

Task_Mock_06: End mock call and finalize transcript
Description: Finalize transcript when mock call session ends.

Task_Mock_07: Run post-call analysis on mock session
Description: Execute standard AI analysis pipeline for mock calls.

Task_Mock_08: Exclude or discount mock calls from billing
Description: Apply billing rules to exclude or discount mock sessions.

Task_Mock_09: Persist mock call results
Description: Store transcript and analysis linked to mock session.

Task_Mock_10: Expose mock call history API
Description: Fetch list of past mock calls for user.

Task_Mock_11: Render mock call UI
Description: Provide UI for starting and interacting with mock calls.

Task_Mock_12: Display mock call feedback
Description: Display AI feedback and scores for completed mock calls.

Task_Mock_13: Enforce role access for mock calls
Description: Restrict mock call access to sales_person and org_manager.

Task_Mock_14: Add tests for mock call flow
Description: Validate mock session creation, execution, and analysis.

---

## Epic_10: Coaching & Improvement Tracking

---

Task_Coach_01: Define coaching metrics model
Description: Define data model for recurring issues and trends.

Task_Coach_02: Aggregate mistakes per sales person
Description: Aggregate recurring mistakes from AI analysis results.

Task_Coach_03: Compute improvement trends
Description: Calculate trend scores over time per sales person.

Task_Coach_04: Identify top focus areas
Description: Derive top three improvement areas per sales person.

Task_Coach_05: Persist coaching metrics
Description: Store computed coaching metrics and trends.

Task_Coach_06: Update metrics after each analysis
Description: Incrementally update coaching metrics after meeting analysis.

Task_Coach_07: Expose coaching metrics API
Description: Provide API to fetch coaching metrics for authorized users.

Task_Coach_08: Enforce access control on coaching data
Description: Restrict access to personal and team-level metrics by role.

Task_Coach_09: Render personal coaching dashboard
Description: Display trends and focus areas for sales_person.

Task_Coach_10: Render team coaching dashboard
Description: Display aggregated team metrics for org_manager.

Task_Coach_11: Add caching for coaching metrics
Description: Cache computed metrics to avoid repeated aggregation.

Task_Coach_12: Add tests for coaching calculations
Description: Validate correctness of trend and focus calculations.

---

## Epic_11: Dashboards & Reporting

---

Task_Dash_01: Implement role-aware dashboard routing
Description: Route users to correct dashboard based on role.

Task_Dash_02: Build sales_person dashboard
Description: Display personal meetings, feedback, and trends.

Task_Dash_03: Build org_manager dashboard
Description: Display team performance and coaching insights.

Task_Dash_04: Build admin dashboard
Description: Display org usage, billing, and knowledge base overview.

Task_Dash_05: Build manager dashboard
Description: Display cross-org high-level metrics.

Task_Dash_06: Build super_admin dashboard
Description: Display global platform usage and health metrics.

Task_Dash_07: Implement meeting list with filters
Description: Add pagination and filters for meeting history.

Task_Dash_08: Implement transcript and analysis views
Description: Provide detailed views for transcripts and AI feedback.

Task_Dash_09: Implement usage and billing reports
Description: Display balance, ledger, and usage trends.

Task_Dash_10: Implement export functionality
Description: Allow exporting reports as CSV or PDF.

Task_Dash_11: Enforce dashboard access control
Description: Ensure dashboards and reports respect role permissions.

Task_Dash_12: Optimize dashboard data loading
Description: Add indexing and caching for dashboard queries.

Task_Dash_13: Add dashboard performance tests
Description: Validate dashboard load times under realistic data volumes.
