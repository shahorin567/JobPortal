import React from 'react';
import './StaticPage.css';

function Privacy() {
  return (
    <div className="static-page-container">
      <div className="static-page">
        <h1>Privacy Policy</h1>
        <p>
          Your privacy is important to us. This policy explains how we collect, use, and protect
          your personal information when using Career Nest.
        </p>
        <h2>Information We Collect</h2>
        <ul>
          <li>Account information (name, email)</li>
          <li>Profile data (education, experience)</li>
          <li>Usage data for improving our services</li>
        </ul>
        <h2>Contact</h2>
        <p>
          For any privacy-related questions, contact privacy@careernest.example.
        </p>
      </div>
    </div>
  );
}

export default Privacy;
