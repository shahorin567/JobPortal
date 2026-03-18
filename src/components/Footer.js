import React, { useState } from 'react';
import './Footer.css';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setMessage(null);

    const isValid = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email);
    if (!isValid) {
      setMessage({ type: 'error', text: 'Please enter a valid email.' });
      return;
    }
    try {
      setSubmitting(true);
      await addDoc(collection(db, 'newsletters'), {
        email: email.trim().toLowerCase(),
        createdAt: serverTimestamp()
      });
      setEmail('');
      setMessage({ type: 'success', text: 'Subscribed! Thanks for joining.' });
    } catch (err) {
      console.error('Newsletter subscribe error:', err);
      setMessage({ type: 'error', text: 'Subscription failed. Try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        {/* Top */}
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/icon.png" alt="Career Nest logo" className="brand-logo" />
            <div>
              <h3 className="brand-name">Career Nest</h3>
              <p className="brand-tag">Find jobs, post jobs, hire talent.</p>
            </div>
          </div>

          <div className="footer-columns">
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><Link to="/jobs">Browse Jobs</Link></li>
                <li><Link to="/post-job">Post a Job</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/privacy">Privacy</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Stay up to date</h4>

              <div className="social-icons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
                  <i className="fab fa-github"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© {year} Career Nest. All rights reserved.</p>

        </div>
      </div>
    </footer>
  );
}

export default Footer;