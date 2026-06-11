import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Download, CheckCircle2, XCircle, Pencil, X, GitBranch, FileText, Clock, LayoutDashboard, ShieldCheck, RotateCcw } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { StatusBadge } from './DashboardPage'
import { useAuth } from '../context/AuthContext'
import {
  getApplication, updateApplicationStatus, referApplication, editApplicationData,
  type Application, type SubmissionData,
} from '../store/applications'

const L2_ADMINS = [
  { username: 'l2admin', displayName: 'Admin (L2) — Rahul Mehta' },
]

const TABS = [
  { key: 'overview',      label: 'Overview',             icon: LayoutDashboard },
  { key: 'merchant',      label: 'Merchant Details',     icon: FileText },
  { key: 'transaction',   label: 'Transaction Settings', icon: ShieldCheck },
  { key: 'report',        label: 'Risk Report',          icon: Download },
  { key: 'audit',         label: 'Audit Trail',          icon: Clock },
]

export default function ApplicationDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [app, setApp] = useState<Application | null>(null)

  // Edit mode state
  const [editMode, setEditMode]     = useState(false)
  const [editData, setEditData]     = useState<SubmissionData>({})
  const [editRemark, setEditRemark] = useState('')
  const [editErr, setEditErr]       = useState('')

  // Action panel state
  const [activeAction, setActiveAction]   = useState<'Approved' | 'Rejected' | 'Refer' | null>(null)
  const [actionRemark, setActionRemark]   = useState('')
  const [actionErr, setActionErr]         = useState('')
  const [referTo, setReferTo]             = useState('')
  const [referRemark, setReferRemark]     = useState('')
  const [referErr, setReferErr]           = useState('')
  const [actionDone, setActionDone]       = useState<string | null>(null)

  const activeTab = searchParams.get('tab') || 'overview'
  const setTab = (tab: string) => setSearchParams({ tab }, { replace: true })

  const refreshApp = () => {
    if (id) setApp(getApplication(id) ?? null)
  }

  useEffect(() => { refreshApp() }, [id])

  if (!app) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-gray-500">Application not found.</div>
      </AppLayout>
    )
  }

  const isL1 = user?.role === 'admin' && user?.adminRole === 'l1'
  const isL2 = user?.role === 'admin' && user?.adminRole === 'l2'
  const canL1Act = isL1 && (app.status === 'Submitted' || app.status === 'Under Review')
  const canL2Act = isL2 && app.status === 'Pending L2 Approval'
  const canAct   = (canL1Act || canL2Act) && !actionDone
  const canEdit  = !editMode && !actionDone &&
    ((isL1 && ['Submitted', 'Under Review'].includes(app.status)) ||
     (isL2 && app.status === 'Pending L2 Approval'))

  const handleApprove = () => {
    if (!actionRemark.trim()) { setActionErr('Remarks are required.'); return }
    updateApplicationStatus(app.id, 'Approved', actionRemark.trim(), user!.username, user!.displayName, isL1 ? 'Admin L1' : 'Admin L2')
    setActionDone('Approved')
    setActiveAction(null)
    refreshApp()
  }

  const handleReject = () => {
    if (!actionRemark.trim()) { setActionErr('Remarks are required.'); return }
    updateApplicationStatus(app.id, 'Rejected', actionRemark.trim(), user!.username, user!.displayName, isL1 ? 'Admin L1' : 'Admin L2')
    setActionDone('Rejected')
    setActiveAction(null)
    refreshApp()
  }

  const handleRefer = () => {
    if (!referTo) { setReferErr('Please select an L2 admin.'); return }
    if (!referRemark.trim()) { setReferErr('Remarks are required.'); return }
    const l2 = L2_ADMINS.find(a => a.username === referTo)!
    referApplication(app.id, l2.username, l2.displayName, referRemark.trim(), user!.username, user!.displayName)
    setActionDone('Referred')
    setActiveAction(null)
    refreshApp()
  }

  const handleSaveEdit = () => {
    if (!editRemark.trim()) { setEditErr('Remarks are required.'); return }
    editApplicationData(app.id, editData, editRemark.trim(), user!.username, user!.displayName)
    setEditMode(false)
    setEditRemark('')
    setEditErr('')
    refreshApp()
  }

  const cancelEdit = () => {
    setEditMode(false)
    setEditData(app.data)
    setEditRemark('')
    setEditErr('')
  }

  const startEdit = () => {
    setEditData({ ...app.data })
    setEditMode(true)
    setTab('merchant')
  }

  const downloadReport = (version: number, generatedAt: string) => {
    const d = app.data
    const lines = [
      `ACME BANK — RISK REPORT (v${version})`,
      `Generated: ${new Date(generatedAt).toLocaleString('en-IN')}`,
      `════════════════════════════════════════`,
      `Application No : ${app.applicationNo}`,
      `Merchant Name  : ${app.merchantName}`,
      `Account Number : ${app.accountNumber}`,
      `MCC            : ${app.mcc}`,
      `Branch         : ${app.branch}`,
      `Status         : ${app.status}`,
      `Created On     : ${app.createdOn}`,
      ``,
      `Merchant Details`,
      `────────────────`,
      `Mobile         : ${d.merchantMobile || '-'}`,
      `VPA            : ${d.merchantVpa ? `${d.merchantVpa}@acmb` : '-'}`,
      `PAN            : ${d.merchantPanNumber || '-'}`,
      `Udyam No.      : ${d.udyamNumber || '-'}`,
      `GST            : ${d.gstNumber || '-'}`,
      ``,
      `Risk Assessment`,
      `────────────────`,
      `Overall Risk Score      : LOW`,
      `Transaction Risk        : ACCEPTABLE`,
      `KYC Verification        : COMPLETED`,
      `Fraud Indicator Score   : 0.12 / 1.00`,
      ``,
      `Note: This is a system-generated risk report.`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const el   = document.createElement('a')
    el.href = url
    el.download = `Risk_Report_${app.applicationNo}_v${version}.txt`
    el.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-gray-800">Application #{app.applicationNo}</h1>
                <StatusBadge status={app.status} />
                {app.isReapplication && (
                  <span className="inline-block px-2 py-0.5 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium rounded">
                    Re-application
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {app.branch} · Created {app.createdOn} · Submitted by {app.submittedBy}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'branch' && app.status === 'Rejected' && (
              <button
                onClick={() => navigate(`/application/new?linkedFrom=${app.id}`)}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <RotateCcw size={13} /> Re-apply
              </button>
            )}
            {canEdit && (
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors"
              >
                <Pencil size={13} /> Edit Details
              </button>
            )}
            {app.reports.length > 0 && (
              <button
                onClick={() => downloadReport(app.reports[app.reports.length - 1].version, app.reports[app.reports.length - 1].generatedAt)}
                className="flex items-center gap-1.5 px-3 py-2 border border-[#003087] text-[#003087] hover:bg-blue-50 text-sm font-semibold rounded-lg transition-colors"
              >
                <Download size={13} /> Risk Report
              </button>
            )}
          </div>
        </div>

        {/* Action done banner */}
        {actionDone && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg mb-4 text-sm font-medium
            ${actionDone === 'Approved' ? 'bg-green-50 border border-green-200 text-green-700'
            : actionDone === 'Rejected' ? 'bg-red-50 border border-red-200 text-red-600'
            : 'bg-purple-50 border border-purple-200 text-purple-700'}`}>
            {actionDone === 'Approved' ? <CheckCircle2 size={16} /> : actionDone === 'Rejected' ? <XCircle size={16} /> : <GitBranch size={16} />}
            Application has been <strong className="mx-1">{actionDone}</strong> successfully.
          </div>
        )}

        {/* Admin Action Panel */}
        {canAct && (
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {isL2 ? 'L2 Admin Action Required' : 'Admin Action Required'}
            </p>

            {!activeAction ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setActiveAction('Approved'); setActionRemark(''); setActionErr('') }}
                  className="flex items-center gap-1.5 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <CheckCircle2 size={14} /> Approve
                </button>
                <button
                  onClick={() => { setActiveAction('Rejected'); setActionRemark(''); setActionErr('') }}
                  className="flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <XCircle size={14} /> Reject
                </button>
                {canL1Act && (
                  <button
                    onClick={() => { setActiveAction('Refer'); setReferTo(''); setReferRemark(''); setReferErr('') }}
                    className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <GitBranch size={14} /> Refer to L2
                  </button>
                )}
              </div>
            ) : activeAction === 'Refer' ? (
              <div className="space-y-3 max-w-lg">
                <p className="text-sm font-medium text-gray-700">Refer to L2 Admin</p>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Select L2 Admin <span className="text-red-500">*</span></label>
                  <select
                    value={referTo}
                    onChange={e => { setReferTo(e.target.value); setReferErr('') }}
                    className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm text-gray-700 bg-white outline-none focus:border-[#003087]"
                  >
                    <option value="">— Select admin —</option>
                    {L2_ADMINS.map(a => <option key={a.username} value={a.username}>{a.displayName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Reason for Referral <span className="text-red-500">*</span></label>
                  <textarea
                    value={referRemark}
                    onChange={e => { setReferRemark(e.target.value); setReferErr('') }}
                    rows={3}
                    placeholder="Explain why this needs L2 review..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#003087] resize-none"
                  />
                  {referErr && <p className="text-red-500 text-[11px] mt-0.5">{referErr}</p>}
                </div>
                <div className="flex gap-3">
                  <button onClick={handleRefer} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    Confirm Referral
                  </button>
                  <button onClick={() => setActiveAction(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-lg">
                <p className="text-sm font-medium text-gray-700">
                  {activeAction === 'Approved' ? 'Approve Application' : 'Reject Application'}
                </p>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Remarks <span className="text-red-500">*</span></label>
                  <textarea
                    value={actionRemark}
                    onChange={e => { setActionRemark(e.target.value); setActionErr('') }}
                    rows={3}
                    placeholder="Enter your remarks..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#003087] resize-none"
                  />
                  {actionErr && <p className="text-red-500 text-[11px] mt-0.5">{actionErr}</p>}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={activeAction === 'Approved' ? handleApprove : handleReject}
                    className={`px-5 py-2 text-white text-sm font-semibold rounded-lg transition-colors
                      ${activeAction === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    Confirm {activeAction === 'Approved' ? 'Approval' : 'Rejection'}
                  </button>
                  <button onClick={() => setActiveAction(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Bar */}
        <div className="flex gap-0 border-b border-gray-200 mb-5">
          {TABS.map(t => {
            const Icon = t.icon
            const active = activeTab === t.key
            return (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); if (t.key !== 'merchant') setEditMode(false) }}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${active
                    ? 'border-[#003087] text-[#003087]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <Icon size={14} />
                {t.label}
                {t.key === 'audit' && app.auditTrail.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">
                    {app.auditTrail.length}
                  </span>
                )}
                {t.key === 'report' && app.reports.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">
                    {app.reports.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab app={app} />}
          {activeTab === 'merchant' && (
            <MerchantDetailsTab
              app={app}
              editMode={editMode}
              editData={editData}
              editRemark={editRemark}
              editErr={editErr}
              onFieldChange={(field, val) => setEditData(p => ({ ...p, [field]: val }))}
              onRemarkChange={v => { setEditRemark(v); setEditErr('') }}
              onSave={handleSaveEdit}
              onCancel={cancelEdit}
            />
          )}
          {activeTab === 'transaction' && <TransactionSettingsTab app={app} />}
          {activeTab === 'report' && <RiskReportTab app={app} onDownload={downloadReport} />}
          {activeTab === 'audit' && <AuditTrailTab app={app} />}
        </div>

      </div>
    </AppLayout>
  )
}

// ── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ app }: { app: Application }) {
  return (
    <div className="space-y-4">
      <DetailCard title="Application Summary">
        <FieldGrid>
          <Field label="Application No." value={`#${app.applicationNo}`} />
          <Field label="Account Number" value={app.accountNumber} mono />
          <Field label="Branch" value={app.branch} />
          <Field label="Submitted By" value={app.submittedBy} />
          <Field label="Created On" value={app.createdOn} />
          <Field label="Pending Since" value={app.pendingSince} />
        </FieldGrid>
      </DetailCard>

      {app.status === 'Pending L2 Approval' && app.referredToDisplay && (
        <DetailCard title="Referral Details">
          <FieldGrid>
            <Field label="Referred To" value={app.referredToDisplay} />
            <Field label="Referred By" value={app.referredBy || '-'} />
          </FieldGrid>
        </DetailCard>
      )}

      {app.isReapplication && app.linkedApplicationId && (
        <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
          <GitBranch size={14} />
          This is a re-application. Original application: #{app.linkedApplicationId}
        </div>
      )}

      {app.auditTrail.length > 0 && (
        <DetailCard title="Status Timeline">
          <div className="space-y-0">
            {app.auditTrail.map((entry, i) => (
              <div key={entry.id} className="flex gap-3 pb-4">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0
                    ${entry.toStatus === 'Approved' ? 'bg-green-500' : entry.toStatus === 'Rejected' ? 'bg-red-500' : 'bg-[#003087]'}`}>
                    {entry.toStatus === 'Approved'
                      ? <CheckCircle2 size={12} className="text-white" />
                      : entry.toStatus === 'Rejected'
                      ? <XCircle size={12} className="text-white" />
                      : <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  {i < app.auditTrail.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 mt-1 min-h-[16px]" />
                  )}
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-medium text-gray-800">{entry.action}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{entry.actorDisplay} · {fmtTs(entry.timestamp)}</p>
                  {entry.remark && (
                    <p className="text-xs text-gray-600 mt-1 italic bg-gray-50 px-2 py-1 rounded">"{entry.remark}"</p>
                  )}
                </div>
              </div>
            ))}

            {!['Approved', 'Rejected'].includes(app.status) && (
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-amber-400 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 bg-amber-400 rounded-full" />
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-medium text-amber-600">{app.status}</p>
                  <p className="text-xs text-gray-400">Current status</p>
                </div>
              </div>
            )}
          </div>
        </DetailCard>
      )}

      {app.auditTrail.length === 0 && (
        <div className="text-sm text-gray-400 text-center py-8">No activity recorded yet.</div>
      )}
    </div>
  )
}

// ── Merchant Details Tab ──────────────────────────────────────────────────────

interface MerchantTabProps {
  app: Application
  editMode: boolean
  editData: SubmissionData
  editRemark: string
  editErr: string
  onFieldChange: (field: keyof SubmissionData, val: string | string[]) => void
  onRemarkChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
}

function MerchantDetailsTab({ app, editMode, editData, editRemark, editErr, onFieldChange, onRemarkChange, onSave, onCancel }: MerchantTabProps) {
  const d = editMode ? editData : app.data

  return (
    <div className="space-y-4">
      {editMode && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          <Pencil size={14} />
          <span>Edit mode — changes will regenerate the risk report. Remarks are mandatory.</span>
        </div>
      )}

      <DetailCard title="Account Details">
        <FieldGrid>
          <EF editMode={editMode} label="Account Number" value={d.accountNumber} field="accountNumber" onChange={onFieldChange} mono />
          <EF editMode={editMode} label="Merchant Account Number" value={d.merchantAccountNumber} field="merchantAccountNumber" onChange={onFieldChange} mono />
          <EF editMode={editMode} label="IFSC Code" value={d.ifscCode} field="ifscCode" onChange={v => onFieldChange('ifscCode', (v as string).toUpperCase())} mono />
        </FieldGrid>
      </DetailCard>

      <DetailCard title="Merchant Information">
        <FieldGrid>
          <EF editMode={editMode} label="Merchant Establishment Name" value={d.merchantEstablishmentName} field="merchantEstablishmentName" onChange={onFieldChange} />
          <EF editMode={editMode} label="Merchant Mobile Number" value={d.merchantMobile} field="merchantMobile" onChange={onFieldChange} />
          <EF editMode={editMode} label="Merchant VPA" value={d.merchantVpa} field="merchantVpa" onChange={onFieldChange} mono />
          <EF editMode={editMode} label="Store Manager Name" value={d.storeManagerName} field="storeManagerName" onChange={onFieldChange} />
        </FieldGrid>
      </DetailCard>

      <DetailCard title="Business Identity">
        <FieldGrid>
          <EF editMode={editMode} label="Merchant PAN Number" value={d.merchantPanNumber} field="merchantPanNumber" onChange={v => onFieldChange('merchantPanNumber', (v as string).toUpperCase())} mono />
          <EF editMode={editMode} label="Udyam Registration Number" value={d.udyamNumber} field="udyamNumber" onChange={v => onFieldChange('udyamNumber', (v as string).toUpperCase())} mono />
          <EF editMode={editMode} label="GST Number" value={d.gstNumber} field="gstNumber" onChange={v => onFieldChange('gstNumber', (v as string).toUpperCase())} mono />
          <EF editMode={editMode} label="Shop Establishment Number" value={d.shopEstablishmentNumber} field="shopEstablishmentNumber" onChange={onFieldChange} />
        </FieldGrid>
      </DetailCard>

      <DetailCard title="Operator Details">
        <FieldGrid>
          <EF editMode={editMode} label="Counter Operator Name" value={d.counterOperatorName} field="counterOperatorName" onChange={onFieldChange} />
          <EF editMode={editMode} label="Operator Mobile Number" value={d.operatorMobileNumber} field="operatorMobileNumber" onChange={onFieldChange} />
          <EF editMode={editMode} label="Operator Email Id" value={d.operatorEmailId} field="operatorEmailId" onChange={onFieldChange} />
        </FieldGrid>
      </DetailCard>

      <DetailCard title="Delivery Address">
        <FieldGrid>
          <EF editMode={editMode} label="Address Line 1" value={d.address1} field="address1" onChange={onFieldChange} />
          <EF editMode={editMode} label="Address Line 2" value={d.address2} field="address2" onChange={onFieldChange} />
          <EF editMode={editMode} label="Address Line 3" value={d.address3} field="address3" onChange={onFieldChange} />
          <EF editMode={editMode} label="City" value={d.city} field="city" onChange={onFieldChange} />
          <EF editMode={editMode} label="State" value={d.state} field="state" onChange={onFieldChange} />
          <EF editMode={editMode} label="Pincode" value={d.pincode} field="pincode" onChange={onFieldChange} mono />
        </FieldGrid>
      </DetailCard>

      {d.remark && !editMode && (
        <DetailCard title="Branch Remark">
          <p className="text-sm text-gray-700">{d.remark}</p>
        </DetailCard>
      )}

      {editMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-5">
          <label className="block text-xs font-semibold text-amber-700 mb-1">
            Edit Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            value={editRemark}
            onChange={e => onRemarkChange(e.target.value)}
            rows={3}
            placeholder="Reason for editing these details..."
            className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-amber-500 resize-none bg-white"
          />
          {editErr && <p className="text-red-500 text-[11px] mt-0.5">{editErr}</p>}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#003087] hover:bg-[#00246b] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Save & Re-generate Report
            </button>
            <button onClick={onCancel} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Transaction Settings Tab ──────────────────────────────────────────────────

function TransactionSettingsTab({ app }: { app: Application }) {
  const d = app.data
  return (
    <div className="space-y-4">
      <DetailCard title="MCC Details">
        <FieldGrid>
          <Field label="MCC Code" value={d.mccCode} mono />
          <Field label="MCC Description" value={d.mccName} />
          <Field label="Full MCC" value={app.mcc} />
        </FieldGrid>
      </DetailCard>

      <DetailCard title="Transaction Limits">
        <FieldGrid>
          <Field label="Transaction Count" value={d.transactionCount} />
        </FieldGrid>
      </DetailCard>

      <DetailCard title="Restricted UPI Products">
        {d.notAllowedProducts && d.notAllowedProducts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {d.notAllowedProducts.map(p => (
              <span key={p} className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-600 text-xs rounded font-medium">{p}</span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-400">No UPI products restricted</span>
        )}
      </DetailCard>
    </div>
  )
}

// ── Risk Report Tab ───────────────────────────────────────────────────────────

function RiskReportTab({ app, onDownload }: { app: Application; onDownload: (version: number, generatedAt: string) => void }) {
  const reports = [...app.reports].reverse()
  return (
    <div className="space-y-3">
      {reports.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-8">No risk reports generated yet.</div>
      ) : reports.map(r => (
        <div key={r.version} className="flex items-center justify-between px-5 py-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <FileText size={16} className="text-[#003087]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Risk Report v{r.version}
                {r.version === app.reports.length && (
                  <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 bg-green-50 border border-green-200 text-green-600 rounded">Latest</span>
                )}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{fmtTs(r.generatedAt)} · By {r.generatedBy}</p>
            </div>
          </div>
          <button
            onClick={() => onDownload(r.version, r.generatedAt)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#003087] text-[#003087] hover:bg-blue-50 text-xs font-semibold rounded-lg transition-colors"
          >
            <Download size={12} /> Download
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Audit Trail Tab ───────────────────────────────────────────────────────────

function AuditTrailTab({ app }: { app: Application }) {
  const entries = [...app.auditTrail].reverse()
  return (
    <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No activity recorded yet.</p>
      ) : entries.map(e => (
        <div key={e.id} className="flex gap-4 px-6 py-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5
            ${e.toStatus === 'Approved' ? 'bg-green-100' : e.toStatus === 'Rejected' ? 'bg-red-100'
            : e.action.includes('Edited') ? 'bg-amber-100' : e.action.includes('Referred') ? 'bg-purple-100' : 'bg-blue-100'}`}>
            {e.toStatus === 'Approved'
              ? <CheckCircle2 size={14} className="text-green-600" />
              : e.toStatus === 'Rejected'
              ? <XCircle size={14} className="text-red-500" />
              : e.action.includes('Edited')
              ? <Pencil size={14} className="text-amber-600" />
              : e.action.includes('Referred')
              ? <GitBranch size={14} className="text-purple-600" />
              : <Clock size={14} className="text-blue-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-gray-800">{e.action}</p>
              <p className="text-[11px] text-gray-400 shrink-0">{fmtTs(e.timestamp)}</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{e.actorDisplay} · {e.actorRole}</p>
            {e.fromStatus && e.toStatus && e.fromStatus !== e.toStatus && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                <span className="bg-gray-100 px-1.5 py-0.5 rounded">{e.fromStatus}</span>
                {' → '}
                <span className={`px-1.5 py-0.5 rounded ${e.toStatus === 'Approved' ? 'bg-green-100 text-green-700' : e.toStatus === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>{e.toStatus}</span>
              </p>
            )}
            {e.remark && (
              <p className="text-xs text-gray-600 mt-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg italic">
                "{e.remark}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Shared sub-components ────────────────────────────────────────────────────

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-6 py-5">
      <h2 className="text-xs font-semibold text-[#003087] uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </div>
  )
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-x-6 gap-y-4">{children}</div>
}

function Field({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm text-gray-800 ${mono ? 'font-mono' : ''} ${!value ? 'text-gray-400' : ''}`}>
        {value || '—'}
      </p>
    </div>
  )
}

interface EFProps {
  editMode: boolean
  label: string
  value?: string
  field: keyof SubmissionData
  onChange: (field: keyof SubmissionData, val: string) => void
  mono?: boolean
}

function EF({ editMode, label, value, field, onChange, mono }: EFProps) {
  if (!editMode) return <Field label={label} value={value} mono={mono} />
  return (
    <div>
      <label className="block text-[11px] text-gray-500 mb-0.5">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(field, e.target.value)}
        className={`w-full h-8 border border-gray-200 rounded-lg px-2.5 text-sm text-gray-800 outline-none focus:border-[#003087] ${mono ? 'font-mono' : ''}`}
      />
    </div>
  )
}

function fmtTs(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}
