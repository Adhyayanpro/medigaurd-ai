import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Star, MapPin, Phone, Calendar, ChevronRight, CheckCircle, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const DoctorMatching = () => {
  const [specialty, setSpecialty] = useState('Cardiologist')
  const [location, setLocation] = useState('')

  const doctors = [
    { name: 'Dr. Sarah Chen', specialty: 'Cardiologist', rating: 4.9, reviews: 128, distance: '2.4 miles', available: 'Today', verified: true },
    { name: 'Dr. Michael Roberts', specialty: 'Neurologist', rating: 4.8, reviews: 93, distance: '3.1 miles', available: 'Tomorrow', verified: true },
    { name: 'Dr. Emily Watson', specialty: 'Endocrinologist', rating: 4.9, reviews: 204, distance: '1.8 miles', available: 'Today', verified: true },
    { name: 'Dr. James Anderson', specialty: 'Cardiologist', rating: 4.7, reviews: 85, distance: '4.5 miles', available: 'In 2 days', verified: true },
    { name: 'Dr. Lisa Kumar', specialty: 'General Physician', rating: 4.9, reviews: 312, distance: '0.8 miles', available: 'Today', verified: true },
  ]

  const specialties = ['Cardiologist', 'Neurologist', 'Endocrinologist', 'General Physician', 'Pulmonologist', 'Orthopedist']

  const handleSearch = () => {
    toast.success('Searching for specialists...')
  }

  return (
    <div className="p-4 sm:p-6  min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display text-white">Find Specialists</h1>
            <p className="text-sm text-gray-500">AI-matched doctors based on your health profile</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-effect mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Specialty</label>
              <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="select-dark">
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Location (Zip or City)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. 10001 or New York" className="input-dark pl-10" />
              </div>
            </div>
            <div className="flex items-end">
              <button onClick={handleSearch} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center space-x-2">
                <Search className="w-4 h-4" /><span>Search Doctors</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white font-display">AI Recommended Matches</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.filter(d => !specialty || d.specialty === specialty).map((doctor, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl glass-effect group hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-blue-500/10 rounded-bl-2xl">
                <div className="flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-white">{doctor.rating}</span>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xl font-bold text-gray-400">
                  {doctor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-base font-bold text-white">{doctor.name}</h3>
                    {doctor.verified && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-sm text-blue-400 font-medium mb-3">{doctor.specialty}</p>
                  
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <div className="flex items-center space-x-2"><MapPin className="w-3.5 h-3.5" /><span>{doctor.distance} away</span></div>
                    <div className="flex items-center space-x-2"><Calendar className="w-3.5 h-3.5" /><span>Next available: <span className="text-white font-medium">{doctor.available}</span></span></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <p className="text-xs text-gray-500">{doctor.reviews} patient reviews</p>
                <div className="flex items-center space-x-3">
                  <button className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] transition-all text-gray-300">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 transition-all flex items-center space-x-1">
                    <span>Book</span><ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default DoctorMatching
