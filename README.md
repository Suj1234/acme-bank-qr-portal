# Acme Bank — QR Add-On Portal

Acme Bank's internal portal for processing QR Add-On applications for merchants. Branch officers submit applications; a two-tier admin team (L1 and L2) reviews, approves, or escalates them — all tracked with a full audit trail.

---

## The Problem It Solves

Previously, QR onboarding for merchants involved manual paperwork and back-and-forth between branches and the approvals team with no visibility into where an application stood. This portal centralises the entire workflow — from initiation to final approval — in one place.

---

## How It Works

**Branch officers** fill out a structured application form for a merchant, capturing account details, merchant info, MCC category, transaction limits, UPI product selection, and delivery address. Once submitted, the application moves into the review queue.

**Admin L1** picks it up, reviews the merchant details and auto-generated risk report, and either approves, rejects, or refers it to L2 for a second opinion.

**Admin L2** gives the final call on escalated cases.

Every action — edits, status changes, referrals — is recorded in a timestamped audit trail visible to all parties.

**Application lifecycle:**

```
Draft → Submitted → Under Review → Pending L2 Approval → Approved / Rejected
```

---

## User Roles

| Role | What they can do |
|------|-----------------|
| Branch Officer | Initiate applications; read-only access after submission |
| Admin L1 | Review, edit merchant details, approve / reject / escalate to L2, regenerate risk reports |
| Admin L2 | Final approval or rejection on referred applications |

---

## Features

- **Application Form** — 9-section form: account details, merchant info, MCC, transaction settings, UPI products, delivery address, mobile/UPI fields, and remarks
- **Dashboard** — paginated list (10/page) with filters by application number, merchant name, account, status, and date range
- **Application Detail** — tabbed view across Overview, Merchant Details, Transaction Settings, Risk Report, and Audit Trail; tab state is URL-persisted
- **Risk Report Versioning** — L1 can regenerate risk reports at any point; all versions (v1, v2…) are retained with timestamps
- **L1 → L2 Referral** — L1 can escalate with remarks; L2's decision is final and reflected in the audit trail
- **Audit Trail** — complete history of every action, with color-coded status badges and full referral chain visibility

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| UI Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| Icons | Lucide React |
| State / Storage | React Context + localStorage |

> No backend yet — all data lives in localStorage. API integration is planned for a future phase.

---

## Getting Started

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

---

## Project Structure

```
src/
├── components/       # AppLayout — shell, nav, auth guard
├── context/          # AuthContext — role-based auth state
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ApplicationDetailPage.tsx
│   ├── InitiateQR.tsx
│   └── SuccessPage.tsx
└── store/
    └── applications.ts   # Mock data + application state

docs/
└── PRD.md            # Full product requirements, decision log, and backlog
```

---

## Build & Deploy

```bash
npm run build   # outputs to /dist
npm run preview # preview the production build locally
```

The app is deployed on Vercel with SPA routing configured via `vercel.json`.
