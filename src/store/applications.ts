export type AppStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Pending L2 Approval' | 'Approved' | 'Rejected'

export interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  actorDisplay: string
  actorRole: string
  action: string
  fromStatus?: AppStatus
  toStatus: AppStatus
  remark?: string
  referredTo?: string
}

export interface RiskReport {
  version: number
  generatedAt: string
  generatedBy: string
}

export interface SubmissionData {
  accountNumber?: string
  merchantMobile?: string
  merchantVpa?: string
  merchantAccountNumber?: string
  ifscCode?: string
  merchantEstablishmentName?: string
  storeManagerName?: string
  merchantPanNumber?: string
  udyamNumber?: string
  gstNumber?: string
  shopEstablishmentNumber?: string
  counterOperatorName?: string
  operatorMobileNumber?: string
  operatorEmailId?: string
  transactionCount?: string
  notAllowedProducts?: string[]
  address1?: string
  address2?: string
  address3?: string
  city?: string
  state?: string
  pincode?: string
  additionalMobiles?: string[]
  additionalUpiIds?: string
  remark?: string
  mccCode?: string
  mccName?: string
}

export interface Application {
  id: string
  applicationNo: number
  merchantName: string
  accountNumber: string
  mcc: string
  branch: string
  createdOn: string
  status: AppStatus
  pendingSince: string
  submittedBy: string
  data: SubmissionData
  auditTrail: AuditEntry[]
  reports: RiskReport[]
  referredTo?: string
  referredToDisplay?: string
  referredBy?: string
  linkedApplicationId?: string
  isReapplication?: boolean
}

const KEY = 'cb_apps'
const VER = 'v2'

const SIMION_DATA: SubmissionData = {
  accountNumber: '04762020009876',
  merchantMobile: '9876543210',
  merchantVpa: 'simion.rutto',
  merchantAccountNumber: '04762020009876',
  ifscCode: 'CNRB0001234',
  merchantEstablishmentName: 'SIMION RUTTO STORES',
  storeManagerName: 'Simion Rutto',
  merchantPanNumber: 'ABCDE1234F',
  udyamNumber: 'UDYAM-MH-12-0012345',
  gstNumber: '27ABCDE1234F1Z5',
  shopEstablishmentNumber: 'MH/12345/2024',
  counterOperatorName: 'John Doe',
  operatorMobileNumber: '9876543211',
  operatorEmailId: 'john.doe@simion.com',
  transactionCount: '100',
  notAllowedProducts: [],
  address1: '123, Main Street',
  address2: 'Near City Mall',
  address3: 'Andheri East',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400069',
  additionalMobiles: [],
  remark: 'New merchant QR registration',
  mccCode: '5411',
  mccName: 'Grocery Stores',
}

const PRIYA_DATA: SubmissionData = {
  accountNumber: '04762020008888',
  merchantMobile: '9123456780',
  merchantVpa: 'priya.sharma',
  merchantAccountNumber: '04762020008888',
  ifscCode: 'CNRB0005678',
  merchantEstablishmentName: 'PRIYA PHARMA',
  storeManagerName: 'Priya Sharma',
  merchantPanNumber: 'PQRST9876Z',
  udyamNumber: 'UDYAM-MH-09-0009876',
  gstNumber: '27PQRST9876Z1Z2',
  shopEstablishmentNumber: 'MH/09876/2023',
  counterOperatorName: 'Anita Rao',
  operatorMobileNumber: '9123456781',
  operatorEmailId: 'anita@priya.com',
  transactionCount: '50',
  notAllowedProducts: ['Voucher'],
  address1: '45, SV Road',
  address2: 'Andheri West',
  address3: '',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400058',
  additionalMobiles: [],
  remark: 'Pharmacy QR setup',
  mccCode: '5912',
  mccName: 'Drug Stores and Pharmacies',
}

const VENKATA_DATA: SubmissionData = {
  accountNumber: '04762020002222',
  merchantMobile: '9988776655',
  merchantVpa: 'venkata.rutto',
  merchantAccountNumber: '04762020002222',
  ifscCode: 'CNRB0009900',
  merchantEstablishmentName: 'VENKATA COMPUTERS',
  storeManagerName: 'Venkata Rao',
  merchantPanNumber: 'VKTRX1234A',
  udyamNumber: 'UDYAM-MH-05-0005678',
  gstNumber: '27VKTRX1234A1Z3',
  shopEstablishmentNumber: 'MH/05678/2023',
  counterOperatorName: 'Suresh Babu',
  operatorMobileNumber: '9988776600',
  operatorEmailId: 'suresh@venkata.com',
  transactionCount: '500',
  notAllowedProducts: ['PPI Wallet', 'Credit Line'],
  address1: '88, IT Park Road',
  address2: 'Malad West',
  address3: '',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400064',
  additionalMobiles: [],
  remark: 'High-value IT peripherals merchant',
  mccCode: '5045',
  mccName: 'Computers and Peripherals',
}

const SEED: Application[] = [
  {
    id: '1',
    applicationNo: 2858,
    merchantName: '-',
    accountNumber: '04762020001354',
    mcc: '5812 — Eating Places, Restaurants',
    branch: 'Main Branch, Mumbai',
    createdOn: '22/04/2026',
    status: 'Draft',
    pendingSince: '-',
    submittedBy: 'branch',
    data: {},
    auditTrail: [],
    reports: [],
  },
  {
    id: '2',
    applicationNo: 2820,
    merchantName: 'SIMION RUTTO',
    accountNumber: '04762020009876',
    mcc: '5411 — Grocery Stores',
    branch: 'Andheri Branch, Mumbai',
    createdOn: '22/04/2026',
    status: 'Approved',
    pendingSince: '26 hours',
    submittedBy: 'branch',
    data: SIMION_DATA,
    auditTrail: [
      { id: 'a1', timestamp: '2026-04-22T06:00:00.000Z', actor: 'branch', actorDisplay: 'Branch Officer', actorRole: 'Branch', action: 'Application submitted', fromStatus: 'Draft', toStatus: 'Submitted' },
      { id: 'a2', timestamp: '2026-04-22T09:15:00.000Z', actor: 'l1admin', actorDisplay: 'Admin (L1) — Priya Nair', actorRole: 'Admin L1', action: 'Approved', fromStatus: 'Under Review', toStatus: 'Approved', remark: 'All documents verified. QR approved.' },
    ],
    reports: [
      { version: 1, generatedAt: '2026-04-22T06:00:00.000Z', generatedBy: 'Branch Officer' },
    ],
  },
  {
    id: '3',
    applicationNo: 2818,
    merchantName: '-',
    accountNumber: '04762020005555',
    mcc: '5999 — Miscellaneous Retail',
    branch: 'Borivali Branch, Mumbai',
    createdOn: '22/04/2026',
    status: 'Submitted',
    pendingSince: '27 hours',
    submittedBy: 'branch',
    data: {},
    auditTrail: [
      { id: 'b1', timestamp: '2026-04-22T07:30:00.000Z', actor: 'branch', actorDisplay: 'Branch Officer', actorRole: 'Branch', action: 'Application submitted', fromStatus: 'Draft', toStatus: 'Submitted' },
    ],
    reports: [
      { version: 1, generatedAt: '2026-04-22T07:30:00.000Z', generatedBy: 'Branch Officer' },
    ],
  },
  {
    id: '4',
    applicationNo: 2806,
    merchantName: 'SIMION RUTTO',
    accountNumber: '04762020003333',
    mcc: '7011 — Hotels and Motels',
    branch: 'Dadar Branch, Mumbai',
    createdOn: '21/04/2026',
    status: 'Rejected',
    pendingSince: '50 hours',
    submittedBy: 'branch',
    data: {},
    auditTrail: [
      { id: 'c1', timestamp: '2026-04-21T08:00:00.000Z', actor: 'branch', actorDisplay: 'Branch Officer', actorRole: 'Branch', action: 'Application submitted', fromStatus: 'Draft', toStatus: 'Submitted' },
      { id: 'c2', timestamp: '2026-04-21T11:30:00.000Z', actor: 'l1admin', actorDisplay: 'Admin (L1) — Priya Nair', actorRole: 'Admin L1', action: 'Rejected', fromStatus: 'Under Review', toStatus: 'Rejected', remark: 'Incomplete documentation. Please resubmit with valid address proof.' },
    ],
    reports: [
      { version: 1, generatedAt: '2026-04-21T08:00:00.000Z', generatedBy: 'Branch Officer' },
    ],
  },
  {
    id: '5',
    applicationNo: 2805,
    merchantName: 'SIMION RUTTO',
    accountNumber: '04762020007777',
    mcc: '5812 — Eating Places, Restaurants',
    branch: 'Main Branch, Mumbai',
    createdOn: '21/04/2026',
    status: 'Rejected',
    pendingSince: '50 hours',
    submittedBy: 'branch',
    data: {},
    auditTrail: [
      { id: 'd1', timestamp: '2026-04-21T09:00:00.000Z', actor: 'branch', actorDisplay: 'Branch Officer', actorRole: 'Branch', action: 'Application submitted', fromStatus: 'Draft', toStatus: 'Submitted' },
      { id: 'd2', timestamp: '2026-04-21T14:00:00.000Z', actor: 'l1admin', actorDisplay: 'Admin (L1) — Priya Nair', actorRole: 'Admin L1', action: 'Rejected', fromStatus: 'Under Review', toStatus: 'Rejected', remark: 'Invalid PAN details provided.' },
    ],
    reports: [
      { version: 1, generatedAt: '2026-04-21T09:00:00.000Z', generatedBy: 'Branch Officer' },
    ],
  },
  {
    id: '6',
    applicationNo: 2804,
    merchantName: 'VENKATA RUTTO',
    accountNumber: '04762020002222',
    mcc: '5045 — Computers and Peripherals',
    branch: 'Malad Branch, Mumbai',
    createdOn: '21/04/2026',
    status: 'Pending L2 Approval',
    pendingSince: '50 hours',
    submittedBy: 'branch',
    data: VENKATA_DATA,
    referredTo: 'l2admin',
    referredToDisplay: 'Admin (L2) — Rahul Mehta',
    referredBy: 'l1admin',
    auditTrail: [
      { id: 'e1', timestamp: '2026-04-21T07:00:00.000Z', actor: 'branch', actorDisplay: 'Branch Officer', actorRole: 'Branch', action: 'Application submitted', fromStatus: 'Draft', toStatus: 'Submitted' },
      { id: 'e2', timestamp: '2026-04-21T10:00:00.000Z', actor: 'l1admin', actorDisplay: 'Admin (L1) — Priya Nair', actorRole: 'Admin L1', action: 'Referred to Admin (L2) — Rahul Mehta', fromStatus: 'Under Review', toStatus: 'Pending L2 Approval', remark: 'High transaction volume. Requires L2 review.', referredTo: 'Admin (L2) — Rahul Mehta' },
    ],
    reports: [
      { version: 1, generatedAt: '2026-04-21T07:00:00.000Z', generatedBy: 'Branch Officer' },
    ],
  },
  {
    id: '7',
    applicationNo: 2800,
    merchantName: 'PRIYA SHARMA',
    accountNumber: '04762020008888',
    mcc: '5912 — Drug Stores and Pharmacies',
    branch: 'Andheri Branch, Mumbai',
    createdOn: '20/04/2026',
    status: 'Approved',
    pendingSince: '74 hours',
    submittedBy: 'branch',
    data: PRIYA_DATA,
    auditTrail: [
      { id: 'f1', timestamp: '2026-04-20T08:00:00.000Z', actor: 'branch', actorDisplay: 'Branch Officer', actorRole: 'Branch', action: 'Application submitted', fromStatus: 'Draft', toStatus: 'Submitted' },
      { id: 'f2', timestamp: '2026-04-20T11:00:00.000Z', actor: 'l1admin', actorDisplay: 'Admin (L1) — Priya Nair', actorRole: 'Admin L1', action: 'Edited merchant details & regenerated risk report', toStatus: 'Submitted', remark: 'Updated GST number as per latest document.' },
      { id: 'f3', timestamp: '2026-04-20T13:00:00.000Z', actor: 'l1admin', actorDisplay: 'Admin (L1) — Priya Nair', actorRole: 'Admin L1', action: 'Approved', fromStatus: 'Under Review', toStatus: 'Approved', remark: 'All documents verified.' },
    ],
    reports: [
      { version: 1, generatedAt: '2026-04-20T08:00:00.000Z', generatedBy: 'Branch Officer' },
      { version: 2, generatedAt: '2026-04-20T11:00:00.000Z', generatedBy: 'Admin (L1) — Priya Nair' },
    ],
  },
  {
    id: '8',
    applicationNo: 2795,
    merchantName: 'RAJESH KUMAR',
    accountNumber: '04762020004444',
    mcc: '5541 — Service Stations',
    branch: 'Borivali Branch, Mumbai',
    createdOn: '19/04/2026',
    status: 'Under Review',
    pendingSince: '98 hours',
    submittedBy: 'branch',
    data: {},
    auditTrail: [
      { id: 'g1', timestamp: '2026-04-19T07:00:00.000Z', actor: 'branch', actorDisplay: 'Branch Officer', actorRole: 'Branch', action: 'Application submitted', fromStatus: 'Draft', toStatus: 'Submitted' },
      { id: 'g2', timestamp: '2026-04-19T09:00:00.000Z', actor: 'l1admin', actorDisplay: 'Admin (L1) — Priya Nair', actorRole: 'Admin L1', action: 'Review started', fromStatus: 'Submitted', toStatus: 'Under Review' },
    ],
    reports: [
      { version: 1, generatedAt: '2026-04-19T07:00:00.000Z', generatedBy: 'Branch Officer' },
    ],
  },
]

function load(): Application[] {
  try {
    const ver = localStorage.getItem(KEY + '_ver')
    if (ver !== VER) throw new Error('stale schema')
    const s = localStorage.getItem(KEY)
    if (s) {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* fall through to seed */ }
  localStorage.setItem(KEY + '_ver', VER)
  localStorage.setItem(KEY, JSON.stringify(SEED))
  return [...SEED]
}

function save(apps: Application[]) {
  localStorage.setItem(KEY, JSON.stringify(apps))
}

export function getApplications(): Application[] { return load() }

export function getApplication(id: string): Application | undefined {
  return load().find(a => a.id === id)
}

export function addApplication(data: SubmissionData, submittedBy: string, submittedByDisplay?: string, linkedApplicationId?: string): Application {
  const apps = load()
  const maxNo = apps.reduce((m, a) => Math.max(m, a.applicationNo), 2800)
  const now = new Date().toISOString()
  const display = submittedByDisplay || 'Branch Officer'
  const app: Application = {
    id: Date.now().toString(),
    applicationNo: maxNo + 1,
    merchantName: data.merchantEstablishmentName || '-',
    accountNumber: data.accountNumber || '-',
    mcc: data.mccCode ? `${data.mccCode} — ${data.mccName}` : '-',
    branch: 'Main Branch, Mumbai',
    createdOn: new Date().toLocaleDateString('en-GB'),
    status: 'Submitted',
    pendingSince: '0 hours',
    submittedBy,
    data,
    isReapplication: !!linkedApplicationId,
    linkedApplicationId,
    auditTrail: [
      {
        id: Date.now().toString() + '_sub',
        timestamp: now,
        actor: submittedBy,
        actorDisplay: display,
        actorRole: 'Branch',
        action: 'Application submitted',
        fromStatus: 'Draft',
        toStatus: 'Submitted',
      },
    ],
    reports: [
      { version: 1, generatedAt: now, generatedBy: display },
    ],
  }
  save([app, ...apps])
  return app
}

export function updateApplicationStatus(
  id: string,
  status: 'Approved' | 'Rejected',
  remark: string,
  actor: string,
  actorDisplay: string,
  actorRole: string
): void {
  const apps = load()
  const i = apps.findIndex(a => a.id === id)
  if (i === -1) return
  const entry: AuditEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    actor,
    actorDisplay,
    actorRole,
    action: status,
    fromStatus: apps[i].status,
    toStatus: status,
    remark,
  }
  apps[i] = { ...apps[i], status, auditTrail: [...apps[i].auditTrail, entry] }
  save(apps)
}

export function referApplication(
  id: string,
  referredTo: string,
  referredToDisplay: string,
  remark: string,
  actor: string,
  actorDisplay: string
): void {
  const apps = load()
  const i = apps.findIndex(a => a.id === id)
  if (i === -1) return
  const entry: AuditEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    actor,
    actorDisplay,
    actorRole: 'Admin L1',
    action: `Referred to ${referredToDisplay}`,
    fromStatus: apps[i].status,
    toStatus: 'Pending L2 Approval',
    remark,
    referredTo: referredToDisplay,
  }
  apps[i] = {
    ...apps[i],
    status: 'Pending L2 Approval',
    referredTo,
    referredToDisplay,
    referredBy: actor,
    auditTrail: [...apps[i].auditTrail, entry],
  }
  save(apps)
}

export function editApplicationData(
  id: string,
  newData: SubmissionData,
  remark: string,
  actor: string,
  actorDisplay: string
): void {
  const apps = load()
  const i = apps.findIndex(a => a.id === id)
  if (i === -1) return
  const newVersion = apps[i].reports.length + 1
  const now = new Date().toISOString()
  const entry: AuditEntry = {
    id: Date.now().toString(),
    timestamp: now,
    actor,
    actorDisplay,
    actorRole: 'Admin',
    action: 'Edited merchant details & regenerated risk report',
    toStatus: apps[i].status,
    remark,
  }
  apps[i] = {
    ...apps[i],
    data: newData,
    merchantName: newData.merchantEstablishmentName || apps[i].merchantName,
    mcc: newData.mccCode ? `${newData.mccCode} — ${newData.mccName}` : apps[i].mcc,
    reports: [...apps[i].reports, { version: newVersion, generatedAt: now, generatedBy: actorDisplay }],
    auditTrail: [...apps[i].auditTrail, entry],
  }
  save(apps)
}

export function resetStore(): void {
  localStorage.removeItem(KEY + '_ver')
  localStorage.removeItem(KEY)
}
