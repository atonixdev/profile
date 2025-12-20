"""
Rule-based chatbot responses and service matching logic
"""

SPECIALIZATIONS = {
    'cloud': {
        'name': 'Cloud Infrastructure & Architecture',
        'technologies': ['OpenStack', 'AWS', 'Google Cloud', 'Microsoft Azure', 'IBM Cloud', 'Red Hat', 'Kubernetes', 'Ceph', 'OVN', 'Private cloud', 'Public cloud', 'Hybrid cloud', 'Multi-cloud architecture', 'High-availability systems', 'Load Balancing', 'Auto-scaling', 'Service Mesh (Istio)', 'Linkerd', 'Network Architecture', 'Disaster Recovery', 'Backup & Recovery', 'Broadcom', 'NVIDIA', 'Computing infrastructure', 'vSphere', 'VMware', 'Hypervisor technology', 'Container orchestration', 'CDN & Edge computing', 'API Gateway', 'Monitoring & Observability'],
        'keywords': ['cloud', 'infrastructure', 'aws', 'azure', 'gcp', 'kubernetes', 'scaling', 'availability', 'deployment', 'multi-cloud', 'hybrid']
    },
    'ai_ml': {
        'name': 'AI & Machine Learning',
        'technologies': ['Model development', 'TensorFlow', 'PyTorch', 'LLM Integration', 'Deployment pipelines', 'Research platforms', 'Data preprocessing', 'Model training & optimization', 'GPU acceleration', 'MLOps & Model Serving', 'Neural Networks', 'Computer Vision', 'Natural Language Processing', 'Transformers', 'Scikit-learn', 'XGBoost', 'Deep Learning', 'Fine-tuning', 'RAG (Retrieval-Augmented Generation)', 'Prompt Engineering', 'Vector Databases', 'Model Optimization', 'Inference Optimization', 'Distributed Training', 'Transfer Learning'],
        'keywords': ['ai', 'machine learning', 'ml', 'deep learning', 'neural network', 'model', 'tensorflow', 'pytorch', 'nlp', 'computer vision', 'llm', 'gpt', 'chatbot', 'prediction']
    },
    'devops': {
        'name': 'DevOps & CI/CD',
        'technologies': ['Jenkins', 'GitLab CI', 'Docker', 'Rootless containers', 'BuildKit', 'Kubernetes', 'Helm', 'Terraform', 'Ansible', 'Kafka', 'Prometheus', 'Grafana', 'ELK Stack', 'Splunk', 'Zero-downtime deployments', 'Blue-green deployments', 'Canary deployments', 'Infrastructure as Code', 'Monitoring & Logging', 'Log aggregation', 'Distributed tracing', 'ArgoCD', 'GitOps', 'CI/CD pipelines', 'Container registry', 'Service discovery', 'Configuration management', 'Health checks & alerting', 'Load testing', 'Rollback strategies', 'Change management', 'Release management', 'Incident response', 'SRE practices'],
        'keywords': ['devops', 'ci/cd', 'deployment', 'pipeline', 'docker', 'jenkins', 'terraform', 'automation', 'monitoring', 'logging', 'infrastructure', 'gitlab']
    },
    'fullstack': {
        'name': 'Full-Stack Development',
        'technologies': ['React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'JavaScript/TypeScript', 'Node.js', 'Express.js', 'Django', 'FastAPI', 'Python', 'REST APIs', 'GraphQL', 'WebSockets', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Elasticsearch', 'Docker', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'API design & documentation', 'Database optimization', 'Caching strategies', 'Authentication & OAuth', 'Payment integration', 'Testing frameworks', 'Microservices architecture', 'Scalability & performance', 'Enterprise applications'],
        'keywords': ['web', 'fullstack', 'frontend', 'backend', 'react', 'node', 'django', 'fastapi', 'javascript', 'python', 'database', 'api', 'application', 'website', 'server']
    },
    'iot': {
        'name': 'IoT & Embedded Systems',
        'technologies': ['Raspberry Pi', 'Arduino', 'ROS (Robotics Operating System)', 'MQTT', 'Zigbee', 'Z-Wave', 'BLE (Bluetooth Low Energy)', 'LoRaWAN', 'NB-IoT', 'LTE-M', 'Edge Computing', 'Microcontroller programming', 'IoT protocols', 'CoAP (Constrained Application Protocol)', 'Embedded Linux', 'FreeRTOS', 'Zephyr OS', 'Sensor integration', 'Real-time systems', 'CAN bus', 'Modbus', 'Power management', 'Battery optimization', 'Firmware development', 'Hardware debugging', 'JTAG/SWD', 'OTA (Over-the-air) updates', 'TinyML & Edge AI', 'Circuit design', 'Telemetry', 'Wearable technology', 'Industrial IoT (IIoT)', 'Smart home integration', 'Hardware interfacing', 'Peripheral drivers'],
        'keywords': ['iot', 'embedded', 'raspberry', 'arduino', 'sensor', 'hardware', 'firmware', 'microcontroller', 'robotics', 'edge', 'wireless', 'smart']
    },
    'security': {
        'name': 'Security & Compliance',
        'technologies': ['Application Security', 'Network Security', 'Cloud Security', 'API Security', 'Cryptography', 'SSL/TLS', 'OAuth & JWT', 'Multi-factor authentication (MFA)', 'OWASP standards', 'Penetration testing', 'Vulnerability assessment', 'Security hardening', 'Identity & Access Management', 'GDPR & HIPAA compliance', 'SOC 2 & ISO 27001 compliance', 'PCI-DSS compliance', 'Data encryption', 'Secure coding practices', 'SAST & DAST scanning', 'Code review & auditing', 'Zero Trust Architecture', 'DevSecOps', 'Security monitoring & auditing', 'SIEM (Security Information Event Management)', 'IDS/IPS (Intrusion Detection/Prevention)', 'WAF (Web Application Firewall)', 'Container security', 'Supply chain security', 'Secret management & Vault', 'Key management', 'Incident response & Forensics', 'Threat modeling & Risk assessment', 'Bug bounty programs', 'Security compliance reporting', 'CORS & CSP policies', 'DLP (Data Loss Prevention)', 'Endpoint security'],
        'keywords': ['security', 'compliance', 'encryption', 'authentication', 'gdpr', 'hipaa', 'penetration', 'vulnerability', 'protection', 'secure', 'privacy']
    }
}

INTENTS = {
    'greeting': {
        'patterns': ['hi', 'hello', 'hey', 'greetings', 'start'],
        'response': "Hello! 👋 I'm here to help you find the perfect services and technology solutions. What project or challenge are you working on?"
    },
    'help': {
        'patterns': ['help', 'support', 'assist', 'guide', 'how', 'what can you do'],
        'response': "I can help you with: 1) Finding the right technology stack, 2) Discovering relevant services, 3) Recommending solutions based on your needs. What would you like to explore?"
    },
    'cloud_inquiry': {
        'patterns': ['cloud', 'infrastructure', 'scaling', 'multi-cloud', 'aws', 'azure', 'gcp', 'hosting', 'deployment', 'kubernetes'],
        'specialization': 'cloud',
        'response': "Great! You're interested in cloud infrastructure. We specialize in {tech_count} cloud technologies including AWS, Azure, Google Cloud, Kubernetes, and more. What specific cloud challenge are you facing?"
    },
    'ai_ml_inquiry': {
        'patterns': ['ai', 'machine learning', 'ml', 'model', 'deep learning', 'neural', 'prediction', 'llm', 'chatbot', 'nlp', 'vision'],
        'specialization': 'ai_ml',
        'response': "Excellent! AI & Machine Learning is our expertise. We work with TensorFlow, PyTorch, LLMs, and more advanced techniques. Are you looking to build, train, or deploy ML models?"
    },
    'devops_inquiry': {
        'patterns': ['devops', 'ci/cd', 'deployment', 'pipeline', 'docker', 'jenkins', 'terraform', 'automation', 'monitoring', 'logging'],
        'specialization': 'devops',
        'response': "DevOps is our strength! We handle CI/CD pipelines, infrastructure automation, monitoring, and deployment strategies. What's your current deployment challenge?"
    },
    'fullstack_inquiry': {
        'patterns': ['web', 'fullstack', 'frontend', 'backend', 'react', 'node', 'django', 'fastapi', 'application', 'website', 'server', 'api'],
        'specialization': 'fullstack',
        'response': "Perfect! Full-Stack development is our core expertise. We build with React, Django, FastAPI, Node.js, and more. What kind of application are you building?"
    },
    'iot_inquiry': {
        'patterns': ['iot', 'embedded', 'raspberry', 'arduino', 'sensor', 'hardware', 'firmware', 'microcontroller', 'robotics', 'edge', 'smart'],
        'specialization': 'iot',
        'response': "IoT & Embedded Systems are our focus! We work with Raspberry Pi, Arduino, ROS, and edge computing. What IoT project are you planning?"
    },
    'security_inquiry': {
        'patterns': ['security', 'compliance', 'encryption', 'authentication', 'gdpr', 'hipaa', 'penetration', 'vulnerability', 'protection', 'secure', 'privacy'],
        'specialization': 'security',
        'response': "Security & Compliance is critical! We ensure your systems are secure with encryption, authentication, compliance standards (GDPR, HIPAA), and more. What security concerns do you have?"
    },
    'portfolio': {
        'patterns': ['portfolio', 'projects', 'examples', 'case study', 'work', 'show me', 'what have you done', 'previous work'],
        'response': "Check out our Portfolio page to see our latest projects and case studies. Each project showcases our expertise across different technologies!"
    },
    'services': {
        'patterns': ['services', 'offerings', 'what do you offer', 'what can you do', 'service list'],
        'response': "We offer services across multiple domains. Visit our Services page to explore our complete offerings or tell me what you're looking for!"
    },
    'contact': {
        'patterns': ['contact', 'talk', 'discuss', 'meeting', 'schedule', 'email', 'phone', 'reach out', 'connect'],
        'response': "I'd love to help! You can reach out through our Contact page or use the form to get in touch with our team directly."
    },
    'budget': {
        'patterns': ['cost', 'price', 'budget', 'how much', 'expense', 'investment', 'affordable'],
        'response': "Budget varies based on project scope, technology stack, and timeline. To get a custom quote, please use our Contact form and tell us about your project!"
    },
    'timeline': {
        'patterns': ['timeline', 'how long', 'duration', 'deadline', 'schedule', 'when', 'time frame'],
        'response': "Project timelines depend on complexity and scope. A simple web app might take weeks, while complex systems can take months. Let's discuss your specific needs!"
    }
}

def match_intent(user_input):
    """Match user input to an intent and return appropriate response"""
    user_input_lower = user_input.lower()
    
    # Check for exact intent matches
    for intent_key, intent_data in INTENTS.items():
        for pattern in intent_data.get('patterns', []):
            if pattern in user_input_lower:
                response = intent_data['response']
                
                # Add specialization details if available
                if 'specialization' in intent_data:
                    spec_key = intent_data['specialization']
                    spec = SPECIALIZATIONS[spec_key]
                    tech_count = len(spec['technologies'])
                    response = response.format(tech_count=tech_count)
                
                return {
                    'response': response,
                    'intent': intent_key,
                    'specialization': intent_data.get('specialization'),
                    'technologies': SPECIALIZATIONS[intent_data.get('specialization')]['technologies'] if 'specialization' in intent_data else None
                }
    
    # Default response if no match
    return {
        'response': "That's interesting! Could you tell me more about what you're looking to build or improve? Are you interested in web development, cloud infrastructure, AI/ML, DevOps, IoT, or security?",
        'intent': 'unknown',
        'specialization': None,
        'technologies': None
    }

def get_recommendations(user_input):
    """Get service and technology recommendations based on user input"""
    match = match_intent(user_input)
    
    recommendations = {
        'response': match['response'],
        'specialization': match.get('specialization'),
        'technologies': match.get('technologies', []),
        'suggested_page': None,
        'related_services': []
    }
    
    # Add suggested pages based on intent
    if match['intent'] == 'portfolio':
        recommendations['suggested_page'] = 'Portfolio'
    elif match['intent'] == 'services':
        recommendations['suggested_page'] = 'Services'
    elif match['intent'] == 'contact':
        recommendations['suggested_page'] = 'Contact'
    
    return recommendations
