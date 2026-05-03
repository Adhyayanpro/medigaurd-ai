import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pill, Clock, Plus, CheckCircle, Bell, Settings, Calendar, BellOff } from 'lucide-react'

const MedicationReminder = () => {
  const [medications] = useState([
    { id: 1, name: 'Lisinopril', dosage: '10mg', time: '08:00 AM', status: 'Taken', type: 'Blood Pressure', afterMeal: true },
    { id: 2, name: 'Atorvastatin', dosage: '20mg', time: '08:00 PM', status: 'Pending', type: 'Cholesterol', afterMeal: false },
    { id: 3, name: 'Vitamin D3', dosage: '1000 IU', time: '12:00 PM', status: 'Pending', type: 'Supplement', afterMeal: true },
  ])

  return (
    <div className="p-4 sm:p-6  min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display text-white">Medications</h1>
              <p className="text-sm text-gray-500">Track and manage your daily prescriptions</p>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all text-sm font-semibold">
            <Plus className="w-4 h-4" /><span>Add Med</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-5 rounded-2xl glass-effect md:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-pink-400" />
                <h2 className="text-lg font-bold text-white font-display">Today's Schedule</h2>
              </div>
              <span className="text-sm text-gray-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            <div className="space-y-3">
              {medications.map((med, i) => (
                <motion.div key={med.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-all gap-4">
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${med.status === 'Taken' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-pink-500/10 text-pink-400'}`}>
                      {med.status === 'Taken' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-base font-bold text-white">{med.name}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-gray-300 text-[10px] font-bold uppercase tracking-wider">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{med.type}</p>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className={`flex items-center space-x-1 ${med.status === 'Taken' ? 'text-gray-500' : 'text-pink-400 font-medium'}`}>
                          <Clock className="w-3.5 h-3.5" /><span>{med.time}</span>
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-400">{med.afterMeal ? 'After meal' : 'Before meal'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-16 sm:ml-0">
                    {med.status === 'Taken' ? (
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-semibold flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" /><span>Taken</span>
                      </span>
                    ) : (
                      <button className="px-4 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400 transition-all text-sm font-semibold">
                        Mark Taken
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl glass-effect">
              <h3 className="text-sm font-bold text-white mb-3 font-display">Adherence Score</h3>
              <div className="flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500" style={{ clipPath: 'inset(0 0 0 15%)' }}></div>
                  <span className="text-2xl font-bold text-white">85%</span>
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">Excellent adherence this week. Keep it up!</p>
              </div>
            </div>
            
            <div className="p-5 rounded-2xl glass-effect">
              <h3 className="text-sm font-bold text-white mb-3 font-display">Settings</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] text-gray-400 hover:text-white transition-all text-sm">
                  <span className="flex items-center space-x-2"><Bell className="w-4 h-4" /><span>Push Notifications</span></span>
                  <div className="w-8 h-4 rounded-full bg-pink-500 relative"><div className="w-3 h-3 rounded-full bg-white absolute right-0.5 top-0.5"></div></div>
                </button>
                <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] text-gray-400 hover:text-white transition-all text-sm">
                  <span className="flex items-center space-x-2"><BellOff className="w-4 h-4" /><span>Mute Weekend</span></span>
                  <div className="w-8 h-4 rounded-full bg-white/10 relative"><div className="w-3 h-3 rounded-full bg-gray-400 absolute left-0.5 top-0.5"></div></div>
                </button>
                <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] text-gray-400 hover:text-white transition-all text-sm">
                  <span className="flex items-center space-x-2"><Settings className="w-4 h-4" /><span>Manage Devices</span></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MedicationReminder
