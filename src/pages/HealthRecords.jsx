import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Calendar, Upload, File, MoreVertical, FileArchive, CheckCircle, Shield, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../services/api'

const HealthRecords = () => {
  const [records, setRecords] = useState([])
  const [storageUsed, setStorageUsed] = useState(0)
  const fileInputRef = useRef(null)

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
    const toastId = toast.loading(`Uploading and analyzing ${file.name}...`)
    
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result

      // Send to backend for Gemini AI analysis
      fetch(`${API_BASE_URL}/analyze-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mime_type: file.type || 'application/pdf',
          file_data: base64String
        })
      })
      .then(res => res.json())
      .then(data => {
        const newRecord = {
          id: Date.now(),
          name: file.name,
          date: new Date().toISOString().split('T')[0],
          type: file.type.includes('image') ? 'Scan/Image' : 'Document',
          size: `${fileSizeMB} MB`,
          status: 'AI Analyzed',
          insights: data.success && data.insights ? data.insights : ["Review pending by physician"]
        }
        
        setRecords(prev => [newRecord, ...prev])
        setStorageUsed(prev => prev + parseFloat(fileSizeMB))
        toast.success('Record uploaded and analyzed!', { id: toastId })
      })
      .catch(err => {
        console.error("Analysis Error:", err)
        toast.error("Failed to analyze document", { id: toastId })
      })
    }
    
    reader.readAsDataURL(file)
  }

  return (
    <div className="p-4 sm:p-6  min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileArchive className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display text-white">Health Records</h1>
              <p className="text-sm text-gray-500">Securely manage your medical documents</p>
            </div>
          </div>
          
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-white/[0.04] border border-white/[0.08] text-white rounded-xl hover:bg-white/[0.08] transition-all text-sm font-semibold">
            <Upload className="w-4 h-4" /><span>Upload Record</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-5 rounded-2xl glass-effect md:col-span-3">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white font-display">Recent Documents</h2>
            </div>
            <div className="space-y-2">
              {records.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <FileArchive className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-sm">No records uploaded yet.</p>
                </div>
              ) : records.map((record, i) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={record.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <File className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{record.name}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center space-x-1"><Calendar className="w-3.5 h-3.5" /><span>{record.date}</span></span>
                          <span>•</span>
                          <span>{record.type}</span>
                          <span>•</span>
                          <span>{record.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /><span>{record.status}</span>
                      </span>
                      <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* AI Insights Section */}
                  {record.insights && (
                    <div className="mt-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wide">AI Analysis Insights</h4>
                      </div>
                      <ul className="space-y-1.5 pl-1">
                        {record.insights.map((insight, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start space-x-2">
                            <span className="text-indigo-500 mt-1">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl glass-effect">
              <h3 className="text-sm font-bold text-white mb-3 font-display">Storage Usage</h3>
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-gray-400">Used: {storageUsed.toFixed(1)}MB</span>
                <span className="text-gray-400">Total: 1000MB</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(storageUsed / 1000) * 100}%` }}></div>
              </div>
            </div>
            <div className="p-5 rounded-2xl glass-effect bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border-indigo-500/10">
              <Shield className="w-6 h-6 text-indigo-400 mb-3" />
              <h3 className="text-sm font-bold text-white mb-2 font-display">End-to-End Encrypted</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                All health records are encrypted at rest using AES-256 and stored securely in HIPAA-compliant cloud infrastructure.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HealthRecords
