import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Activity, Heart, Thermometer, Droplet, Bell, Shield } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

const AnomalyDetection = () => {
  const [anomalies, setAnomalies] = useState([
    {
      id: 1,
      type: 'Heart Rate',
      severity: 'High',
      value: '112 bpm',
      normalRange: '60-100 bpm',
      timestamp: new Date(Date.now() - 3600000),
      status: 'Active',
      description: 'Elevated heart rate detected. May indicate stress or physical exertion.'
    },
    {
      id: 2,
      type: 'Blood Pressure',
      severity: 'Warning',
      value: '135/88 mmHg',
      normalRange: '<120/80 mmHg',
      timestamp: new Date(Date.now() - 7200000),
      status: 'Resolved',
      description: 'Slightly elevated blood pressure. Monitor and consider lifestyle changes.'
    },
    {
      id: 3,
      type: 'Temperature',
      severity: 'Critical',
      value: '100.2°F',
      normalRange: '97.8-99.1°F',
      timestamp: new Date(Date.now() - 1800000),
      status: 'Active',
      description: 'Fever detected. Consider medical consultation if persistent.'
    }
  ])

  const [detectionStats, setDetectionStats] = useState({
    totalDetections: 12,
    activeAlerts: 2,
    resolved: 10,
    accuracy: 94.5
  })

  const [historicalData, setHistoricalData] = useState([
    { date: 'Mon', anomalies: 2, normal: 98 },
    { date: 'Tue', anomalies: 1, normal: 99 },
    { date: 'Wed', anomalies: 3, normal: 97 },
    { date: 'Thu', anomalies: 0, normal: 100 },
    { date: 'Fri', anomalies: 2, normal: 98 },
    { date: 'Sat', anomalies: 1, normal: 99 },
    { date: 'Sun', anomalies: 2, normal: 98 },
  ])

  useEffect(() => {
    // Fetch actual anomalies from the Flask Backend ML Model
    const fetchAnomalies = () => {
      fetch('http://localhost:5000/api/anomalies')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.anomalies) {
            // Map backend logs to frontend format
            const mapped = data.anomalies.map((a, index) => {
              // The backend might return multiple alerts per anomaly. Let's just pick the most severe or the first one.
              const alert = a.analysis.alerts[0] || { type: 'Unknown', severity: 'Low', msg: 'No specific alert' };
              return {
                id: a._id || index,
                type: alert.type,
                severity: alert.severity === 'critical' ? 'Critical' : alert.severity === 'warning' ? 'Warning' : 'Low',
                value: 'ML Detected',
                normalRange: 'N/A',
                timestamp: new Date(a.created_at),
                status: 'Active',
                description: alert.msg
              }
            });
            if (mapped.length > 0) {
              setAnomalies(mapped);
              setDetectionStats(prev => ({
                ...prev,
                totalDetections: mapped.length,
                activeAlerts: mapped.filter(m => m.status === 'Active').length
              }));
            }
          }
        })
        .catch(err => console.error("Error fetching anomalies:", err))
    }

    fetchAnomalies()
    // Poll for new anomalies every 5 seconds
    const interval = setInterval(fetchAnomalies, 5000)

    return () => clearInterval(interval)
  }, [])

  const resolveAnomaly = (id) => {
    setAnomalies(anomalies.map(anomaly => 
      anomaly.id === id ? { ...anomaly, status: 'Resolved' } : anomaly
    ))
    setDetectionStats(prev => ({
      ...prev,
      activeAlerts: Math.max(0, prev.activeAlerts - 1),
      resolved: prev.resolved + 1
    }))
    toast.success('Anomaly marked as resolved')
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'from-red-600 to-rose-700'
      case 'High': return 'from-orange-500 to-red-600'
      case 'Warning': return 'from-amber-500 to-orange-500'
      case 'Low': return 'from-blue-500 to-cyan-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Heart Rate': return Heart
      case 'Temperature': return Thermometer
      case 'Oxygen': return Droplet
      default: return Activity
    }
  }

  return (
    <div className="p-4 sm:p-6  min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display text-white">Anomaly Detection System</h1>
            <p className="text-sm text-gray-500">Proactive anomaly detection using time-series forecasting</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Detections', value: detectionStats.totalDetections, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Active Alerts', value: detectionStats.activeAlerts, icon: Bell, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Resolved', value: detectionStats.resolved, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Algorithm Accuracy', value: `${detectionStats.accuracy}%`, icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10' }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl glass-effect">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</span>
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Anomalies List */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 font-display">Recent Anomalies</h2>
          <div className="space-y-3">
            {anomalies.map((anomaly, index) => {
              const Icon = getTypeIcon(anomaly.type)
              return (
                <motion.div key={anomaly.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                  className="p-5 rounded-2xl glass-effect flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex flex-shrink-0 items-center justify-center ${getSeverityColor(anomaly.severity)} shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-base font-bold text-white">{anomaly.type}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${getSeverityColor(anomaly.severity)} text-white`}>
                          {anomaly.severity}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${anomaly.status === 'Active' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                          {anomaly.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{anomaly.description}</p>
                      <div className="flex items-center space-x-4 text-xs">
                        <div><span className="text-gray-500">Value:</span> <span className="font-semibold text-white ml-1">{anomaly.value}</span></div>
                        <div><span className="text-gray-500">Normal:</span> <span className="text-gray-300 ml-1">{anomaly.normalRange}</span></div>
                        <div className="text-gray-500">{anomaly.timestamp.toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </div>
                  {anomaly.status === 'Active' && (
                    <button onClick={() => resolveAnomaly(anomaly.id)}
                      className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-white rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 transition-all text-sm font-semibold whitespace-nowrap">
                      Mark Resolved
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 rounded-2xl glass-effect">
            <h3 className="text-base font-bold text-white mb-4 font-display">Anomaly Detection Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="anomalies" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                <Area type="monotone" dataKey="normal" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-6 rounded-2xl glass-effect">
            <h3 className="text-base font-bold text-white mb-4 font-display">Detection Accuracy</h3>
            <div className="space-y-4 mb-6">
              {[
                { label: 'True Positives', value: '94.5%', color: 'from-emerald-500 to-green-600', w: '94.5%' },
                { label: 'False Positives', value: '3.2%', color: 'from-amber-500 to-orange-500', w: '3.2%' },
                { label: 'False Negatives', value: '2.3%', color: 'from-red-500 to-rose-600', w: '2.3%' }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">{item.label}</span>
                    <span className="text-xs font-bold text-white">{item.value}</span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full bg-gradient-to-r ${item.color}`} style={{ width: item.w }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
              <p className="text-xs text-gray-400 mb-1"><strong className="text-white">Algorithm:</strong> Isolation Forest + LSTM</p>
              <p className="text-xs text-gray-400"><strong className="text-white">Model Version:</strong> v2.4.1 (Updated: Jan 2024)</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default AnomalyDetection
