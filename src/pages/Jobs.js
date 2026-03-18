import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import JobApplicationModal from '../components/JobApplicationModal';
import './Jobs.css';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  
  const { currentUser } = useAuth();

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryParam = params.get('query');
    const locationParam = params.get('location');
    const categoryParam = params.get('category');
    
    if (queryParam) {
      setSearchTerm(queryParam);
    }
    
    if (locationParam) {
      setLocationFilter(locationParam);
    }
    
    if (categoryParam) {
      // Handle category filtering separately if needed
    }
  }, [location.search]);

  // Fetch jobs from Firestore
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(
          collection(db, 'jobs'),
          where('status', '==', 'active'),
          orderBy('postedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setJobs(jobsData);
        setFilteredJobs(jobsData);
      } catch (err) {
        setError('Failed to load jobs: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch user's saved jobs
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (currentUser) {
        try {
          const userSavedJobsRef = collection(db, 'users', currentUser.uid, 'savedJobs');
          const savedJobsSnapshot = await getDocs(userSavedJobsRef);
          const savedJobIds = savedJobsSnapshot.docs.map(doc => doc.data().jobId);
          setSavedJobs(savedJobIds);
        } catch (err) {
          console.error('Error fetching saved jobs:', err);
        }
      }
    };
    
    fetchSavedJobs();
  }, [currentUser]);
  
  // Filter jobs based on search criteria
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, locationFilter, typeFilter]);

  const formatDate = (date) => {
    if (date && date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    return deadlineDate < new Date();
  };

  if (loading) {
    return (
      <div className="jobs-container">
        <div className="loading">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1>Job Opportunities</h1>
        <p>Find your next career opportunity</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Search and Filter Section */}
      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search jobs, companies, or keywords..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Update URL parameter without full page reload
              const params = new URLSearchParams(location.search);
              if (e.target.value) {
                params.set('query', e.target.value);
              } else {
                params.delete('query');
              }
              navigate({ search: params.toString() }, { replace: true });
            }}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <input
            type="text"
            placeholder="Location"
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              // Update URL parameter without full page reload
              const params = new URLSearchParams(location.search);
              if (e.target.value) {
                params.set('location', e.target.value);
              } else {
                params.delete('location');
              }
              navigate({ search: params.toString() }, { replace: true });
            }}
            className="filter-input"
          />
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
            <option value="Internship">Internship</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Jobs List */}
      <div className="jobs-list">
        {filteredJobs.length === 0 ? (
          <div className="no-jobs">
            <h3>No jobs found</h3>
            <p>Try adjusting your search criteria or check back later for new opportunities.</p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <div className="job-title-company">
                  <h3 className="job-title">{job.title}</h3>
                  <p className="company-name">{job.company}</p>
                </div>
                <div className="job-meta">
                  <span className={`job-type ${job.type.toLowerCase().replace('-', '')}`}>
                    {job.type}
                  </span>
                </div>
              </div>

              <div className="job-details">
                <div className="job-info">
                  <span className="location">📍 {job.location}</span>
                  {job.salary && <span className="salary">💰 {job.salary}</span>}
                  <span className="posted-date">
                    📅 Posted {formatDate(job.postedAt)}
                  </span>
                </div>
              </div>

              <div className="job-description">
                <p>{job.description.substring(0, 200)}...</p>
              </div>

              <div className="job-requirements">
                <h4>Requirements:</h4>
                <p>{job.requirements.substring(0, 150)}...</p>
              </div>

              {job.benefits && (
                <div className="job-benefits">
                  <h4>Benefits:</h4>
                  <p>{job.benefits.substring(0, 100)}...</p>
                </div>
              )}

              <div className="job-footer">
                <div className="job-deadline">
                  {job.applicationDeadline && (
                    <span className={isDeadlinePassed(job.applicationDeadline) ? 'deadline-passed' : 'deadline-active'}>
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <div className="job-actions">
                  <button 
                    className="apply-button"
                    onClick={() => handleApplyClick(job)}
                  >
                    Apply Now
                  </button>
                  <button 
                    className={`save-button ${isSaved(job.id) ? 'saved' : ''}`}
                    onClick={() => handleSaveJob(job)}
                    title={isSaved(job.id) ? 'Remove from saved jobs' : 'Save this job'}
                  >
                    <i className={`fas ${isSaved(job.id) ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {showApplicationModal && selectedJob && (
        <JobApplicationModal 
          job={selectedJob}
          onClose={() => setShowApplicationModal(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
  
  // Check if a job is saved
  function isSaved(jobId) {
    return savedJobs.includes(jobId);
  }
  
  // Handle apply button click
  function handleApplyClick(job) {
    setSelectedJob(job);
    setShowApplicationModal(true);
  }
  
  // Handle successful application submission
  function handleApplicationSuccess() {
    setShowApplicationModal(false);
    alert('Your application has been submitted successfully!');
  }
  
  // Handle save job
  async function handleSaveJob(job) {
    if (!currentUser) {
      alert('Please log in to save jobs');
      return;
    }
    
    try {
      const jobRef = doc(db, 'users', currentUser.uid, 'savedJobs', job.id);
      const jobDoc = await getDoc(jobRef);
      
      if (jobDoc.exists()) {
        // Remove job from saved jobs
        await setDoc(jobRef, { deleted: true }, { merge: true });
        setSavedJobs(savedJobs.filter(id => id !== job.id));
      } else {
        // Save the job
        await setDoc(jobRef, {
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          savedAt: new Date().toISOString()
        });
        setSavedJobs([...savedJobs, job.id]);
      }
    } catch (err) {
      console.error('Error saving/unsaving job:', err);
      alert('Failed to save job. Please try again.');
    }
  }
}

export default Jobs;
