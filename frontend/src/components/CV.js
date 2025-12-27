import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { MdEmail } from 'react-icons/md';
import { FaLinkedin, FaGithub, FaGlobe, FaGitlab, FaWhatsapp } from 'react-icons/fa';

const CV = () => {
  const componentRef = useRef();

  const handleDownloadPDF = () => {
    const element = componentRef.current;
    if (!element) return;
    
    const opt = {
      margin: 8,
      filename: 'Samuel_Obiora_Principal_Architect_CV.pdf',
      // Smaller file size: lower raster scale + slightly lower JPEG quality.
      image: { type: 'jpeg', quality: 0.78 },
      html2canvas: {
        scale: 1.15,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Action Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleDownloadPDF}
            className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
          >
            Download PDF
          </button>
        </div>

        {/* CV Content */}
        <div ref={componentRef} className="bg-white shadow-2xl rounded-lg p-10 print:shadow-none print:p-7 print:max-w-none" style={{fontFamily: "'Inter', 'Segoe UI', sans-serif"}}>
          
          {/* Premium Header */}
          <div className="mb-8 pb-7 border-b-4 border-blue-700">
            <div className="text-center mb-5">
              <h1 className="text-6xl font-bold text-gray-900 mb-2 print:text-5xl tracking-tight" style={{letterSpacing: '-0.5px'}}>Samuel Obiora</h1>
              <p className="text-2xl text-blue-700 font-semibold mb-4 print:text-xl tracking-wide">
                Principal Architect | Cloud Infrastructure & AI Systems
              </p>
              <p className="text-base text-gray-700 max-w-3xl mx-auto leading-relaxed mb-4 font-light">
                Visionary technologist specializing in sovereign technology infrastructure, intelligent automation, and scalable architectures that drive organizational transformation at enterprise scale.
              </p>
            </div>
            <div className="flex justify-center gap-6 text-xl text-gray-700">
              <a href="mailto:devatonix@gmail.com" className="hover:text-blue-700 transition-colors" title="Email">
                <MdEmail size={22} />
              </a>
              <a href="https://www.linkedin.com/in/atonixdev" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors" title="LinkedIn">
                <FaLinkedin size={22} />
              </a>
              <a href="https://github.com/atonixdev" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors" title="GitHub">
                <FaGithub size={22} />
              </a>
              <a href="https://gitlab.com/atonixdev" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors" title="GitLab">
                <FaGitlab size={22} />
              </a>
              <a href="https://atonixdev.org" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors" title="Website">
                <FaGlobe size={22} />
              </a>
              <a href="https://wa.me/27664173157" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors" title="WhatsApp: +27664173157">
                <FaWhatsapp size={22} />
              </a>
            </div>
          </div>

          {/* Executive Summary */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-blue-700 uppercase tracking-wide font-semibold">Executive Summary</h2>
            <p className="text-gray-800 leading-relaxed text-base font-light">
              Principal-level architect with 8+ years of experience transforming enterprises through sovereign cloud infrastructure, intelligent AI automation, and developer-first platforms. Architected 50+ production systems serving millions of users. Expert in designing resilient, high-performance architectures across AWS, Google Cloud, Azure, and private cloud environments. Deep specialization in FinTech systems, AI/ML integration, DevOps transformation, and security compliance. Proven track record of reducing operational costs by 40%, accelerating deployment cycles, and enabling organizations to compete globally with cutting-edge technology.
            </p>
          </section>

          {/* Core Philosophy */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-blue-700 uppercase tracking-wide font-semibold">Core Philosophy</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-700">
                <h3 className="font-semibold text-gray-900 mb-2 text-blue-700 text-sm">Sovereign Technology</h3>
                <p className="text-gray-700 text-sm leading-relaxed font-light">Building infrastructure that gives organizations true control over their data and systems</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-700">
                <h3 className="font-semibold text-gray-900 mb-2 text-blue-700 text-sm">Intelligent Automation</h3>
                <p className="text-gray-700 text-sm leading-relaxed font-light">Leveraging AI and machine learning to solve complex challenges efficiently</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-700">
                <h3 className="font-semibold text-gray-900 mb-2 text-blue-700 text-sm">Scalable Architecture</h3>
                <p className="text-gray-700 text-sm leading-relaxed font-light">Designing systems that grow with your business without compromising performance</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-700">
                <h3 className="font-semibold text-gray-900 mb-2 text-blue-700 text-sm">Developer Excellence</h3>
                <p className="text-gray-700 text-sm leading-relaxed font-light">Creating platforms and tools that empower developers to do their best work</p>
              </div>
            </div>
          </section>

          {/* Technical Expertise - Comprehensive */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-blue-700 uppercase tracking-wide font-semibold">Technical Expertise</h2>
            
            <div className="space-y-5">
              {/* Cloud Infrastructure */}
              <div className="border-l-4 border-blue-600 pl-4 py-2">
                <h3 className="font-bold text-gray-900 text-blue-700 mb-3 text-base">Cloud Infrastructure & Architecture</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Cloud Providers</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">AWS • Google Cloud • Microsoft Azure • OpenStack • IBM Cloud • Red Hat</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Deployment Models</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">Public Cloud • Private Cloud • Hybrid Cloud • Community Cloud • Multi-Cloud Architecture</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Service Models</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">IaaS • PaaS • SaaS • Serverless Computing • Event-driven Architecture</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Containerization &amp; Orchestration</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">Kubernetes • Docker • Helm • Containerd • BuildKit • Rootless Containers</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Infrastructure &amp; Architecture</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">Terraform • Ansible • Service Mesh (Istio, Linkerd) • High-Availability • Load Balancing • Auto-scaling • Disaster Recovery</p>
                  </div>
                </div>
              </div>

              {/* AI & Machine Learning */}
              <div className="border-l-4 border-blue-600 pl-4 py-2">
                <h3 className="font-bold text-gray-900 text-blue-700 mb-3 text-base">AI & Machine Learning</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Frameworks & Libraries</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">TensorFlow • PyTorch • Scikit-learn • XGBoost • Transformers</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Specializations</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">LLM Integration • RAG Systems • Prompt Engineering • Fine-tuning • Computer Vision • NLP • Deep Learning • Model Optimization</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Infrastructure & Deployment</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">GPU Acceleration • MLOps • Distributed Training • Model Serving • Vector Databases • Research Platforms</p>
                  </div>
                </div>
              </div>

              {/* DevOps & CI/CD */}
              <div className="border-l-4 border-blue-600 pl-4 py-2">
                <h3 className="font-bold text-gray-900 text-blue-700 mb-3 text-base">DevOps, CI/CD & Infrastructure Automation</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">CI/CD Tools &amp; Platforms</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">Jenkins • GitLab CI • GitHub Actions • ArgoCD • GitOps Workflows</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Infrastructure as Code</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">Terraform • Ansible • Helm Charts • Configuration Management • Infrastructure Automation</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Monitoring & Observability</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">Prometheus • Grafana • ELK Stack • Splunk • Distributed Tracing • Log Aggregation</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Deployment Strategies</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">Zero-downtime • Blue-green • Canary • Rolling Updates • Health Checks & Alerting • SRE Practices</p>
                  </div>
                </div>
              </div>

              {/* Programming Languages */}
              <div className="border-l-4 border-blue-600 pl-4 py-2">
                <h3 className="font-bold text-gray-900 text-blue-700 mb-3 text-base">Programming Languages & Development</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Backend Languages</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">Python • JavaScript/TypeScript • Go • Java • C++ • Rust • Bash/Shell</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Backend Frameworks</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">Django • FastAPI • Node.js • Express.js • Spring Boot • Kafka</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Frontend Technologies</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">React • Next.js • Vue.js • Angular • Svelte • Tailwind CSS • Bootstrap</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">API & Database</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">REST • GraphQL • WebSockets • gRPC • PostgreSQL • MongoDB • MySQL • Redis • Elasticsearch</p>
                  </div>
                </div>
              </div>

              {/* Full-Stack Development */}
              <div className="border-l-4 border-blue-600 pl-4 py-2">
                <h3 className="font-bold text-gray-900 text-blue-700 mb-3 text-base">Full-Stack Development & Architecture</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <p className="text-gray-700 font-light leading-relaxed">Microservices Architecture</p>
                  <p className="text-gray-700 font-light leading-relaxed">API Design & Documentation</p>
                  <p className="text-gray-700 font-light leading-relaxed">Performance Optimization</p>
                  <p className="text-gray-700 font-light leading-relaxed">Database Optimization</p>
                  <p className="text-gray-700 font-light leading-relaxed">Caching Strategies (Redis, Memcached)</p>
                  <p className="text-gray-700 font-light leading-relaxed">Authentication & OAuth</p>
                  <p className="text-gray-700 font-light leading-relaxed">Real-time Systems</p>
                  <p className="text-gray-700 font-light leading-relaxed">Event-driven Architecture</p>
                </div>
              </div>

              {/* IoT & Embedded */}
              <div className="border-l-4 border-blue-600 pl-4 py-2">
                <h3 className="font-bold text-gray-900 text-blue-700 mb-3 text-base">IoT & Embedded Systems</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Platforms & Boards</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">Raspberry Pi • Arduino • NVIDIA Jetson • ROS (Robotics OS)</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Protocols & Communication</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">MQTT • Zigbee • Z-Wave • BLE • LoRaWAN • NB-IoT • LTE-M • CoAP • Modbus • CAN Bus</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Operating Systems</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">Embedded Linux • FreeRTOS • Zephyr OS • Real-time Systems</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Specializations</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">Edge Computing • Firmware Development • Hardware Debugging • TinyML & Edge AI • Industrial IoT • Smart Home Integration</p>
                  </div>
                </div>
              </div>

              {/* Security & Compliance */}
              <div className="border-l-4 border-blue-600 pl-4 py-2">
                <h3 className="font-bold text-gray-900 text-blue-700 mb-3 text-base">Security, Compliance & Risk Management</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Compliance & Standards</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">SOC 2 • ISO 27001 • GDPR • HIPAA • PCI-DSS • OWASP • Zero Trust Architecture</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Security Technologies</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">SSL/TLS • OAuth 2.0 • JWT • MFA/2FA • Cryptography • Data Encryption • Vault • WAF • IDS/IPS • SIEM</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Data Migration & Protection</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">Secure Data Migration • Data Classification • DLP • Backup & Recovery • Cross-cloud Portability • Compliance-aware Migration</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Advanced Practices</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">DevSecOps • Penetration Testing • Incident Response • Threat Modeling • Supply Chain Security • Code Auditing</p>
                  </div>
                </div>
              </div>

              {/* Cloud Models & Migration */}
              <div className="border-l-4 border-blue-600 pl-4 py-2">
                <h3 className="font-bold text-gray-900 text-blue-700 mb-3 text-base">Cloud Deployment Models & Data Migration</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Deployment Models</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed"><strong>Public:</strong> AWS, Google Cloud, Azure • <strong>Private:</strong> OpenStack, IBM Cloud • <strong>Hybrid:</strong> Seamless Integration • <strong>Community:</strong> Industry Collaboration • <strong>Multi-Cloud:</strong> Resilience & Optimization</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">Data Migration Expertise</p>
                    <p className="text-gray-700 text-sm font-light leading-relaxed">Secure Cross-cloud Migration • Zero-downtime Strategies • Data Validation & Integrity • Compliance-aware Approach • Database Replication & Sync • Multi-region Distribution</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Impact & Achievements */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-blue-700 uppercase tracking-wide font-semibold">Impact &amp; Achievements</h2>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white p-6 rounded-lg text-center shadow-md">
                <p className="text-5xl font-bold mb-1">50+</p>
                <p className="text-sm font-semibold leading-tight">Production Projects</p>
              </div>
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white p-6 rounded-lg text-center shadow-md">
                <p className="text-5xl font-bold mb-1">8+</p>
                <p className="text-sm font-semibold leading-tight">Years Experience</p>
              </div>
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white p-6 rounded-lg text-center shadow-md">
                <p className="text-5xl font-bold mb-1">Global</p>
                <p className="text-sm font-semibold leading-tight">Reach & Impact</p>
              </div>
              <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white p-6 rounded-lg text-center shadow-md">
                <p className="text-5xl font-bold mb-1">40%</p>
                <p className="text-sm font-semibold leading-tight">Cost Reduction</p>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Key Achievements</h3>
              <ul className="space-y-2 text-sm text-gray-700 ml-5 font-light leading-relaxed">
                <li>✓ Architected and deployed 50+ production systems across AWS, Google Cloud, Azure, OpenStack, IBM Cloud</li>
                <li>✓ Led enterprise cloud migrations (public → hybrid → multi-cloud) with zero-downtime deployment</li>
                <li>✓ Designed FinTech platforms with multi-country logic, compliance, and tax engines across 5+ regions</li>
                <li>✓ Built AI/ML research platforms with GPU acceleration for scaled model deployment</li>
                <li>✓ Established SOC 2, ISO 27001, PCI-DSS compliance with Zero Trust architecture</li>
                <li>✓ Reduced operational costs by 40% through infrastructure optimization and multi-cloud strategy</li>
                <li>✓ Accelerated CI/CD cycles from weeks to hours with Containerd containerization</li>
                <li>✓ Designed sovereign cloud solutions using OpenStack for data-sensitive organizations</li>
                <li>✓ Mentored teams in full-stack development, IoT systems (Raspberry Pi, Arduino, ROS), and DevSecOps</li>
              </ul>
            </div>
          </section>

          {/* Professional Experience */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-blue-700 uppercase tracking-wide font-semibold">Professional Experience</h2>
            <div className="space-y-6">
              
              <div className="border-l-4 border-blue-700 pl-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-bold text-gray-900">Principal Architect &amp; Full-Stack Engineer</h3>
                  <span className="text-xs text-gray-600 font-semibold bg-blue-100 px-2 py-1 rounded whitespace-nowrap ml-2">2016 - Present</span>
                </div>
                <p className="text-blue-700 font-semibold text-sm mb-3">AtonixDev / Freelance & Enterprise Clients</p>
                <ul className="space-y-2 text-gray-700 text-sm leading-relaxed font-light">
                  <li>• Architected and deployed 50+ production-grade systems across AWS, Google Cloud, Azure, OpenStack, and IBM Cloud</li>
                  <li>• Led enterprise-wide cloud migration initiatives with zero-downtime data migration and compliance verification</li>
                  <li>• Designed and built AI/ML integration platforms enabling intelligent workflow automation and predictive analytics with GPU acceleration</li>
                  <li>• Built multi-region FinTech platforms with tax calculation engines, multi-currency logic, compliance workflows across 5+ countries</li>
                  <li>• Established sovereign cloud infrastructure solutions using OpenStack &amp; Kubernetes for data-sensitive organizations</li>
                  <li>• Implemented containerized environments using Docker, Kubernetes, and Containerd runtime for production workloads</li>
                  <li>• Reduced operational costs by 40% through infrastructure optimization, auto-scaling, and multi-cloud cost allocation</li>
                  <li>• Implemented zero-downtime deployment strategies (blue-green, canary) achieving 99.99% uptime SLAs</li>
                  <li>• Established enterprise security infrastructure: SOC 2, ISO 27001, PCI-DSS compliance with SIEM &amp; IPS deployment</li>
                  <li>• Mentored engineering teams on cloud-native architecture, DevSecOps, data migration, and IoT integration (Raspberry Pi, Arduino, ROS)</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-700 pl-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-bold text-gray-900">Senior Software Engineer - DevOps &amp; Infrastructure</h3>
                  <span className="text-xs text-gray-600 font-semibold bg-blue-100 px-2 py-1 rounded whitespace-nowrap ml-2">2019 - 2023</span>
                </div>
                <p className="text-blue-700 font-semibold text-sm mb-3">FinTech Startup (Series B)</p>
                <ul className="space-y-2 text-gray-700 text-sm leading-relaxed font-light">
                  <li>• Built and scaled backend infrastructure handling 100K+ daily active users, processing millions of transactions</li>
                  <li>• Containerized entire stack with Docker and orchestrated on AWS EKS (Kubernetes) with Helm</li>
                  <li>• Implemented comprehensive CI/CD pipeline with GitHub Actions, reducing deployment time from 2 hours to 10 minutes</li>
                  <li>• Optimized PostgreSQL queries and Redis caching, improving API response time by 50%</li>
                  <li>• Designed and implemented infrastructure-as-code using Terraform, managing 200+ cloud resources</li>
                  <li>• Established monitoring and observability with Prometheus, Grafana, and ELK Stack</li>
                  <li>• Led DevSecOps initiative implementing SAST, DAST, and container security scanning</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-700 pl-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-bold text-gray-900">Full-Stack Engineer</h3>
                  <span className="text-xs text-gray-600 font-semibold bg-blue-100 px-2 py-1 rounded whitespace-nowrap ml-2">2018 - 2020</span>
                </div>
                <p className="text-blue-700 font-semibold text-sm mb-3">Web Development Agency</p>
                <ul className="space-y-2 text-gray-700 text-sm leading-relaxed font-light">
                  <li>• Developed 25+ full-stack applications using React, Django, FastAPI for enterprise and startup clients</li>
                  <li>• Designed responsive, accessible interfaces with Tailwind CSS achieving 90+ Lighthouse performance scores</li>
                  <li>• Built scalable REST and GraphQL APIs handling high-traffic applications</li>
                  <li>• Optimized database queries and implemented caching strategies reducing load times by 60%</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Services & Expertise */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-blue-700 uppercase tracking-wide font-semibold">Core Services & Expertise Areas</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
                <h3 className="font-bold text-gray-900 text-blue-700 mb-2 text-sm">1. Software Engineering & Product Development</h3>
                <p className="text-gray-700 text-xs leading-relaxed font-light">Custom applications • Full-stack engineering • Backend systems & APIs • Database design • Clean, maintainable code • Scalable architectures</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
                <h3 className="font-bold text-gray-900 text-blue-700 mb-2 text-sm">2. AI-Driven Automation & Intelligence</h3>
                <p className="text-gray-700 text-xs leading-relaxed font-light">Workflow automation • LLM integration • RAG systems • Smart decision-making • Machine learning • Data analysis</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
                <h3 className="font-bold text-gray-900 text-blue-700 mb-2 text-sm">3. Technical Architecture & Systems Design</h3>
                <p className="text-gray-700 text-xs leading-relaxed font-light">Systems architecture • Database optimization • Multi-country logic • Financial engines • Enterprise infrastructure</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
                <h3 className="font-bold text-gray-900 text-blue-700 mb-2 text-sm">4. FinTech Engineering & Financial Systems</h3>
                <p className="text-gray-700 text-xs leading-relaxed font-light">Tax calculations • Multi-currency logic • Compliance workflows • Financial reporting • Regulatory alignment</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
                <h3 className="font-bold text-gray-900 text-blue-700 mb-2 text-sm">5. Cloud Infrastructure & DevOps Transformation</h3>
                <p className="text-gray-700 text-xs leading-relaxed font-light">Multi-cloud strategy • Infrastructure as Code • CI/CD automation • Kubernetes • Cost optimization • Security</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-600">
                <h3 className="font-bold text-gray-900 text-blue-700 mb-2 text-sm">6. Strategic Consulting & Technical Leadership</h3>
                <p className="text-gray-700 text-xs leading-relaxed font-light">Product vision • Technical requirements • Developer specifications • Team alignment • Technology strategy</p>
              </div>
            </div>
          </section>

          {/* Education & Certifications */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-blue-700 uppercase tracking-wide font-semibold">Education & Certifications</h2>
            <div className="space-y-4 mb-6">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-bold text-gray-900 text-base">Bachelor of Science in Chemical Engineering</h3>
                <p className="text-gray-700 text-sm mt-1 leading-relaxed font-light">Systems design • Process optimization • Complex problem-solving methodologies</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-bold text-gray-900 text-base">Diploma in Computer Science</h3>
                <p className="text-gray-700 text-sm mt-1 leading-relaxed font-light">Algorithms • Data structures • Software development principles • Distributed systems</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-700">
                <h3 className="font-bold text-gray-900 text-blue-700 text-base">Self-Taught & Continuous Learning</h3>
                <p className="text-gray-700 text-sm mt-2 leading-relaxed font-light">Advanced expertise in cloud infrastructure, AI/ML, DevOps, full-stack development, and distributed systems. Mastered through rigorous self-directed learning, hands-on projects, and real-world engineering challenges. Committed to staying at the forefront of technological innovation.</p>
              </div>
            </div>
          </section>

          {/* Core Approach */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-blue-700 uppercase tracking-wide font-semibold">Working Approach</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-t-4 border-blue-700">
                <h3 className="font-bold text-gray-900 text-sm mb-2 text-blue-700">Results-Driven</h3>
                <p className="text-gray-700 text-xs leading-relaxed font-light">Measurable outcomes and business impact aligned with strategic goals</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-t-4 border-blue-700">
                <h3 className="font-bold text-gray-900 text-sm mb-2 text-blue-700">Collaborative</h3>
                <p className="text-gray-700 text-xs leading-relaxed font-light">Close partnership through transparency and clear communication</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-t-4 border-blue-700">
                <h3 className="font-bold text-gray-900 text-sm mb-2 text-blue-700">Innovative</h3>
                <p className="text-gray-700 text-xs leading-relaxed font-light">Latest technologies and methodologies for cutting-edge solutions</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-t-4 border-blue-700">
                <h3 className="font-bold text-gray-900 text-sm mb-2 text-blue-700">Problem-Solver</h3>
                <p className="text-gray-700 text-xs leading-relaxed font-light">Elegant, scalable solutions that stand the test of time</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center text-gray-700 border-t border-gray-300 pt-8 mt-2">
            <p className="font-bold text-sm mb-1 text-gray-900">atonixdev.org • Global Technology Architect</p>
            <p className="text-gray-600 text-xs font-light">Building sovereign, intelligent, and scalable systems that power the future</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CV;