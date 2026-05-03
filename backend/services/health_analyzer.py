"""
Health Analyzer Service
Processes user health parameters, generates health scores, 
identifies risk factors, and produces recommendations.
"""

import numpy as np


class HealthAnalyzer:
    def __init__(self):
        self.parameter_ranges = {
            'systolic_bp': {'optimal': (90, 120), 'normal': (120, 130), 'high': (130, 140), 'critical': (140, 200)},
            'diastolic_bp': {'optimal': (60, 80), 'normal': (80, 85), 'high': (85, 90), 'critical': (90, 130)},
            'cholesterol': {'optimal': (0, 200), 'normal': (200, 240), 'high': (240, 300), 'critical': (300, 500)},
            'fasting_blood_sugar': {'optimal': (70, 100), 'normal': (100, 126), 'high': (126, 200), 'critical': (200, 400)},
            'resting_heart_rate': {'optimal': (60, 80), 'normal': (80, 100), 'high': (100, 120), 'critical': (120, 200)},
            'bmi': {'optimal': (18.5, 24.9), 'normal': (25, 29.9), 'high': (30, 35), 'critical': (35, 50)},
        }

    def calculate_health_score(self, user_data):
        """Calculate an overall health score from 0-100."""
        scores = []
        breakdown = []

        # Blood Pressure Score (25% weight)
        bp_score = self._score_parameter(
            user_data.get('systolic_bp', 120),
            self.parameter_ranges['systolic_bp']
        )
        dbp_score = self._score_parameter(
            user_data.get('diastolic_bp', 80),
            self.parameter_ranges['diastolic_bp']
        )
        bp_combined = (bp_score + dbp_score) / 2
        scores.append(('Blood Pressure', bp_combined, 0.25))
        breakdown.append({
            'category': 'Blood Pressure',
            'score': round(bp_combined),
            'status': self._get_status(bp_combined),
            'value': f"{user_data.get('systolic_bp', 120)}/{user_data.get('diastolic_bp', 80)} mmHg",
            'weight': 25
        })

        # Cholesterol Score (20% weight)
        chol_score = self._score_parameter(
            user_data.get('cholesterol', 200),
            self.parameter_ranges['cholesterol']
        )
        scores.append(('Cholesterol', chol_score, 0.20))
        breakdown.append({
            'category': 'Cholesterol',
            'score': round(chol_score),
            'status': self._get_status(chol_score),
            'value': f"{user_data.get('cholesterol', 200)} mg/dL",
            'weight': 20
        })

        # Blood Sugar Score (15% weight)
        bs_score = self._score_parameter(
            user_data.get('fasting_blood_sugar', 90),
            self.parameter_ranges['fasting_blood_sugar']
        )
        scores.append(('Blood Sugar', bs_score, 0.15))
        breakdown.append({
            'category': 'Blood Sugar',
            'score': round(bs_score),
            'status': self._get_status(bs_score),
            'value': f"{user_data.get('fasting_blood_sugar', 90)} mg/dL",
            'weight': 15
        })

        # Heart Rate Score (10% weight)
        hr_score = self._score_parameter(
            user_data.get('resting_heart_rate', 72),
            self.parameter_ranges['resting_heart_rate']
        )
        scores.append(('Heart Rate', hr_score, 0.10))
        breakdown.append({
            'category': 'Resting Heart Rate',
            'score': round(hr_score),
            'status': self._get_status(hr_score),
            'value': f"{user_data.get('resting_heart_rate', 72)} bpm",
            'weight': 10
        })

        # BMI Score (10% weight)
        height_m = user_data.get('height', 170) / 100
        weight_kg = user_data.get('weight', 70)
        bmi = weight_kg / (height_m ** 2) if height_m > 0 else 25
        bmi_score = self._score_parameter(bmi, self.parameter_ranges['bmi'])
        scores.append(('BMI', bmi_score, 0.10))
        breakdown.append({
            'category': 'BMI',
            'score': round(bmi_score),
            'status': self._get_status(bmi_score),
            'value': f"{bmi:.1f}",
            'weight': 10
        })

        # Lifestyle Score (20% weight)
        lifestyle_score = self._calculate_lifestyle_score(user_data)
        scores.append(('Lifestyle', lifestyle_score, 0.20))
        breakdown.append({
            'category': 'Lifestyle',
            'score': round(lifestyle_score),
            'status': self._get_status(lifestyle_score),
            'value': 'Combined assessment',
            'weight': 20
        })

        # Calculate weighted total
        total_score = sum(score * weight for _, score, weight in scores)
        total_score = max(0, min(100, round(total_score)))

        # Generate recommendations
        recommendations = self._generate_recommendations(user_data, breakdown, bmi)

        # Identify risk factors
        risk_factors = self._identify_risk_factors(user_data, bmi)

        return {
            'overall_score': total_score,
            'grade': self._get_grade(total_score),
            'breakdown': breakdown,
            'recommendations': recommendations,
            'risk_factors': risk_factors,
            'bmi': round(bmi, 1)
        }

    def _score_parameter(self, value, ranges):
        """Score a single parameter on a 0-100 scale."""
        opt_low, opt_high = ranges['optimal']
        _, norm_high = ranges['normal']
        _, high_high = ranges['high']

        if opt_low <= value <= opt_high:
            return 95 + np.random.uniform(-3, 3)
        elif value <= norm_high:
            return 70 + (95 - 70) * (1 - (value - opt_high) / (norm_high - opt_high))
        elif value <= high_high:
            return 40 + (70 - 40) * (1 - (value - norm_high) / (high_high - norm_high))
        else:
            return max(10, 40 * (1 - min((value - high_high) / high_high, 1)))

    def _calculate_lifestyle_score(self, user_data):
        """Calculate a lifestyle score based on habits."""
        score = 50  # Base score

        # Exercise (0-7 days/week)
        exercise = user_data.get('exercise_freq', 3)
        score += min(exercise * 4, 20)

        # Smoking
        if not user_data.get('smoking', False):
            score += 10
        else:
            score -= 15

        # Alcohol (0=none, 1=moderate, 2=heavy)
        alcohol = user_data.get('alcohol', 0)
        if alcohol == 0:
            score += 8
        elif alcohol == 1:
            score += 3
        else:
            score -= 10

        # Diet (1-5 scale, 5=excellent)
        diet = user_data.get('diet_score', 3)
        score += (diet - 3) * 5

        return max(0, min(100, score))

    def _get_status(self, score):
        """Convert score to status label."""
        if score >= 85:
            return 'Excellent'
        elif score >= 70:
            return 'Good'
        elif score >= 50:
            return 'Fair'
        elif score >= 30:
            return 'Needs Attention'
        else:
            return 'Critical'

    def _get_grade(self, score):
        """Convert score to letter grade."""
        if score >= 90:
            return 'A+'
        elif score >= 80:
            return 'A'
        elif score >= 70:
            return 'B'
        elif score >= 60:
            return 'C'
        elif score >= 50:
            return 'D'
        else:
            return 'F'

    def _generate_recommendations(self, user_data, breakdown, bmi):
        """Generate personalized health recommendations."""
        recommendations = []

        systolic = user_data.get('systolic_bp', 120)
        diastolic = user_data.get('diastolic_bp', 80)
        chol = user_data.get('cholesterol', 200)
        fbs = user_data.get('fasting_blood_sugar', 90)
        exercise = user_data.get('exercise_freq', 3)
        smoking = user_data.get('smoking', False)

        if systolic > 130 or diastolic > 85:
            recommendations.append({
                'category': 'Blood Pressure',
                'priority': 'High',
                'text': 'Your blood pressure is elevated. Reduce sodium intake, exercise regularly, and consult your doctor about medication if needed.',
                'icon': '🩺'
            })

        if chol > 200:
            recommendations.append({
                'category': 'Cholesterol',
                'priority': 'High' if chol > 240 else 'Moderate',
                'text': 'Focus on a heart-healthy diet: more fiber, healthy fats (olive oil, nuts), and less saturated fat. Consider omega-3 supplements.',
                'icon': '📊'
            })

        if fbs > 100:
            recommendations.append({
                'category': 'Blood Sugar',
                'priority': 'High' if fbs > 126 else 'Moderate',
                'text': 'Your blood sugar is elevated. Reduce refined carbohydrates, increase fiber intake, and exercise regularly. Monitor levels closely.',
                'icon': '🍎'
            })

        if bmi > 25:
            recommendations.append({
                'category': 'Weight Management',
                'priority': 'High' if bmi > 30 else 'Moderate',
                'text': f'Your BMI ({bmi:.1f}) suggests weight management would benefit your health. Aim for gradual weight loss through diet and exercise.',
                'icon': '⚖️'
            })

        if exercise < 3:
            recommendations.append({
                'category': 'Physical Activity',
                'priority': 'Moderate',
                'text': 'Increase physical activity to at least 150 minutes per week. Start with brisk walking 30 minutes daily.',
                'icon': '💪'
            })

        if smoking:
            recommendations.append({
                'category': 'Smoking Cessation',
                'priority': 'Critical',
                'text': 'Quitting smoking is the single most important step for your health. Consult your doctor about cessation programs.',
                'icon': '🚭'
            })

        if not recommendations:
            recommendations.append({
                'category': 'Maintenance',
                'priority': 'Low',
                'text': 'Great job! Your parameters look healthy. Continue your current lifestyle and get regular check-ups.',
                'icon': '✅'
            })

        return recommendations

    def _identify_risk_factors(self, user_data, bmi):
        """Identify active risk factors."""
        risks = []

        if user_data.get('systolic_bp', 120) > 140:
            risks.append({'factor': 'High Blood Pressure', 'severity': 'High', 'impact': 'Increases heart disease and stroke risk'})
        elif user_data.get('systolic_bp', 120) > 130:
            risks.append({'factor': 'Elevated Blood Pressure', 'severity': 'Moderate', 'impact': 'Pre-hypertension stage'})

        if user_data.get('cholesterol', 200) > 240:
            risks.append({'factor': 'High Cholesterol', 'severity': 'High', 'impact': 'Promotes arterial plaque buildup'})

        if user_data.get('fasting_blood_sugar', 90) > 126:
            risks.append({'factor': 'High Blood Sugar', 'severity': 'High', 'impact': 'Indicates diabetes risk'})

        if bmi > 30:
            risks.append({'factor': 'Obesity', 'severity': 'High', 'impact': 'Increases risk for multiple chronic diseases'})
        elif bmi > 25:
            risks.append({'factor': 'Overweight', 'severity': 'Moderate', 'impact': 'Increased metabolic disease risk'})

        if user_data.get('smoking', False):
            risks.append({'factor': 'Smoking', 'severity': 'Critical', 'impact': 'Major risk factor for heart disease and cancer'})

        if user_data.get('age', 30) > 55:
            risks.append({'factor': 'Age > 55', 'severity': 'Moderate', 'impact': 'Age-related cardiovascular risk increase'})

        if user_data.get('family_heart', False):
            risks.append({'factor': 'Family History (Heart)', 'severity': 'Moderate', 'impact': 'Genetic predisposition to heart disease'})

        if user_data.get('family_diabetes', False):
            risks.append({'factor': 'Family History (Diabetes)', 'severity': 'Moderate', 'impact': 'Genetic predisposition to diabetes'})

        return risks


# Singleton instance
health_analyzer = HealthAnalyzer()
