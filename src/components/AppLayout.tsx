import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <div className="flex h-screen bg-[#eef2f7] overflow-hidden">

      {/* Sidebar */}
      <aside className="w-16 bg-[#003087] flex flex-col items-center py-4 shrink-0 z-10">
        {/* Logo */}
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mb-6 shrink-0">
          <span className="text-[#003087] text-xs font-black leading-none">CB</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col items-center gap-2 flex-1">
          <SidebarBtn
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={isActive('/dashboard')}
            onClick={() => navigate('/dashboard')}
          />
        </nav>

        {/* Logout */}
        <SidebarBtn
          icon={<LogOut size={18} />}
          label="Logout"
          onClick={handleLogout}
        />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center justify-between shrink-0">
          <div className="text-sm text-gray-500">
            <span className="font-semibold text-[#003087]">Canara Bank</span>
            <span className="mx-2 text-gray-300">|</span>
            QR Add On Portal
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={14} className="text-[#003087]" />
            <span className="font-medium">{user?.displayName}</span>
            <span className="text-[10px] bg-[#003087]/10 text-[#003087] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
              {user?.role}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarBtn({
  icon, label, active, onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors
        ${active
          ? 'bg-white text-[#003087]'
          : 'text-white/60 hover:bg-white/10 hover:text-white'
        }`}
    >
      {icon}
    </button>
  )
}
