import { useState, useEffect } from 'react';

const API_BASE = '/api/editions';

/**
 * Fetch a single edition — either latest or by specific date.
 *
 * @param {string|null} date - 'YYYY-MM-DD' or null for latest
 */
export const useEdition = (date = null) => {
  const [edition, setEdition]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchEdition = async () => {
      setLoading(true);
      setError(null);

      try {
        const url      = date ? `${API_BASE}/${date}` : `${API_BASE}/latest`;
        const response = await fetch(url);
        const data     = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        if (!cancelled) {
          setEdition(data.edition || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchEdition();

    // Cleanup — prevents state updates on unmounted components
    return () => { cancelled = true; };
  }, [date]);

  return { edition, loading, error };
};


/**
 * Fetch all editions for the archive page.
 * Returns summary data only (date + article count).
 */
export const useArchive = () => {
  const [editions, setEditions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchArchive = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_BASE);
        const data     = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        if (!cancelled) {
          setEditions(data.editions || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchArchive();
    return () => { cancelled = true; };
  }, []);

  return { editions, loading, error };
};


/**
 * Helper — format a YYYY-MM-DD date string into a readable display string.
 * e.g. '2026-04-09' → 'Wednesday, April 9, 2026'
 */
export const formatEditionDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T12:00:00Z'); // noon UTC avoids timezone edge cases
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
    timeZone: 'UTC',
  });
};
