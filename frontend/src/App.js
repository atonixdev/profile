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
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="portfolio/:id" element={<ProjectDetail />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogDetail />} />
            <Route path="contact" element={<Contact />} />
<<<<<<< HEAD
            <Route path="cv" element={<CV />} />
=======
            <Route path="help" element={<FAQ />} />
            <Route path="faq" element={<FAQ />} />
>>>>>>> aaa2a14c636db724a5b4227059ddfc54fd5501ff
          </Route>

          {/* Auth Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Community Routes */}
          <Route element={<Layout><ProtectedRoute /></Layout>}>
            <Route path="community" element={<CommunityDashboard />} />
            <Route path="community/discussions" element={<Discussions />} />
            <Route path="community/members" element={<Members />} />
            <Route path="community/events" element={<Events />} />
            <Route path="community/resources" element={<Resources />} />
          </Route>

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
