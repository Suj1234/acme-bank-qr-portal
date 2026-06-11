import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'

export default function SuccessPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl border border-gray-200 px-12 py-10 flex flex-col items-center max-w-md w-full mx-4 shadow-sm">

        <div className="mb-6 text-center">
          <div className="text-[#003087] text-xl font-bold tracking-wide">ACME BANK</div>
          <div className="text-gray-400 text-xs tracking-widest mt-0.5">Your Trusted Banking Partner</div>
        </div>

        <CheckCircle2 size={60} className="text-green-500 mb-4" strokeWidth={1.5} />

        <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
          Application Submitted
        </h2>
        <p className="text-sm text-gray-500 text-center mb-1">
          Your QR Add On application has been submitted successfully.
        </p>
        <p className="text-xs text-gray-400 text-center mb-8">
          It is now pending admin approval. You can track the status from the dashboard.
        </p>

        <div className="w-full border-t border-gray-100 pt-5 flex flex-col gap-3">
          <button
            onClick={() => navigate('/application/new')}
            className="w-full py-2.5 bg-[#003087] hover:bg-[#00246b] text-white text-sm font-semibold rounded-lg tracking-widest transition-colors"
          >
            NEW APPLICATION
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-2.5 border border-[#003087] text-[#003087] hover:bg-blue-50 text-sm font-semibold rounded-lg tracking-widest transition-colors"
          >
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    </div>
  )
}
