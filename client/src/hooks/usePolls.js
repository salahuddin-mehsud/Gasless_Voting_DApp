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
      // Don't clear polls on error, keep showing existing data
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
        await fetchPolls(); // Refresh the polls list
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const vote = async (pollId, optionIndex) => {
    try {
      if (!pollId) {
        throw new Error('Poll ID is required');
      }

      const response = await fetch(`${BACKEND_URL}/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ optionIndex }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchPolls(); // Refresh the polls list
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error voting:', error);
      return { success: false, message: 'Network error occurred' };
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