import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self):
        # IsolationForest for unsupervised anomaly detection
        # Features: [HeartRate, SpO2, Temperature, RespRate, Systolic, Diastolic]
        self.model = IsolationForest(contamination=0.05, random_state=42)
        
        # Pre-train the model on a baseline of normal human vitals
        normal_data = []
        for _ in range(1000):
            normal_data.append([
                np.random.normal(72, 8),    # HR (60-100 normal, mean 72)
                np.random.normal(98, 1),    # SpO2 (95-100 normal)
                np.random.normal(36.6, 0.3),# Temp (36.1-37.2 normal)
                np.random.normal(16, 2),    # Resp (12-20 normal)
                np.random.normal(115, 10),  # Systolic (90-120 normal)
                np.random.normal(75, 6)     # Diastolic (60-80 normal)
            ])
        self.model.fit(normal_data)

    def analyze(self, vitals):
        """
        Analyze live vitals for anomalies.
        Returns whether it's an anomaly and specific clinical flags.
        """
        try:
            features = np.array([[
                float(vitals.get('heartRate', 72)),
                float(vitals.get('spo2', 98)),
                float(vitals.get('temperature', 36.6)),
                float(vitals.get('respRate', 16)),
                float(vitals.get('systolic', 120)),
                float(vitals.get('diastolic', 80))
            ]])
            
            # -1 for anomaly, 1 for normal
            prediction = self.model.predict(features)[0]
            # score_samples returns the anomaly score of each sample
            score = self.model.score_samples(features)[0]
            
            is_anomaly = prediction == -1
            alerts = []
            
            if is_anomaly:
                hr = features[0][0]
                spo2 = features[0][1]
                temp = features[0][2]
                sys = features[0][4]
                dia = features[0][5]
                
                if hr > 100: 
                    alerts.append({'type': 'Tachycardia', 'msg': f'Heart rate {hr:.1f} bpm — elevated', 'severity': 'warning'})
                elif hr < 55: 
                    alerts.append({'type': 'Bradycardia', 'msg': f'Heart rate {hr:.1f} bpm — low', 'severity': 'warning'})
                    
                if spo2 < 94: 
                    alerts.append({'type': 'Hypoxemia', 'msg': f'Oxygen {spo2:.1f}% — below normal', 'severity': 'critical'})
                    
                if temp > 37.8: 
                    alerts.append({'type': 'Fever', 'msg': f'Temp {temp:.1f}°C — elevated', 'severity': 'warning'})
                elif temp < 35.0:
                    alerts.append({'type': 'Hypothermia', 'msg': f'Temp {temp:.1f}°C — low', 'severity': 'critical'})
                    
                if sys > 140 or dia > 90: 
                    alerts.append({'type': 'Hypertension', 'msg': f'BP {sys:.0f}/{dia:.0f} — high', 'severity': 'warning'})
                elif sys < 90 or dia < 60:
                    alerts.append({'type': 'Hypotension', 'msg': f'BP {sys:.0f}/{dia:.0f} — low', 'severity': 'warning'})
                
                # If ML detects a complex pattern that doesn't trip standard thresholds
                if not alerts:
                    alerts.append({
                        'type': 'Complex Pattern Anomaly', 
                        'msg': 'Unusual multi-vital pattern detected by ML model', 
                        'severity': 'warning'
                    })

            return {
                'is_anomaly': bool(is_anomaly),
                'anomaly_score': float(score),
                'alerts': alerts
            }
            
        except Exception as e:
            print(f"Error in anomaly_detector: {e}")
            return {'is_anomaly': False, 'anomaly_score': 0.0, 'alerts': []}

anomaly_detector = AnomalyDetector()
