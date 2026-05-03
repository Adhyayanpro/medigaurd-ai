import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Layout/Navbar'
import Sidebar from './components/Layout/Sidebar'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import SymptomAnalyzer from './pages/SymptomAnalyzer'
import HealthRecords from './pages/HealthRecords'
import MedicationReminder from './pages/MedicationReminder'
import AIChatbot from './pages/AIChatbot'
import DoctorMatching from './pages/DoctorMatching'
import WearableMonitor from './pages/WearableMonitor'
import AnomalyDetection from './pages/AnomalyDetection'
import HealthAssessment from './pages/HealthAssessment'
import DrugInteractionChecker from './pages/DrugInteractionChecker'
import EmergencySOS from './pages/EmergencySOS'
import HealthReport from './pages/HealthReport'
import { useState } from 'react'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex bg-[#07070b]">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 ml-0 lg:ml-64 w-full transition-all duration-300 min-h-screen pt-24">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/health-assessment" element={<HealthAssessment />} />
            <Route path="/symptom-analyzer" element={<SymptomAnalyzer />} />
            <Route path="/health-records" element={<HealthRecords />} />
            <Route path="/medication-reminder" element={<MedicationReminder />} />
            <Route path="/ai-chatbot" element={<AIChatbot />} />
            <Route path="/doctor-matching" element={<DoctorMatching />} />
            <Route path="/wearable-monitor" element={<WearableMonitor />} />
            <Route path="/anomaly-detection" element={<AnomalyDetection />} />
            <Route path="/drug-interactions" element={<DrugInteractionChecker />} />
            <Route path="/emergency-sos" element={<EmergencySOS />} />
            <Route path="/health-report" element={<HealthReport />} />
          </Routes>
        </main>
      </div>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: { background: '#1a1a2e', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.06)' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </Router>
  )
}

export default App
