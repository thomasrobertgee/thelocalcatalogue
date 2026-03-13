import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetches all posts for the 'Explore' tab.
 * Joins with the businesses table to get business details.
 * 
 * Assuming a schema where:
 * - 'posts' has a 'business_id' foreign key
 * - 'businesses' has 'name' and 'logo_url'
 */
export const getExplorePosts = async () => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        product_name,
        image_url,
        description,
        created_at,
        business:businesses (
          name,
          logo_url,
          location
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching explore posts:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in getExplorePosts:', err);
    return [];
  }
};
