import React from 'react';
import './StaticPage.css';

function Contact() {
  return (
    <div className="static-page-container">
      <div className="static-page">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Reach us at:</p>
        <ul>
          <li>Email: support@careernest.example</li>
          <li>Phone: +1 (555) 123-4567</li>
          <li>Address: 123 University Ave, Suite 100, City, Country</li>
        </ul>
      </div>
    </div>
  );
}

export default Contact;
