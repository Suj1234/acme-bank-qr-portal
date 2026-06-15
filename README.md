# Acme Bank QR Add-On Portal

A web portal for managing QR Add-On applications for merchants — built for Acme Bank's branch officers and admin reviewers.

## What It Does

Branch officers initiate QR Add-On applications for merchants. Admin users (L1 and L2) review and action them through a structured approval workflow.

**Application lifecycle:**
`Draft → Submitted → Under Review → Pending L2 Approval → Approved / Rejected`

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS 4**
- **React Router DOM 7**
- **Lucide React** (icons)
- State via React Context + localStorage (no backend yet)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## User Roles

| Role | Access |
|------|--------|
| Branch Officer | Initiate applications, view own submissions (read-only after submit) |
| Admin L1 | Review, edit merchant details, approve / reject / escalate to L2 |
| Admin L2 | Final approval or rejection on escalated applications |

## Key Features

- **Dashboard** — paginated list with filters (application no., merchant name, account, status, date range) and sorting
- **Application Form** — 9-section form covering account details, merchant info, MCC, transaction settings, UPI products, delivery address, and remarks
- **Detail View** — tabbed UI (Overview, Merchant Details, Transaction Settings, Risk Report, Audit Trail) with URL-persisted tab state
- **Risk Report Versioning** — L1 can regenerate risk reports; all versions (v1, v2…) are retained with timestamps
- **Audit Trail** — full action history with color-coded status badges and referral chain visibility

## Project Structure

```
src/
├── components/    # Layout wrappers
├── context/       # Auth state (AuthContext)
├── pages/         # LoginPage, DashboardPage, ApplicationDetailPage, InitiateQR, SuccessPage
└── store/         # Mock data and application state
docs/
└── PRD.md         # Product requirements and decision log
```

## Status

Frontend-only. Backend API integration is planned for a future phase.
