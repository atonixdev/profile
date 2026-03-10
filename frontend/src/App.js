import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Software from './pages/Software';
import Solutions from './pages/Solutions';
import Industries from './pages/Industries';
import About from './pages/About';
import Services from './pages/Services';
import Infrastructure from './pages/Infrastructure';
import ProjectDetail from './pages/ProjectDetail';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Register from './pages/Register';
import Portal from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import StaffRoute from './components/StaffRoute';
import { AuthProvider } from './context/AuthContext';
import CommunityHome from './pages/community/CommunityHome';
import Discussions from './pages/community/Discussions';
import Tutorials from './pages/community/Tutorials';
import Announcements from './pages/community/Announcements';
import CommunityRules from './pages/community/CommunityRules';
import DashboardLayout from './components/Layout/DashboardLayout';
import DashboardOverview from './pages/dashboard/Overview';
import DashboardProjects from './pages/dashboard/Projects';
import DashboardWorkspaces from './pages/dashboard/Workspaces';
import DashboardPipelines from './pages/dashboard/Pipelines';
import DashboardEnvironments from './pages/dashboard/Environments';
import DashboardRegistries from './pages/dashboard/Registries';
import DashboardMonitoring from './pages/dashboard/Monitoring';
import DashboardSupport from './pages/dashboard/Support';
import Networking from './pages/platform/Networking';
import PlatformSecurity from './pages/platform/Security';
import Careers from './pages/Careers';
import GovernmentContracting from './pages/GovernmentContracting';
import CapabilitiesStatement from './pages/CapabilitiesStatement';
import Platform from './pages/Platform';
import SecurityCompliance from './pages/SecurityCompliance';
import DataProtection from './pages/DataProtection';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Legal from './pages/Legal';
import EnterpriseSoftware from './pages/EnterpriseSoftware';
import AIAutomation from './pages/AIAutomation';
import CloudEngineering from './pages/CloudEngineering';
import DevOpsSecurity from './pages/DevOpsSecurity';
import CaseStudies from './pages/CaseStudies';
import SettingsLayout from './components/Layout/SettingsLayout';
import OpsLayout from './components/Layout/OpsLayout';
import SupportConsoleLayout from './components/Layout/SupportConsoleLayout';
import SupportInbox from './pages/support-console/Inbox';
import SupportEscalated from './pages/support-console/Escalated';
import SupportPending from './pages/support-console/Pending';
import SupportResolved from './pages/support-console/Resolved';
import SupportOverview from './pages/support-console/Overview';
import OpsOverview from './pages/ops/OpsOverview';
import OpsServices from './pages/ops/OpsServices';
import OpsLogs from './pages/ops/OpsLogs';
import OpsSecurity from './pages/ops/OpsSecurity';
import OpsResources from './pages/ops/OpsResources';
import OpsPipelines from './pages/ops/OpsPipelines';
import OpsModels from './pages/ops/OpsModels';
import OpsEnvironments from './pages/ops/OpsEnvironments';
import OpsIncidents from './pages/ops/OpsIncidents';
import OpsAudit from './pages/ops/OpsAudit';
import AdminLayout from './components/Layout/AdminLayout';
import AdminUsers from './pages/admin-console/Users';
import AdminRoles from './pages/admin-console/Roles';
import AdminConfig from './pages/admin-console/Config';
import AdminSecurity from './pages/admin-console/Security';
import AdminAudit from './pages/admin-console/Audit';
import AdminBilling from './pages/admin-console/Billing';
import AdminAPI from './pages/admin-console/API';
import AdminEmail from './pages/admin-console/Email';
import AdminSettings from './pages/admin-console/Settings';
import AdminActivity from './pages/admin-console/Activity';
import AdminFeatures from './pages/admin-console/Features';
import AdminCampaigns from './pages/admin-console/Campaigns';
import AdminSupport from './pages/admin-console/Support';
import EmailConsoleLayout from './components/Layout/EmailConsoleLayout';
import EmailOverview from './pages/email-console/Overview';
import EmailDomains from './pages/email-console/Domains';
import EmailSMTP from './pages/email-console/SMTP';
import EmailTemplates from './pages/email-console/Templates';
import EmailLogs from './pages/email-console/Logs';
import EmailMarketing from './pages/email-console/Marketing';
import EmailCampaigns from './pages/email-console/Campaigns';
import EmailSenders from './pages/email-console/Senders';
import EmailInbox from './pages/email-console/Inbox';
import Support from './pages/Support';
import SettingsProfile from './pages/settings/Profile';
import SettingsSSHKeys from './pages/settings/SSHKeys';
import SettingsGPGKeys from './pages/settings/GPGKeys';
import PipelineDashboardLayout from './components/Layout/PipelineDashboardLayout';
import PipelineOverview from './pages/pipelines/PipelineOverview';
import PipelineGraph from './pages/pipelines/PipelineGraph';
import PipelineSteps from './pages/pipelines/PipelineSteps';
import PipelineContainers from './pages/pipelines/PipelineContainers';
import PipelineLogs from './pages/pipelines/PipelineLogs';
import PipelineArtifacts from './pages/pipelines/PipelineArtifacts';
import PipelineReports from './pages/pipelines/PipelineReports';
import PipelineMetrics from './pages/pipelines/PipelineMetrics';
import PipelineSettings from './pages/pipelines/PipelineSettings';
import {
  Account as SettingsAccount,
  Security as SettingsSecurity,
  AccessTokens as SettingsAccessTokens,
  Sessions as SettingsSessions,
  Notifications as SettingsNotifications,
} from './pages/settings/Placeholders';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public + Layout Routes */}
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="software" element={<Software />} />
            <Route path="solutions" element={<Solutions />} />
            <Route path="industries" element={<Industries />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="infrastructure" element={<Infrastructure />} />
            <Route path="portfolio" element={<Navigate to="/infrastructure" replace />} />
            <Route path="infrastructure/:id" element={<ProjectDetail />} />
            <Route path="portfolio/:id" element={<Navigate to="/infrastructure" replace />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="support" element={<Support />} />
            <Route path="help" element={<FAQ />} />
            <Route path="faq" element={<FAQ />} />

            {/* Lab removed — redirect to home */}
            <Route path="lab/*" element={<Navigate to="/" replace />} />

            {/* Platform capability pages */}
            <Route path="platform/networking" element={<Networking />} />
            <Route path="platform/security"   element={<PlatformSecurity />} />

            {/* Company Pages */}
            <Route path="careers" element={<Careers />} />
            <Route path="government" element={<GovernmentContracting />} />
            <Route path="capabilities" element={<CapabilitiesStatement />} />

            {/* Platform Hub */}
            <Route path="platform" element={<Platform />} />

            {/* Trust & Compliance */}
            <Route path="security" element={<SecurityCompliance />} />
            <Route path="data-protection" element={<DataProtection />} />

            {/* Legal */}
            <Route path="legal" element={<Legal />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />

            {/* Corporate Solutions */}
            <Route path="enterprise-software" element={<EnterpriseSoftware />} />
            <Route path="ai-automation" element={<AIAutomation />} />
            <Route path="cloud-engineering" element={<CloudEngineering />} />
            <Route path="devops-security" element={<DevOpsSecurity />} />
            <Route path="case-studies" element={<CaseStudies />} />

            {/* Community Platform — Public */}
            <Route path="community" element={<CommunityHome />} />
            <Route path="community/discussions" element={<Discussions />} />
            <Route path="community/discussions/:category" element={<Discussions />} />
            <Route path="community/tutorials" element={<Tutorials />} />
            <Route path="community/announcements" element={<Announcements />} />
            <Route path="community/rules" element={<CommunityRules />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Portal />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          {/* Developer Dashboard — Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="projects" element={<DashboardProjects />} />
              <Route path="workspaces" element={<DashboardWorkspaces />} />
              <Route path="pipelines" element={<DashboardPipelines />} />
              <Route path="environments" element={<DashboardEnvironments />} />
              <Route path="registries" element={<DashboardRegistries />} />
              <Route path="monitoring" element={<DashboardMonitoring />} />
              <Route path="support" element={<DashboardSupport />} />
            </Route>
          </Route>

          {/* Pipeline Console (Dashboard 2) — Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/pipelines/:pipelineId" element={<PipelineDashboardLayout />}>
              <Route index element={<PipelineOverview />} />
              <Route path="graph" element={<PipelineGraph />} />
              <Route path="steps" element={<PipelineSteps />} />
              <Route path="containers" element={<PipelineContainers />} />
              <Route path="logs" element={<PipelineLogs />} />
              <Route path="artifacts" element={<PipelineArtifacts />} />
              <Route path="reports" element={<PipelineReports />} />
              <Route path="metrics" element={<PipelineMetrics />} />
              <Route path="settings" element={<PipelineSettings />} />
            </Route>
          </Route>

          {/* Developer Settings — Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="/settings/profile" replace />} />
              <Route path="profile"       element={<SettingsProfile />} />
              <Route path="account"       element={<SettingsAccount />} />
              <Route path="security"      element={<SettingsSecurity />} />
              <Route path="ssh-keys"      element={<SettingsSSHKeys />} />
              <Route path="gpg-keys"      element={<SettingsGPGKeys />} />
              <Route path="access-tokens" element={<SettingsAccessTokens />} />
              <Route path="sessions"      element={<SettingsSessions />} />
              <Route path="notifications" element={<SettingsNotifications />} />
            </Route>
          </Route>

          {/* Operational Control — Staff Only */}
          <Route element={<StaffRoute />}>
            <Route path="/ops" element={<OpsLayout />}>
              <Route index element={<OpsOverview />} />
              <Route path="services"    element={<OpsServices />} />
              <Route path="logs"        element={<OpsLogs />} />
              <Route path="security"    element={<OpsSecurity />} />
              <Route path="resources"   element={<OpsResources />} />
              <Route path="pipelines"   element={<OpsPipelines />} />
              <Route path="models"      element={<OpsModels />} />
              <Route path="environments" element={<OpsEnvironments />} />
              <Route path="incidents"   element={<OpsIncidents />} />
              <Route path="audit"       element={<OpsAudit />} />
            </Route>
          </Route>

          {/* Email Console — Staff Only */}
          <Route element={<StaffRoute />}>
            <Route path="/email-console" element={<EmailConsoleLayout />}>
              <Route index element={<EmailOverview />} />
              <Route path="inbox"     element={<EmailInbox />} />
              <Route path="marketing" element={<EmailMarketing />} />
              <Route path="campaigns" element={<EmailCampaigns />} />
              <Route path="templates" element={<EmailTemplates />} />
              <Route path="logs"      element={<EmailLogs />} />
              <Route path="domains"   element={<EmailDomains />} />
              <Route path="smtp"      element={<EmailSMTP />} />
              <Route path="senders"   element={<EmailSenders />} />
            </Route>
          </Route>

          {/* Admin Console — Staff Only */}
          <Route element={<StaffRoute />}>
            <Route path="/admin-console" element={<AdminLayout />}>
              <Route index element={<AdminUsers />} />
              <Route path="roles"    element={<AdminRoles />} />
              <Route path="config"   element={<AdminConfig />} />
              <Route path="security" element={<AdminSecurity />} />
              <Route path="audit"    element={<AdminAudit />} />
              <Route path="billing"  element={<AdminBilling />} />
              <Route path="api"      element={<AdminAPI />} />
              <Route path="email" element={<AdminEmail />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="activity" element={<AdminActivity />} />
              <Route path="features"   element={<AdminFeatures />} />
              <Route path="campaigns"  element={<AdminCampaigns />} />
              <Route path="support"    element={<AdminSupport />} />
            </Route>
          </Route>

          {/* Support Console — Staff Only */}
          <Route element={<StaffRoute />}>
            <Route path="/support-console" element={<SupportConsoleLayout />}>
              <Route index element={<SupportInbox />} />
              <Route path="escalated" element={<SupportEscalated />} />
              <Route path="pending"   element={<SupportPending />} />
              <Route path="resolved"  element={<SupportResolved />} />
              <Route path="overview"  element={<SupportOverview />} />
            </Route>
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
