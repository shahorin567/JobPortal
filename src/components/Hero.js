import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

function Hero() {
  const [jobQuery, setJobQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // Use URLSearchParams to create query string
    const params = new URLSearchParams();
    
    if (jobQuery) {
      params.append('query', jobQuery);
    }
    
    if (locationQuery) {
      params.append('location', locationQuery);
    }
    
    // Navigate to jobs page with search parameters
    navigate({
      pathname: '/jobs',
      search: params.toString()
    });
  };

  return (
    <section className="hero" id="home">
      <div className="container hero-container">
        <div className="hero-content">
          <h1>Find the<br />job that fits your life</h1>
          <p>
            A comprehensive University Job Portal, connecting students and alumni with employers.
          </p>
          <form onSubmit={handleSearch} className="search-box">
            <input 
              type="text" 
              placeholder="Job Title or Company Name" 
              className="search-input"
              value={jobQuery}
              onChange={(e) => setJobQuery(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Location" 
              className="search-input"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary search-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </button>
          </form>
        </div>
        <div className="hero-image">
          {/* We would typically use an actual image here */}
          <div className="hero-illustration"></div>
        </div>
      </div>
    </section>
  );
}

export default Hero;