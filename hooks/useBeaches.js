import { useState, useEffect } from 'react';
import { beachService } from '../services/beachService';

export const useBeaches = (fetchOnMount = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBeaches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await beachService.getBeaches();
      setData(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchOnMount) {
      fetchBeaches();
    }
  }, [fetchOnMount]);

  return { data, loading, error, refetch: fetchBeaches };
};