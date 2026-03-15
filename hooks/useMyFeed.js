import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

/**
 * Hook to fetch posts for the 'My Feed' tab.
 * Only fetches posts from businesses that the current user is following.
 * 
 * Assumes schema:
 * - 'followers' table: { user_id, business_id }
 * - 'posts' table: { id, business_id, image_url, description, created_at, ... }
 * - 'businesses' table: { id, name, logo_url, location, ... }
 */
export const useMyFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get the current user session
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // 2. Query the followers table to get business IDs the user follows
      const { data: followingData, error: followingError } = await supabase
        .from('followers')
        .select('business_id')
        .eq('user_id', user.id);

      if (followingError) throw followingError;

      const followedBusinessIds = followingData.map(f => f.business_id);

      if (followedBusinessIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // 3. Fetch posts for those business IDs, joining with businesses table
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          image_url,
          caption,
          created_at,
          business:businesses (
            id,
            business_name,
            suburb
          )
        `)
        .in('business_id', followedBusinessIds)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      setPosts(postsData);
    } catch (err) {
      console.error('Error in useMyFeed:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return { posts, loading, error, refresh: fetchFeed };
};
