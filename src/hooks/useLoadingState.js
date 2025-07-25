import { useState, useCallback } from 'react';

// Hook para estados de loading consistentes
export const useLoadingState = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const withLoading = useCallback(async (asyncFn) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err.message || 'Algo deu errado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => setError(null), []);
  
  const startLoading = useCallback(() => setLoading(true), []);
  
  const stopLoading = useCallback(() => setLoading(false), []);

  return { 
    loading, 
    error, 
    setLoading, 
    setError, 
    withLoading, 
    resetError,
    startLoading,
    stopLoading
  };
}; 