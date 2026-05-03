import { Link, useLocation } from 'react-router-dom'
import { Menu, Bell, User, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/[0.06]"
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors lg:hidden"
            >
              <Menu className="w-6 h-6 text-gray-400" />
            </button>
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold font-display gradient-text hidden sm:block">
                MediGuard AI
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => toast('No new notifications', { icon: '🔔', style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } })}
              className="relative p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
              <Bell className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#0a0a0f]"></span>
            </button>
            <button 
              onClick={() => toast.success('Profile settings opened')}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
