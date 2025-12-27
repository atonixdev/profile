import React, { Suspense, lazy } from 'react';
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
import SpaceModulePage from './pages/Lab/SpaceModulePage';
import SelfLabOverview from './pages/Lab/SelfLabOverview';
import SelfLabBiometrics from './pages/Lab/SelfLabBiometrics';
import SelfLabCognitive from './pages/Lab/SelfLabCognitive';
import SelfLabEvolution from './pages/Lab/SelfLabEvolution';
import SelfLabJournals from './pages/Lab/SelfLabJournals';
import AILabOverview from './pages/Lab/AILabOverview';
import AILabTraining from './pages/Lab/AILabTraining';
import AILabTuning from './pages/Lab/AILabTuning';
import AILabDatasets from './pages/Lab/AILabDatasets';
import AILabRegistry from './pages/Lab/AILabRegistry';
import IoTLabOverview from './pages/Lab/IoTLabOverview';
import IoTLabDevices from './pages/Lab/IoTLabDevices';
import IoTLabTelemetry from './pages/Lab/IoTLabTelemetry';
import IoTLabAutomation from './pages/Lab/IoTLabAutomation';
import IoTLabNetwork from './pages/Lab/IoTLabNetwork';
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

const SpaceApiPage = lazy(() => import('./pages/Lab/SpaceApiPage'));
const SpaceMapPage = lazy(() => import('./pages/Lab/SpaceMapPage'));
const MarsTrekMapPage = lazy(() => import('./pages/Lab/MarsTrekMapPage'));

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
                <Route
                  path="space/map"
                  element={
                    <Suspense fallback={<div className="py-6">Loading map…</div>}>
                      <SpaceMapPage />
                    </Suspense>
                  }
                />
                <Route
                  path="space/mars-map"
                  element={
                    <Suspense fallback={<div className="py-6">Loading map…</div>}>
                      <MarsTrekMapPage />
                    </Suspense>
                  }
                />
                <Route
                  path="space/apis/:apiId"
                  element={
                    <Suspense fallback={<div className="py-6">Loading…</div>}>
                      <SpaceApiPage />
                    </Suspense>
                  }
                />
                <Route path="space/astrophysics" element={<SpaceModulePage kind="astrophysics" title="Astrophysics & Orbital Mechanics" description="Orbital fundamentals, near-earth objects, and astrophysics signals" />} />
                <Route path="space/simulations" element={<SpaceModulePage kind="simulations" title="Orbital Simulations" description="Run gravitational and trajectory models" />} />
                <Route path="space/telemetry" element={<SpaceModulePage kind="telemetry" title="Satellite Telemetry" description="Monitor real-time satellite data" />} />
                <Route path="space/models" element={<SpaceModulePage kind="models" title="Cosmic Event Models" description="Analyze solar storms and space weather signals" />} />
                <Route path="space/datasets" element={<SpaceModulePage kind="datasets" title="Datasets" description="Browse space datasets and activity summaries" />} />
                <Route path="space/settings" element={<LabSettings />} />

                {/* Self Lab */}
                <Route path="self" element={<SelfLabOverview />} />
                <Route path="self/biometrics" element={<SelfLabBiometrics />} />
                <Route path="self/cognitive" element={<SelfLabCognitive />} />
                <Route path="self/evolution" element={<SelfLabEvolution />} />
                <Route path="self/journals" element={<SelfLabJournals />} />
                <Route path="self/settings" element={<LabSettings />} />

                {/* AI Lab */}
                <Route path="ai" element={<AILabOverview />} />
                <Route path="ai/training" element={<AILabTraining />} />
                <Route path="ai/datasets" element={<AILabDatasets />} />
                <Route path="ai/experiments" element={<AILabTuning />} />
                <Route path="ai/registry" element={<AILabRegistry />} />
                <Route path="ai/settings" element={<LabSettings />} />

                {/* IoT Lab */}
                <Route path="iot" element={<IoTLabOverview />} />
                <Route path="iot/devices" element={<IoTLabDevices />} />
                <Route path="iot/telemetry" element={<IoTLabTelemetry />} />
                <Route path="iot/automation" element={<IoTLabAutomation />} />
                <Route path="iot/network" element={<IoTLabNetwork />} />
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
