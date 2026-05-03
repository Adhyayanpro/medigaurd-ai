import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, Activity, Thermometer, Droplet, TrendingUp, AlertCircle, CheckCircle, HeartPulse, ArrowRight, Sparkles, Shield } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
  const [assessment, setAssessment] = useState(null)
  const [formData, setFormData] = useState(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('healthAssessment')
      const savedForm = localStorage.getItem('healthFormData')
      if (saved) setAssessment(JSON.parse(saved))
      if (savedForm) setFormData(JSON.parse(savedForm))
    } catch {}
  }, [])

  if (!assessment) {
    return (
      <div className="p-6  min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg text-center">
          <div className="p-16 rounded-3xl glass-effect relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20"></div>
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-2xl shadow-rose-500/25">
                <HeartPulse className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold font-display text-white mb-3">Welcome to MediGuard</h1>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                Take a health assessment to populate your dashboard with real AI-powered predictions and personalized insights.
              </p>
              <Link to="/health-assessment"
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-bold shadow-2xl shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-500 hover:-translate-y-1">
                <HeartPulse className="w-5 h-5" /><span>Take Assessment</span><ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const cardiac = assessment.cardiac_risk || {}
  const healthScore = assessment.health_score || {}
  const diseases = assessment.disease_risks || []
  const riskFactors = healthScore.risk_factors || []

  const metrics = [
    { title: 'Cardiac Risk', value: `${cardiac.risk_percentage || 0}%`, icon: Heart, gradient: 'from-rose-500 to-pink-600', glow: 'shadow-rose-500/20', trend: cardiac.risk_level || 'N/A', ok: cardiac.risk_level === 'Low' || cardiac.risk_level === 'Moderate' },
    { title: 'Health Score', value: `${healthScore.overall_score || 0}`, icon: Shield, gradient: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/20', trend: healthScore.grade || 'N/A', ok: (healthScore.overall_score || 0) >= 60 },
    { title: 'Blood Pressure', value: `${formData?.systolic_bp || 120}/${formData?.diastolic_bp || 80}`, icon: Activity, gradient: 'from-purple-500 to-violet-600', glow: 'shadow-purple-500/20', trend: (formData?.systolic_bp || 120) > 130 ? 'Elevated' : 'Normal', ok: (formData?.systolic_bp || 120) <= 130 },
    { title: 'BMI', value: healthScore.bmi ? `${healthScore.bmi}` : 'N/A', icon: Droplet, gradient: 'from-cyan-500 to-blue-500', glow: 'shadow-cyan-500/20', trend: (healthScore.bmi || 25) > 25 ? 'Overweight' : 'Normal', ok: (healthScore.bmi || 25) <= 25 },
  ]

  const diseaseChartData = diseases.slice(0, 7).map(d => ({ name: d.disease.length > 14 ? d.disease.substring(0, 13) + '…' : d.disease, risk: d.risk_percentage }))
  const scoreBreakdown = (healthScore.breakdown || []).map(item => ({ name: item.category, value: item.score, color: item.score >= 80 ? '#10b981' : item.score >= 60 ? '#3b82f6' : item.score >= 40 ? '#f59e0b' : '#ef4444' }))

  return (
    <div className="p-4 sm:p-6  min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display text-white">Health Dashboard</h1>
            <p className="text-sm text-gray-500">Insights from your AI health assessment</p>
          </div>
          <Link to="/health-assessment" className="px-4 py-2 text-sm bg-white/[0.04] border border-white/[0.08] text-gray-300 rounded-xl hover:bg-white/[0.08] transition-all flex items-center space-x-2">
            <HeartPulse className="w-4 h-4" /><span>Retake</span>
          </Link>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((m, i) => {
            const Icon = m.icon
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="stat-card">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-lg ${m.glow}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {m.ok ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{m.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{m.value}</p>
                <p className={`text-xs font-medium mt-1 ${m.ok ? 'text-emerald-400' : 'text-amber-400'}`}>{m.trend}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl glass-effect">
            <h3 className="text-base font-bold text-white mb-4 font-display">Disease Risk Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={diseaseChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" stroke="#4b5563" domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" stroke="#4b5563" width={110} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} formatter={(v) => [`${v}%`, 'Risk']} />
                <Bar dataKey="risk" radius={[0, 6, 6, 0]}>
                  {diseaseChartData.map((e, i) => <Cell key={i} fill={e.risk > 50 ? '#ef4444' : e.risk > 30 ? '#f59e0b' : '#10b981'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 rounded-2xl glass-effect">
            <h3 className="text-base font-bold text-white mb-4 font-display">Health Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={scoreBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {scoreBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} formatter={(v) => [`${v}/100`, 'Score']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {scoreBreakdown.map((item, i) => (
                <div key={i} className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-gray-400">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-6 rounded-2xl glass-effect">
            <h3 className="text-base font-bold text-white mb-4 font-display">Risk Factors</h3>
            {riskFactors.length > 0 ? (
              <div className="space-y-2">
                {riskFactors.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className={`w-4 h-4 flex-shrink-0 ${r.severity === 'Critical' ? 'text-red-400' : r.severity === 'High' ? 'text-orange-400' : 'text-amber-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-white">{r.factor}</p>
                        <p className="text-xs text-gray-500">{r.impact}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.severity === 'Critical' ? 'bg-red-500/10 text-red-400' : r.severity === 'High' ? 'bg-orange-500/10 text-orange-400' : 'bg-amber-500/10 text-amber-400'}`}>{r.severity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                <p className="text-sm text-gray-400">No significant risk factors!</p>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="p-6 rounded-2xl glass-effect">
            <h3 className="text-base font-bold text-white mb-4 font-display">Recommendations</h3>
            <div className="space-y-2">
              {(healthScore.recommendations || []).slice(0, 4).map((rec, i) => (
                <div key={i} className={`p-3 rounded-xl bg-white/[0.02] border-l-2 ${rec.priority === 'Critical' ? 'border-red-500' : rec.priority === 'High' ? 'border-orange-500' : rec.priority === 'Moderate' ? 'border-amber-500' : 'border-emerald-500'}`}>
                  <div className="flex items-center space-x-2 mb-0.5">
                    <span>{rec.icon}</span><span className="font-semibold text-white text-sm">{rec.category}</span>
                  </div>
                  <p className="text-xs text-gray-400">{rec.text}</p>
                </div>
              ))}
            </div>
            <Link to="/ai-chatbot" className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:-translate-y-0.5">
              <Sparkles className="w-4 h-4" /><span>Chat with AI for Advice</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
