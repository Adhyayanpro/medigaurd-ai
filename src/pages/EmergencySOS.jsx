import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Phone, AlertTriangle, Heart, Brain, Scissors, Droplet, ChevronDown, ChevronUp, Shield } from 'lucide-react'
import { getEmergencyInfo } from '../services/api'

const EmergencySOS = () => {
  const [data, setData] = useState(null)
  const [expandedGuide, setExpandedGuide] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getEmergencyInfo()
        if (res.success) setData(res.emergency)
      } catch {
        // Fallback data
        setData({
          numbers: [
            { country: 'India', number: '112', service: 'Emergency' },
            { country: 'India', number: '108', service: 'Ambulance' },
            { country: 'India', number: '104', service: 'Health Helpline' },
            { country: 'USA', number: '911', service: 'Emergency' },
          ],
          first_aid: [
            { condition: 'Heart Attack', steps: ['Call emergency services', 'Chew aspirin 325mg', 'Begin CPR if needed', 'Use AED if available'] },
            { condition: 'Stroke', steps: ['Call emergency immediately', 'Note time of symptoms', 'Keep comfortable', 'Do NOT give food/water'] },
            { condition: 'Choking', steps: ['Heimlich maneuver', '5 back blows', '5 abdominal thrusts', 'Repeat until cleared'] },
            { condition: 'Severe Bleeding', steps: ['Apply direct pressure', 'Elevate above heart', 'Use tourniquet if needed', 'Call emergency'] },
          ]
        })
      }
    }
    load()
  }, [])

  const conditionIcons = { 'Heart Attack': Heart, 'Stroke': Brain, 'Choking': AlertTriangle, 'Severe Bleeding': Droplet }

  return (
    <div className="p-4 sm:p-6  min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20 animate-pulse">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display text-white">Emergency SOS</h1>
            <p className="text-sm text-gray-500">Emergency contacts & first aid guides</p>
          </div>
        </div>

        {/* Emergency Numbers */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4 font-display">Emergency Numbers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data?.numbers?.map((num, i) => (
              <motion.a key={i} href={`tel:${num.number}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all group cursor-pointer">
                <div>
                  <p className="text-sm text-gray-400">{num.country} — {num.service}</p>
                  <p className="text-2xl font-bold text-red-400 font-display">{num.number}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-all">
                  <Phone className="w-5 h-5 text-red-400" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* First Aid Guides */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 font-display">First Aid Guides</h2>
          <div className="space-y-3">
            {data?.first_aid?.map((guide, i) => {
              const Icon = conditionIcons[guide.condition] || Shield
              const isExpanded = expandedGuide === i
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl glass-effect overflow-hidden">
                  <button onClick={() => setExpandedGuide(isExpanded ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-red-400" />
                      </div>
                      <span className="text-base font-bold text-white font-display">{guide.condition}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                  </button>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      className="px-5 pb-5">
                      <div className="space-y-2 ml-14">
                        {guide.steps.map((step, j) => (
                          <div key={j} className="flex items-start space-x-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-xs font-bold text-red-400 flex-shrink-0 mt-0.5">{j + 1}</span>
                            <span className="text-sm text-gray-300">{step}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* CPR Guide */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-red-600/10 to-rose-600/10 border border-red-500/10">
          <h3 className="text-lg font-bold text-white mb-4 font-display">🫀 CPR Quick Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Check Response', desc: 'Tap shoulders, shout "Are you OK?"' },
              { step: '2', title: 'Call Emergency', desc: 'Dial 112/911, put on speaker' },
              { step: '3', title: 'Start Compressions', desc: '30 chest compressions, 2 rescue breaths. Push hard, push fast (100-120/min), 2 inches deep.' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-sm font-bold text-red-400 mb-3">{item.step}</div>
                <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default EmergencySOS
