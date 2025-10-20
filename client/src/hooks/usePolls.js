import { useState, useEffect } from 'react';
import { BACKEND_URL } from '../utils/constants.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export const usePolls = (status = 'active', page = 1, limit = 10) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const { token } = useAuth();

  useEffect(() => {
    fetchPolls();
  }, [status, page, limit]);

  const fetchPolls = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        status,
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`${BACKEND_URL}/api/polls?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch polls: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setPolls(data.data.polls);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Error fetching polls:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPoll = async (pollData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/polls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(pollData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchPolls();
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const vote = async (pollId, optionIndex, signature, nonce) => {
    try {
      if (!pollId) {
        throw new Error('Poll ID is required');
      }

      const voteData = {
        optionIndex: optionIndex
      };

      // Add signature data if provided
      if (signature && nonce !== undefined) {
        voteData.signature = signature;
        voteData.nonce = nonce;
      }

      console.log('📤 Sending vote request to backend...');
      console.log('Request URL:', `${BACKEND_URL}/api/polls/${pollId}/vote`);
      console.log('Request Data:', voteData);
      console.log('Token available:', !!token);

      const response = await fetch(`${BACKEND_URL}/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(voteData),
      });

      console.log('📥 Received response, status:', response.status);

      // Parse the response regardless of status
      const data = await response.json();
      console.log('Backend response data:', data);

      if (!response.ok) {
        // Return the backend error message
        return { 
          success: false, 
          message: data.message || `HTTP error! status: ${response.status}` 
        };
      }

      if (data.success) {
        await fetchPolls();
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('❌ Error in vote function:', error);
      return { 
        success: false, 
        message: 'Network error occurred: ' + error.message 
      };
    }
  };

  const refetch = () => {
    fetchPolls();
  };

  return {
    polls,
    loading,
    error,
    pagination,
    createPoll,
    vote,
    refetch,
  };
}

export const useUserPolls = (page = 1, limit = 10) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const { token } = useAuth();

  useEffect(() => {
    fetchUserPolls();
  }, [page, limit]);

  const fetchUserPolls = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`${BACKEND_URL}/api/polls/user?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user polls');
      }

      const data = await response.json();
      
      if (data.success) {
        setPolls(data.data.polls);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchUserPolls();
  };

  return {
    polls,
    loading,
    error,
    pagination,
    refetch,
  };
};