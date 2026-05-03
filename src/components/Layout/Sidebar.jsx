import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Stethoscope, 
  FileText, 
  Pill, 
  MessageSquare, 
  Users, 
  Activity,
  AlertTriangle,
  HeartPulse,
  X,
  Phone,
  FileBarChart
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'blue' },
  { path: '/health-assessment', icon: HeartPulse, label: 'Health Assessment', color: 'rose' },
  { path: '/symptom-analyzer', icon: Stethoscope, label: 'Symptom Analyzer', color: 'purple' },
  { path: '/ai-chatbot', icon: MessageSquare, label: 'AI Assistant', color: 'cyan' },
  { path: '/drug-interactions', icon: Pill, label: 'Drug Interactions', color: 'orange' },
  { path: '/health-report', icon: FileBarChart, label: 'Health Report', color: 'emerald' },
  { path: '/wearable-monitor', icon: Activity, label: 'Wearable Monitor', color: 'teal' },
  { path: '/emergency-sos', icon: Phone, label: 'Emergency SOS', color: 'rose' },
  { path: '/health-records', icon: FileText, label: 'Health Records', color: 'indigo' },
  { path: '/doctor-matching', icon: Users, label: 'Find Doctors', color: 'blue' },
  { path: '/anomaly-detection', icon: AlertTriangle, label: 'Anomaly Detection', color: 'amber' },
]

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  rose: 'from-rose-500 to-pink-600',
  purple: 'from-purple-500 to-violet-600',
  cyan: 'from-cyan-500 to-blue-500',
  emerald: 'from-emerald-500 to-green-600',
  orange: 'from-orange-500 to-amber-600',
  indigo: 'from-indigo-500 to-purple-600',
  teal: 'from-teal-500 to-cyan-600',
  amber: 'from-amber-500 to-orange-600',
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-[#0a0a0f]/95 backdrop-blur-2xl border-r border-white/[0.06] z-40 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Navigation</span>
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${colorMap[item.color]} text-white shadow-lg`
                      : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                    isActive ? 'bg-white/20' : 'bg-white/[0.04] group-hover:bg-white/[0.08]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/10">
            <p className="text-xs text-gray-400 mb-2">Backend Status</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">Connected</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
