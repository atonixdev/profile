import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import FloatingChatbot from './components/FloatingChatbot';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Portfolio from './pages/Portfolio';
import ProjectDetail from './pages/ProjectDetail';
import Testimonials from './pages/Testimonials';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Register from './pages/Register';
import Login from './pages/Login';
import CommunityDashboard from './pages/CommunityDashboard';
import Discussions from './pages/Discussions';
import Members from './pages/Members';
import Events from './pages/Events';
import Resources from './pages/Resources';
import LabLayout from './components/Lab/LabLayout';
import LabOverview from './pages/Lab/Overview';
import LabRunExperiment from './pages/Lab/RunExperiment';
import LabHistory from './pages/Lab/History';
import LabCompare from './pages/Lab/Compare';
import LabModelsArtifacts from './pages/Lab/ModelsArtifacts';
import LabSettings from './pages/Lab/Settings';
import SpaceLabOverview from './pages/Lab/SpaceLabOverview';
import SelfLabOverview from './pages/Lab/SelfLabOverview';
import AILabOverview from './pages/Lab/AILabOverview';
import IoTLabOverview from './pages/Lab/IoTLabOverview';
import PlaceholderPage from './pages/Lab/PlaceholderPage';
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProjects from './pages/Admin/Projects';
import AdminServices from './pages/Admin/Services';
import AdminTestimonials from './pages/Admin/Testimonials';
import AdminInquiries from './pages/Admin/Inquiries';
import AdminProfile from './pages/Admin/Profile';
import CV from './components/CV';
import ChatbotAdmin from './pages/Admin/ChatbotAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <FloatingChatbot />
        <Routes>
          {/* Public + Layout Routes */}
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="portfolio/:id" element={<ProjectDetail />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="cv" element={<CV />} />
            <Route path="help" element={<FAQ />} />
            <Route path="faq" element={<FAQ />} />

            {/* Protected Community Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="community" element={<CommunityDashboard />} />
              <Route path="community/discussions" element={<Discussions />} />
              <Route path="community/members" element={<Members />} />
              <Route path="community/events" element={<Events />} />
              <Route path="community/resources" element={<Resources />} />
            </Route>

            {/* Protected Lab Route (requires registration) */}
            <Route element={<ProtectedRoute redirectTo="/register" />}>
              <Route path="lab" element={<LabLayout />}>
                {/* Experimentation Lab */}
                <Route index element={<LabOverview />} />
                <Route path="run" element={<LabRunExperiment />} />
                <Route path="history" element={<LabHistory />} />
                <Route path="compare" element={<LabCompare />} />
                <Route path="models" element={<LabModelsArtifacts />} />
                <Route path="settings" element={<LabSettings />} />

                {/* Space Lab */}
                <Route path="space" element={<SpaceLabOverview />} />
                <Route path="space/simulations" element={<PlaceholderPage title="Orbital Simulations" description="Run gravitational and trajectory models" domain="Space Lab" />} />
                <Route path="space/telemetry" element={<PlaceholderPage title="Satellite Telemetry" description="Monitor real-time satellite data" domain="Space Lab" />} />
                <Route path="space/models" element={<PlaceholderPage title="Cosmic Event Models" description="Analyze supernovae, black holes, and more" domain="Space Lab" />} />
                <Route path="space/datasets" element={<PlaceholderPage title="Datasets" description="Browse astrophysics research data" domain="Space Lab" />} />
                <Route path="space/settings" element={<LabSettings />} />

                {/* Self Lab */}
                <Route path="self" element={<SelfLabOverview />} />
                <Route path="self/biometrics" element={<PlaceholderPage title="Biometrics" description="Track heart rate, sleep, and vitals" domain="Self Lab" />} />
                <Route path="self/cognitive" element={<PlaceholderPage title="Cognitive Experiments" description="Run memory, focus, and cognition tests" domain="Self Lab" />} />
                <Route path="self/evolution" element={<PlaceholderPage title="Personal Evolution" description="Analyze growth metrics over time" domain="Self Lab" />} />
                <Route path="self/journals" element={<PlaceholderPage title="Journals & Logs" description="Review daily entries and reflections" domain="Self Lab" />} />
                <Route path="self/settings" element={<LabSettings />} />

                {/* AI Lab */}
                <Route path="ai" element={<AILabOverview />} />
                <Route path="ai/training" element={<PlaceholderPage title="Model Training" description="Train neural networks and ML models" domain="AI Lab" />} />
                <Route path="ai/datasets" element={<PlaceholderPage title="Dataset Manager" description="Upload and manage training data" domain="AI Lab" />} />
                <Route path="ai/experiments" element={<PlaceholderPage title="Hyperparameter Tuning" description="Optimize model parameters" domain="AI Lab" />} />
                <Route path="ai/registry" element={<PlaceholderPage title="Model Registry" description="Browse and deploy trained models" domain="AI Lab" />} />
                <Route path="ai/settings" element={<LabSettings />} />

                {/* IoT Lab */}
                <Route path="iot" element={<IoTLabOverview />} />
                <Route path="iot/devices" element={<PlaceholderPage title="Device Manager" description="Configure and monitor IoT devices" domain="IoT Lab" />} />
                <Route path="iot/telemetry" element={<PlaceholderPage title="Sensor Telemetry" description="View real-time sensor data streams" domain="IoT Lab" />} />
                <Route path="iot/automation" element={<PlaceholderPage title="Automation Experiments" description="Build and test automation workflows" domain="IoT Lab" />} />
                <Route path="iot/network" element={<PlaceholderPage title="Network Health" description="Monitor network status and connectivity" domain="IoT Lab" />} />
                <Route path="iot/settings" element={<LabSettings />} />
              </Route>
            </Route>
          </Route>

          {/* Auth Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/testimonials" element={<AdminTestimonials />} />
            <Route path="/admin/inquiries" element={<AdminInquiries />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/chat" element={<ChatbotAdmin />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
