"""
Multi-Disease Predictor
Predicts risk for multiple diseases based on symptoms and biometric parameters.
"""

import numpy as np


class DiseasePredictor:
    def __init__(self):
        # Disease profiles: each disease has risk factor weights
        self.disease_profiles = {
            'Hypertension': {
                'description': 'Chronic high blood pressure that can lead to heart disease and stroke',
                'risk_factors': {
                    'systolic_bp': {'threshold': 130, 'weight': 0.30, 'direction': 'above'},
                    'diastolic_bp': {'threshold': 85, 'weight': 0.25, 'direction': 'above'},
                    'age': {'threshold': 45, 'weight': 0.10, 'direction': 'above'},
                    'bmi': {'threshold': 25, 'weight': 0.10, 'direction': 'above'},
                    'smoking': {'threshold': 0.5, 'weight': 0.08, 'direction': 'above'},
                    'exercise_freq': {'threshold': 3, 'weight': 0.07, 'direction': 'below'},
                    'family_heart': {'threshold': 0.5, 'weight': 0.05, 'direction': 'above'},
                    'alcohol': {'threshold': 1, 'weight': 0.05, 'direction': 'above'},
                },
                'severity_thresholds': {'low': 25, 'moderate': 45, 'high': 65},
                'prevention': [
                    'Reduce sodium intake to less than 2,300 mg/day',
                    'Exercise at least 150 minutes per week',
                    'Maintain healthy weight (BMI 18.5-24.9)',
                    'Practice stress management techniques',
                    'Limit alcohol consumption',
                    'Monitor blood pressure regularly'
                ]
            },
            'Type 2 Diabetes': {
                'description': 'Metabolic disorder affecting blood sugar regulation',
                'risk_factors': {
                    'fasting_blood_sugar': {'threshold': 100, 'weight': 0.25, 'direction': 'above'},
                    'bmi': {'threshold': 25, 'weight': 0.20, 'direction': 'above'},
                    'age': {'threshold': 45, 'weight': 0.10, 'direction': 'above'},
                    'family_diabetes': {'threshold': 0.5, 'weight': 0.15, 'direction': 'above'},
                    'exercise_freq': {'threshold': 3, 'weight': 0.10, 'direction': 'below'},
                    'systolic_bp': {'threshold': 130, 'weight': 0.05, 'direction': 'above'},
                    'cholesterol': {'threshold': 200, 'weight': 0.05, 'direction': 'above'},
                    'smoking': {'threshold': 0.5, 'weight': 0.05, 'direction': 'above'},
                    'diet_score': {'threshold': 3, 'weight': 0.05, 'direction': 'below'},
                },
                'severity_thresholds': {'low': 20, 'moderate': 40, 'high': 60},
                'prevention': [
                    'Maintain healthy body weight',
                    'Follow a balanced diet rich in fiber and whole grains',
                    'Exercise regularly — at least 30 minutes daily',
                    'Monitor blood glucose levels',
                    'Limit processed sugar and refined carbs',
                    'Get regular health check-ups'
                ]
            },
            'Coronary Artery Disease': {
                'description': 'Narrowing of coronary arteries due to plaque buildup',
                'risk_factors': {
                    'cholesterol': {'threshold': 200, 'weight': 0.20, 'direction': 'above'},
                    'systolic_bp': {'threshold': 130, 'weight': 0.15, 'direction': 'above'},
                    'smoking': {'threshold': 0.5, 'weight': 0.15, 'direction': 'above'},
                    'age': {'threshold': 50, 'weight': 0.10, 'direction': 'above'},
                    'family_heart': {'threshold': 0.5, 'weight': 0.10, 'direction': 'above'},
                    'bmi': {'threshold': 27, 'weight': 0.08, 'direction': 'above'},
                    'exercise_freq': {'threshold': 3, 'weight': 0.07, 'direction': 'below'},
                    'fasting_blood_sugar': {'threshold': 100, 'weight': 0.05, 'direction': 'above'},
                    'sex': {'threshold': 0.5, 'weight': 0.05, 'direction': 'above'},
                    'alcohol': {'threshold': 2, 'weight': 0.05, 'direction': 'above'},
                },
                'severity_thresholds': {'low': 20, 'moderate': 40, 'high': 60},
                'prevention': [
                    'Quit smoking and avoid secondhand smoke',
                    'Lower LDL cholesterol through diet and medication',
                    'Control blood pressure',
                    'Manage diabetes effectively',
                    'Exercise regularly',
                    'Eat a heart-healthy Mediterranean diet'
                ]
            },
            'Stroke': {
                'description': 'Interruption of blood supply to the brain',
                'risk_factors': {
                    'systolic_bp': {'threshold': 140, 'weight': 0.25, 'direction': 'above'},
                    'age': {'threshold': 55, 'weight': 0.12, 'direction': 'above'},
                    'smoking': {'threshold': 0.5, 'weight': 0.12, 'direction': 'above'},
                    'cholesterol': {'threshold': 240, 'weight': 0.10, 'direction': 'above'},
                    'family_stroke': {'threshold': 0.5, 'weight': 0.10, 'direction': 'above'},
                    'fasting_blood_sugar': {'threshold': 126, 'weight': 0.08, 'direction': 'above'},
                    'bmi': {'threshold': 30, 'weight': 0.08, 'direction': 'above'},
                    'alcohol': {'threshold': 2, 'weight': 0.08, 'direction': 'above'},
                    'exercise_freq': {'threshold': 2, 'weight': 0.07, 'direction': 'below'},
                },
                'severity_thresholds': {'low': 15, 'moderate': 35, 'high': 55},
                'prevention': [
                    'Control high blood pressure — #1 stroke risk factor',
                    'Quit smoking immediately',
                    'Manage atrial fibrillation if present',
                    'Lower cholesterol levels',
                    'Control diabetes',
                    'Eat a low-sodium, high-potassium diet'
                ]
            },
            'Heart Failure': {
                'description': 'Heart cannot pump blood efficiently to meet body needs',
                'risk_factors': {
                    'systolic_bp': {'threshold': 140, 'weight': 0.20, 'direction': 'above'},
                    'age': {'threshold': 60, 'weight': 0.15, 'direction': 'above'},
                    'cholesterol': {'threshold': 240, 'weight': 0.12, 'direction': 'above'},
                    'bmi': {'threshold': 30, 'weight': 0.12, 'direction': 'above'},
                    'fasting_blood_sugar': {'threshold': 126, 'weight': 0.10, 'direction': 'above'},
                    'smoking': {'threshold': 0.5, 'weight': 0.10, 'direction': 'above'},
                    'family_heart': {'threshold': 0.5, 'weight': 0.08, 'direction': 'above'},
                    'alcohol': {'threshold': 2, 'weight': 0.08, 'direction': 'above'},
                    'exercise_freq': {'threshold': 2, 'weight': 0.05, 'direction': 'below'},
                },
                'severity_thresholds': {'low': 15, 'moderate': 35, 'high': 55},
                'prevention': [
                    'Control blood pressure and cholesterol',
                    'Maintain a healthy weight',
                    'Avoid excessive alcohol',
                    'Get regular cardiac check-ups',
                    'Manage stress effectively',
                    'Follow a heart-healthy diet'
                ]
            },
            'Arrhythmia': {
                'description': 'Irregular heartbeat that can affect heart function',
                'risk_factors': {
                    'resting_heart_rate': {'threshold': 100, 'weight': 0.20, 'direction': 'above'},
                    'age': {'threshold': 55, 'weight': 0.12, 'direction': 'above'},
                    'systolic_bp': {'threshold': 140, 'weight': 0.12, 'direction': 'above'},
                    'smoking': {'threshold': 0.5, 'weight': 0.10, 'direction': 'above'},
                    'alcohol': {'threshold': 2, 'weight': 0.12, 'direction': 'above'},
                    'caffeine': {'threshold': 3, 'weight': 0.08, 'direction': 'above'},
                    'exercise_freq': {'threshold': 2, 'weight': 0.06, 'direction': 'below'},
                    'family_heart': {'threshold': 0.5, 'weight': 0.10, 'direction': 'above'},
                    'bmi': {'threshold': 30, 'weight': 0.05, 'direction': 'above'},
                    'stress_level': {'threshold': 6, 'weight': 0.05, 'direction': 'above'},
                },
                'severity_thresholds': {'low': 18, 'moderate': 38, 'high': 58},
                'prevention': [
                    'Limit caffeine and stimulant intake',
                    'Avoid excessive alcohol consumption',
                    'Manage stress with relaxation techniques',
                    'Get adequate sleep (7-9 hours)',
                    'Exercise moderately and regularly',
                    'Avoid known trigger substances'
                ]
            },
            'Peripheral Artery Disease': {
                'description': 'Narrowing of peripheral arteries reducing blood flow to limbs',
                'risk_factors': {
                    'smoking': {'threshold': 0.5, 'weight': 0.25, 'direction': 'above'},
                    'age': {'threshold': 50, 'weight': 0.15, 'direction': 'above'},
                    'fasting_blood_sugar': {'threshold': 126, 'weight': 0.12, 'direction': 'above'},
                    'cholesterol': {'threshold': 240, 'weight': 0.12, 'direction': 'above'},
                    'systolic_bp': {'threshold': 140, 'weight': 0.10, 'direction': 'above'},
                    'bmi': {'threshold': 30, 'weight': 0.08, 'direction': 'above'},
                    'exercise_freq': {'threshold': 2, 'weight': 0.08, 'direction': 'below'},
                    'family_heart': {'threshold': 0.5, 'weight': 0.05, 'direction': 'above'},
                    'sex': {'threshold': 0.5, 'weight': 0.05, 'direction': 'above'},
                },
                'severity_thresholds': {'low': 15, 'moderate': 35, 'high': 55},
                'prevention': [
                    'Quit smoking — most important preventive measure',
                    'Walk regularly to improve circulation',
                    'Manage blood sugar if diabetic',
                    'Lower cholesterol through diet and medication',
                    'Maintain foot care and skin health',
                    'Take prescribed antiplatelet medications'
                ]
            }
        }

    def _calculate_risk_score(self, user_data, risk_factors):
        """Calculate a composite risk score for a disease based on user data."""
        total_score = 0.0

        for factor, config in risk_factors.items():
            value = user_data.get(factor, None)
            if value is None:
                continue

            threshold = config['threshold']
            weight = config['weight']
            direction = config['direction']

            if direction == 'above':
                if value > threshold:
                    excess_ratio = min((value - threshold) / threshold, 2.0)
                    score = weight * (0.5 + 0.5 * excess_ratio)
                else:
                    score = weight * max(0, 0.3 * (value / threshold))
            else:  # below
                if value < threshold:
                    deficit_ratio = min((threshold - value) / threshold, 2.0)
                    score = weight * (0.5 + 0.5 * deficit_ratio)
                else:
                    score = weight * max(0, 0.2 * (threshold / max(value, 1)))

            total_score += score

        # Normalize to 0-100 percentage
        risk_percent = min(round(total_score * 100, 1), 95)
        return risk_percent

    def predict(self, user_data):
        """
        Predict risk for all diseases.
        
        user_data keys:
            age, sex (0/1), systolic_bp, diastolic_bp, cholesterol,
            fasting_blood_sugar, resting_heart_rate, bmi, smoking (0/1),
            alcohol (0-3 scale), exercise_freq (days/week), 
            diet_score (1-5), caffeine (cups/day), stress_level (1-10),
            family_heart (0/1), family_diabetes (0/1), family_stroke (0/1)
        """
        results = []

        for disease_name, profile in self.disease_profiles.items():
            risk_score = self._calculate_risk_score(user_data, profile['risk_factors'])

            thresholds = profile['severity_thresholds']
            if risk_score < thresholds['low']:
                severity = 'Low'
            elif risk_score < thresholds['moderate']:
                severity = 'Moderate'
            elif risk_score < thresholds['high']:
                severity = 'High'
            else:
                severity = 'Critical'

            # Identify top contributing factors
            factor_contributions = []
            for factor, config in profile['risk_factors'].items():
                value = user_data.get(factor, None)
                if value is None:
                    continue
                threshold = config['threshold']
                direction = config['direction']
                is_risky = (direction == 'above' and value > threshold) or \
                           (direction == 'below' and value < threshold)
                if is_risky:
                    factor_contributions.append({
                        'factor': factor.replace('_', ' ').title(),
                        'value': value,
                        'threshold': threshold,
                        'direction': direction,
                        'weight': config['weight']
                    })

            factor_contributions.sort(key=lambda x: x['weight'], reverse=True)

            results.append({
                'disease': disease_name,
                'description': profile['description'],
                'risk_percentage': risk_score,
                'severity': severity,
                'contributing_factors': factor_contributions[:4],
                'prevention_tips': profile['prevention']
            })

        # Sort by risk score descending
        results.sort(key=lambda x: x['risk_percentage'], reverse=True)

        return results

    def analyze_symptoms(self, symptoms):
        """
        Analyze symptoms and match to possible conditions.
        """
        symptom_disease_map = {
            'Chest Pain': [
                {'disease': 'Angina / Coronary Artery Disease', 'probability': 45, 'urgency': 'High'},
                {'disease': 'Gastroesophageal Reflux (GERD)', 'probability': 25, 'urgency': 'Low'},
                {'disease': 'Costochondritis', 'probability': 15, 'urgency': 'Low'},
                {'disease': 'Pulmonary Embolism', 'probability': 10, 'urgency': 'Critical'},
                {'disease': 'Anxiety / Panic Attack', 'probability': 5, 'urgency': 'Moderate'},
            ],
            'Shortness of Breath': [
                {'disease': 'Asthma', 'probability': 30, 'urgency': 'Moderate'},
                {'disease': 'Heart Failure', 'probability': 25, 'urgency': 'High'},
                {'disease': 'COPD', 'probability': 20, 'urgency': 'Moderate'},
                {'disease': 'Anxiety Disorder', 'probability': 15, 'urgency': 'Low'},
                {'disease': 'Anemia', 'probability': 10, 'urgency': 'Moderate'},
            ],
            'Headache': [
                {'disease': 'Tension Headache', 'probability': 40, 'urgency': 'Low'},
                {'disease': 'Migraine', 'probability': 30, 'urgency': 'Moderate'},
                {'disease': 'Hypertension', 'probability': 15, 'urgency': 'Moderate'},
                {'disease': 'Sinusitis', 'probability': 10, 'urgency': 'Low'},
                {'disease': 'Cluster Headache', 'probability': 5, 'urgency': 'Moderate'},
            ],
            'Fever': [
                {'disease': 'Viral Infection', 'probability': 40, 'urgency': 'Low'},
                {'disease': 'Bacterial Infection', 'probability': 25, 'urgency': 'Moderate'},
                {'disease': 'Upper Respiratory Infection', 'probability': 20, 'urgency': 'Low'},
                {'disease': 'Urinary Tract Infection', 'probability': 10, 'urgency': 'Moderate'},
                {'disease': 'COVID-19', 'probability': 5, 'urgency': 'Moderate'},
            ],
            'Fatigue': [
                {'disease': 'Iron Deficiency Anemia', 'probability': 25, 'urgency': 'Moderate'},
                {'disease': 'Hypothyroidism', 'probability': 20, 'urgency': 'Moderate'},
                {'disease': 'Depression', 'probability': 20, 'urgency': 'Moderate'},
                {'disease': 'Diabetes', 'probability': 15, 'urgency': 'Moderate'},
                {'disease': 'Chronic Fatigue Syndrome', 'probability': 10, 'urgency': 'Low'},
                {'disease': 'Sleep Apnea', 'probability': 10, 'urgency': 'Moderate'},
            ],
            'Nausea': [
                {'disease': 'Gastritis', 'probability': 30, 'urgency': 'Low'},
                {'disease': 'Food Poisoning', 'probability': 25, 'urgency': 'Low'},
                {'disease': 'Gastroenteritis', 'probability': 20, 'urgency': 'Low'},
                {'disease': 'Migraine', 'probability': 15, 'urgency': 'Moderate'},
                {'disease': 'Pregnancy', 'probability': 10, 'urgency': 'Low'},
            ],
            'Dizziness': [
                {'disease': 'Benign Positional Vertigo', 'probability': 30, 'urgency': 'Low'},
                {'disease': 'Low Blood Pressure', 'probability': 25, 'urgency': 'Moderate'},
                {'disease': 'Anemia', 'probability': 20, 'urgency': 'Moderate'},
                {'disease': 'Inner Ear Infection', 'probability': 15, 'urgency': 'Low'},
                {'disease': 'Dehydration', 'probability': 10, 'urgency': 'Low'},
            ],
            'Cough': [
                {'disease': 'Common Cold', 'probability': 35, 'urgency': 'Low'},
                {'disease': 'Bronchitis', 'probability': 25, 'urgency': 'Moderate'},
                {'disease': 'Allergic Rhinitis', 'probability': 20, 'urgency': 'Low'},
                {'disease': 'Pneumonia', 'probability': 12, 'urgency': 'High'},
                {'disease': 'GERD', 'probability': 8, 'urgency': 'Low'},
            ],
            'Joint Pain': [
                {'disease': 'Osteoarthritis', 'probability': 35, 'urgency': 'Moderate'},
                {'disease': 'Rheumatoid Arthritis', 'probability': 25, 'urgency': 'Moderate'},
                {'disease': 'Gout', 'probability': 15, 'urgency': 'Moderate'},
                {'disease': 'Bursitis', 'probability': 15, 'urgency': 'Low'},
                {'disease': 'Lupus', 'probability': 10, 'urgency': 'High'},
            ],
            'Muscle Aches': [
                {'disease': 'Fibromyalgia', 'probability': 25, 'urgency': 'Moderate'},
                {'disease': 'Viral Infection (Flu)', 'probability': 30, 'urgency': 'Low'},
                {'disease': 'Vitamin D Deficiency', 'probability': 20, 'urgency': 'Low'},
                {'disease': 'Overexertion', 'probability': 15, 'urgency': 'Low'},
                {'disease': 'Polymyalgia Rheumatica', 'probability': 10, 'urgency': 'Moderate'},
            ],
            'Sore Throat': [
                {'disease': 'Viral Pharyngitis', 'probability': 40, 'urgency': 'Low'},
                {'disease': 'Strep Throat', 'probability': 25, 'urgency': 'Moderate'},
                {'disease': 'Tonsillitis', 'probability': 20, 'urgency': 'Moderate'},
                {'disease': 'Mononucleosis', 'probability': 10, 'urgency': 'Moderate'},
                {'disease': 'GERD', 'probability': 5, 'urgency': 'Low'},
            ],
            'Runny Nose': [
                {'disease': 'Common Cold', 'probability': 45, 'urgency': 'Low'},
                {'disease': 'Allergic Rhinitis', 'probability': 30, 'urgency': 'Low'},
                {'disease': 'Sinusitis', 'probability': 15, 'urgency': 'Low'},
                {'disease': 'Influenza', 'probability': 10, 'urgency': 'Moderate'},
            ],
            'Abdominal Pain': [
                {'disease': 'Gastritis', 'probability': 25, 'urgency': 'Low'},
                {'disease': 'Irritable Bowel Syndrome', 'probability': 20, 'urgency': 'Low'},
                {'disease': 'Appendicitis', 'probability': 15, 'urgency': 'Critical'},
                {'disease': 'Gallstones', 'probability': 15, 'urgency': 'High'},
                {'disease': 'Peptic Ulcer', 'probability': 15, 'urgency': 'Moderate'},
                {'disease': 'Kidney Stones', 'probability': 10, 'urgency': 'High'},
            ],
            'Diarrhea': [
                {'disease': 'Gastroenteritis', 'probability': 35, 'urgency': 'Low'},
                {'disease': 'Food Poisoning', 'probability': 25, 'urgency': 'Low'},
                {'disease': 'IBS', 'probability': 20, 'urgency': 'Low'},
                {'disease': 'Celiac Disease', 'probability': 10, 'urgency': 'Moderate'},
                {'disease': 'Inflammatory Bowel Disease', 'probability': 10, 'urgency': 'Moderate'},
            ],
            'Rash': [
                {'disease': 'Contact Dermatitis', 'probability': 30, 'urgency': 'Low'},
                {'disease': 'Eczema', 'probability': 25, 'urgency': 'Low'},
                {'disease': 'Psoriasis', 'probability': 15, 'urgency': 'Low'},
                {'disease': 'Allergic Reaction', 'probability': 20, 'urgency': 'Moderate'},
                {'disease': 'Fungal Infection', 'probability': 10, 'urgency': 'Low'},
            ],
        }

        if not symptoms:
            return {
                'primary_diagnosis': None,
                'possible_conditions': [],
                'recommendations': ['Please provide symptoms for analysis'],
                'severity': 'Unknown',
                'urgency': 'Unknown'
            }

        # Aggregate disease probabilities across all symptoms
        disease_scores = {}
        max_urgency = 'Low'
        urgency_rank = {'Low': 0, 'Moderate': 1, 'High': 2, 'Critical': 3}

        for symptom in symptoms:
            matches = symptom_disease_map.get(symptom, [])
            for match in matches:
                name = match['disease']
                if name not in disease_scores:
                    disease_scores[name] = {'total_prob': 0, 'count': 0, 'urgency': match['urgency']}
                disease_scores[name]['total_prob'] += match['probability']
                disease_scores[name]['count'] += 1
                if urgency_rank.get(match['urgency'], 0) > urgency_rank.get(disease_scores[name]['urgency'], 0):
                    disease_scores[name]['urgency'] = match['urgency']
                if urgency_rank.get(match['urgency'], 0) > urgency_rank.get(max_urgency, 0):
                    max_urgency = match['urgency']

        # Boost diseases that match multiple symptoms
        for name in disease_scores:
            if disease_scores[name]['count'] > 1:
                disease_scores[name]['total_prob'] *= (1 + 0.3 * (disease_scores[name]['count'] - 1))

        # Sort and normalize
        sorted_diseases = sorted(disease_scores.items(), key=lambda x: x[1]['total_prob'], reverse=True)
        
        if not sorted_diseases:
            # Fallback for unrecognized symptoms
            return {
                'primary_diagnosis': {
                    'condition': 'Unspecified Condition',
                    'confidence': 50,
                    'description': 'The symptoms you described require further evaluation. Please consult a healthcare provider.'
                },
                'possible_conditions': [{'name': s, 'probability': 20} for s in symptoms[:3]],
                'recommendations': [
                    'Consult a healthcare professional for accurate diagnosis',
                    'Monitor your symptoms and note any changes',
                    'Stay hydrated and get adequate rest'
                ],
                'severity': 'Moderate',
                'urgency': 'Moderate'
            }

        total = sum(d[1]['total_prob'] for d in sorted_diseases)
        possible = []
        for name, data in sorted_diseases[:5]:
            pct = round((data['total_prob'] / total) * 100) if total > 0 else 0
            possible.append({'name': name, 'probability': pct})

        primary = sorted_diseases[0]
        confidence = min(95, round((primary[1]['total_prob'] / total) * 100) + len(symptoms) * 3)

        # Determine severity
        if max_urgency == 'Critical':
            severity = 'High'
        elif max_urgency == 'High':
            severity = 'Moderate-High'
        elif len(symptoms) >= 4:
            severity = 'Moderate'
        else:
            severity = 'Mild'

        recommendations = [
            'Rest and maintain adequate hydration',
            'Monitor symptoms every 4-6 hours',
            'Consider over-the-counter symptom relief',
            'Consult a healthcare provider if symptoms persist beyond 3 days',
            'Seek immediate care if symptoms worsen rapidly'
        ]

        if max_urgency in ['High', 'Critical']:
            recommendations.insert(0, '⚠️ Some symptoms may indicate a serious condition — consider urgent medical evaluation')

        return {
            'primary_diagnosis': {
                'condition': primary[0],
                'confidence': confidence,
                'description': f'Based on analysis of {len(symptoms)} symptom(s), the most likely condition is {primary[0]}.'
            },
            'possible_conditions': possible,
            'recommendations': recommendations,
            'severity': severity,
            'urgency': max_urgency
        }


# Singleton instance
disease_predictor = DiseasePredictor()
