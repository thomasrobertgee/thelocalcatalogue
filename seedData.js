import { supabase } from './supabase';

/**
 * Seeder function to populate the database with test data.
 * Creates 5 businesses, each with 3 posts (one being a multi-photo album).
 */
export const seedDatabase = async () => {
  console.log('Starting Database Seed...');

  const businesses = [
    { business_name: 'The local Coffee', suburb: 'Altona North', category: 'Cafe' },
    { business_name: 'Artisan Bakery', suburb: 'Altona', category: 'Retail' },
    { business_name: 'Greenery Florals', suburb: 'Newport', category: 'Retail' },
    { business_name: 'Fitness First Altona', suburb: 'Altona North', category: 'Fitness' },
    { business_name: 'Yarraville Services', suburb: 'Yarraville', category: 'Services' },
  ];

  try {
    // 1. Insert Businesses
    const { data: bizData, error: bizError } = await supabase
      .from('businesses')
      .insert(businesses)
      .select();

    if (bizError) throw bizError;
    console.log(`Inserted ${bizData.length} businesses.`);

    // 2. Insert Posts for each business
    for (const biz of bizData) {
      const posts = [
        { 
          business_id: biz.id, 
          image_url: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/600/600`, 
          caption: `Fresh update from ${biz.business_name}! #local #support`, 
          price: 15.00,
          created_at: new Date().toISOString()
        },
        { 
          business_id: biz.id, 
          image_url: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/600/600`, 
          caption: `We are open until 5 PM today at ${biz.suburb}.`, 
          created_at: new Date(Date.now() - 86400000).toISOString() 
        },
        { 
          business_id: biz.id, 
          image_url: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/600/600`, 
          caption: `Album post! Check out our new arrivals.`, 
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert(posts)
        .select();

      if (postError) {
        console.error(`Error inserting posts for ${biz.business_name}:`, postError.message);
        continue;
      }

      // 3. Insert Album Images for the 3rd post
      const albumPost = postData[2];
      const albumImages = [
        { post_id: albumPost.id, image_url: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/600/600`, order_index: 0 },
        { post_id: albumPost.id, image_url: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/600/600`, order_index: 1 },
        { post_id: albumPost.id, image_url: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/600/600`, order_index: 2 },
      ];

      await supabase.from('post_images').insert(albumImages);
    }

    console.log('Database Seeding Complete!');
    return { success: true };
  } catch (err) {
    console.error('Seeding Failed:', err.message);
    return { success: false, error: err.message };
  }
};
