import React from 'react';
import './HowItWorks.css';

function HowItWorks() {
  const steps = [
    {
      id: 1,
      icon: '👤',
      title: 'Create an Account',
      description: 'Post a job to tell us about your project. We\'ll quickly match you with the right freelancers find place best.'
    },
    {
      id: 2,
      icon: '🔍',
      title: 'Search Jobs',
      description: 'Post a job to tell us about your project. We\'ll quickly match you with the right freelancers find place best.'
    },
    {
      id: 3,
      icon: '🏆',
      title: 'Apply',
      description: 'Post a job to tell us about your project. We\'ll quickly match you with the right freelancers find place best.'
    }
  ];

  return (
    <section className="how-it-works section" id="how-it-works">
      <div className="container">
        <div className="section-title">
          <h2>How It Works?</h2>
          
        </div>
        
        <div className="steps-container">
          {steps.map((step) => (
            <div className="step-card" key={step.id}>
              <div className="step-icon">
                <span>{step.icon}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks; 