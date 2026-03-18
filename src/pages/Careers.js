import React from 'react';
import './StaticPage.css';

function Careers() {
  return (
    <div className="static-page-container">
      <div className="static-page">
        <h1>Careers at Career Nest</h1>
        <p>
          We're building the future of university job placement. If you're passionate about
          education and hiring tech, we'd love to hear from you.
        </p>
        <h2>Open Roles</h2>
        <ul>
          <li>Frontend Engineer (React)</li>
          <li>Backend Engineer (Node/Firebase)</li>
          <li>Product Designer</li>
        </ul>
        <p>
          Send your resume to careers@careernest.example and tell us why you'd be a great fit.
        </p>
      </div>
    </div>
  );
}

export default Careers;
