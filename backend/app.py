"""
MediGuard AI — Flask Backend Server
Provides ML-powered health prediction, disease analysis, and AI chatbot APIs.
"""

import os
import json
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId

# Load environment variables
load_dotenv()

# Import our models and services
from models.heart_disease_model import heart_model
from models.disease_predictor import disease_predictor
from services.chatbot_service import chatbot_service
from services.health_analyzer import health_analyzer
from services.drug_interaction_checker import drug_checker
from services.anomaly_detector import anomaly_detector

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# MongoDB connection
mongo_uri = os.getenv('MONGODB_URI', '')
db = None
if mongo_uri:
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        db = client['mediguard_ai']
        print("[MongoDB] Connected successfully")
    except Exception as e:
        print(f"[MongoDB] Connection failed: {e}")
        db = None


# Helper to serialize MongoDB ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)

app.json_encoder = JSONEncoder


# ==================== ROUTES ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """API health check endpoint."""
    return jsonify({
        'status': 'ok',
        'service': 'MediGuard AI Backend',
        'version': '1.0.0',
        'mongodb': 'connected' if db is not None else 'disconnected',
        'timestamp': datetime.utcnow().isoformat()
    })


@app.route('/api/predict/cardiac', methods=['POST'])
def predict_cardiac():
    """
    Predict cardiac arrest risk from user health parameters.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Run prediction
        result = heart_model.predict(data)

        # Save to MongoDB if connected
        if db is not None:
            assessment = {
                'type': 'cardiac_prediction',
                'input_data': data,
                'result': result,
                'created_at': datetime.utcnow()
            }
            db.assessments.insert_one(assessment)

        return jsonify({
            'success': True,
            'prediction': result
        })

    except Exception as e:
        print(f"[predict_cardiac] Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/predict/diseases', methods=['POST'])
def predict_diseases():
    """
    Predict risk for multiple diseases based on health parameters.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Calculate BMI if height and weight provided
        if 'height' in data and 'weight' in data:
            height_m = data['height'] / 100
            data['bmi'] = data['weight'] / (height_m ** 2) if height_m > 0 else 25

        results = disease_predictor.predict(data)

        # Save to MongoDB if connected
        if db is not None:
            assessment = {
                'type': 'disease_prediction',
                'input_data': data,
                'results': results,
                'created_at': datetime.utcnow()
            }
            db.assessments.insert_one(assessment)

        return jsonify({
            'success': True,
            'diseases': results
        })

    except Exception as e:
        print(f"[predict_diseases] Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/health-assessment', methods=['POST'])
def health_assessment():
    """
    Complete health assessment: cardiac risk + disease risks + health score.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Calculate BMI
        if 'height' in data and 'weight' in data:
            height_m = data['height'] / 100
            data['bmi'] = data['weight'] / (height_m ** 2) if height_m > 0 else 25

        # Run all analyses
        cardiac_result = heart_model.predict(data)
        disease_results = disease_predictor.predict(data)
        health_score = health_analyzer.calculate_health_score(data)

        combined_result = {
            'cardiac_risk': cardiac_result,
            'disease_risks': disease_results,
            'health_score': health_score,
            'assessed_at': datetime.utcnow().isoformat()
        }

        # Save to MongoDB if connected
        if db is not None:
            assessment = {
                'type': 'full_assessment',
                'input_data': data,
                'result': {
                    'cardiac_risk': cardiac_result,
                    'disease_risks': disease_results,
                    'health_score': {
                        'overall_score': health_score['overall_score'],
                        'grade': health_score['grade'],
                        'bmi': health_score['bmi']
                    }
                },
                'created_at': datetime.utcnow()
            }
            inserted = db.assessments.insert_one(assessment)
            combined_result['assessment_id'] = str(inserted.inserted_id)

        return jsonify({
            'success': True,
            'assessment': combined_result
        })

    except Exception as e:
        print(f"[health_assessment] Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze-symptoms', methods=['POST'])
def analyze_symptoms():
    """
    Analyze symptoms using ML-based disease predictor.
    """
    try:
        data = request.get_json()
        symptoms = data.get('symptoms', [])

        if not symptoms:
            return jsonify({'error': 'No symptoms provided'}), 400

        result = disease_predictor.analyze_symptoms(symptoms)

        # Save to MongoDB
        if db is not None:
            record = {
                'type': 'symptom_analysis',
                'symptoms': symptoms,
                'result': result,
                'created_at': datetime.utcnow()
            }
            db.symptom_analyses.insert_one(record)

        return jsonify({
            'success': True,
            'analysis': result
        })

    except Exception as e:
        print(f"[analyze_symptoms] Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/chat', methods=['POST'])
def chat():
    """
    AI chatbot endpoint using Gemini API.
    """
    try:
        data = request.get_json()
        message = data.get('message', '')
        session_id = data.get('session_id', 'default')
        health_context = data.get('health_context', None)

        if not message:
            return jsonify({'error': 'No message provided'}), 400

        # Get chatbot response
        response = chatbot_service.chat_sync(message, session_id, health_context)

        # Save to MongoDB
        if db is not None:
            chat_record = {
                'session_id': session_id,
                'user_message': message,
                'bot_response': response,
                'health_context': health_context,
                'created_at': datetime.utcnow()
            }
            db.chat_history.insert_one(chat_record)

        return jsonify({
            'success': True,
            'response': response
        })

    except Exception as e:
        print(f"[chat] Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/chat/clear', methods=['POST'])
def clear_chat():
    """Clear chat history for a session."""
    data = request.get_json()
    session_id = data.get('session_id', 'default')
    chatbot_service.clear_history(session_id)
    return jsonify({'success': True, 'message': 'Chat history cleared'})


@app.route('/api/assessments', methods=['GET'])
def get_assessments():
    """Get recent assessments from MongoDB."""
    try:
        if db is None:
            return jsonify({'success': True, 'assessments': []})

        assessments = list(
            db.assessments.find({}, {'_id': 0})
            .sort('created_at', -1)
            .limit(10)
        )

        # Convert datetime objects to strings
        for a in assessments:
            if 'created_at' in a:
                a['created_at'] = a['created_at'].isoformat()

        return jsonify({
            'success': True,
            'assessments': assessments
        })

    except Exception as e:
        print(f"[get_assessments] Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/health-score', methods=['POST'])
def get_health_score():
    """Calculate health score from parameters."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        if 'height' in data and 'weight' in data:
            height_m = data['height'] / 100
            data['bmi'] = data['weight'] / (height_m ** 2) if height_m > 0 else 25

        result = health_analyzer.calculate_health_score(data)

        return jsonify({
            'success': True,
            'health_score': result
        })

    except Exception as e:
        print(f"[get_health_score] Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/drug-interactions', methods=['POST'])
def check_drug_interactions():
    """Check for interactions between multiple drugs."""
    try:
        data = request.get_json()
        drugs = data.get('drugs', [])
        if not drugs or len(drugs) < 2:
            return jsonify({'error': 'Provide at least 2 drugs to check'}), 400

        result = drug_checker.check_interactions(drugs)

        if db is not None:
            record = {
                'type': 'drug_interaction_check',
                'drugs': drugs,
                'result': result,
                'created_at': datetime.utcnow()
            }
            db.drug_checks.insert_one(record)

        return jsonify({'success': True, 'result': result})
    except Exception as e:
        print(f"[drug_interactions] Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/emergency-info', methods=['GET'])
def emergency_info():
    """Get emergency health information."""
    return jsonify({
        'success': True,
        'emergency': {
            'numbers': [
                {'country': 'India', 'number': '112', 'service': 'Emergency'},
                {'country': 'India', 'number': '108', 'service': 'Ambulance'},
                {'country': 'India', 'number': '104', 'service': 'Health Helpline'},
                {'country': 'USA', 'number': '911', 'service': 'Emergency'},
                {'country': 'UK', 'number': '999', 'service': 'Emergency'},
            ],
            'first_aid': [
                {'condition': 'Heart Attack', 'steps': ['Call emergency services immediately', 'Have person chew aspirin (325mg)', 'Begin CPR if person stops breathing', 'Use AED if available']},
                {'condition': 'Stroke', 'steps': ['Call emergency immediately', 'Note the time symptoms started', 'Keep person comfortable', 'Do NOT give food or water']},
                {'condition': 'Choking', 'steps': ['Perform Heimlich maneuver', '5 back blows between shoulder blades', '5 abdominal thrusts', 'Repeat until object is expelled']},
                {'condition': 'Severe Bleeding', 'steps': ['Apply direct pressure with clean cloth', 'Elevate the wound above heart level', 'Apply tourniquet if bleeding is life-threatening', 'Call emergency services']},
            ]
        }
    })


@app.route('/api/health-tips', methods=['GET'])
def health_tips():
    """Get daily health tips."""
    import random
    tips = [
        {'tip': 'Drink at least 8 glasses of water daily to stay hydrated', 'category': 'Hydration', 'icon': '💧'},
        {'tip': 'Take a 10-minute walk after meals to aid digestion', 'category': 'Exercise', 'icon': '🚶'},
        {'tip': 'Practice deep breathing for 5 minutes to reduce stress', 'category': 'Mental Health', 'icon': '🧘'},
        {'tip': 'Eat a handful of nuts daily for heart health', 'category': 'Nutrition', 'icon': '🥜'},
        {'tip': 'Get 7-9 hours of sleep for optimal recovery', 'category': 'Sleep', 'icon': '😴'},
        {'tip': 'Limit screen time 1 hour before bed for better sleep', 'category': 'Sleep', 'icon': '📱'},
        {'tip': 'Include leafy greens in every meal for essential nutrients', 'category': 'Nutrition', 'icon': '🥬'},
        {'tip': 'Stand up and stretch every 30 minutes during desk work', 'category': 'Posture', 'icon': '🧍'},
        {'tip': 'Monitor your blood pressure at least once a week', 'category': 'Prevention', 'icon': '🩺'},
        {'tip': 'Replace sugary drinks with green tea or water', 'category': 'Nutrition', 'icon': '🍵'},
    ]
    return jsonify({'success': True, 'tips': random.sample(tips, min(3, len(tips)))})

@app.route('/api/anomalies', methods=['GET'])
def get_anomalies():
    """Get recent anomaly logs."""
    try:
        if db is None:
            return jsonify({'success': True, 'anomalies': []})
        
        logs = list(db.anomaly_logs.find({}, {'_id': 0}).sort('created_at', -1).limit(20))
        for log in logs:
            if 'created_at' in log:
                log['created_at'] = log['created_at'].isoformat()
                
        return jsonify({'success': True, 'anomalies': logs})
    except Exception as e:
        print(f"[get_anomalies] Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze-vitals', methods=['POST'])
def analyze_vitals():
    """
    Real-time anomaly detection for streaming vitals using IsolationForest ML.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No vitals provided'}), 400

        result = anomaly_detector.analyze(data)

        # Log anomalies to MongoDB for the Anomaly Detection Dashboard
        if db is not None and result['is_anomaly']:
            record = {
                'type': 'vital_anomaly',
                'vitals': data,
                'analysis': result,
                'created_at': datetime.utcnow()
            }
            db.anomaly_logs.insert_one(record)

        return jsonify({'success': True, 'analysis': result})
    except Exception as e:
        print(f"[analyze_vitals] Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze-record', methods=['POST'])
def analyze_record():
    """
    Analyze uploaded medical record using Gemini AI.
    Accepts base64 encoded file and filename.
    """
    try:
        data = request.get_json()
        filename = data.get('filename', 'Unknown Document')
        file_base64 = data.get('file_data', '')
        mime_type = data.get('mime_type', 'application/pdf')

        if not chatbot_service.model:
            # Fallback if Gemini is not configured
            return jsonify({
                'success': True,
                'insights': [
                    "Gemini API key not configured. Cannot perform deep ML analysis.",
                    "Please consult your doctor regarding this document.",
                    "Ensure you keep a physical copy for your next visit."
                ]
            })

        # Prompt for the model
        prompt = f"""
        You are MediGuard AI, an expert medical analysis system.
        The user has uploaded a medical document named '{filename}'.
        Please analyze this document and provide exactly 3-5 actionable, 
        bulleted points on 'what needs to be done' or 'key insights' based on this report type.
        If you cannot read the document, provide general advice based on the filename (e.g., if it's an ECG, provide general ECG next steps).
        Do not use markdown bolding or headers, just return a plain text list where each line starts with a bullet point character (•).
        """

        try:
            # If we have base64 data and it's a supported format (PDF or Image), we pass it to Gemini
            if file_base64 and (mime_type.startswith('image/') or mime_type == 'application/pdf'):
                # Strip the data:image/png;base64, prefix if present
                if ',' in file_base64:
                    file_base64 = file_base64.split(',')[1]
                
                import base64
                file_bytes = base64.b64decode(file_base64)
                
                content_parts = [
                    {'mime_type': mime_type, 'data': file_bytes},
                    prompt
                ]
                response = chatbot_service.model.generate_content(content_parts)
            else:
                # Just use the filename if no valid base64 or unsupported type
                response = chatbot_service.model.generate_content(prompt)
                
            reply = response.text.strip()
            
            # Parse the response into a list of points
            insights = [line.strip().lstrip('•*-').strip() for line in reply.split('\n') if line.strip()]
            # Filter out empty strings
            insights = [i for i in insights if i]
            
            # Fallback if parsing fails
            if not insights:
                insights = ["Discuss these results with your primary care physician.", "Monitor for any new symptoms."]

            return jsonify({
                'success': True,
                'insights': insights[:5] # Limit to 5 points max
            })
            
        except Exception as api_err:
            print(f"[analyze_record] Gemini API Error: {api_err}")
            # Fallback based on filename
            general_insights = [
                f"Schedule a follow-up appointment to review your {filename}.",
                "Keep this document securely stored for future reference.",
                "If you experience any concerning symptoms, contact emergency services."
            ]
            if 'ecg' in filename.lower() or 'heart' in filename.lower():
                general_insights.append("Maintain a heart-healthy diet and monitor your blood pressure.")
            elif 'blood' in filename.lower():
                general_insights.append("Stay hydrated and maintain regular physical activity.")
                
            return jsonify({
                'success': True,
                'insights': general_insights
            })

    except Exception as e:
        print(f"[analyze_record] Error: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== MAIN ====================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"\n{'='*50}")
    print(f"  MediGuard AI Backend Server")
    print(f"  Running on http://localhost:{port}")
    print(f"  MongoDB: {'Connected' if db is not None else 'Disconnected'}")
    print(f"  Gemini API: {'Configured' if chatbot_service.model else 'Fallback mode'}")
    print(f"{'='*50}\n")
    app.run(host='0.0.0.0', port=port, debug=True)
