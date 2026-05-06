# Product Requirements Document
## Canara Bank — QR Add On Portal

**Last Updated:** 2026-04-24  
**Status:** Living Document — updated with every major discussion (confirmation required before each update)  
**Owner:** Sujeet Kumar

---

## Table of Contents
1. [Product Overview](#1-product-overview)
2. [User Roles](#2-user-roles)
3. [Status Workflow](#3-status-workflow)
4. [Features Built (Current State)](#4-features-built-current-state)
5. [Discussion Log](#5-discussion-log)
6. [Proposed Features (Backlog)](#6-proposed-features-backlog)
7. [Decision Log](#7-decision-log)

---

## 1. Product Overview

A web-based portal for Canara Bank that enables branch officers to initiate and submit **QR Add On** applications for merchants. Admin users (L1 and L2) review, approve, reject, or escalate these applications through a structured workflow.

**Tech Stack:**
- Frontend: React 19 + TypeScript + Vite
- Styling: Tailwind CSS
- State: React Context + localStorage (no backend yet)
- Icons: Lucide React
- Routing: React Router DOM 7

**No backend integrated yet** — all data is mock/localStorage-based. Backend integration is a future milestone.

---

## 2. User Roles

### 2.1 Branch Officer
- Creates new QR Add On applications on behalf of merchants
- Submits applications for admin review
- View-only access after submission — cannot edit
- Can retry (new application) if previous application is rejected — pre-fills from rejected application

### 2.2 Admin — L1
- Reviews submitted applications (status: Submitted)
- Can edit merchant details + re-generate risk report (remarks mandatory on edit; status does not revert)
- Can Approve / Reject with mandatory remarks
- Can refer application upward to an L2 admin with mandatory remarks
- Cannot create new applications
- Becomes observer (view-only) once application is referred to L2

### 2.3 Admin — L2 (Higher Authority)
- Receives applications referred by L1 admin
- Can Approve / Reject with mandatory remarks — this is the **final decision**
- Cannot refer further (L2 is the terminal authority)
- Decision auto-applies as the application's final status

---

## 3. Status Workflow

### 3.1 Status Names (Decided 2026-04-24)

| Status | Actor | Meaning |
|--------|-------|---------|
| **Draft** | System | Application created, not yet submitted by branch |
| **Submitted** | Branch Officer | Branch has submitted; awaiting L1 admin review |
| **Under Review** | L1 Admin | L1 admin is actively reviewing |
| **Pending L2 Approval** | L1 Admin | L1 has referred to L2; awaiting L2 decision |
| **Approved** | L1 or L2 Admin | Final approval granted |
| **Rejected** | L1 or L2 Admin | Rejected — branch can retry as a new application |

> Previous names (Initiated, Pending Approval) deprecated.

### 3.2 Status Transitions

```
Draft
  └─► Submitted (branch submits)
        └─► Under Review (L1 admin opens)
              ├─► Approved (L1 action — final)
              ├─► Rejected (L1 action — branch can retry)
              └─► Pending L2 Approval (L1 refers to L2)
                    ├─► Approved (L2 action — final)
                    └─► Rejected (L2 action — final)
```

### 3.3 Referral Rules (Decided 2026-04-24)
- L1 selects an L2 admin from a dropdown + mandatory remarks
- Application status → "Pending L2 Approval"
- L2 admin sees it in their queue
- L2 can Approve or Reject — no further referral
- L2 approval/rejection is the final word; no return to L1 for sign-off
- Full referral chain (who referred, when, remarks) visible in Audit Trail tab
- L1 admin becomes observer once referred — cannot take further action

---

## 4. Features Built (Current State)

### 4.1 Authentication
- Two-role login: `branch` / `admin`
- Demo credentials on login page
- Route protection with role-based guards
- Persistent session via localStorage

### 4.2 Dashboard
- Paginated application list (10 per page)
- Filter by: Application No., Merchant Name, Account Number, Status, Date Range
- Sort by: Application No., Merchant Name, Created On, Status, Pending Since
- Show/hide filter panel
- Status badges (color-coded)
- Download Risk Report (TXT)
- "Create New Application" (branch only)

### 4.3 Application Detail Page (Tab View — built 2026-04-24)
- 5 tabs: Overview, Merchant Details, Transaction Settings, Risk Report, Audit Trail
- Tab state URL-persisted (`?tab=<key>`)
- Overview: application summary + status timeline from audit trail + referral details
- Merchant Details: view mode (all users) + edit mode (admin only, all fields editable, remarks mandatory)
- Admin edit regenerates a new risk report version; status stays unchanged
- Transaction Settings: MCC, transaction count, restricted UPI products
- Risk Report: version history with per-version download (v1, v2...)
- Audit Trail: reverse-chronological, color-coded by action type
- Admin Action Panel (above tabs): Approve / Reject / Refer to L2 (L1 admin); Approve / Reject (L2 admin)
- Branch user: "Re-apply" button visible on rejected applications

### 4.4 New Application Form
- 9-section form:
  1. Account Number (fetch/reset)
  2. Merchant Details (mobile, VPA, IFSC, PAN, Udyam, GST, establishment, manager)
  3. MCC — AI image upload or PAN/Udyam/GST lookup (mock)
  4. Transaction Count selector
  5. Not Allowed UPI Products (checkboxes)
  6. Delivery Address (editable toggle)
  7. Additional Mobile Numbers (dynamic)
  8. Additional UPI IDs (dynamic)
  9. Remarks/Notes
- Client-side validation
- VPA availability check (mock)
- Auto-uppercase for IFSC, PAN, Udyam, GST

### 4.5 Success Page
- Confirmation after submission
- Links: Create New / Return to Dashboard

---

## 5. Discussion Log

Each entry records the question raised, options discussed, answers given, and the final decision. This log exists so no context is lost between sessions.

---

### [DISC-001] Tab View on Application Detail Page
**Date:** 2026-04-24  
**Raised by:** Sujeet Kumar

**Context:** Current detail page is a long scroll. Tab layout proposed for cleaner UX.

**Questions Asked:**
- Q: Should tab state be URL-persisted (e.g., `?tab=audit-trail`) for shareable links?
- A: Not yet answered — carry forward.

**Proposed Tabs:**
| Tab | Content |
|-----|---------|
| Overview | Application summary, status badge, key IDs, timeline |
| Merchant Details | All form-captured merchant info (Edit toggle for admin) |
| Transaction Settings | MCC, UPI limits, restricted UPI products |
| Risk Report | View report history (all versions with timestamps) + download |
| Audit Trail | Full status history — who acted, when, remarks, referral chain |

**Status:** Decided (tab view approved) — URL persistence still open

---

### [DISC-002] Status Names
**Date:** 2026-04-24  
**Raised by:** Sujeet Kumar

**Context:** Original names (Initiated, Pending Approval) are ambiguous. Needed clearer names that reflect L1/L2 role distinction.

**Questions Asked:**
- Q: Do we need distinct status names for L1 vs L2 review, or is "Referred" sufficient with a sub-label?
- A: Separate statuses are better — decided on "Under Review" (L1) and "Pending L2 Approval" (referred to L2).

**Decision:** Draft → Submitted → Under Review → Pending L2 Approval → Approved / Rejected

**Status:** Decided ✓

---

### [DISC-003] Admin Edit + Re-generate Risk Report
**Date:** 2026-04-24  
**Raised by:** Sujeet Kumar

**Context:** Admin should be able to edit merchant details and re-generate the risk report. Branch cannot edit after submission.

**Questions Asked:**
- Q: After admin edits and re-generates risk report, should status revert to "Under Review"?
- A: No — status stays. Only remarks are mandatory when editing.
- Q: How should the new risk report be shown to the branch user?
- A: Show full report history with timestamps (v1, v2...) — both old and new reports visible.

**Decided Flow:**
1. Admin opens Merchant Details tab → clicks **Edit**
2. Makes changes → mandatory remarks → **Save & Re-generate Risk Report**
3. Status stays unchanged
4. New report version added to Risk Report tab history (v1, v2... with timestamps)
5. Branch user sees all report versions in the Risk Report tab
6. Audit Trail records: editor name, timestamp, remarks

**Open Question:**
- Q: Should admin edits be restricted to certain fields only (e.g., not account number), or all fields editable?
- A: Not yet answered — carry forward.

**Status:** Mostly decided — field restriction question open

---

### [DISC-004] Retry After Rejection — Multiple Applications
**Date:** 2026-04-24  
**Raised by:** Sujeet Kumar

**Context:** When rejected, branch should be able to re-apply for the same merchant. Need to track and link multiple attempts.

**Questions Asked:**
- Q: New application per retry (Option A) vs versioned attempts in same ID (Option B)?
- A: Option A — new application per retry.
- Q: Should re-application pre-fill from the rejected one, or start blank?
- A: Not yet answered — carry forward.

**Decided Approach:**
- Each retry = new application number
- Linked via `accountNumber` or `merchantPAN`
- Dashboard shows "Re-application" badge + link to original
- Applications grouped by merchant/account to show attempt history

**Open Question:**
- Q: Should the re-application form pre-fill from the rejected application, or start blank?
- A: Not yet answered — carry forward.

**Status:** Partially decided — pre-fill question open

---

### [DISC-005] Referral / L2 Escalation Workflow
**Date:** 2026-04-24  
**Raised by:** Sujeet Kumar

**Context:** L1 admins need ability to escalate applications to L2 instead of deciding directly. Admins confirmed to have L1/L2 role distinction.

**Questions Asked:**
- Q: Is referral within the same branch hierarchy or cross-branch?
- A: Not yet answered — carry forward.
- Q: Are all admins equal or L1/L2 distinction?
- A: L1 and L2 roles confirmed.
- Q: Cap referrals at 1 hop (L1 → L2 only) or allow chains?
- A: L2 is final — no further referral. Max 1 hop.
- Q: Does L2 approval auto-approve or return to L1 for sign-off?
- A: L2 approval is final — no return to L1.

**Open Question:**
- Q: Is referral within the same branch hierarchy or cross-branch?
- A: Not yet answered — carry forward.

**Decided Flow:**
- L1 selects L2 admin from dropdown + mandatory remarks → status: "Pending L2 Approval"
- L2 can Approve or Reject — final decision, no further referral
- L1 becomes observer once referred
- Full chain in Audit Trail

**Status:** Mostly decided — cross-branch question open

---

## 6. Proposed Features (Backlog)

| ID | Feature | Source | Priority | Status |
|----|---------|---------|----------|--------|
| F-001 | Tab view on Application Detail page | DISC-001 | High | **Built** (2026-04-24) |
| F-002 | Revised status names (incl. L1/L2) | DISC-002 | High | **Built** (2026-04-24) |
| F-003 | Admin edit + risk report re-generation | DISC-003 | High | **Built** (2026-04-24) |
| F-004 | Risk report version history (v1, v2...) | DISC-003 | High | **Built** (2026-04-24) |
| F-005 | Retry flow — new application per rejection | DISC-004 | Medium | **Built** (2026-04-24) |
| F-006 | Re-application badge + grouping on dashboard | DISC-004 | Medium | **Built** (2026-04-24) |
| F-007 | L1 → L2 referral workflow | DISC-005 | Medium | **Built** (2026-04-24) |
| F-008 | Audit Trail tab | DISC-001 | High | **Built** (2026-04-24) |
| F-009 | L1/L2 admin role distinction in auth | DISC-005 | High | **Built** (2026-04-24) |
| F-010 | URL-persisted tab state | DISC-001 | Low | **Built** (2026-04-24) |
| F-011 | Backend API integration | — | Future | Not started |
| F-012 | Notification system | DISC-003 | Future | Not started |

---

## 7. Decision Log

| Date | ID | Decision | Rationale |
|------|----|----------|-----------|
| 2026-04-24 | DISC-001 | Tab view approved for detail page | Long scroll is poor UX; tabs give clear separation |
| 2026-04-24 | DISC-002 | Status: Draft → Submitted → Under Review → Pending L2 Approval → Approved/Rejected | Clearer names; distinct L1/L2 states |
| 2026-04-24 | DISC-003 | Admin edit keeps status; remarks mandatory; report history shown | No status churn; branch sees full report evolution |
| 2026-04-24 | DISC-004 | Option A: new application per retry, linked by account/PAN | Cleaner audit trail, aligns with banking norms |
| 2026-04-24 | DISC-005 | L1/L2 roles confirmed; L2 is final authority; max 1 referral hop | Prevent unmanageable escalation chains |
| 2026-04-24 | DISC-005 | L2 approval = final; no return to L1 | Simplicity; avoids ping-pong approvals |
| 2026-04-24 | DISC-003/004 | Branch cannot edit after submission | Prevents tampering; admin edits instead |
| 2026-04-24 | OQ-001 | Tab state URL-persisted (`?tab=<key>`) | Shareable deep links to specific tabs |
| 2026-04-24 | OQ-002 | All fields editable by admin | No field restrictions |
| 2026-04-24 | OQ-003 | Re-application starts blank | Prevents carrying over incorrect data |
| 2026-04-24 | OQ-004 | Referral cross-branch — to any admin | No hierarchy restriction on referral |

---

## 8. Open Questions (Carry Forward)

These are unresolved questions from discussions. Each must be answered before the related feature is built.

All previous open questions resolved on 2026-04-24. No open questions currently.

| ID | Question | Related | Asked On | Resolved On | Answer |
|----|----------|---------|----------|-------------|--------|
| OQ-001 | Should tab state be URL-persisted? | DISC-001 | 2026-04-24 | 2026-04-24 | Yes — `?tab=<key>` |
| OQ-002 | Should admin edits be restricted to certain fields? | DISC-003 | 2026-04-24 | 2026-04-24 | All fields editable |
| OQ-003 | Re-application: pre-fill from rejected or start blank? | DISC-004 | 2026-04-24 | 2026-04-24 | Start blank |
| OQ-004 | Is referral within branch hierarchy or cross-branch? | DISC-005 | 2026-04-24 | 2026-04-24 | Cross-branch — to anyone |

---

*This document is a living record. Updated after every discussion session with Sujeet's confirmation. Claude proposes changes and waits for approval before writing.*
