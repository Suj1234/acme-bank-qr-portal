import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Download, Filter, X, Plus, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { getApplications, type Application, type AppStatus } from '../store/applications'

type SortKey = 'applicationNo' | 'merchantName' | 'createdOn' | 'status' | 'pendingSince'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 10

const STATUS_OPTIONS: AppStatus[] = ['Draft', 'Submitted', 'Under Review', 'Pending L2 Approval', 'Approved', 'Rejected']

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [apps, setApps]             = useState<Application[]>([])
  const [showFilters, setShowFilters] = useState(true)
  const [sortKey, setSortKey]       = useState<SortKey>('applicationNo')
  const [sortDir, setSortDir]       = useState<SortDir>('desc')
  const [page, setPage]             = useState(1)

  // Filter state
  const [fAppNo, setFAppNo]       = useState('')
  const [fMerchant, setFMerchant] = useState('')
  const [fAccNo, setFAccNo]       = useState('')
  const [fStatus, setFStatus]     = useState('')
  const [fFrom, setFFrom]         = useState('')
  const [fTo, setFTo]             = useState('')

  // Applied filters (only changes on Apply click)
  const [applied, setApplied] = useState({ appNo: '', merchant: '', accNo: '', status: '', from: '', to: '' })

  useEffect(() => { setApps(getApplications()) }, [])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    return apps.filter(a => {
      if (applied.appNo && !String(a.applicationNo).includes(applied.appNo)) return false
      if (applied.merchant && !a.merchantName.toLowerCase().includes(applied.merchant.toLowerCase())) return false
      if (applied.accNo && !a.accountNumber.includes(applied.accNo)) return false
      if (applied.status && a.status !== applied.status) return false
      if (applied.from) {
        const [d, m, y] = a.createdOn.split('/')
        const appDate = new Date(`${y}-${m}-${d}`)
        if (appDate < new Date(applied.from)) return false
      }
      if (applied.to) {
        const [d, m, y] = a.createdOn.split('/')
        const appDate = new Date(`${y}-${m}-${d}`)
        if (appDate > new Date(applied.to)) return false
      }
      return true
    })
  }, [apps, applied])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: string | number = '', vb: string | number = ''
      if (sortKey === 'applicationNo')  { va = a.applicationNo; vb = b.applicationNo }
      else if (sortKey === 'merchantName') { va = a.merchantName; vb = b.merchantName }
      else if (sortKey === 'status')    { va = a.status; vb = b.status }
      else if (sortKey === 'pendingSince') { va = parseInt(a.pendingSince); vb = parseInt(b.pendingSince) }
      else if (sortKey === 'createdOn') {
        const parse = (s: string) => { const [d,m,y] = s.split('/'); return +new Date(`${y}-${m}-${d}`) }
        va = parse(a.createdOn); vb = parse(b.createdOn)
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const applyFilters = () => {
    setApplied({ appNo: fAppNo, merchant: fMerchant, accNo: fAccNo, status: fStatus, from: fFrom, to: fTo })
    setPage(1)
  }
  const clearFilters = () => {
    setFAppNo(''); setFMerchant(''); setFAccNo(''); setFStatus(''); setFFrom(''); setFTo('')
    setApplied({ appNo: '', merchant: '', accNo: '', status: '', from: '', to: '' })
    setPage(1)
  }

  const downloadRiskReport = (a: Application) => {
    const lines = [
      `CANARA BANK — RISK REPORT`,
      `Generated: ${new Date().toLocaleString()}`,
      `═══════════════════════════════════════`,
      `Application No : ${a.applicationNo}`,
      `Merchant Name  : ${a.merchantName}`,
      `Account Number : ${a.accountNumber}`,
      `MCC            : ${a.mcc}`,
      `Branch         : ${a.branch}`,
      `Status         : ${a.status}`,
      `Created On     : ${a.createdOn}`,
      ``,
      `Risk Assessment`,
      `───────────────`,
      `Overall Risk Score      : LOW`,
      `Transaction Risk        : ACCEPTABLE`,
      `KYC Verification        : COMPLETED`,
      `Fraud Indicator Score   : 0.12 / 1.00`,
      ``,
      `Note: This is a system-generated risk report.`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a_el = document.createElement('a')
    a_el.href = url
    a_el.download = `Risk_Report_${a.applicationNo}.txt`
    a_el.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppLayout>
      <div className="p-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">Application Listing</h1>
          <div className="flex items-center gap-3">
            {user?.role === 'branch' && (
              <button
                onClick={() => navigate('/application/new')}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#003087] hover:bg-[#00246b] text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Plus size={15} />
                Create New Application
              </button>
            )}
            <button
              onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#003087] text-[#003087] hover:bg-blue-50 text-sm font-medium rounded-lg transition-colors"
            >
              <Filter size={14} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Filters</p>
            <div className="grid grid-cols-5 gap-3 mb-3">
              <FilterInput placeholder="Application Number" value={fAppNo} onChange={setFAppNo} />
              <FilterInput placeholder="Merchant Name" value={fMerchant} onChange={setFMerchant} />
              <FilterInput placeholder="Account Number" value={fAccNo} onChange={setFAccNo} />
              <div className="relative">
                <select
                  value={fStatus}
                  onChange={e => setFStatus(e.target.value)}
                  className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm text-gray-700 bg-white appearance-none outline-none focus:border-[#003087]"
                >
                  <option value="">All Status</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <svg className="absolute right-2.5 top-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <input type="date" value={fFrom} onChange={e => setFFrom(e.target.value)}
                className="h-9 border border-gray-200 rounded-lg px-3 text-sm text-gray-600 outline-none focus:border-[#003087]"
              />
            </div>
            <div className="grid grid-cols-5 gap-3 mb-4">
              <input type="date" value={fTo} onChange={e => setFTo(e.target.value)}
                className="h-9 border border-gray-200 rounded-lg px-3 text-sm text-gray-600 outline-none focus:border-[#003087]"
              />
              <div className="col-span-4" />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={applyFilters}
                className="px-5 py-2 bg-[#003087] hover:bg-[#00246b] text-white text-sm font-semibold rounded-lg transition-colors">
                Apply Filters
              </button>
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <X size={14} /> Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <Th label="Application No." sortKey="applicationNo" current={sortKey} dir={sortDir} onClick={handleSort} />
                  <Th label="Merchant Name" sortKey="merchantName" current={sortKey} dir={sortDir} onClick={handleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">Account No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">MCC Code</th>
                  <Th label="Created On" sortKey="createdOn" current={sortKey} dir={sortDir} onClick={handleSort} />
                  <Th label="Status" sortKey="status" current={sortKey} dir={sortDir} onClick={handleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Branch</th>
                  <Th label="Pending Since" sortKey="pendingSince" current={sortKey} dir={sortDir} onClick={handleSort} />
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                      No applications found.
                    </td>
                  </tr>
                ) : paginated.map((app, idx) => (
                  <tr key={app.id} className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    <td className="px-4 py-3 font-semibold text-[#003087]">{app.applicationNo}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <span>{app.merchantName}</span>
                      {app.isReapplication && (
                        <span className="ml-2 px-1.5 py-0.5 bg-orange-50 border border-orange-200 text-orange-600 text-[10px] font-medium rounded whitespace-nowrap">Re-app</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{app.accountNumber}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[140px] truncate" title={app.mcc}>{app.mcc}</td>
                    <td className="px-4 py-3 text-gray-600">{app.createdOn}</td>
                    <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate" title={app.branch}>{app.branch}</td>
                    <td className="px-4 py-3 text-gray-600">{app.pendingSince}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/application/${app.id}`)}
                          title="View Application"
                          className="w-8 h-8 bg-[#003087] hover:bg-[#00246b] text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => downloadRiskReport(app)}
                          title="Download Risk Report"
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium">{sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * PAGE_SIZE, sorted.length)}</span> of{' '}
              <span className="font-medium">{sorted.length}</span> applications
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded border text-xs font-medium transition-colors
                    ${p === page ? 'bg-[#003087] text-white border-[#003087]' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4">Powered by <span className="font-semibold text-[#003087]">Canara Bank</span></p>
      </div>
    </AppLayout>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-9 border border-gray-200 rounded-lg pl-3 pr-8 text-sm text-gray-700 outline-none focus:border-[#003087] placeholder-gray-400"
      />
    </div>
  )
}

function Th({ label, sortKey, current, dir, onClick }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir
  onClick: (k: SortKey) => void
}) {
  const active = current === sortKey
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none hover:text-[#003087] transition-colors"
      onClick={() => onClick(sortKey)}
    >
      <span className="flex items-center gap-1">
        {label}
        {active
          ? (dir === 'asc' ? <ChevronUp size={12} className="text-[#003087]" /> : <ChevronDown size={12} className="text-[#003087]" />)
          : <ChevronsUpDown size={12} className="text-gray-300" />
        }
      </span>
    </th>
  )
}

export function StatusBadge({ status }: { status: AppStatus }) {
  const styles: Record<AppStatus, string> = {
    'Draft':               'bg-gray-100 text-gray-500 border-gray-200',
    'Submitted':           'bg-blue-50 text-blue-600 border-blue-200',
    'Under Review':        'bg-amber-50 text-amber-600 border-amber-200',
    'Pending L2 Approval': 'bg-purple-50 text-purple-600 border-purple-200',
    'Approved':            'bg-green-50 text-green-600 border-green-200',
    'Rejected':            'bg-red-50 text-red-500 border-red-200',
  }
  return (
    <span className={`inline-block px-2.5 py-1 rounded border text-xs font-medium whitespace-nowrap ${styles[status]}`}>
      {status}
    </span>
  )
}
