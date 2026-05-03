import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => { console.error('API Error:', error.response?.data || error.message); throw error }
)

export const submitHealthAssessment = async (data) => api.post('/health-assessment', data)
export const predictCardiac = async (data) => api.post('/predict/cardiac', data)
export const predictDiseases = async (data) => api.post('/predict/diseases', data)
export const analyzeSymptoms = async (symptoms) => api.post('/analyze-symptoms', { symptoms })
export const chatWithAI = async (message, sessionId = 'default', healthContext = null) =>
  api.post('/chat', { message, session_id: sessionId, health_context: healthContext })
export const clearChatHistory = async (sessionId = 'default') => api.post('/chat/clear', { session_id: sessionId })
export const getHealthScore = async (data) => api.post('/health-score', data)
export const getAssessments = async () => api.get('/assessments')
export const healthCheck = async () => api.get('/health')
export const checkDrugInteractions = async (drugs) => api.post('/drug-interactions', { drugs })
export const getEmergencyInfo = async () => api.get('/emergency-info')
export const getHealthTips = async () => api.get('/health-tips')

export default api
