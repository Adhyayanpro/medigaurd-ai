import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Printer, Calendar, Heart, Activity, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const HealthReport = () => {
  const [assessment, setAssessment] = useState(null)
  const [formData, setFormData] = useState(null)
  const reportRef = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('healthAssessment')
      const savedForm = localStorage.getItem('healthFormData')
      if (saved) setAssessment(JSON.parse(saved))
      if (savedForm) setFormData(JSON.parse(savedForm))
    } catch {}
  }, [])

  const handlePrint = () => window.print()

  if (!assessment) {
    return (
      <div className="p-6  min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Report Available</h2>
          <p className="text-gray-500 mb-4">Complete a health assessment first</p>
          <Link to="/health-assessment" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold">
            Take Assessment
          </Link>
        </div>
      </div>
    )
  }

  const cardiac = assessment.cardiac_risk || {}
  const healthScore = assessment.health_score || {}
  const diseases = assessment.disease_risks || []
  const bmi = formData ? (formData.weight / ((formData.height / 100) ** 2)).toFixed(1) : 'N/A'

  return (
    <div className="p-4 sm:p-6  min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display text-white">Health Report</h1>
              <p className="text-sm text-gray-500">Comprehensive AI-generated health report</p>
            </div>
          </div>
          <button onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all text-sm">
            <Printer className="w-4 h-4" /><span>Print Report</span>
          </button>
        </div>

        <div ref={reportRef} className="space-y-5 print:space-y-4 print:text-black">
          {/* Header */}
          <div className="p-6 rounded-2xl glass-effect print:border print:border-gray-300 print:bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white print:text-black font-display">MediGuard AI Health Report</h2>
                <p className="text-sm text-gray-500 print:text-gray-600">AI-Powered Health Assessment Summary</p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 print:text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Age', value: formData?.age || 'N/A' },
                { label: 'Sex', value: formData?.sex === 1 ? 'Male' : 'Female' },
                { label: 'BMI', value: bmi },
                { label: 'BP', value: `${formData?.systolic_bp || '—'}/${formData?.diastolic_bp || '—'}` },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] print:bg-gray-50 print:border text-center">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-lg font-bold text-white print:text-black">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cardiac Risk */}
          <div className="p-6 rounded-2xl glass-effect print:border print:border-gray-300 print:bg-white">
            <h3 className="text-lg font-bold text-white print:text-black mb-4 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-rose-400 print:text-red-600" /><span>Cardiac Arrest Risk</span>
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-white/[0.03] print:bg-gray-50 text-center">
                <p className="text-3xl font-bold text-white print:text-black">{cardiac.risk_percentage || 0}%</p>
                <p className="text-xs text-gray-500">Risk Score</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] print:bg-gray-50 text-center">
                <p className="text-xl font-bold text-white print:text-black">{cardiac.risk_level || 'N/A'}</p>
                <p className="text-xs text-gray-500">Risk Level</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] print:bg-gray-50 text-center">
                <p className="text-xl font-bold text-white print:text-black">{cardiac.model_confidence || 0}%</p>
                <p className="text-xs text-gray-500">Model Confidence</p>
              </div>
            </div>
            {cardiac.contributing_factors?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Contributing Factors</p>
                <div className="space-y-1.5">
                  {cardiac.contributing_factors.map((f, i) => (
                    <div key={i} className="flex items-start space-x-2 text-sm text-gray-300 print:text-gray-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-1 flex-shrink-0" /><span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Health Score */}
          <div className="p-6 rounded-2xl glass-effect print:border print:border-gray-300 print:bg-white">
            <h3 className="text-lg font-bold text-white print:text-black mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400 print:text-blue-600" /><span>Health Score: {healthScore.overall_score}/100 ({healthScore.grade})</span>
            </h3>
            {healthScore.breakdown && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {healthScore.breakdown.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.03] print:bg-gray-50 text-center">
                    <p className="text-xl font-bold text-white print:text-black">{item.score}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                      item.status === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400 print:text-green-600' :
                      item.status === 'Good' ? 'bg-blue-500/10 text-blue-400 print:text-blue-600' :
                      item.status === 'Fair' ? 'bg-amber-500/10 text-amber-400 print:text-amber-600' :
                      'bg-red-500/10 text-red-400 print:text-red-600'
                    }`}>{item.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disease Risks */}
          <div className="p-6 rounded-2xl glass-effect print:border print:border-gray-300 print:bg-white">
            <h3 className="text-lg font-bold text-white print:text-black mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-400 print:text-purple-600" /><span>Disease Risk Summary</span>
            </h3>
            <div className="space-y-2">
              {diseases.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] print:bg-gray-50">
                  <span className="text-sm text-gray-300 print:text-gray-700 font-medium">{d.disease}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 h-2 bg-white/[0.06] print:bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${d.risk_percentage > 50 ? 'bg-red-500' : d.risk_percentage > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(d.risk_percentage, 100)}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-white print:text-black w-10 text-right">{d.risk_percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {healthScore.recommendations?.length > 0 && (
            <div className="p-6 rounded-2xl glass-effect print:border print:border-gray-300 print:bg-white">
              <h3 className="text-lg font-bold text-white print:text-black mb-4">Recommendations</h3>
              <div className="space-y-2">
                {healthScore.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-2 p-3 rounded-xl bg-white/[0.02] print:bg-gray-50">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-semibold text-white print:text-black">{rec.icon} {rec.category}: </span>
                      <span className="text-sm text-gray-400 print:text-gray-600">{rec.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 print:border-amber-500">
            <p className="text-xs text-gray-500 print:text-gray-600">
              <strong>Disclaimer:</strong> This report is generated by AI/ML models for informational purposes only.
              It does not constitute medical advice. Consult a healthcare professional for diagnosis and treatment decisions.
              Generated on {new Date().toLocaleString()}.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HealthReport
