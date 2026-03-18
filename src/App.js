import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import PostJob from './pages/PostJob';
import Jobs from './pages/Jobs';
import About from './pages/About';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute, EmployerRoute } from './components/ProtectedRoute';

// Unauthorized page component
const UnauthorizedPage = () => (
  <div className="unauthorized-container">
    <div className="unauthorized-content">
      <h2>Access Denied</h2>
      <p>You don't have permission to access this page.</p>
      <a href="/" className="back-link">Back to Home</a>
    </div>
  </div>
);

// Home page component
const HomePage = () => (
  <>
    <Hero />
    <Categories />
    <HowItWorks />
  </>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Header />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            
            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/users" element={<Dashboard />} />
              <Route path="/admin/jobs" element={<Dashboard />} />
            </Route>
            
            {/* Employer routes */}
            <Route element={<EmployerRoute />}>
              <Route path="/employer/post-job" element={<Dashboard />} />
              <Route path="/employer/manage-jobs" element={<Dashboard />} />
            </Route>
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
