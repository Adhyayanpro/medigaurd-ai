import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Search, AlertTriangle, CheckCircle, Loader, Sparkles } from 'lucide-react'
import { analyzeSymptoms as analyzeSymptomsAPI } from '../services/api'
import toast from 'react-hot-toast'

const SymptomAnalyzer = () => {
  const [symptoms, setSymptoms] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState(null)

  const commonSymptoms = [
    'Fever', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Dizziness',
    'Chest Pain', 'Shortness of Breath', 'Joint Pain', 'Muscle Aches',
    'Sore Throat', 'Runny Nose', 'Abdominal Pain', 'Diarrhea', 'Rash'
  ]

  const addSymptom = (s) => { if (!symptoms.includes(s)) { setSymptoms([...symptoms, s]); setInputValue('') } }
  const removeSymptom = (s) => setSymptoms(symptoms.filter(x => x !== s))

  const analyze = async () => {
    if (!symptoms.length) { toast.error('Add at least one symptom'); return }
    setIsAnalyzing(true); setResults(null)
    try {
      const res = await analyzeSymptomsAPI(symptoms)
      if (res.success) {
        setResults({ primaryDiagnosis: res.analysis.primary_diagnosis, possibleConditions: res.analysis.possible_conditions,
          recommendations: res.analysis.recommendations, severity: res.analysis.severity, urgency: res.analysis.urgency })
        toast.success('Analysis complete!')
      }
    } catch { toast.error('Failed. Is backend running?') }
    finally { setIsAnalyzing(false) }
  }

  return (
    <div className="p-4 sm:p-6  min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display text-white">Symptom Analyzer</h1>
            <p className="text-sm text-gray-500">ML-powered diagnostic prediction</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="p-6 rounded-2xl glass-effect">
              <h2 className="text-base font-bold text-white mb-4 font-display">Enter Symptoms</h2>
              <div className="flex space-x-2 mb-4">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter' && inputValue.trim()) addSymptom(inputValue.trim()) }}
                  placeholder="Type a symptom..." className="flex-1 input-dark text-sm" />
                <button onClick={() => inputValue.trim() && addSymptom(inputValue.trim())}
                  className="px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all">
                  <Search className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Common Symptoms</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {commonSymptoms.map((s) => (
                  <button key={s} onClick={() => addSymptom(s)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-300 ${
                      symptoms.includes(s) ? 'bg-purple-600 text-white border border-purple-500' : 'bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12]'
                    }`}>{s}</button>
                ))}
              </div>

              {symptoms.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Selected</p>
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map((s) => (
                      <motion.span key={s} initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs rounded-lg">
                        <span>{s}</span>
                        <button onClick={() => removeSymptom(s)} className="hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center text-xs">×</button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={analyze} disabled={isAnalyzing || !symptoms.length}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all disabled:opacity-30 flex items-center justify-center space-x-2 hover:-translate-y-0.5 active:translate-y-0">
                {isAnalyzing ? <><Loader className="w-4 h-4 animate-spin" /><span>Analyzing...</span></> : <><Sparkles className="w-4 h-4" /><span>Run ML Analysis</span></>}
              </button>
            </div>

            <AnimatePresence>
              {results && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-6 rounded-2xl glass-effect-strong">
                  <div className="flex items-center space-x-2 mb-5">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-base font-bold text-white font-display">Analysis Results</h2>
                  </div>

                  {results.primaryDiagnosis && (
                    <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-white">{results.primaryDiagnosis.condition}</h3>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">{results.primaryDiagnosis.confidence}%</span>
                      </div>
                      <p className="text-sm text-gray-400">{results.primaryDiagnosis.description}</p>
                    </div>
                  )}

                  <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Possible Conditions</h3>
                  <div className="space-y-2 mb-6">
                    {results.possibleConditions.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-sm text-gray-300">{c.name}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${c.probability}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-gray-300 w-8 text-right">{c.probability}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Recommendations</h3>
                  <div className="space-y-1.5 mb-6">
                    {results.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start space-x-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{r}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div><p className="text-xs text-gray-500">Severity</p><p className="text-sm font-bold text-white">{results.severity}</p></div>
                    <div className="text-right"><p className="text-xs text-gray-500">Urgency</p>
                      <p className={`text-sm font-bold ${results.urgency === 'High' || results.urgency === 'Critical' ? 'text-red-400' : results.urgency === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'}`}>{results.urgency}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-5 rounded-2xl glass-effect">
              <AlertTriangle className="w-6 h-6 text-amber-400 mb-3" />
              <h3 className="text-sm font-bold text-white mb-2 font-display">Important</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                This tool uses ML for preliminary assessment only. Always consult a healthcare provider for diagnosis.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="p-5 rounded-2xl glass-effect">
              <Brain className="w-6 h-6 text-purple-400 mb-3" />
              <h3 className="text-sm font-bold text-white mb-2 font-display">How It Works</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Symptoms are analyzed by our Flask backend ML models using pattern recognition across 50+ medical conditions.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SymptomAnalyzer
