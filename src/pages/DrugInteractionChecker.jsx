import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pill, Plus, X, AlertTriangle, CheckCircle, Loader, Shield, Sparkles } from 'lucide-react'
import { checkDrugInteractions } from '../services/api'
import toast from 'react-hot-toast'

const DrugInteractionChecker = () => {
  const [drugs, setDrugs] = useState(['', ''])
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState(null)

  const updateDrug = (index, value) => {
    const updated = [...drugs]
    updated[index] = value
    setDrugs(updated)
  }

  const addDrug = () => { if (drugs.length < 8) setDrugs([...drugs, '']) }
  const removeDrug = (index) => { if (drugs.length > 2) setDrugs(drugs.filter((_, i) => i !== index)) }

  const checkInteractions = async () => {
    const filled = drugs.filter(d => d.trim())
    if (filled.length < 2) { toast.error('Enter at least 2 medications'); return }
    setIsChecking(true); setResults(null)
    try {
      const res = await checkDrugInteractions(filled)
      if (res.success) { setResults(res.result); toast.success('Check complete!') }
    } catch { toast.error('Check failed. Is the backend running?') }
    finally { setIsChecking(false) }
  }

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Critical': return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' }
      case 'High': return { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400' }
      case 'Moderate': return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400' }
      default: return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400' }
    }
  }

  const commonDrugs = ['Aspirin', 'Ibuprofen', 'Metformin', 'Lisinopril', 'Simvastatin', 'Amlodipine', 'Omeprazole', 'Warfarin', 'Metoprolol', 'Clopidogrel']

  return (
    <div className="p-4 sm:p-6  min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display text-white">Drug Interaction Checker</h1>
            <p className="text-sm text-gray-500">Check for dangerous medication interactions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="p-6 rounded-2xl glass-effect">
              <h2 className="text-base font-bold text-white mb-4 font-display">Enter Medications</h2>
              <div className="space-y-3 mb-4">
                {drugs.map((drug, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 w-6 text-right">{i + 1}.</span>
                    <input type="text" value={drug} onChange={(e) => updateDrug(i, e.target.value)}
                      placeholder={`Medication ${i + 1}`} className="flex-1 input-dark text-sm" />
                    {drugs.length > 2 && (
                      <button onClick={() => removeDrug(i)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={addDrug} disabled={drugs.length >= 8}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all text-sm mb-4 disabled:opacity-30">
                <Plus className="w-4 h-4" /><span>Add Medication</span>
              </button>

              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Quick Add</p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {commonDrugs.map((d) => (
                  <button key={d} onClick={() => {
                    const empty = drugs.findIndex(x => !x.trim())
                    if (empty >= 0) updateDrug(empty, d)
                    else if (drugs.length < 8) setDrugs([...drugs, d])
                  }}
                    className="px-3 py-1 text-xs rounded-lg bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all">
                    {d}
                  </button>
                ))}
              </div>

              <button onClick={checkInteractions} disabled={isChecking}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all disabled:opacity-30 flex items-center justify-center space-x-2 hover:-translate-y-0.5">
                {isChecking ? <><Loader className="w-4 h-4 animate-spin" /><span>Checking...</span></> : <><Shield className="w-4 h-4" /><span>Check Interactions</span></>}
              </button>
            </div>

            <AnimatePresence>
              {results && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6 rounded-2xl glass-effect-strong">
                  <div className="flex items-center space-x-2 mb-5">
                    {results.safe ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
                    <h2 className="text-base font-bold text-white font-display">{results.summary}</h2>
                  </div>

                  {results.safe ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
                      <p className="text-emerald-400 font-semibold mb-1">No Known Interactions</p>
                      <p className="text-sm text-gray-500">The medications you entered don't have documented interactions in our database.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {results.interactions.map((inter, i) => {
                        const style = getSeverityStyle(inter.severity)
                        return (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                            className={`p-4 rounded-xl ${style.bg} border ${style.border}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-bold text-white">{inter.drug1}</span>
                                <span className="text-xs text-gray-500">×</span>
                                <span className="text-sm font-bold text-white">{inter.drug2}</span>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${style.badge}`}>{inter.severity}</span>
                            </div>
                            <p className={`text-sm font-medium ${style.text} mb-1`}>{inter.effect}</p>
                            <p className="text-xs text-gray-400 mb-2">{inter.advice}</p>
                            <span className="text-xs text-gray-600">Type: {inter.type}</span>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-5">
            <div className="p-5 rounded-2xl glass-effect">
              <AlertTriangle className="w-6 h-6 text-amber-400 mb-3" />
              <h3 className="text-sm font-bold text-white mb-2 font-display">Disclaimer</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                This checker covers common interactions but is not exhaustive. Always consult your pharmacist or doctor before combining medications.
              </p>
            </div>
            <div className="p-5 rounded-2xl glass-effect">
              <Sparkles className="w-6 h-6 text-purple-400 mb-3" />
              <h3 className="text-sm font-bold text-white mb-2 font-display">Tips</h3>
              <ul className="text-xs text-gray-500 space-y-1.5">
                <li>• Enter brand or generic names</li>
                <li>• Include supplements too</li>
                <li>• Check before starting new meds</li>
                <li>• Report any side effects to your doctor</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DrugInteractionChecker
