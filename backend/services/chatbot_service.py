"""
Chatbot Service
Google Gemini API integration for health-focused AI chatbot.
Falls back to comprehensive rule-based responses if API fails.
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()


class ChatbotService:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model = None
        self.conversations = {}  # session_id -> chat history

        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-2.0-flash')
                print("[ChatbotService] Gemini API initialized successfully")
            except Exception as e:
                print(f"[ChatbotService] Gemini init failed: {e}, using fallback")
                self.model = None
        else:
            print("[ChatbotService] No API key found, using rule-based fallback")

    def _get_system_prompt(self, health_context=None):
        """Build the system prompt with optional health context."""
        base_prompt = """You are MediGuard AI Health Assistant — an empathetic, knowledgeable medical AI chatbot.

Your role:
- Provide helpful, accurate health information and prevention advice
- Be conversational, warm, and supportive
- Always recommend consulting a doctor for serious concerns
- Never diagnose — only inform and suggest
- Use bullet points and clear formatting
- If the user shares health data, reference it in your advice
- Focus on prevention, lifestyle changes, and wellness tips

Important guidelines:
- Be concise but thorough (2-4 paragraphs max)
- Use simple language that any patient can understand
- Always end with an actionable recommendation
- If unsure, say so honestly and recommend professional consultation
- Never prescribe medications — only suggest they discuss options with their doctor"""

        if health_context:
            context_str = "\n\nThe user's health profile:\n"
            for key, value in health_context.items():
                context_str += f"- {key.replace('_', ' ').title()}: {value}\n"
            base_prompt += context_str
            base_prompt += "\nUse this health data to personalize your advice when relevant."

        return base_prompt

    async def chat(self, message, session_id='default', health_context=None):
        """Send a message and get a response."""
        # Try Gemini API first
        if self.model:
            try:
                return await self._gemini_chat(message, session_id, health_context)
            except Exception as e:
                print(f"[ChatbotService] Gemini API error: {e}")
                return self._fallback_response(message, health_context)
        else:
            return self._fallback_response(message, health_context)

    def chat_sync(self, message, session_id='default', health_context=None):
        """Synchronous version of chat."""
        if self.model:
            try:
                return self._gemini_chat_sync(message, session_id, health_context)
            except Exception as e:
                print(f"[ChatbotService] Gemini API error: {e}")
                return self._fallback_response(message, health_context)
        else:
            return self._fallback_response(message, health_context)

    async def _gemini_chat(self, message, session_id, health_context):
        """Chat using Gemini API (async)."""
        return self._gemini_chat_sync(message, session_id, health_context)

    def _gemini_chat_sync(self, message, session_id, health_context):
        """Chat using Gemini API (sync)."""
        system_prompt = self._get_system_prompt(health_context)

        # Build conversation history
        if session_id not in self.conversations:
            self.conversations[session_id] = []

        history = self.conversations[session_id]

        # Build the full prompt with history
        full_prompt = system_prompt + "\n\n"
        for msg in history[-10:]:  # Keep last 10 messages for context
            role = "User" if msg['role'] == 'user' else "Assistant"
            full_prompt += f"{role}: {msg['content']}\n"
        full_prompt += f"User: {message}\nAssistant:"

        response = self.model.generate_content(full_prompt)
        reply = response.text.strip()

        # Save to history
        history.append({'role': 'user', 'content': message})
        history.append({'role': 'assistant', 'content': reply})
        self.conversations[session_id] = history

        return reply

    def _fallback_response(self, message, health_context=None):
        """Comprehensive rule-based fallback when API is unavailable."""
        msg = message.lower()

        # Context-aware responses based on health data
        context_note = ""
        if health_context:
            bp = health_context.get('systolic_bp')
            chol = health_context.get('cholesterol')
            bmi = health_context.get('bmi')
            if bp and bp > 130:
                context_note += f"\n\n📊 Based on your blood pressure ({bp} mmHg), I'd especially emphasize reducing sodium intake and regular exercise."
            if chol and chol > 200:
                context_note += f"\n\n📊 Your cholesterol level ({chol} mg/dL) suggests focusing on heart-healthy fats and fiber-rich foods."
            if bmi and bmi > 25:
                context_note += f"\n\n📊 Your BMI ({bmi:.1f}) indicates weight management could significantly improve your health outcomes."

        # Cardiac / Heart responses
        if any(w in msg for w in ['heart', 'cardiac', 'chest pain', 'heart attack', 'cardiovascular']):
            return ("Heart health is critical for overall wellbeing. Here's what you can do:\n\n"
                    "🫀 **Prevention Tips:**\n"
                    "• Exercise 150+ minutes per week (brisk walking counts!)\n"
                    "• Eat omega-3 rich foods (salmon, walnuts, flaxseed)\n"
                    "• Limit saturated fats and trans fats\n"
                    "• Monitor blood pressure regularly\n"
                    "• Manage stress through meditation or yoga\n"
                    "• Quit smoking if applicable\n\n"
                    "⚠️ If you're experiencing chest pain, shortness of breath, or arm pain, "
                    "please seek immediate medical attention." + context_note)

        if any(w in msg for w in ['blood pressure', 'hypertension', 'bp high', 'high bp']):
            return ("High blood pressure is often called the 'silent killer' because it usually has no symptoms.\n\n"
                    "🩺 **Management Strategies:**\n"
                    "• Reduce sodium to less than 2,300 mg/day (ideally 1,500 mg)\n"
                    "• Follow the DASH diet (rich in fruits, vegetables, whole grains)\n"
                    "• Exercise regularly (30 min/day, most days)\n"
                    "• Maintain a healthy weight\n"
                    "• Limit alcohol to 1 drink/day (women) or 2 drinks/day (men)\n"
                    "• Practice stress management\n"
                    "• Take prescribed medications consistently\n\n"
                    "Regular monitoring is key — check your BP at least weekly." + context_note)

        if any(w in msg for w in ['diabetes', 'blood sugar', 'glucose', 'insulin']):
            return ("Managing blood sugar is essential for preventing complications.\n\n"
                    "🍎 **Prevention & Management:**\n"
                    "• Eat balanced meals with low glycemic index foods\n"
                    "• Exercise at least 30 minutes daily\n"
                    "• Monitor blood glucose levels regularly\n"
                    "• Maintain a healthy weight (lose 5-7% if overweight)\n"
                    "• Choose whole grains over refined carbs\n"
                    "• Stay hydrated with water, not sugary drinks\n"
                    "• Get A1C tested every 3-6 months\n\n"
                    "Even small lifestyle changes can reduce diabetes risk by up to 58%!" + context_note)

        if any(w in msg for w in ['cholesterol', 'ldl', 'hdl', 'triglycerides']):
            return ("Cholesterol management is vital for heart health.\n\n"
                    "📊 **Healthy Levels:**\n"
                    "• Total cholesterol: under 200 mg/dL\n"
                    "• LDL ('bad'): under 100 mg/dL\n"
                    "• HDL ('good'): above 60 mg/dL\n\n"
                    "🥗 **How to Lower Cholesterol:**\n"
                    "• Eat more soluble fiber (oats, beans, lentils)\n"
                    "• Add plant sterols and stanols\n"
                    "• Choose healthy fats (olive oil, avocados, nuts)\n"
                    "• Exercise at least 30 minutes, 5 days/week\n"
                    "• Limit processed and fried foods\n"
                    "• Consider statin medication if recommended by your doctor" + context_note)

        if any(w in msg for w in ['exercise', 'workout', 'fitness', 'physical activity']):
            return ("Regular exercise is one of the best things you can do for your health!\n\n"
                    "💪 **Recommended Activity:**\n"
                    "• 150 minutes moderate exercise OR 75 minutes vigorous exercise per week\n"
                    "• Include strength training 2+ days per week\n"
                    "• Start slow and gradually increase intensity\n\n"
                    "🏃 **Easy Ways to Start:**\n"
                    "• Take a 30-minute brisk walk daily\n"
                    "• Use stairs instead of elevators\n"
                    "• Try swimming, cycling, or yoga\n"
                    "• Join a fitness class for accountability\n"
                    "• Set reminders to move every hour" + context_note)

        if any(w in msg for w in ['diet', 'nutrition', 'food', 'eat', 'healthy eating']):
            return ("Nutrition plays a huge role in disease prevention.\n\n"
                    "🥗 **Heart-Healthy Diet Tips:**\n"
                    "• Fill half your plate with fruits and vegetables\n"
                    "• Choose whole grains (brown rice, quinoa, oats)\n"
                    "• Eat lean proteins (fish, poultry, legumes)\n"
                    "• Use healthy oils (olive, avocado)\n"
                    "• Limit sodium, sugar, and processed foods\n"
                    "• Drink plenty of water (8+ glasses/day)\n\n"
                    "Consider the Mediterranean diet — it's proven to reduce heart disease risk by 30%!" + context_note)

        if any(w in msg for w in ['stress', 'anxiety', 'mental health', 'worry', 'depression']):
            return ("Mental health directly impacts physical health, especially your heart.\n\n"
                    "🧘 **Stress Management Techniques:**\n"
                    "• Practice deep breathing exercises (4-7-8 technique)\n"
                    "• Try meditation or mindfulness (start with 5 min/day)\n"
                    "• Exercise regularly — it's a natural stress reliever\n"
                    "• Maintain social connections\n"
                    "• Get 7-9 hours of quality sleep\n"
                    "• Limit screen time and news consumption\n"
                    "• Consider talking to a therapist\n\n"
                    "Chronic stress can raise blood pressure and heart disease risk. Don't ignore it!" + context_note)

        if any(w in msg for w in ['sleep', 'insomnia', 'rest', 'tired']):
            return ("Quality sleep is essential for heart health and overall wellness.\n\n"
                    "😴 **Sleep Improvement Tips:**\n"
                    "• Aim for 7-9 hours of sleep per night\n"
                    "• Keep a consistent sleep schedule\n"
                    "• Create a dark, cool, quiet sleeping environment\n"
                    "• Avoid screens 1 hour before bed\n"
                    "• Limit caffeine after 2 PM\n"
                    "• Avoid heavy meals before bedtime\n"
                    "• Try relaxation techniques before sleep\n\n"
                    "Poor sleep increases risk of high blood pressure, obesity, and diabetes." + context_note)

        if any(w in msg for w in ['smoking', 'smoke', 'tobacco', 'quit smoking']):
            return ("Quitting smoking is the single best thing you can do for your health.\n\n"
                    "🚭 **Benefits of Quitting:**\n"
                    "• After 20 min: Heart rate drops\n"
                    "• After 12 hrs: CO levels normalize\n"
                    "• After 1 year: Heart disease risk drops by 50%\n"
                    "• After 5 years: Stroke risk equals non-smoker\n\n"
                    "📋 **How to Quit:**\n"
                    "• Talk to your doctor about nicotine replacement\n"
                    "• Use apps and support groups\n"
                    "• Identify triggers and develop coping strategies\n"
                    "• Consider prescription medications\n"
                    "• Take it one day at a time" + context_note)

        if any(w in msg for w in ['stroke', 'brain attack']):
            return ("Stroke prevention is critical — remember the signs with FAST:\n\n"
                    "🧠 **F.A.S.T. Warning Signs:**\n"
                    "• **F**ace drooping\n"
                    "• **A**rm weakness\n"
                    "• **S**peech difficulty\n"
                    "• **T**ime to call emergency services\n\n"
                    "🛡️ **Prevention:**\n"
                    "• Control blood pressure (biggest risk factor)\n"
                    "• Quit smoking\n"
                    "• Manage diabetes and cholesterol\n"
                    "• Exercise regularly\n"
                    "• Eat a low-sodium diet\n"
                    "• Limit alcohol\n\n"
                    "⚠️ If you suspect a stroke, call emergency services immediately — every minute counts!" + context_note)

        if any(w in msg for w in ['prevent', 'prevention', 'avoid', 'reduce risk', 'protect']):
            return ("Prevention is the most powerful medicine! Here's a comprehensive approach:\n\n"
                    "🛡️ **Top Prevention Strategies:**\n"
                    "1. **Exercise regularly** — 150 min/week moderate activity\n"
                    "2. **Eat healthy** — Mediterranean or DASH diet\n"
                    "3. **Maintain healthy weight** — BMI 18.5-24.9\n"
                    "4. **Don't smoke** — Quit if you do\n"
                    "5. **Manage stress** — Meditation, yoga, or therapy\n"
                    "6. **Get quality sleep** — 7-9 hours nightly\n"
                    "7. **Regular check-ups** — Annual physicals, bloodwork\n"
                    "8. **Monitor numbers** — BP, cholesterol, blood sugar\n"
                    "9. **Stay hydrated** — 8+ glasses of water daily\n"
                    "10. **Limit alcohol** — Moderate consumption only\n\n"
                    "Small consistent changes lead to massive health improvements over time!" + context_note)

        # Default response
        return ("Thank you for your question! I'm here to help with health-related concerns.\n\n"
                "I can provide guidance on:\n"
                "• 🫀 Heart health and cardiac risk prevention\n"
                "• 🩺 Blood pressure and hypertension management\n"
                "• 🍎 Diabetes prevention and blood sugar control\n"
                "• 📊 Cholesterol management\n"
                "• 💪 Exercise and fitness recommendations\n"
                "• 🥗 Nutrition and healthy eating\n"
                "• 🧘 Stress management and mental health\n"
                "• 😴 Sleep improvement\n"
                "• 🚭 Smoking cessation\n"
                "• 🧠 Stroke prevention\n\n"
                "Please ask me about any of these topics, or share your specific health concern! "
                "Remember, I provide general health information — always consult your doctor for personalized medical advice." + context_note)

    def clear_history(self, session_id='default'):
        """Clear conversation history for a session."""
        if session_id in self.conversations:
            del self.conversations[session_id]


# Singleton instance
chatbot_service = ChatbotService()
