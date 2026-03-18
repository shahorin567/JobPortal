import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import './Dashboard.css';

function Dashboard() {
  const { currentUser, userProfile, isAdmin, isEmployer, fetchUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // Stats for the dashboard
  const [stats, setStats] = useState({
    appliedJobs: 0,
    savedJobs: 0,
    viewedJobs: 0,
    notifications: 0
  });

  // Jobs data
  const [jobsFilter, setJobsFilter] = useState('applied');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [viewedJobs, setViewedJobs] = useState([

    {
      id: 1,
      title: 'Frontend Developer',
      company: 'Tech Solutions Inc.',
      location: 'Remote',
      postedDate: '2023-08-05',
      status: 'Applied'
    },
    {
      id: 2,
      title: 'UX Designer',
      company: 'Creative Minds',
      location: 'New York, NY',
      postedDate: '2023-08-03',
      status: 'Saved'
    },
    {
      id: 3,
      title: 'Backend Engineer',
      company: 'Data Systems',
      location: 'San Francisco, CA',
      postedDate: '2023-08-01',
      status: 'Viewed'
    }
  ]);

  // Mock data for employer dashboard (would be fetched from the database)
  const [postedJobs, setPostedJobs] = useState([
    {
      id: 101,
      title: 'Senior Developer',
      applications: 12,
      views: 145,
      status: 'Active',
      postedDate: '2023-07-28'
    },
    {
      id: 102,
      title: 'Project Manager',
      applications: 8,
      views: 98,
      status: 'Active',
      postedDate: '2023-08-02'
    }
  ]);

  // Mock data for admin dashboard (would be fetched from the database)
  const [adminStats, setAdminStats] = useState({
    totalUsers: 1250,
    totalJobs: 342,
    totalApplications: 2890,
    newUsersToday: 15
  });

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Always refresh profile data when Dashboard mounts
    fetchUserProfile(currentUser);
    
    // Fetch user's job data
    const fetchUserJobs = async () => {
      try {
        // Fetch applied jobs
        const appliedJobsRef = collection(db, 'users', currentUser.uid, 'appliedJobs');
        const appliedSnapshot = await getDocs(query(appliedJobsRef, orderBy('appliedAt', 'desc')));
        const appliedJobsData = await Promise.all(appliedSnapshot.docs.map(async (appliedDoc) => {
          const jobData = appliedDoc.data();
          // fetch full job document from jobs collection
          const fullJobDoc = await getDoc(doc(db, 'jobs', jobData.jobId));
          const fullJob = fullJobDoc.exists() ? fullJobDoc.data() : null;
          
          return {
            id: appliedDoc.id,
            jobId: jobData.jobId,
            title: jobData.jobTitle || (fullJob ? fullJob.title : 'Job no longer available'),
            company: jobData.company || (fullJob ? fullJob.company : ''),
            location: fullJob ? fullJob.location : '',
            appliedDate: jobData.appliedAt ? new Date(jobData.appliedAt.toDate()).toLocaleDateString() : 'Unknown date',
            status: 'Applied'
          };
        }));
        
        setAppliedJobs(appliedJobsData);
        
        // Fetch saved jobs
        const savedJobsRef = collection(db, 'users', currentUser.uid, 'savedJobs');
        const savedSnapshot = await getDocs(savedJobsRef);
        const savedJobsData = await Promise.all(savedSnapshot.docs
          .filter(d => !d.data().deleted)
          .map(async (savedDoc) => {
          const jobData = savedDoc.data();
          const fullJobDoc = await getDoc(doc(db, 'jobs', jobData.jobId));
          const fullJob = fullJobDoc.exists() ? fullJobDoc.data() : null;
          
          return {
            id: savedDoc.id,
            jobId: jobData.jobId,
            title: jobData.jobTitle || (fullJob ? fullJob.title : 'Job no longer available'),
            company: jobData.company || (fullJob ? fullJob.company : ''),
            location: fullJob ? fullJob.location : '',
            savedDate: jobData.savedAt ? new Date(jobData.savedAt).toLocaleDateString() : 'Unknown date',
            status: 'Saved'
          };
        }));
        
        setSavedJobs(savedJobsData);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          appliedJobs: appliedJobsData.length,
          savedJobs: savedJobsData.length
        }));
      } catch (error) {
        console.error("Error fetching user's jobs:", error);
      }
    };
    
    fetchUserJobs();
  }, [currentUser, navigate]);

  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Refresh profile data when switching to the profile tab
    if (tab === 'profile' && currentUser) {
      fetchUserProfile(currentUser);
    }
  };
  
  // Handle jobs filter changes
  const handleJobsFilterChange = (filter) => {
    setJobsFilter(filter);
  };

  // Render different content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'jobs':
        return renderJobs();
      case 'profile':
        return renderProfilePreview();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  // Render the overview tab content
  const renderOverview = () => {
    // Render different overview based on user role
    if (isAdmin()) {
      return renderAdminOverview();
    } else if (isEmployer()) {
      return renderEmployerOverview();
    } else {
      return renderUserOverview();
    }
  };

  // Render the admin overview
  const renderAdminOverview = () => {
    return (
      <div className="dashboard-content">
        <h2>Admin Dashboard</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{adminStats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-card">
            <h3>{adminStats.totalJobs}</h3>
            <p>Total Jobs</p>
          </div>
          <div className="stat-card">
            <h3>{adminStats.totalApplications}</h3>
            <p>Applications</p>
          </div>
          <div className="stat-card">
            <h3>{adminStats.newUsersToday}</h3>
            <p>New Users Today</p>
          </div>
        </div>

        <div className="admin-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-button">Manage Users</button>
            <button className="action-button">Review Jobs</button>
            <button className="action-button">System Settings</button>
            <button className="action-button">View Reports</button>
          </div>
        </div>
      </div>
    );
  };

  // Render the employer overview
  const renderEmployerOverview = () => {
    return (
      <div className="dashboard-content">
        <h2>Employer Dashboard</h2>
        
        <div className="employer-stats">
          <div className="stat-card">
            <h3>{postedJobs.length}</h3>
            <p>Active Jobs</p>
          </div>
          <div className="stat-card">
            <h3>{postedJobs.reduce((sum, job) => sum + job.applications, 0)}</h3>
            <p>Total Applications</p>
          </div>
          <div className="stat-card">
            <h3>{postedJobs.reduce((sum, job) => sum + job.views, 0)}</h3>
            <p>Total Views</p>
          </div>
        </div>

        <div className="posted-jobs">
          <div className="section-header">
            <h3>Your Posted Jobs</h3>
            <button className="post-job-button">Post New Job</button>
          </div>
          
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Applications</th>
                <th>Views</th>
                <th>Status</th>
                <th>Posted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {postedJobs.map(job => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.applications}</td>
                  <td>{job.views}</td>
                  <td>
                    <span className={`status-badge ${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>{job.postedDate}</td>
                  <td>
                    <button className="table-action-btn">Edit</button>
                    <button className="table-action-btn">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render the regular user overview
  const renderUserOverview = () => {
    return (
      <div className="dashboard-content">
        <h2>Dashboard</h2>
        
        <div className="welcome-message">
          <h3>Welcome back, {currentUser?.displayName || 'User'}!</h3>
          <p>Here's what's happening with your job search</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.appliedJobs}</h3>
            <p>Applied Jobs</p>
          </div>
        
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          
          <div className="job-cards">
            {[...appliedJobs.slice(0, 3).map(j => ({ ...j, status: 'Applied' })),
              ...savedJobs.slice(0, 3).map(j => ({ ...j, status: 'Saved' }))].map(job => (
              <div className="job-card" key={job.id}>
                <div className="job-card-header">
                  <h4>{job.title}</h4>
                  <span className={`status-badge ${job.status.toLowerCase()}`}>
                    {job.status}
                  </span>
                </div>
                {job.company && <div className="job-card-company">{job.company}</div>}
                {job.location && <div className="job-card-location">{job.location}</div>}
                <div className="job-card-date">
                  {job.status === 'Applied' && job.appliedDate ? `Applied on ${job.appliedDate}` : ''}
                  {job.status === 'Saved' && job.savedDate ? `Saved on ${job.savedDate}` : ''}
                </div>
                <div className="job-card-actions">
                  <button className="job-action-btn">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render the jobs tab content
  const renderJobs = () => {
    return (
      <div className="dashboard-content">
        <h2>Your Jobs</h2>
        
        <div className="jobs-filter">
          <button 
            className={`filter-btn ${jobsFilter === 'applied' ? 'active' : ''}`}
            onClick={() => handleJobsFilterChange('applied')}
          >
            Applied ({appliedJobs.length})
          </button>
          <button 
            className={`filter-btn ${jobsFilter === 'saved' ? 'active' : ''}`}
            onClick={() => handleJobsFilterChange('saved')}
          >
            Saved ({savedJobs.length})
          </button>
          <button 
            className={`filter-btn ${jobsFilter === 'viewed' ? 'active' : ''}`}
            onClick={() => handleJobsFilterChange('viewed')}
          >
            Viewed ({viewedJobs.length})
          </button>
        </div>
        
        <div className="job-list">
          {jobsFilter === 'applied' && appliedJobs.map(job => (
            <div className="job-item" key={job.id}>
              <div className="job-details">
                <h3>{job.title}</h3>
                <p className="company">{job.company}</p>
                {job.location && <p className="location">{job.location}</p>}
                <p className="date">Applied on {job.appliedDate}</p>
              </div>
              <div className="job-status">
                <span className="status-badge applied">
                  Applied
                </span>
              </div>
              <div className="job-actions">
                <Link to={`/jobs?id=${job.jobId}`} className="job-btn">View Job</Link>
              </div>
            </div>
          ))}

          {jobsFilter === 'saved' && savedJobs.map(job => (
            <div className="job-item" key={job.id}>
              <div className="job-details">
                <h3>{job.title}</h3>
                <p className="company">{job.company}</p>
                {job.location && <p className="location">{job.location}</p>}
                <p className="date">Saved on {job.savedDate}</p>
              </div>
              <div className="job-status">
                <span className="status-badge saved">
                  Saved
                </span>
              </div>
              <div className="job-actions">
                <Link to={`/jobs?id=${job.jobId}`} className="job-btn">View Job</Link>
                <Link to={`/jobs?id=${job.jobId}&apply=true`} className="job-btn apply">Apply</Link>
              </div>
            </div>
          ))}

          {jobsFilter === 'viewed' && viewedJobs.map(job => (
            <div className="job-item" key={job.id}>
              <div className="job-details">
                <h3>{job.title}</h3>
                <p className="company">{job.company}</p>
                {job.location && <p className="location">{job.location}</p>}
                <p className="date">Viewed on {job.viewedDate}</p>
              </div>
              <div className="job-status">
                <span className="status-badge viewed">
                  Viewed
                </span>
              </div>
              <div className="job-actions">
                <Link to={`/jobs?id=${job.jobId}`} className="job-btn">View Job</Link>
                <Link to={`/jobs?id=${job.jobId}&apply=true`} className="job-btn apply">Apply</Link>
              </div>
            </div>
          ))}
          
          {((jobsFilter === 'applied' && appliedJobs.length === 0) ||
            (jobsFilter === 'saved' && savedJobs.length === 0) ||
            (jobsFilter === 'viewed' && viewedJobs.length === 0)) && (
            <div className="no-jobs-message">
              <p>You have no {jobsFilter} jobs.</p>
              <Link to="/jobs" className="browse-jobs-link">Browse Jobs</Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render the profile preview tab content
  const renderProfilePreview = () => {
    return (
      <div className="dashboard-content">
        <h2>Your Profile</h2>
        
        <div className="profile-preview">
          <div className="profile-header">
            <div className="profile-avatar">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {currentUser?.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h3>{currentUser?.displayName || 'User'}</h3>
              <p>{userProfile?.title || 'No title set'}</p>
              <p>{userProfile?.location || 'No location set'}</p>
            </div>
            <div className="profile-actions">
              <Link to="/profile" className="edit-profile-btn">
                Edit Profile
              </Link>
            </div>
          </div>
          
          <div className="profile-details">
            <div className="profile-section">
              <h4>About</h4>
              <p>{userProfile?.bio || 'No bio added yet.'}</p>
            </div>
            
            <div className="profile-section">
              <h4>Skills</h4>
              <p>{userProfile?.skills || 'No skills added yet.'}</p>
            </div>
            
            <div className="profile-section">
              <h4>Contact</h4>
              <p>Email: {currentUser?.email}</p>
              <p>Phone: {userProfile?.phone || 'No phone added'}</p>
              <p>Website: {userProfile?.website ? (
                <a href={userProfile.website} target="_blank" rel="noopener noreferrer">
                  {userProfile.website}
                </a>
              ) : 'No website added'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the settings tab content
  const renderSettings = () => {
    return (
      <div className="dashboard-content">
        <h2>Account Settings</h2>
        
        <div className="settings-section">
          <h3>Email Notifications</h3>
          <div className="setting-item">
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
            <div className="setting-info">
              <h4>Job Recommendations</h4>
              <p>Receive emails about jobs that match your profile</p>
            </div>
          </div>
          
          <div className="setting-item">
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
            <div className="setting-info">
              <h4>Application Updates</h4>
              <p>Receive emails when there are updates to your applications</p>
            </div>
          </div>
          
          <div className="setting-item">
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
            <div className="setting-info">
              <h4>Marketing Emails</h4>
              <p>Receive promotional emails and newsletters</p>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Privacy Settings</h3>
          <div className="setting-item">
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
            <div className="setting-info">
              <h4>Profile Visibility</h4>
              <p>Allow employers to view your profile</p>
            </div>
          </div>
          
          <div className="setting-item">
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
            <div className="setting-info">
              <h4>Resume Visibility</h4>
              <p>Allow employers to download your resume</p>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Account Management</h3>
          <div className="account-actions">
            <button className="account-btn">Change Password</button>
            <button className="account-btn danger">Delete Account</button>
          </div>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="user-info">
          <div className="user-avatar">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {currentUser.displayName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="user-details">
            <h3>{currentUser.displayName || 'User'}</h3>
            <p>{userProfile?.role || 'User'}</p>
          </div>
        </div>
        
        <nav className="dashboard-nav">
          <ul>
            <li 
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => handleTabChange('overview')}
            >
              <i className="fas fa-home"></i> Overview
            </li>
            <li 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => handleTabChange('profile')}
            >
              <i className="fas fa-user"></i> Profile
            </li>
          </ul>
        </nav>
      </div>
      
      <div className="dashboard-main">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default Dashboard;
