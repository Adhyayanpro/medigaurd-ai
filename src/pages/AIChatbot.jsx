import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, Bot, User, Sparkles, Loader, Trash2, HeartPulse } from 'lucide-react'
import { chatWithAI, clearChatHistory } from '../services/api'
import toast from 'react-hot-toast'

const AIChatbot = () => {
  const [messages, setMessages] = useState([{
    id: 1, text: "Hello! I'm your MediGuard AI Health Assistant powered by Google Gemini. I can help with cardiac risk prevention, disease analysis, diet advice, and personalized health recommendations. How can I help you today?",
    sender: 'bot', timestamp: new Date()
  }])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => 'session_' + Date.now())
  const messagesEndRef = useRef(null)

  const getHealthContext = () => {
    try { const d = localStorage.getItem('healthFormData'); return d ? JSON.parse(d) : null } catch { return null }
  }

  const quickQuestions = [
    "How to reduce cardiac risk?",
    "Best diet for heart health?",
    "Managing high blood pressure",
    "Lowering cholesterol naturally",
    "Exercises for heart disease",
    "Early signs of diabetes",
    "How stress affects my heart",
    "Improving my health score"
  ]

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (messageText) => {
    const text = messageText || inputValue.trim()
    if (!text) return
    setMessages(prev => [...prev, { id: prev.length + 1, text, sender: 'user', timestamp: new Date() }])
    setInputValue('')
    setIsTyping(true)
    try {
      const response = await chatWithAI(text, sessionId, getHealthContext())
      setMessages(prev => [...prev, { id: prev.length + 1, text: response.response || "I couldn't process that. Please try again.", sender: 'bot', timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, { id: prev.length + 1, text: "Unable to connect. Make sure the backend is running on localhost:5000.", sender: 'bot', timestamp: new Date() }])
      toast.error('Connection failed')
    } finally { setIsTyping(false) }
  }

  const handleClearChat = async () => {
    try { await clearChatHistory(sessionId) } catch {}
    setMessages([{ id: 1, text: "Chat cleared! How can I help you?", sender: 'bot', timestamp: new Date() }])
  }

  const hasAssessment = !!localStorage.getItem('healthAssessment')

  return (
    <div className="p-4 sm:p-6  min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-white">AI Health Assistant</h1>
              <p className="text-xs text-gray-500">Powered by Google Gemini</p>
            </div>
          </div>
          <button onClick={handleClearChat}
            className="px-3 py-2 bg-white/[0.04] border border-white/[0.08] text-gray-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all flex items-center space-x-2 text-sm">
            <Trash2 className="w-3.5 h-3.5" /><span>Clear</span>
          </button>
        </div>

        {hasAssessment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Health data loaded — AI will personalize advice to your parameters</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <div className="lg:col-span-3">
            <div className="rounded-2xl glass-effect overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 240px)' }}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        msg.sender === 'bot' ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'
                      }`}>
                        {msg.sender === 'bot' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                      </div>
                      <div className={`flex-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                        <div className={`inline-block p-4 rounded-2xl max-w-[85%] ${
                          msg.sender === 'bot' ? 'bg-white/[0.04] text-gray-200 border border-white/[0.06]' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center space-x-2 p-4 bg-white/[0.04] border border-white/[0.06] rounded-2xl">
                      <Loader className="w-4 h-4 animate-spin text-blue-400" />
                      <span className="text-xs text-gray-400">Gemini is thinking...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/[0.06] bg-black/20">
                <div className="flex space-x-2">
                  <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about health, prevention, diet..."
                    className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all" />
                  <button onClick={() => sendMessage()} disabled={!inputValue.trim() || isTyping}
                    className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-5 rounded-2xl glass-effect">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white font-display">Quick Questions</h3>
              </div>
              <div className="space-y-1.5">
                {quickQuestions.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    className="w-full text-left p-2.5 text-xs text-gray-400 bg-white/[0.02] hover:bg-white/[0.06] rounded-lg transition-all border border-transparent hover:border-white/[0.08] hover:text-gray-200">
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="p-5 rounded-2xl glass-effect">
              <h3 className="text-sm font-bold text-white mb-3 font-display">Capabilities</h3>
              <div className="space-y-1.5">
                {['Cardiac risk prevention', 'Diet & nutrition', 'Exercise plans', 'Disease prevention', 'Stress management', 'Personalized insights'].map((item, i) => (
                  <div key={i} className="flex items-center space-x-2 text-xs text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div><span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AIChatbot
