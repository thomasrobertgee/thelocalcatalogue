import { useState, useCallback } from 'react';
import { supabase } from '../supabase';

/**
 * Hook to search posts in the 'Search' tab.
 * Allows searching by caption/description text or filtering by tags.
 * 
 * Assumes schema:
 * - 'posts' table: { id, description, tags (array), image_url, ... }
 * - 'businesses' table: { id, name, logo_url }
 */
export const useSearchPosts = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchPosts = useCallback(async ({ query = '', tag = null }) => {
    try {
      setLoading(true);
      setError(null);

      let supabaseQuery = supabase
        .from('posts')
        .select(`
          id,
          description,
          tags,
          image_url,
          created_at,
          business:businesses (
            name,
            logo_url
          )
        `);

      // 1. Text search by description (case-insensitive)
      if (query) {
        supabaseQuery = supabaseQuery.ilike('description', `%${query}%`);
      }

      // 2. Filter by tags array
      if (tag) {
        // .contains() is used for Postgres array types
        supabaseQuery = supabaseQuery.contains('tags', [tag]);
      }

      const { data, error: searchError } = await supabaseQuery
        .order('created_at', { ascending: false })
        .limit(20);

      if (searchError) throw searchError;

      setResults(data || []);
    } catch (err) {
      console.error('Search error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, searchPosts };
};
