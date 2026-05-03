import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Brain, Activity, Shield, Zap, TrendingUp, Heart,
  ArrowRight, Sparkles, HeartPulse, MessageSquare, Stethoscope
} from 'lucide-react'

const LandingPage = () => {
  const features = [
    { icon: HeartPulse, title: 'Cardiac Risk Prediction', description: 'ML model trained on clinical data predicts cardiac arrest risk with 90% accuracy', color: 'from-rose-500 to-pink-600', glow: 'shadow-rose-500/20' },
    { icon: Brain, title: 'Multi-Disease Analysis', description: 'Simultaneous risk assessment for 7+ cardiovascular and metabolic diseases', color: 'from-purple-500 to-violet-600', glow: 'shadow-purple-500/20' },
    { icon: MessageSquare, title: 'AI Health Assistant', description: 'Gemini-powered chatbot provides personalized prevention advice in real-time', color: 'from-cyan-500 to-blue-500', glow: 'shadow-cyan-500/20' },
    { icon: Stethoscope, title: 'Symptom Analyzer', description: 'Advanced pattern recognition maps symptoms to 50+ medical conditions', color: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/20' },
    { icon: Activity, title: 'Health Score Engine', description: 'Comprehensive scoring system evaluating cardiovascular, metabolic & lifestyle factors', color: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-500/20' },
    { icon: Shield, title: 'Secure Data Storage', description: 'MongoDB Atlas cloud storage with encrypted health records and assessment history', color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20' },
  ]

  const stats = [
    { value: '90%', label: 'ML Accuracy' },
    { value: '7+', label: 'Diseases Predicted' },
    { value: '50+', label: 'Symptoms Analyzed' },
    { value: '24/7', label: 'AI Assistant' },
  ]

  return (
    <div className="min-h-screen bg-[#07070b] overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/[0.07] rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/[0.07] rounded-full blur-[120px] animate-float-delayed"></div>
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-cyan-600/[0.04] rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30"></div>
      </div>



      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
              <span className="text-xs font-medium text-blue-400 tracking-wide uppercase">AI-Powered Healthcare Platform</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black font-display leading-[0.9] mb-8 tracking-tight">
              <span className="block text-white">Your Health.</span>
              <span className="block gradient-text mt-2">Our Intelligence.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Real ML models predict cardiac arrest risk and disease probability. 
              Gemini AI provides personalized prevention advice. All from your health parameters.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/health-assessment"
                className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-2xl shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-500 hover:-translate-y-1">
                <span>Start Assessment</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/ai-chatbot"
                className="flex items-center space-x-3 px-8 py-4 bg-white/[0.04] border border-white/[0.08] text-gray-300 rounded-2xl font-semibold text-lg hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-500">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <span>Chat with AI</span>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                <p className="text-3xl font-bold font-display gradient-text">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-20">
            <p className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-4">Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-4">
              Powered by Real <span className="gradient-text">Machine Learning</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Not just mockups — every prediction is computed by trained scikit-learn models and Google Gemini AI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: index * 0.08 }}
                  className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg ${feature.glow} group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 font-display">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="tech" className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/[0.03] to-transparent"></div>
        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-20">
            <p className="text-sm font-medium text-purple-400 uppercase tracking-widest mb-4">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold font-display text-white">
              Three Steps to <span className="gradient-text-warm">Better Health</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Enter Parameters', desc: 'Input your vitals — blood pressure, cholesterol, heart rate, lifestyle factors, and family history', icon: HeartPulse, color: 'from-blue-500 to-cyan-500' },
              { step: '02', title: 'AI Analysis', desc: 'Our ML models process your data through Gradient Boosting classifiers and multi-disease predictors', icon: Brain, color: 'from-purple-500 to-pink-500' },
              { step: '03', title: 'Get Insights', desc: 'Receive cardiac risk %, disease predictions, health score, and chat with Gemini AI for prevention tips', icon: Sparkles, color: 'from-amber-500 to-orange-500' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center group hover:border-white/[0.12] transition-all duration-500">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-xs font-bold text-white">
                  Step {item.step}
                </div>
                <div className={`w-16 h-16 mx-auto mt-4 mb-5 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-display">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative p-16 rounded-3xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/10 overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20"></div>
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-display text-white mb-4">
                Ready to Know <span className="gradient-text">Your Risk?</span>
              </h2>
              <p className="text-lg text-gray-400 mb-10 max-w-lg mx-auto">
                Takes 2 minutes. Get AI-powered cardiac risk prediction, disease analysis, and personalized health advice.
              </p>
              <Link to="/health-assessment"
                className="inline-flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-500 hover:-translate-y-1">
                <span>Start Free Assessment</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-600">© 2026 MediGuard AI. Built with React, Flask, scikit-learn & Gemini API.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
