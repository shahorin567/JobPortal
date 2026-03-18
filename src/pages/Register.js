import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { register, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setValidationError('');
    clearError();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    if (!formData.agreeTerms) {
      setValidationError('You must agree to the Terms and Conditions');
      return;
    }
    
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      // Register user using the AuthContext
      await register(
        formData.email, 
        formData.password,
        formData.fullName
      );
      
      // Redirect to login page after successful registration
      navigate('/login');
    } catch (error) {
      // Error is handled in the AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {showTerms ? (
        <div className="terms-modal">
          <div className="terms-content">
            <h2>Terms and Conditions</h2>
            <div className="terms-text">
              <h3>1. Acceptance of Terms</h3>
              <p>By registering for an account on Job Portal, you agree to be bound by these Terms and Conditions.</p>
              
              <h3>2. User Registration</h3>
              <p>You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
              
              <h3>3. User Conduct</h3>
              <p>You agree not to use the service to:</p>
              <ul>
                <li>Post false, inaccurate, misleading, defamatory, or libelous content</li>
                <li>Distribute viruses or any other technologies that may harm Job Portal or the interests of other users</li>
                <li>Impose an unreasonable load on our infrastructure or interfere with the proper working of Job Portal</li>
                <li>Copy, modify, or distribute content from the site or other users' content</li>
              </ul>
              
              <h3>4. Privacy</h3>
              <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.</p>
              
              <h3>5. Termination</h3>
              <p>We reserve the right to terminate or suspend your account at any time for any reason without notice.</p>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowTerms(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
      
      <div className="register-card">
        <h2>Create an Account</h2>
        
        {(validationError || error) && (
          <div className="error-message">
            {validationError || error}
          </div>
        )}
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>
          
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
            />
            <label htmlFor="agreeTerms">
              I agree to the <button 
                type="button" 
                className="btn-link"
                onClick={() => setShowTerms(true)}
              >
                Terms and Conditions
              </button>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary register-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
          
          <div className="form-footer">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
