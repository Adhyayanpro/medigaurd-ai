import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartPulse, Activity, Loader, AlertTriangle, CheckCircle, Shield, Sparkles, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'
import { submitHealthAssessment } from '../services/api'
import toast from 'react-hot-toast'

const HealthAssessment = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState(null)
  const [formData, setFormData] = useState({
    age: 35, sex: 1, height: 170, weight: 70,
    systolic_bp: 120, diastolic_bp: 80, resting_heart_rate: 72,
    cholesterol: 200, fasting_blood_sugar: 90, max_heart_rate: 150,
    chest_pain_type: 0, exercise_angina: 0, st_depression: 0,
    st_slope: 1, num_major_vessels: 0, thalassemia: 2, resting_ecg: 0,
    smoking: 0, alcohol: 0, exercise_freq: 3, diet_score: 3,
    family_heart: 0, family_diabetes: 0, family_stroke: 0,
  })

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: Number(value) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResults(null)
    try {
      const res = await submitHealthAssessment(formData)
      if (res.success) {
        setResults(res.assessment)
        toast.success('Assessment complete!')
        localStorage.setItem('healthAssessment', JSON.stringify(res.assessment))
        localStorage.setItem('healthFormData', JSON.stringify(formData))
      }
    } catch { toast.error('Failed. Is the backend running?') }
    finally { setIsSubmitting(false) }
  }

  const getRiskGradient = (level) => {
    switch (level) {
      case 'Low': return 'from-emerald-500 to-green-600'
      case 'Moderate': return 'from-amber-500 to-orange-500'
      case 'High': return 'from-orange-500 to-red-500'
      case 'Critical': return 'from-red-600 to-rose-700'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getRiskTextColor = (level) => {
    switch (level) {
      case 'Low': return 'text-emerald-400'
      case 'Moderate': return 'text-amber-400'
      case 'High': return 'text-orange-400'
      case 'Critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const InputField = ({ label, field, min, max, step = 1, unit = '' }) => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
        {label} {unit && <span className="text-gray-600 normal-case">({unit})</span>}
      </label>
      <input type="number" min={min} max={max} step={step} value={formData[field]}
        onChange={(e) => updateField(field, e.target.value)} className="input-dark" />
    </div>
  )

  const SelectField = ({ label, field, options }) => (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
      <select value={formData[field]} onChange={(e) => updateField(field, e.target.value)} className="select-dark">
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  )

  return (
    <div className="p-4 sm:p-6  min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display text-white">Health Risk Assessment</h1>
            <p className="text-sm text-gray-500">Enter your parameters for AI-powered cardiac & disease risk prediction</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            {/* Personal Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl glass-effect">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">1</div>
                <h2 className="text-base font-bold text-white font-display">Personal</h2>
              </div>
              <div className="space-y-4">
                <InputField label="Age" field="age" min={18} max={100} unit="years" />
                <SelectField label="Sex" field="sex" options={[{ value: 0, label: 'Female' }, { value: 1, label: 'Male' }]} />
                <InputField label="Height" field="height" min={100} max={250} unit="cm" />
                <InputField label="Weight" field="weight" min={30} max={200} unit="kg" />
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <p className="text-xs text-gray-400">BMI <span className="text-lg font-bold text-white ml-2">
                    {(formData.weight / ((formData.height / 100) ** 2)).toFixed(1)}
                  </span></p>
                </div>
              </div>
            </motion.div>

            {/* Cardiovascular */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl glass-effect">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-sm font-bold">2</div>
                <h2 className="text-base font-bold text-white font-display">Cardiovascular</h2>
              </div>
              <div className="space-y-4">
                <InputField label="Systolic BP" field="systolic_bp" min={80} max={220} unit="mmHg" />
                <InputField label="Diastolic BP" field="diastolic_bp" min={50} max={140} unit="mmHg" />
                <InputField label="Resting Heart Rate" field="resting_heart_rate" min={40} max={200} unit="bpm" />
                <InputField label="Max Heart Rate" field="max_heart_rate" min={60} max={220} unit="bpm" />
                <InputField label="Cholesterol" field="cholesterol" min={100} max={500} unit="mg/dL" />
                <SelectField label="Chest Pain" field="chest_pain_type" options={[
                  { value: 0, label: 'Typical Angina' }, { value: 1, label: 'Atypical Angina' },
                  { value: 2, label: 'Non-Anginal' }, { value: 3, label: 'Asymptomatic' }
                ]} />
              </div>
            </motion.div>

            {/* Metabolic & Lifestyle */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl glass-effect">
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">3</div>
                <h2 className="text-base font-bold text-white font-display">Lifestyle</h2>
              </div>
              <div className="space-y-4">
                <InputField label="Fasting Blood Sugar" field="fasting_blood_sugar" min={50} max={400} unit="mg/dL" />
                <SelectField label="Smoking" field="smoking" options={[{ value: 0, label: 'Non-Smoker' }, { value: 1, label: 'Smoker' }]} />
                <SelectField label="Alcohol" field="alcohol" options={[
                  { value: 0, label: 'None' }, { value: 1, label: 'Moderate' }, { value: 2, label: 'Heavy' }
                ]} />
                <InputField label="Exercise" field="exercise_freq" min={0} max={7} unit="days/week" />
                <SelectField label="Diet Quality" field="diet_score" options={[
                  { value: 1, label: 'Poor' }, { value: 2, label: 'Below Avg' }, { value: 3, label: 'Average' },
                  { value: 4, label: 'Good' }, { value: 5, label: 'Excellent' }
                ]} />
              </div>
            </motion.div>
          </div>

          {/* Family History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-5 rounded-2xl glass-effect mb-6">
            <h2 className="text-sm font-bold text-white mb-3 font-display">Family History</h2>
            <div className="flex flex-wrap gap-6">
              {[{ field: 'family_heart', label: 'Heart Disease' }, { field: 'family_diabetes', label: 'Diabetes' }, { field: 'family_stroke', label: 'Stroke' }].map(item => (
                <label key={item.field} className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" checked={formData[item.field] === 1}
                    onChange={(e) => updateField(item.field, e.target.checked ? 1 : 0)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/40" />
                  <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{item.label}</span>
                </label>
              ))}
            </div>
          </motion.div>

          <button type="submit" disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-rose-500/20 hover:shadow-rose-500/40 transition-all duration-500 disabled:opacity-50 flex items-center justify-center space-x-3 hover:-translate-y-0.5 active:translate-y-0">
            {isSubmitting ? <><Loader className="w-5 h-5 animate-spin" /><span>Running ML Models...</span></> : <><HeartPulse className="w-5 h-5" /><span>Run AI Health Assessment</span></>}
          </button>
        </form>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-10 space-y-6">
              {/* Cardiac Risk */}
              <div className="p-8 rounded-2xl glass-effect-strong">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3 font-display">
                  <HeartPulse className="w-6 h-6 text-rose-400" /><span>Cardiac Arrest Risk</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center">
                    <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center bg-gradient-to-br ${getRiskGradient(results.cardiac_risk.risk_level)} shadow-2xl`}>
                      <span className="text-4xl font-black text-white">{results.cardiac_risk.risk_percentage}%</span>
                      <span className="text-xs font-medium text-white/70">Risk Score</span>
                    </div>
                    <p className={`mt-3 text-lg font-bold ${getRiskTextColor(results.cardiac_risk.risk_level)}`}>{results.cardiac_risk.risk_level} Risk</p>
                    <p className="text-xs text-gray-500">Model Confidence: {results.cardiac_risk.model_confidence}%</p>
                  </div>
                  <div className="col-span-2">
                    <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Contributing Factors</h3>
                    <div className="space-y-2 mb-6">
                      {results.cardiac_risk.contributing_factors.map((f, i) => (
                        <div key={i} className="flex items-start space-x-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{f}</span>
                        </div>
                      ))}
                    </div>
                    <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">Feature Importance</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.cardiac_risk.feature_importance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="feature" type="category" stroke="#6b7280" width={100} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                        <Bar dataKey="importance" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Health Score */}
              {results.health_score && (
                <div className="p-8 rounded-2xl glass-effect-strong">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3 font-display">
                    <Shield className="w-6 h-6 text-blue-400" /><span>Overall Health Score</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex flex-col items-center p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl shadow-blue-500/20">
                      <span className="text-5xl font-black text-white">{results.health_score.overall_score}</span>
                      <span className="text-sm font-medium text-white/70">/ 100</span>
                      <span className="text-2xl font-bold text-white/90 mt-1">{results.health_score.grade}</span>
                    </div>
                    {results.health_score.breakdown?.slice(0, 3).map((item, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{item.category}</p>
                        <p className="text-2xl font-bold text-white mt-1">{item.score}</p>
                        <p className="text-xs text-gray-500">{item.value}</p>
                        <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          item.status === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          item.status === 'Good' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          item.status === 'Fair' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                  {results.health_score.recommendations?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.health_score.recommendations.map((rec, i) => (
                        <div key={i} className={`p-4 rounded-xl bg-white/[0.02] border-l-2 ${
                          rec.priority === 'Critical' ? 'border-red-500' : rec.priority === 'High' ? 'border-orange-500' :
                          rec.priority === 'Moderate' ? 'border-amber-500' : 'border-emerald-500'
                        }`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <span>{rec.icon}</span>
                            <span className="font-semibold text-white text-sm">{rec.category}</span>
                          </div>
                          <p className="text-xs text-gray-400">{rec.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Disease Risks */}
              <div className="p-8 rounded-2xl glass-effect-strong">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-3 font-display">
                  <Activity className="w-6 h-6 text-purple-400" /><span>Disease Risk Analysis</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.disease_risks?.map((d, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-white text-sm">{d.disease}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold bg-gradient-to-r ${getRiskGradient(d.severity)} text-white`}>{d.severity}</span>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500">Risk</span>
                          <span className="text-sm font-bold text-white">{d.risk_percentage}%</span>
                        </div>
                        <div className="w-full bg-white/[0.06] rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full bg-gradient-to-r ${getRiskGradient(d.severity)}`} style={{ width: `${Math.min(d.risk_percentage, 100)}%` }}></div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">{d.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="p-8 rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/10 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                <h3 className="text-xl font-bold text-white mb-2 font-display">Want personalized prevention advice?</h3>
                <p className="text-gray-400 text-sm mb-5">Chat with Gemini AI about your results</p>
                <Link to="/ai-chatbot" className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:-translate-y-0.5">
                  <span>Chat with AI</span><ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default HealthAssessment
