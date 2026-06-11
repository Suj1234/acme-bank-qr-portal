import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  if (user) {
    navigate('/dashboard', { replace: true })
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const ok = login(username.trim(), password.trim())
      if (ok) {
        navigate('/dashboard', { replace: true })
      } else {
        setError('Invalid username or password.')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#003087] flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}
      />

      <div className="w-full max-w-sm relative">
        {/* Logo card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-3">
            <span className="text-[#003087] text-xl font-black">AB</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-wide">ACME BANK</h1>
          <p className="text-blue-300 text-sm mt-0.5">Your Trusted Banking Partner</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-2xl px-8 py-8">
          <h2 className="text-gray-800 text-lg font-semibold mb-1">Sign In</h2>
          <p className="text-gray-400 text-xs mb-6">QR Add On Administration Portal</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError('') }}
                placeholder="Enter username"
                autoComplete="username"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]/20 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#003087] hover:bg-[#00246b] disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg tracking-widest transition-colors mt-2"
            >
              {loading ? 'Signing in...' : 'SIGN IN'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
            <p className="text-[11px] text-gray-500 font-semibold mb-2 uppercase tracking-wide">Demo Credentials</p>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">Branch Officer:</span>
                <span className="font-mono text-gray-700">branch / branch123</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">Admin (L1):</span>
                <span className="font-mono text-gray-700">l1admin / l1admin123</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">Admin (L2):</span>
                <span className="font-mono text-gray-700">l2admin / l2admin123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
