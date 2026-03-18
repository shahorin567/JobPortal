import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import './JobApplicationModal.css';

function JobApplicationModal({ job, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [cvUrl, setCvUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cvUrl.trim()) {
      setError('Please enter your CV URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(cvUrl);
    } catch (e) {
      setError('Please enter a valid URL');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create application document in Firestore
      const applicationData = {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        applicantId: currentUser ? currentUser.uid : null,
        applicantName: currentUser ? currentUser.displayName : null,
        applicantEmail: currentUser ? currentUser.email : null,
        cvUrl: cvUrl,
        coverLetter: coverLetter,
        status: 'pending',
        appliedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'applications'), applicationData);
      
      // If user is logged in, add this job to their applied jobs
      if (currentUser) {
        await addDoc(collection(db, 'users', currentUser.uid, 'appliedJobs'), {
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          appliedAt: serverTimestamp()
        });
      }
      
      onSuccess();
    } catch (err) {
      setError('Failed to submit application: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Apply for {job.title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="cvUrl">CV / Resume URL <span className="required">*</span></label>
              <input
                type="text"
                id="cvUrl"
                placeholder="Paste the URL to your CV/Resume (Google Drive, Dropbox, etc.)"
                value={cvUrl}
                onChange={(e) => setCvUrl(e.target.value)}
                required
              />
              <small>Paste a link to your CV/Resume from Google Drive, Dropbox, or other cloud storage</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="coverLetter">Cover Letter (Optional)</label>
              <textarea
                id="coverLetter"
                placeholder="Write a brief cover letter or note to the employer"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-button" 
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JobApplicationModal;
