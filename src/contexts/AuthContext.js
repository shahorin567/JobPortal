import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Clear any error messages
  const clearError = () => setError('');

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      clearError();
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Register a new user
  const register = async (email, password, fullName) => {
    try {
      clearError();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: fullName
      });
      
      // Store additional user data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName,
        email,
        createdAt: new Date(),
        role: 'user'
      });
      
      return userCredential;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    try {
      clearError();
      return await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Fetch user profile data from Firestore
  const fetchUserProfile = async (user) => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      } else {
        // Create a default user profile if none exists
        try {
          await setDoc(doc(db, "users", user.uid), {
            fullName: user.displayName || '',
            email: user.email,
            createdAt: new Date(),
            role: 'user'
          });
          
          setUserProfile({
            fullName: user.displayName || '',
            email: user.email,
            createdAt: new Date(),
            role: 'user'
          });
        } catch (createErr) {
          console.error("Error creating user profile:", createErr);
          // Use a fallback profile if Firestore access fails
          setUserProfile({
            fullName: user.displayName || '',
            email: user.email,
            role: 'user'
          });
        }
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      // Use a fallback profile if Firestore access fails
      setUserProfile({
        fullName: user.displayName || '',
        email: user.email,
        role: 'user'
      });
    }
  };

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      fetchUserProfile(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Check if user has a specific role
  const hasRole = (requiredRole) => {
    if (!currentUser || !userProfile) return false;
    return userProfile.role === requiredRole;
  };

  // Check if user is an admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Check if user is an employer
  const isEmployer = () => {
    return hasRole('employer');
  };

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    try {
      clearError();
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        role: newRole,
        updatedAt: new Date()
      });
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Context value
  const value = {
    currentUser,
    userProfile,
    isAuthenticated: !!currentUser,
    login,
    register,
    resetPassword,
    logout,
    error,
    clearError,
    hasRole,
    isAdmin,
    isEmployer,
    updateUserRole,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
