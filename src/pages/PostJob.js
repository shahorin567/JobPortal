import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './PostJob.css';

function PostJob() {
  const { currentUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: '',
    benefits: '',
    contactEmail: '',
    applicationDeadline: ''
  });

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData({
      ...jobData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Add job to Firestore
      await addDoc(collection(db, 'jobs'), {
        ...jobData,
        postedBy: currentUser ? currentUser.uid : 'anonymous',
        postedByName: currentUser ? (currentUser.displayName || currentUser.email) : 'Anonymous',
        postedAt: new Date(),
        status: 'active',
        applicationsCount: 0
      });

      setSuccess('Job posted successfully!');
      
      // Reset form
      setJobData({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        salary: '',
        description: '',
        requirements: '',
        benefits: '',
        contactEmail: '',
        applicationDeadline: ''
      });

      // Redirect to jobs page after 2 seconds
      setTimeout(() => {
        navigate('/jobs');
      }, 2000);

    } catch (err) {
      setError('Failed to post job: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-container">
      <div className="post-job-card">
        <h2>Post a Job</h2>
        <p className="subtitle">Share your job opportunity with talented professionals</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Job Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={jobData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="company">Company *</label>
              <input
                type="text"
                id="company"
                name="company"
                value={jobData.company}
                onChange={handleChange}
                required
                placeholder="e.g. Tech Corp"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={jobData.location}
                onChange={handleChange}
                required
                placeholder="e.g. New York, NY or Remote"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Job Type *</label>
              <select
                id="type"
                name="type"
                value={jobData.type}
                onChange={handleChange}
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salary">Salary Range</label>
              <input
                type="text"
                id="salary"
                name="salary"
                value={jobData.salary}
                onChange={handleChange}
                placeholder="e.g. ৳80,000 - ৳120,000 or Negotiable"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email *</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={jobData.contactEmail}
                onChange={handleChange}
                required
                placeholder="hr@company.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="applicationDeadline">Application Deadline</label>
            <input
              type="date"
              id="applicationDeadline"
              name="applicationDeadline"
              value={jobData.applicationDeadline}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              name="description"
              value={jobData.description}
              onChange={handleChange}
              required
              placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
              rows="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements *</label>
            <textarea
              id="requirements"
              name="requirements"
              value={jobData.requirements}
              onChange={handleChange}
              required
              placeholder="List the required skills, experience, and qualifications..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="benefits">Benefits & Perks</label>
            <textarea
              id="benefits"
              name="benefits"
              value={jobData.benefits}
              onChange={handleChange}
              placeholder="Health insurance, flexible hours, remote work, etc..."
              rows="3"
            />
          </div>

          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? 'Posting Job...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostJob;
