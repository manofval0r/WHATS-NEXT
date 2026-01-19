import { useState, useEffect } from 'react';
import api from '../api';

/**
 * Custom hook to fetch profile data
 * Shared between Profile.jsx and ProfilePageV2.jsx to avoid duplication
 * @param {string} username - Username to fetch profile for (if null, uses current user)
 * @returns {Object} { profile, loading, error, refetch }
 */
export const useProfileData = (username = null) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      let endpoint;
      if (username) {
        // Fetch specific user's profile
        endpoint = `/api/users/${username}/profile/`;
      } else {
        // Fetch current user's profile
        endpoint = '/api/profile/';
      }

      const response = await api.get(endpoint);
      setProfile(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  return { profile, loading, error, refetch: fetchProfile };
};
