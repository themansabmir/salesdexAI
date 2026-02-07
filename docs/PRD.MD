PHASE 1 — Discovery & PRD

---

## Product Summary (Working Name)

AI Sales Call Coach

A web application that joins sales meetings as a bot, captures transcripts, analyzes conversations using AI, and provides actionable feedback to improve sales performance. Feedback is available post-call (deep analysis) and during live calls (real-time suggestion cards). Billing follows a pay-as-you-go model at USD 2 per hour of meeting analysis.

---

## Problem Statement

Sales teams lack objective, consistent feedback on live sales calls. Human coaching is expensive, subjective, delayed, and does not scale. Existing tools often provide generic insights that do not reflect the company’s product, positioning, or competitors.

---

## Core Value Proposition

Provide real-time and post-call AI coaching tailored to a company’s specific product knowledge and competitive landscape, enabling measurable improvement in sales effectiveness with usage-based pricing.

---

## Target Users & Personas

1. Superadmin
   Platform owner. Manages system-level configuration, pricing rules, quotas, abuse prevention, and global analytics.

2. OrgAdmin
   Represents a company. Manages organization settings, billing, knowledge base, competitor data, and invites team members.

3. OrgMember (Manager / Sales Rep)
   Participates in calls, views feedback, receives live suggestions, and reviews historical performance.

---

## Core Features (MVP Scope)

### Meeting Ingestion

* Invite AI bot to live meetings (initially Zoom/Google Meet via link or calendar integration).
* Capture live audio stream or transcript.
* Store timestamped transcripts per meeting.

### AI Analysis (Post-Call)

* Detect sales mistakes (e.g., weak discovery, poor objection handling, excessive talk ratio).
* Highlight missed opportunities aligned with sales best practices.
* Provide improvement suggestions contextualized to the company’s product and competitors.
* Score calls across defined dimensions (clarity, value articulation, objection handling).

### Live Call Assistance

* Real-time suggestion cards surfaced during the call.
* Short, actionable prompts (e.g., “Ask about budget,” “Clarify pain point,” “Mention differentiator X”).
* Non-intrusive, low-latency delivery.

### Organization Knowledge Base

* OrgAdmins upload:

  * Product documentation.
  * Value propositions.
  * FAQs.
  * Competitor information.
* AI uses this data to ground responses and suggestions.

### Billing

* Pay-as-you-go pricing.
* USD 2 per hour of analyzed meeting time.
* Track usage at organization level.
* Hard limits or soft warnings based on balance.

### Access Control

* Role-based access:

  * Superadmin: platform-wide.
  * OrgAdmin: org-level control.
  * OrgMember: usage and insights only.

---

## Out of Scope (MVP)

* Custom ML model training.
* CRM write-back (Salesforce, HubSpot).
* Automated deal forecasting.
* Multi-language support beyond English.

---

## Non-Functional Requirements

* Low latency for live suggestions (sub-5s target).
* Type-safe codebase (TypeScript end-to-end).
* Modular monorepo structure (Turborepo).
* Secure handling of meeting data and transcripts.
* Scalable to multi-tenant organizations.

---

## High-Level System Architecture (Text Diagram)

```
[Web App (React)]
  ├─ Auth (Clerk)
  ├─ Live Suggestions UI
  ├─ Transcript Viewer
  ├─ Billing Dashboard
  │
  ▼
[API Gateway (Express + Node)]
  ├─ Auth Middleware
  ├─ Org / User Management
  ├─ Billing & Usage Metering
  ├─ Meeting Orchestration
  │
  ▼
[Meeting Bot Service]
  ├─ Joins Meeting
  ├─ Captures Audio / Transcript
  ├─ Streams Chunks
  │
  ▼
[AI Processing Layer]
  ├─ Live Analysis Engine
  ├─ Post-Call Analysis Engine
  ├─ RAG over Org Knowledge Base
  │
  ▼
[MongoDB Atlas]
  ├─ Orgs
  ├─ Users
  ├─ Meetings
  ├─ Transcripts
  ├─ Feedback & Scores
  ├─ Usage Records
```

---

## Key Assumptions

* Transcript access is available via meeting platform APIs or audio processing.
* AI accuracy improves with organization-specific data.
* Users accept AI bot presence in calls.

---

## Key Risks

* Live latency constraints.
* Meeting platform API limitations.
* Privacy and consent compliance.
* Cost control for AI inference.

---

Awaiting explicit approval to proceed to **PHASE 2: Epics & Acceptance Criteria**.
