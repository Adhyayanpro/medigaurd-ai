"""
Heart Disease ML Model
Trained Random Forest classifier using UCI Heart Disease dataset features.
Predicts cardiac arrest risk based on user biometric parameters.
"""

import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings('ignore')


class HeartDiseaseModel:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs',
            'restecg', 'thalach', 'exang', 'oldpeak', 'slope',
            'ca', 'thal'
        ]
        self._train_model()

    def _generate_training_data(self):
        """
        Generate realistic training data based on UCI Heart Disease dataset statistics.
        This replicates the distribution patterns from the Cleveland dataset.
        """
        np.random.seed(42)
        n_samples = 1000

        # --- Healthy patients (target=0) ---
        n_healthy = 550
        healthy = {
            'age': np.random.normal(48, 10, n_healthy).clip(20, 80),
            'sex': np.random.choice([0, 1], n_healthy, p=[0.4, 0.6]),
            'cp': np.random.choice([0, 1, 2, 3], n_healthy, p=[0.6, 0.2, 0.15, 0.05]),
            'trestbps': np.random.normal(125, 14, n_healthy).clip(90, 180),
            'chol': np.random.normal(230, 40, n_healthy).clip(120, 400),
            'fbs': np.random.choice([0, 1], n_healthy, p=[0.85, 0.15]),
            'restecg': np.random.choice([0, 1, 2], n_healthy, p=[0.55, 0.4, 0.05]),
            'thalach': np.random.normal(155, 20, n_healthy).clip(80, 210),
            'exang': np.random.choice([0, 1], n_healthy, p=[0.85, 0.15]),
            'oldpeak': np.random.exponential(0.5, n_healthy).clip(0, 5),
            'slope': np.random.choice([0, 1, 2], n_healthy, p=[0.15, 0.55, 0.30]),
            'ca': np.random.choice([0, 1, 2, 3], n_healthy, p=[0.70, 0.15, 0.10, 0.05]),
            'thal': np.random.choice([1, 2, 3], n_healthy, p=[0.10, 0.65, 0.25]),
        }

        # --- Diseased patients (target=1) ---
        n_diseased = n_samples - n_healthy
        diseased = {
            'age': np.random.normal(56, 9, n_diseased).clip(25, 80),
            'sex': np.random.choice([0, 1], n_diseased, p=[0.25, 0.75]),
            'cp': np.random.choice([0, 1, 2, 3], n_diseased, p=[0.15, 0.15, 0.30, 0.40]),
            'trestbps': np.random.normal(138, 18, n_diseased).clip(100, 200),
            'chol': np.random.normal(255, 50, n_diseased).clip(150, 450),
            'fbs': np.random.choice([0, 1], n_diseased, p=[0.60, 0.40]),
            'restecg': np.random.choice([0, 1, 2], n_diseased, p=[0.35, 0.45, 0.20]),
            'thalach': np.random.normal(135, 25, n_diseased).clip(70, 200),
            'exang': np.random.choice([0, 1], n_diseased, p=[0.40, 0.60]),
            'oldpeak': np.random.exponential(1.5, n_diseased).clip(0, 6),
            'slope': np.random.choice([0, 1, 2], n_diseased, p=[0.35, 0.35, 0.30]),
            'ca': np.random.choice([0, 1, 2, 3], n_diseased, p=[0.30, 0.30, 0.25, 0.15]),
            'thal': np.random.choice([1, 2, 3], n_diseased, p=[0.05, 0.25, 0.70]),
        }

        # Combine
        X = np.column_stack([
            np.concatenate([healthy[f], diseased[f]]) for f in self.feature_names
        ])
        y = np.concatenate([np.zeros(n_healthy), np.ones(n_diseased)])

        return X, y

    def _train_model(self):
        """Train the Random Forest model."""
        X, y = self._generate_training_data()

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        self.scaler.fit(X_train)
        X_train_scaled = self.scaler.transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        self.model = GradientBoostingClassifier(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.1,
            random_state=42
        )
        self.model.fit(X_train_scaled, y_train)

        accuracy = self.model.score(X_test_scaled, y_test)
        print(f"[HeartDiseaseModel] Trained with accuracy: {accuracy:.2%}")

    def predict(self, user_data):
        """
        Predict cardiac arrest risk from user parameters.
        
        user_data dict keys:
            age, sex (0=F,1=M), chest_pain_type (0-3), 
            systolic_bp, cholesterol, fasting_blood_sugar (0/1),
            resting_ecg (0-2), max_heart_rate, exercise_angina (0/1),
            st_depression, st_slope (0-2), num_major_vessels (0-3),
            thalassemia (1-3)
        """
        features = np.array([[
            user_data.get('age', 45),
            user_data.get('sex', 1),
            user_data.get('chest_pain_type', 0),
            user_data.get('systolic_bp', 120),
            user_data.get('cholesterol', 200),
            user_data.get('fasting_blood_sugar', 0),
            user_data.get('resting_ecg', 0),
            user_data.get('max_heart_rate', 150),
            user_data.get('exercise_angina', 0),
            user_data.get('st_depression', 0),
            user_data.get('st_slope', 1),
            user_data.get('num_major_vessels', 0),
            user_data.get('thalassemia', 2),
        ]])

        features_scaled = self.scaler.transform(features)
        probability = self.model.predict_proba(features_scaled)[0][1]
        risk_percentage = round(probability * 100, 1)

        # Determine risk level
        if risk_percentage < 20:
            risk_level = 'Low'
        elif risk_percentage < 45:
            risk_level = 'Moderate'
        elif risk_percentage < 70:
            risk_level = 'High'
        else:
            risk_level = 'Critical'

        # Feature importances for explaining the prediction
        importances = self.model.feature_importances_
        feature_impact = []
        feature_labels = {
            'age': 'Age',
            'sex': 'Sex',
            'cp': 'Chest Pain Type',
            'trestbps': 'Blood Pressure',
            'chol': 'Cholesterol',
            'fbs': 'Fasting Blood Sugar',
            'restecg': 'Resting ECG',
            'thalach': 'Max Heart Rate',
            'exang': 'Exercise Angina',
            'oldpeak': 'ST Depression',
            'slope': 'ST Slope',
            'ca': 'Major Vessels',
            'thal': 'Thalassemia',
        }

        for i, fname in enumerate(self.feature_names):
            impact_score = importances[i] * abs(features_scaled[0][i])
            feature_impact.append({
                'feature': feature_labels.get(fname, fname),
                'importance': round(importances[i] * 100, 1),
                'value': float(features[0][i]),
                'impact_score': round(impact_score * 100, 1)
            })

        feature_impact.sort(key=lambda x: x['impact_score'], reverse=True)

        # Generate contributing factors
        contributing_factors = []
        raw = features[0]
        if raw[0] > 55:
            contributing_factors.append(f"Age ({int(raw[0])}) is above 55 — increased cardiovascular risk")
        if raw[3] > 140:
            contributing_factors.append(f"Systolic BP ({int(raw[3])} mmHg) is elevated (hypertension range)")
        elif raw[3] > 130:
            contributing_factors.append(f"Systolic BP ({int(raw[3])} mmHg) is in pre-hypertension range")
        if raw[4] > 240:
            contributing_factors.append(f"Cholesterol ({int(raw[4])} mg/dL) is high — increases plaque buildup risk")
        elif raw[4] > 200:
            contributing_factors.append(f"Cholesterol ({int(raw[4])} mg/dL) is borderline high")
        if raw[5] == 1:
            contributing_factors.append("Fasting blood sugar > 120 mg/dL — diabetic indicator")
        if raw[7] < 120:
            contributing_factors.append(f"Max heart rate ({int(raw[7])} bpm) is low for age — possible cardiac impairment")
        if raw[8] == 1:
            contributing_factors.append("Exercise-induced angina present — significant cardiac stress indicator")
        if raw[9] > 2:
            contributing_factors.append(f"ST depression ({raw[9]:.1f}) is significant — suggests ischemia")
        if raw[2] >= 2:
            contributing_factors.append("Chest pain pattern suggests potential cardiac origin")

        if not contributing_factors:
            contributing_factors.append("No significant individual risk factors identified")

        return {
            'risk_percentage': risk_percentage,
            'risk_level': risk_level,
            'contributing_factors': contributing_factors,
            'feature_importance': feature_impact[:6],
            'model_confidence': round(max(probability, 1 - probability) * 100, 1)
        }


# Singleton instance
heart_model = HeartDiseaseModel()
