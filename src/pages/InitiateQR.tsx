import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Pencil, CheckCircle, Loader2, ImagePlus, X, Sparkles, RotateCcw } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { addApplication, getApplication } from '../store/applications'

// ── Static data ──────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
]

const TRANSACTION_COUNTS = ['10', '25', '50', '100', '200', '500', 'Unlimited']

const MCC_MOCK_IMAGE = { code: '5812', name: 'Eating Places, Restaurants' }
const MCC_MOCK_PAN   = { code: '5411', name: 'Grocery Stores, Supermarkets' }

// ── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  accountNumber: string
  merchantMobile: string
  merchantVpa: string
  merchantAccountNumber: string
  ifscCode: string
  merchantEstablishmentName: string
  storeManagerName: string
  merchantPanNumber: string
  udyamNumber: string
  gstNumber: string
  shopEstablishmentNumber: string
  counterOperatorName: string
  operatorMobileNumber: string
  operatorEmailId: string
  transactionCount: string
  notAllowedProducts: string[]
  address1: string
  address2: string
  address3: string
  city: string
  state: string
  pincode: string
  additionalMobiles: string[]
  additionalUpiIds: string
  remark: string
}

type MccResult = { code: string; name: string } | null

const initialForm: FormData = {
  accountNumber: '',
  merchantMobile: '',
  merchantVpa: '',
  merchantAccountNumber: '',
  ifscCode: '',
  merchantEstablishmentName: '',
  storeManagerName: '',
  merchantPanNumber: '',
  udyamNumber: '',
  gstNumber: '',
  shopEstablishmentNumber: '',
  counterOperatorName: '',
  operatorMobileNumber: '',
  operatorEmailId: '',
  transactionCount: '',
  notAllowedProducts: [],
  address1: '',
  address2: '',
  address3: '',
  city: '',
  state: '',
  pincode: '',
  additionalMobiles: [],
  additionalUpiIds: '',
  remark: '',
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function InitiateQR() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  const linkedFromId  = searchParams.get('linkedFrom')
  const originalApp   = linkedFromId ? getApplication(linkedFromId) : null

  const [form, setForm]                     = useState<FormData>(initialForm)
  const [fetched, setFetched]               = useState(false)
  const [vpaChecked, setVpaChecked]         = useState(false)
  const [addressEditable, setAddressEditable] = useState(false)
  const [errors, setErrors]                 = useState<Partial<Record<keyof FormData, string>>>({})

  // MCC state
  const [mccOption, setMccOption]   = useState<'image' | 'pan'>('image')
  const [uploadedImages, setUploadedImages] = useState<{ file: File; preview: string }[]>([])
  const [mccLoading, setMccLoading] = useState(false)
  const [mccResult, setMccResult]   = useState<MccResult>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const set = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
    // clear MCC if PAN/Udyam/GST changes while pan option is active
    if (['merchantPanNumber', 'udyamNumber', 'gstNumber'].includes(field) && mccOption === 'pan') {
      setMccResult(null)
    }
  }

  const toggleProduct = (product: string) => {
    setForm(prev => ({
      ...prev,
      notAllowedProducts: prev.notAllowedProducts.includes(product)
        ? prev.notAllowedProducts.filter(p => p !== product)
        : [...prev.notAllowedProducts, product],
    }))
  }

  const handleFetchOrReset = () => {
    if (fetched) {
      setForm(initialForm)
      setFetched(false)
      setVpaChecked(false)
      setMccResult(null)
      setUploadedImages([])
      setErrors({})
    } else {
      // mock fetch — just flip state
      setFetched(true)
    }
  }

  // ── MCC logic ───────────────────────────────────────────────────────────

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const remaining = 2 - uploadedImages.length
    const toAdd = files.slice(0, remaining).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setUploadedImages(prev => [...prev, ...toAdd])
    setMccResult(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const removeImage = (idx: number) => {
    setUploadedImages(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
    setMccResult(null)
  }

  const suggestMcc = (source: 'image' | 'pan') => {
    setMccLoading(true)
    setMccResult(null)
    setTimeout(() => {
      setMccResult(source === 'image' ? MCC_MOCK_IMAGE : MCC_MOCK_PAN)
      setMccLoading(false)
    }, 1800)
  }

  const switchMccOption = (opt: 'image' | 'pan') => {
    setMccOption(opt)
    setMccResult(null)
    setUploadedImages([])
  }

  // ── Validation & submit ─────────────────────────────────────────────────

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.accountNumber.trim()) e.accountNumber = 'Account Number is required'
    if (!form.merchantVpa.trim())   e.merchantVpa   = 'Merchant VPA is required'
    if (!form.transactionCount)     e.transactionCount = 'Transaction Count is required'
    if (addressEditable) {
      if (!form.address1.trim()) e.address1 = 'Address 1 is required'
      if (!form.city.trim())     e.city     = 'City is required'
      if (!form.state)           e.state    = 'State is required'
      if (!form.pincode.trim())  e.pincode  = 'Pincode is required'
    }
    if (!form.remark.trim()) e.remark = 'Remark is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      addApplication(
        { ...form, mccCode: mccResult?.code, mccName: mccResult?.name },
        user?.username ?? 'branch',
        user?.displayName,
        linkedFromId ?? undefined,
      )
      navigate('/success')
    }
  }

  const addMobileField = () =>
    setForm(prev => ({ ...prev, additionalMobiles: [...prev.additionalMobiles, ''] }))

  const updateAdditionalMobile = (idx: number, val: string) => {
    setForm(prev => {
      const updated = [...prev.additionalMobiles]
      updated[idx] = val
      return { ...prev, additionalMobiles: updated }
    })
  }

  // ── PAN/Udyam/GST readiness check ──────────────────────────────────────
  const panReady = form.merchantPanNumber.trim().length === 10
  const udyamOrGstReady = form.udyamNumber.trim().length > 0 || form.gstNumber.trim().length > 0
  const panOptionReady = panReady && udyamOrGstReady

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <AppLayout>
    <div className="bg-[#f0f2f5]">

      {/* Page header */}
      <div className="bg-[#003087] px-6 py-3">
        <h1 className="text-white text-lg font-semibold tracking-wide">QR Add On</h1>
        <p className="text-blue-200 text-xs mt-0.5">
          {originalApp ? `Re-application — Original Application #${originalApp.applicationNo}` : 'Merchant QR Registration — New Application'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-6 py-6 space-y-4">

        {/* Re-application banner */}
        {originalApp && (
          <div className="flex items-start gap-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800">
            <RotateCcw size={16} className="shrink-0 mt-0.5 text-orange-500" />
            <div>
              <p className="font-semibold">Re-application for Application #{originalApp.applicationNo}</p>
              <p className="text-xs text-orange-600 mt-0.5">
                The original application was rejected. Please fill in the form fresh and address the issues from the previous application.
              </p>
              {originalApp.auditTrail.filter(e => e.toStatus === 'Rejected').slice(-1).map(e => (
                e.remark && (
                  <p key={e.id} className="text-xs text-orange-700 mt-1.5 bg-orange-100 px-2.5 py-1.5 rounded italic">
                    Rejection reason: "{e.remark}"
                  </p>
                )
              ))}
            </div>
          </div>
        )}

        {/* ── 1. Account Number ────────────────────────────────────────── */}
        <SectionCard>
          <div className="flex items-end gap-6">
            <div className="flex-1 max-w-sm">
              <UnderlineField
                label="Account Number"
                required
                value={form.accountNumber}
                onChange={v => set('accountNumber', v)}
                error={errors.accountNumber}
                placeholder="Enter account number"
              />
            </div>
            <button
              type="button"
              onClick={handleFetchOrReset}
              disabled={!fetched && !form.accountNumber.trim()}
              className={`mb-1 px-8 py-2 text-white text-sm font-semibold rounded tracking-widest transition-colors
                ${fetched
                  ? 'bg-gray-500 hover:bg-gray-600'
                  : 'bg-[#003087] hover:bg-[#00246b] disabled:bg-gray-300 disabled:cursor-not-allowed'
                }`}
            >
              {fetched ? 'RESET' : 'FETCH DETAILS'}
            </button>
          </div>
        </SectionCard>

        {/* ── 2. Merchant Details ──────────────────────────────────────── */}
        <SectionCard title="Merchant Details">

          {/* Row 1: Mobile | VPA */}
          <div className="grid grid-cols-3 gap-8 mb-6">
            <UnderlineField
              label="Merchant Mobile Number"
              value={form.merchantMobile}
              onChange={v => set('merchantMobile', v)}
              maxLength={10}
            />
            <div className="col-span-2">
              <label className="block text-[11px] text-gray-500 mb-1">
                Merchant VPA <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border-b border-gray-400 pb-1 gap-1">
                <input
                  type="text"
                  value={form.merchantVpa}
                  onChange={e => set('merchantVpa', e.target.value)}
                  className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                  placeholder="Enter VPA"
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">@cnrb</span>
                <button
                  type="button"
                  onClick={() => setVpaChecked(true)}
                  className="ml-2 px-3 py-1 bg-[#003087] hover:bg-[#00246b] text-white text-xs font-semibold rounded tracking-wider whitespace-nowrap transition-colors"
                >
                  CHECK VPA
                </button>
              </div>
              {vpaChecked && (
                <p className="text-green-600 text-[10px] mt-1 flex items-center gap-1">
                  <CheckCircle size={11} /> VPA is available
                </p>
              )}
              {errors.merchantVpa && <p className="text-red-500 text-[10px] mt-0.5">{errors.merchantVpa}</p>}
              <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                VPA is a unique address used to send and receive money. It can be your Mobile Number or contain lower alphabets/number/special character as @.
              </p>
            </div>
          </div>

          {/* Row 2: Account | IFSC | Establishment Name */}
          <div className="grid grid-cols-3 gap-8 mb-6">
            <UnderlineField label="Merchant Account Number" value={form.merchantAccountNumber} onChange={v => set('merchantAccountNumber', v)} />
            <UnderlineField label="IFSC Code" value={form.ifscCode} onChange={v => set('ifscCode', v.toUpperCase())} maxLength={11} />
            <UnderlineField label="Merchant Establishment Name" value={form.merchantEstablishmentName} onChange={v => set('merchantEstablishmentName', v)} />
          </div>

          {/* Row 3: Store Manager | PAN | Udyam */}
          <div className="grid grid-cols-3 gap-8 mb-6">
            <UnderlineField label="Store Manager Name" value={form.storeManagerName} onChange={v => set('storeManagerName', v)} />
            <UnderlineField label="Merchant PAN Number" value={form.merchantPanNumber} onChange={v => set('merchantPanNumber', v.toUpperCase())} maxLength={10} placeholder="ABCDE1234F" />
            <UnderlineField label="Udyam Registration Number" value={form.udyamNumber} onChange={v => set('udyamNumber', v.toUpperCase())} placeholder="UDYAM-XX-00-0000000" />
          </div>

          {/* Row 4: GST | Shop Establishment | empty */}
          <div className="grid grid-cols-3 gap-8 mb-6">
            <UnderlineField label="GST Number" value={form.gstNumber} onChange={v => set('gstNumber', v.toUpperCase())} maxLength={15} placeholder="22ABCDE1234F1Z5" />
            <UnderlineField label="Shop Establishment Number" value={form.shopEstablishmentNumber} onChange={v => set('shopEstablishmentNumber', v)} />
            <div />
          </div>

          {/* Row 5: Counter Operator | Operator Mobile | Operator Email */}
          <div className="grid grid-cols-3 gap-8">
            <UnderlineField label="Counter Operator Name" value={form.counterOperatorName} onChange={v => set('counterOperatorName', v)} />
            <UnderlineField label="Operator Mobile Number" value={form.operatorMobileNumber} onChange={v => set('operatorMobileNumber', v)} maxLength={10} />
            <UnderlineField label="Operator Email Id" value={form.operatorEmailId} onChange={v => set('operatorEmailId', v)} type="email" />
          </div>
        </SectionCard>

        {/* ── 3. MCC Extraction ────────────────────────────────────────── */}
        <SectionCard title="Merchant Category Code (MCC)">
          <p className="text-xs text-gray-500 mb-4">
            The system will intelligently suggest the most relevant MCC code. Choose a method below.
          </p>

          {/* Option toggle */}
          <div className="flex gap-0 mb-5 border border-[#003087] rounded overflow-hidden w-fit">
            {([
              { key: 'image', label: 'Upload Business Images' },
              { key: 'pan',   label: 'Use PAN / Udyam / GST'  },
            ] as const).map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => switchMccOption(opt.key)}
                className={`px-5 py-2 text-sm font-medium transition-colors
                  ${mccOption === opt.key
                    ? 'bg-[#003087] text-white'
                    : 'bg-white text-[#003087] hover:bg-blue-50'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Option A — Image Upload */}
          {mccOption === 'image' && (
            <div>
              <p className="text-xs text-gray-600 mb-3">
                Upload up to <span className="font-semibold">2 images</span> of your business (storefront, signage, interior) for AI-based MCC detection.
              </p>

              <div className="flex gap-3 mb-4">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative w-28 h-28 rounded border border-gray-200 overflow-hidden group">
                    <img src={img.preview} alt={`Business ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {uploadedImages.length < 2 && (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-28 h-28 rounded border-2 border-dashed border-gray-300 hover:border-[#003087] flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-[#003087] transition-colors"
                  >
                    <ImagePlus size={20} />
                    <span className="text-[10px]">
                      {uploadedImages.length === 0 ? 'Add Image' : 'Add More'}
                    </span>
                  </button>
                )}
              </div>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              <button
                type="button"
                disabled={uploadedImages.length === 0 || mccLoading}
                onClick={() => suggestMcc('image')}
                className="flex items-center gap-2 px-5 py-2 bg-[#003087] hover:bg-[#00246b] text-white text-sm font-semibold rounded tracking-wider transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {mccLoading
                  ? <><Loader2 size={14} className="animate-spin" /> Analysing Images...</>
                  : <><Sparkles size={14} /> Analyse &amp; Suggest MCC</>
                }
              </button>
            </div>
          )}

          {/* Option B — PAN / Udyam / GST */}
          {mccOption === 'pan' && (
            <div>
              <p className="text-xs text-gray-600 mb-3">
                The system will use the following details you've entered above to suggest the MCC.
              </p>

              <div className="flex flex-wrap gap-3 mb-4">
                <InfoChip label="PAN" value={form.merchantPanNumber || '—'} ready={panReady} />
                <InfoChip label="Udyam" value={form.udyamNumber || '—'} ready={form.udyamNumber.trim().length > 0} />
                <InfoChip label="GST" value={form.gstNumber || '—'} ready={form.gstNumber.trim().length > 0} />
              </div>

              {!panOptionReady && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-3">
                  Please fill in PAN Number and at least one of Udyam or GST in the Merchant Details section above.
                </p>
              )}

              <button
                type="button"
                disabled={!panOptionReady || mccLoading}
                onClick={() => suggestMcc('pan')}
                className="flex items-center gap-2 px-5 py-2 bg-[#003087] hover:bg-[#00246b] text-white text-sm font-semibold rounded tracking-wider transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {mccLoading
                  ? <><Loader2 size={14} className="animate-spin" /> Fetching Suggestion...</>
                  : <><Sparkles size={14} /> Suggest MCC</>
                }
              </button>
            </div>
          )}

          {/* Suggested MCC result */}
          {mccResult && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#eef3ff] border border-[#003087]/30 rounded-lg px-4 py-2.5">
                <CheckCircle size={15} className="text-[#003087]" />
                <span className="text-xs text-gray-500">Suggested MCC:</span>
                <span className="text-sm font-semibold text-[#003087]">
                  {mccResult.code} — {mccResult.name}
                </span>
                <span className="ml-2 text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Auto-filled · Read only</span>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── 4. Transaction Count ─────────────────────────────────────── */}
        <SectionCard>
          <label className="block text-[11px] text-gray-500 mb-2">
            Select Transaction Count <span className="text-red-500">*</span>
          </label>
          <div className="relative border border-gray-300 rounded max-w-xs">
            <select
              value={form.transactionCount}
              onChange={e => set('transactionCount', e.target.value)}
              className="w-full text-sm outline-none bg-white text-gray-800 px-3 py-2 appearance-none cursor-pointer rounded"
            >
              <option value="">Select Transaction Count</option>
              {TRANSACTION_COUNTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <svg className="absolute right-3 top-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {errors.transactionCount && <p className="text-red-500 text-[10px] mt-1">{errors.transactionCount}</p>}
        </SectionCard>

        {/* ── 5. Not Allowed UPI Products ──────────────────────────────── */}
        <SectionCard>
          <p className="text-sm text-gray-700 font-medium mb-3">Select Not Allowed UPI Products?</p>
          <div className="grid grid-cols-3 gap-x-8 gap-y-2">
            {[
              ['RuPay Credit Card on UPI', 'Voucher'],
              ['PPI Wallet', 'Credit Line Product'],
              ['Unsecured Over Draft'],
            ].map((col, ci) => (
              <div key={ci} className="flex flex-col gap-2">
                {col.map(product => (
                  <label key={product} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.notAllowedProducts.includes(product)}
                      onChange={() => toggleProduct(product)}
                      className="w-3.5 h-3.5 accent-[#003087] cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{product}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── 6. Delivery Address ──────────────────────────────────────── */}
        <SectionCard>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-700 font-medium">Delivery Address</span>
            {!addressEditable && (
              <button
                type="button"
                onClick={() => setAddressEditable(true)}
                className="flex items-center gap-1 text-[#003087] text-xs hover:underline"
              >
                <Pencil size={11} /> Click to edit the address
              </button>
            )}
          </div>
          <div className="space-y-3">
            <BoxField label="Address 1" required value={form.address1} onChange={v => set('address1', v)} disabled={!addressEditable} error={errors.address1} />
            <BoxField label="Address 2" value={form.address2} onChange={v => set('address2', v)} disabled={!addressEditable} />
            <div className="grid grid-cols-4 gap-3 items-end">
              <div className="col-span-2">
                <BoxField label="Address 3" value={form.address3} onChange={v => set('address3', v)} disabled={!addressEditable} />
              </div>
              <BoxField label="City" required value={form.city} onChange={v => set('city', v)} disabled={!addressEditable} error={errors.city} />
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">State <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    value={form.state}
                    onChange={e => set('state', e.target.value)}
                    disabled={!addressEditable}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-800 bg-white appearance-none outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <svg className="absolute right-2 top-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {errors.state && <p className="text-red-500 text-[10px] mt-0.5">{errors.state}</p>}
              </div>
            </div>
            <div className="max-w-xs">
              <BoxField label="Pincode" required value={form.pincode} onChange={v => set('pincode', v)} disabled={!addressEditable} error={errors.pincode} maxLength={6} />
            </div>
          </div>
        </SectionCard>

        {/* ── 7. Additional Mobile ─────────────────────────────────────── */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-700 font-medium">Additional Mobile No.:</span>
            <button
              type="button"
              onClick={addMobileField}
              className="w-5 h-5 bg-[#003087] hover:bg-[#00246b] text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mb-3">
            Note: Please add mobile number in case of requirements only as it is adding operating cost to the Bank.
          </p>
          {form.additionalMobiles.map((mob, idx) => (
            <div key={idx} className="mb-2 max-w-xs">
              <input
                type="text"
                value={mob}
                onChange={e => updateAdditionalMobile(idx, e.target.value)}
                placeholder={`Mobile ${idx + 1}`}
                maxLength={10}
                className="w-full border-b border-gray-400 text-sm outline-none py-1 bg-transparent text-gray-800 placeholder-gray-400"
              />
            </div>
          ))}
        </SectionCard>

        {/* ── 8. Additional UPI ID ─────────────────────────────────────── */}
        <SectionCard>
          <p className="text-sm text-gray-700 font-medium mb-2">Additional UPI ID &amp; Mobile No:</p>
          <textarea
            value={form.additionalUpiIds}
            onChange={e => setForm(prev => ({ ...prev, additionalUpiIds: e.target.value }))}
            placeholder="Add Sub-Merchant UPI ID &amp; Mobile Number"
            rows={2}
            className="w-full text-sm border-b border-gray-300 outline-none resize-none bg-transparent text-gray-800 placeholder-gray-400 py-1"
          />
        </SectionCard>

        {/* ── 9. Remark ────────────────────────────────────────────────── */}
        <SectionCard>
          <label className="block text-[11px] text-gray-500 mb-1">
            Remark <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.remark}
            onChange={e => setForm(prev => ({ ...prev, remark: e.target.value }))}
            rows={2}
            className="w-full border-b border-gray-400 text-sm outline-none resize-none bg-transparent text-gray-800 py-1"
          />
          {errors.remark && <p className="text-red-500 text-[10px] mt-0.5">{errors.remark}</p>}
        </SectionCard>

        {/* ── Submit ───────────────────────────────────────────────────── */}
        <div className="flex justify-end pb-2">
          <button
            type="submit"
            className="px-10 py-2.5 bg-[#003087] hover:bg-[#00246b] text-white text-sm font-semibold rounded tracking-widest transition-colors"
          >
            SUBMIT
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 pb-4">
          Note: Best viewed in browser Google Chrome
        </p>
      </form>
    </div>
    </AppLayout>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionCard({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="bg-white rounded border border-gray-200 px-6 py-5">
      {title && (
        <h2 className="text-sm font-semibold text-[#003087] mb-4 pb-2 border-b border-gray-100">
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}

function UnderlineField({
  label, required, value, onChange, placeholder = '', type = 'text', error, maxLength,
}: {
  label: string; required?: boolean; value: string
  onChange: (v: string) => void; placeholder?: string
  type?: string; error?: string; maxLength?: number
}) {
  return (
    <div>
      <label className="block text-[11px] text-gray-500 mb-1">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full border-b border-gray-400 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400 py-1"
      />
      {error && <p className="text-red-500 text-[10px] mt-0.5">{error}</p>}
    </div>
  )
}

function BoxField({
  label, required, value, onChange, disabled, error, maxLength,
}: {
  label: string; required?: boolean; value: string
  onChange: (v: string) => void; disabled?: boolean
  error?: string; maxLength?: number
}) {
  return (
    <div>
      <label className="block text-[11px] text-gray-600 mb-1">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        maxLength={maxLength}
        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-800 outline-none disabled:bg-gray-50 disabled:text-gray-400 focus:border-[#003087]"
      />
      {error && <p className="text-red-500 text-[10px] mt-0.5">{error}</p>}
    </div>
  )
}

function InfoChip({ label, value, ready }: { label: string; value: string; ready: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs
      ${ready
        ? 'border-green-300 bg-green-50 text-green-800'
        : 'border-gray-200 bg-gray-50 text-gray-400'
      }`}
    >
      <span className="font-medium">{label}:</span>
      <span className="font-mono">{value}</span>
      {ready && <CheckCircle size={11} className="text-green-500 ml-0.5" />}
    </div>
  )
}
