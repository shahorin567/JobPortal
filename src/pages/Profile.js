import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const { currentUser, userProfile, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    fullName: '',
    title: '',
    bio: '',
    skills: '',
    location: '',
    phone: '',
    website: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load user data
  useEffect(() => {
    if (currentUser && userProfile) {
      setProfileData({
        fullName: currentUser.displayName || '',
        title: userProfile.title || '',
        bio: userProfile.bio || '',
        skills: userProfile.skills || '',
        location: userProfile.location || '',
        phone: userProfile.phone || '',
        website: userProfile.website || ''
      });
      
      if (currentUser.photoURL) {
        setImagePreview(currentUser.photoURL);
      }
    }
  }, [currentUser, userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
      setPhotoUrlInput(''); // clear URL if a file is chosen
    }
  };

  // Allow setting photo by URL
  const handleApplyPhotoUrl = () => {
    if (!photoUrlInput) return;
    // set preview immediately; actual save happens on submit
    setImagePreview(photoUrlInput);
    setProfileImage(null); // prefer URL over file if provided
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update profile in Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: profileData.fullName
      });

      // Update profile in Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        fullName: profileData.fullName,
        title: profileData.title,
        bio: profileData.bio,
        skills: profileData.skills,
        location: profileData.location,
        phone: profileData.phone,
        website: profileData.website,
        updatedAt: new Date()
      });

      // Upload profile image if selected (file upload)
      if (profileImage) {
        const storageRef = ref(storage, `profile-images/${currentUser.uid}`);
        await uploadBytes(storageRef, profileImage);
        const photoURL = await getDownloadURL(storageRef);
        
        // Update photoURL in Auth
        await updateProfile(auth.currentUser, {
          photoURL: photoURL
        });
        
        // Update photoURL in Firestore
        await updateDoc(userDocRef, {
          photoURL: photoURL
        });
      } else if (photoUrlInput) {
        // If user provided a direct URL, save it directly (no upload)
        await updateProfile(auth.currentUser, { photoURL: photoUrlInput });
        await updateDoc(userDocRef, { photoURL: photoUrlInput });
      }

      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || !userProfile) {
    return <div className="profile-container">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Your Profile</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="profile-image-section">
            <div className="profile-image-container">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="profile-image" />
              ) : (
                <div className="profile-image-placeholder">
                  {profileData.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-image-upload">
              
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <div className="photo-url-row">
                <input
                  type="url"
                  placeholder="Paste image URL (https://...)"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  className="photo-url-input"
                />
                <button
                  type="button"
                  className="upload-button apply-url-btn"
                  onClick={handleApplyPhotoUrl}
                >
                  Use URL
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={profileData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Professional Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={profileData.title}
              onChange={handleChange}
              placeholder="e.g. Software Engineer"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={profileData.skills}
              onChange={handleChange}
              placeholder="e.g. JavaScript, React, Node.js"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={profileData.location}
              onChange={handleChange}
              placeholder="e.g. New York, NY"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
              placeholder="e.g. +1 (555) 123-4567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={profileData.website}
              onChange={handleChange}
              placeholder="e.g. https://yourportfolio.com"
            />
          </div>

          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
