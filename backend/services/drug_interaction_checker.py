"""
Drug Interaction Checker Service
Checks for potential interactions between medications.
"""


class DrugInteractionChecker:
    def __init__(self):
        # Interaction database (drug pairs with interaction info)
        self.interactions = {
            frozenset(['aspirin', 'warfarin']): {
                'severity': 'High',
                'effect': 'Increased risk of bleeding',
                'advice': 'Avoid combination unless directed by doctor. Both drugs thin the blood and together significantly increase bleeding risk.',
                'type': 'Pharmacodynamic'
            },
            frozenset(['aspirin', 'ibuprofen']): {
                'severity': 'Moderate',
                'effect': 'Reduced cardioprotective effect of aspirin, increased GI bleeding risk',
                'advice': 'If both needed, take aspirin at least 30 minutes before ibuprofen. Consult your doctor.',
                'type': 'Pharmacodynamic'
            },
            frozenset(['lisinopril', 'potassium']): {
                'severity': 'High',
                'effect': 'Risk of hyperkalemia (dangerously high potassium)',
                'advice': 'ACE inhibitors like lisinopril already increase potassium. Adding potassium supplements can be dangerous.',
                'type': 'Pharmacodynamic'
            },
            frozenset(['metformin', 'alcohol']): {
                'severity': 'High',
                'effect': 'Increased risk of lactic acidosis',
                'advice': 'Limit alcohol while taking metformin. Heavy drinking can lead to dangerous lactic acid buildup.',
                'type': 'Pharmacokinetic'
            },
            frozenset(['simvastatin', 'grapefruit']): {
                'severity': 'Moderate',
                'effect': 'Increased statin levels, higher risk of muscle damage',
                'advice': 'Avoid grapefruit and grapefruit juice while taking simvastatin.',
                'type': 'Pharmacokinetic'
            },
            frozenset(['metoprolol', 'verapamil']): {
                'severity': 'High',
                'effect': 'Severe bradycardia and heart block risk',
                'advice': 'Both drugs slow heart rate. Combination can cause dangerously slow heartbeat.',
                'type': 'Pharmacodynamic'
            },
            frozenset(['ssri', 'maoi']): {
                'severity': 'Critical',
                'effect': 'Serotonin syndrome — potentially fatal',
                'advice': 'NEVER combine SSRIs with MAOIs. Wait at least 14 days between switching.',
                'type': 'Pharmacodynamic'
            },
            frozenset(['warfarin', 'vitamin k']): {
                'severity': 'Moderate',
                'effect': 'Reduced anticoagulant effect',
                'advice': 'Maintain consistent vitamin K intake. Sudden changes can affect warfarin efficacy.',
                'type': 'Pharmacodynamic'
            },
            frozenset(['amlodipine', 'simvastatin']): {
                'severity': 'Moderate',
                'effect': 'Increased simvastatin levels, higher myopathy risk',
                'advice': 'Limit simvastatin to 20mg daily when taken with amlodipine.',
                'type': 'Pharmacokinetic'
            },
            frozenset(['insulin', 'metformin']): {
                'severity': 'Low',
                'effect': 'Enhanced blood sugar lowering — beneficial but monitor closely',
                'advice': 'Common combination but monitor blood sugar carefully to prevent hypoglycemia.',
                'type': 'Pharmacodynamic'
            },
            frozenset(['omeprazole', 'clopidogrel']): {
                'severity': 'High',
                'effect': 'Reduced antiplatelet effect of clopidogrel',
                'advice': 'Use pantoprazole instead of omeprazole if a PPI is needed with clopidogrel.',
                'type': 'Pharmacokinetic'
            },
            frozenset(['ciprofloxacin', 'antacid']): {
                'severity': 'Moderate',
                'effect': 'Reduced absorption of ciprofloxacin',
                'advice': 'Take ciprofloxacin 2 hours before or 6 hours after antacids.',
                'type': 'Pharmacokinetic'
            },
            frozenset(['lithium', 'ibuprofen']): {
                'severity': 'High',
                'effect': 'Increased lithium levels — toxicity risk',
                'advice': 'NSAIDs reduce lithium clearance. Use acetaminophen instead if possible.',
                'type': 'Pharmacokinetic'
            },
            frozenset(['digoxin', 'amiodarone']): {
                'severity': 'High',
                'effect': 'Increased digoxin levels — toxicity risk',
                'advice': 'Reduce digoxin dose by 50% when adding amiodarone. Monitor digoxin levels.',
                'type': 'Pharmacokinetic'
            },
        }

        # Drug aliases for flexible matching
        self.aliases = {
            'advil': 'ibuprofen', 'motrin': 'ibuprofen', 'aleve': 'naproxen',
            'tylenol': 'acetaminophen', 'paracetamol': 'acetaminophen',
            'coumadin': 'warfarin', 'lipitor': 'atorvastatin', 'zocor': 'simvastatin',
            'glucophage': 'metformin', 'norvasc': 'amlodipine', 'lopressor': 'metoprolol',
            'toprol': 'metoprolol', 'zestril': 'lisinopril', 'prinivil': 'lisinopril',
            'prilosec': 'omeprazole', 'nexium': 'esomeprazole', 'plavix': 'clopidogrel',
            'prozac': 'fluoxetine', 'zoloft': 'sertraline', 'lexapro': 'escitalopram',
            'cipro': 'ciprofloxacin', 'lanoxin': 'digoxin', 'cordarone': 'amiodarone',
        }

        # SSRI list for generic matching
        self.ssris = ['fluoxetine', 'sertraline', 'escitalopram', 'paroxetine', 'citalopram', 'fluvoxamine']
        self.maois = ['phenelzine', 'tranylcypromine', 'isocarboxazid', 'selegiline']

    def _normalize(self, drug):
        drug = drug.lower().strip()
        return self.aliases.get(drug, drug)

    def check_interactions(self, drugs):
        """Check for interactions between a list of drugs."""
        normalized = [self._normalize(d) for d in drugs if d.strip()]
        found = []
        checked_pairs = set()

        for i in range(len(normalized)):
            for j in range(i + 1, len(normalized)):
                d1, d2 = normalized[i], normalized[j]
                pair = frozenset([d1, d2])

                if pair in checked_pairs:
                    continue
                checked_pairs.add(pair)

                # Direct lookup
                if pair in self.interactions:
                    info = self.interactions[pair]
                    found.append({
                        'drug1': drugs[i].strip(),
                        'drug2': drugs[j].strip(),
                        **info
                    })
                    continue

                # Check SSRI + MAOI
                is_ssri_1 = d1 in self.ssris
                is_ssri_2 = d2 in self.ssris
                is_maoi_1 = d1 in self.maois
                is_maoi_2 = d2 in self.maois
                if (is_ssri_1 and is_maoi_2) or (is_ssri_2 and is_maoi_1):
                    found.append({
                        'drug1': drugs[i].strip(),
                        'drug2': drugs[j].strip(),
                        **self.interactions[frozenset(['ssri', 'maoi'])]
                    })

        # Sort by severity
        severity_rank = {'Critical': 0, 'High': 1, 'Moderate': 2, 'Low': 3}
        found.sort(key=lambda x: severity_rank.get(x.get('severity', ''), 4))

        return {
            'drugs_checked': [d.strip() for d in drugs if d.strip()],
            'interactions_found': len(found),
            'interactions': found,
            'safe': len(found) == 0,
            'summary': f"Found {len(found)} potential interaction(s)" if found else "No known interactions detected"
        }


# Singleton
drug_checker = DrugInteractionChecker()
