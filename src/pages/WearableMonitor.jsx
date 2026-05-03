import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Activity, Heart, Thermometer, Wind, Droplet, Zap, AlertTriangle, Wifi, WifiOff, X, Loader } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../services/api'

const generateVital = (base, variance, min, max) => {
  const val = base + (Math.random() - 0.5) * variance * 2
  return Math.round(Math.min(max, Math.max(min, val)) * 10) / 10
}

const WearableMonitor = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [vitals, setVitals] = useState({ heartRate: 72, spo2: 98, temperature: 36.6, respRate: 16, systolic: 120, diastolic: 80 })
  const [history, setHistory] = useState({ heartRate: [], spo2: [], temperature: [] })
  const [alerts, setAlerts] = useState([])
  const intervalRef = useRef(null)

  const devices = [
    { id: 'apple', name: 'Apple Watch Series 9', type: 'Smartwatch' },
    { id: 'garmin', name: 'Garmin Fenix 7', type: 'Fitness Tracker' },
    { id: 'fitbit', name: 'Fitbit Charge 6', type: 'Health Band' },
    { id: 'samsung', name: 'Galaxy Watch 6', type: 'Smartwatch' }
  ]

  const connectDevice = (device) => {
    setSelectedDevice(device)
    setIsConnecting(true)
    
    // Simulate Bluetooth pairing delay
    setTimeout(() => {
      setIsConnecting(false)
      setShowModal(false)
      setIsConnected(true)
      toast.success(`Connected to ${device.name}`)
      startSimulation()
    }, 2500)
  }

  const startSimulation = () => {
    intervalRef.current = setInterval(() => {
      const newVitals = {
        heartRate: generateVital(72, 8, 55, 110),
        spo2: generateVital(97.5, 1.5, 92, 100),
        temperature: generateVital(36.6, 0.3, 35.5, 38.5),
        respRate: generateVital(16, 3, 10, 25),
        systolic: generateVital(120, 10, 90, 160),
        diastolic: generateVital(80, 6, 55, 100),
      }
      setVitals(newVitals)

      const time = new Date().toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setHistory(prev => ({
        heartRate: [...prev.heartRate.slice(-30), { time, value: newVitals.heartRate }],
        spo2: [...prev.spo2.slice(-30), { time, value: newVitals.spo2 }],
        temperature: [...prev.temperature.slice(-30), { time, value: newVitals.temperature }],
      }))

      // Send to ML backend for real anomaly detection
      fetch(`${API_BASE_URL}/analyze-vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVitals)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.analysis.is_anomaly) {
          setAlerts(prev => [...data.analysis.alerts, ...prev].slice(0, 10))
        }
      })
      .catch(err => console.error("Error connecting to ML backend:", err))
    }, 2000)
  }

  const disconnect = () => {
    setIsConnected(false)
    setSelectedDevice(null)
    if (intervalRef.current) clearInterval(intervalRef.current)
    toast('Device disconnected', { icon: '🔌', style: { background: '#1a1a2e', color: '#fff' } })
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const VitalCard = ({ icon: Icon, label, value, unit, color, gradient, normal }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-xs text-gray-600">{normal}</span>
      </div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-white mt-1">{isConnected ? value : '—'}</p>
      <p className="text-xs text-gray-500">{unit}</p>
      {isConnected && <div className={`mt-2 w-full h-1 rounded-full bg-white/[0.06]`}>
        <motion.div animate={{ width: '100%' }} transition={{ duration: 2, repeat: Infinity }}
          className={`h-full rounded-full bg-gradient-to-r ${gradient} opacity-50`} style={{ width: '0%' }} />
      </div>}
    </motion.div>
  )

  const MiniChart = ({ data, color, label }) => (
    <div className="p-5 rounded-2xl glass-effect">
      <h3 className="text-sm font-bold text-white mb-3 font-display">{label}</h3>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" stroke="#4b5563" tick={{ fontSize: 9, fill: '#6b7280' }} interval="preserveStartEnd" />
          <YAxis stroke="#4b5563" tick={{ fontSize: 9, fill: '#6b7280' }} domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  return (
    <div className="p-4 sm:p-6  min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display text-white">Wearable Monitor</h1>
              <p className="text-sm text-gray-500">Real-time vital signs simulation</p>
            </div>
          </div>
          <button onClick={isConnected ? disconnect : () => setShowModal(true)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              isConnected ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20' : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40'
            }`}>
            {isConnected ? <><WifiOff className="w-4 h-4" /><span>Disconnect</span></> : <><Wifi className="w-4 h-4" /><span>Connect Device</span></>}
          </button>
        </div>

        {!isConnected && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20 flex items-center justify-center">
              <Activity className="w-10 h-10 text-teal-400" />
            </div>
            <h2 className="text-2xl font-bold text-white font-display mb-2">No Device Connected</h2>
            <p className="text-gray-500 mb-6">Click "Connect Device" to pair via Web Bluetooth and start real-time monitoring</p>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-display flex items-center space-x-2">
                  <Wifi className="w-5 h-5 text-teal-400" />
                  <span>Available Devices</span>
                </h3>
                <button onClick={() => !isConnecting && setShowModal(false)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5">
                {isConnecting ? (
                  <div className="text-center py-8">
                    <Loader className="w-10 h-10 text-teal-400 animate-spin mx-auto mb-4" />
                    <p className="text-white font-bold mb-1">Connecting to {selectedDevice?.name}...</p>
                    <p className="text-sm text-gray-500">Establishing secure Bluetooth LE connection</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {devices.map(device => (
                      <button key={device.id} onClick={() => connectDevice(device)} className="w-full p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-teal-500/30 transition-all flex items-center justify-between group">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-teal-400" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">{device.name}</p>
                            <p className="text-xs text-gray-500">{device.type}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-white/5 text-gray-400 group-hover:bg-teal-500/10 group-hover:text-teal-400 transition-colors">Connect</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {isConnected && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <VitalCard icon={Heart} label="Heart Rate" value={vitals.heartRate} unit="bpm" gradient="from-rose-500 to-pink-600" normal="60-100" />
              <VitalCard icon={Droplet} label="SpO₂" value={vitals.spo2} unit="%" gradient="from-blue-500 to-cyan-600" normal="95-100%" />
              <VitalCard icon={Thermometer} label="Temp" value={vitals.temperature} unit="°C" gradient="from-amber-500 to-orange-600" normal="36.1-37.2" />
              <VitalCard icon={Wind} label="Resp Rate" value={vitals.respRate} unit="/min" gradient="from-emerald-500 to-green-600" normal="12-20" />
              <VitalCard icon={Activity} label="Systolic" value={vitals.systolic} unit="mmHg" gradient="from-purple-500 to-violet-600" normal="< 120" />
              <VitalCard icon={Zap} label="Diastolic" value={vitals.diastolic} unit="mmHg" gradient="from-indigo-500 to-blue-600" normal="< 80" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <MiniChart data={history.heartRate} color="#f43f5e" label="Heart Rate Trend" />
              <MiniChart data={history.spo2} color="#3b82f6" label="SpO₂ Trend" />
              <MiniChart data={history.temperature} color="#f59e0b" label="Temperature Trend" />
            </div>

            <div className="p-6 rounded-2xl glass-effect">
              <h3 className="text-base font-bold text-white mb-4 font-display flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /><span>Live Alerts</span>
              </h3>
              {alerts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No anomalies detected — all vitals normal</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {alerts.map((a, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${a.severity === 'critical' ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`w-4 h-4 ${a.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
                        <div>
                          <p className={`text-sm font-medium ${a.severity === 'critical' ? 'text-red-300' : 'text-amber-300'}`}>{a.type}</p>
                          <p className="text-xs text-gray-500">{a.msg}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{a.severity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default WearableMonitor
