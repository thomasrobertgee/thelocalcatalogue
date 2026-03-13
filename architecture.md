# TheLocalCatalogue Architecture

## Tech Stack
- **Frontend:** React Native with Expo (SDK 54)
- **Navigation:** React Navigation (Bottom Tabs + Native Stack)
- **Icons:** Lucide-react-native
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage, Real-time)
- **AI Integration:** Google Gemini 1.5 Flash (Product analysis & caption generation)
- **Notifications:** Expo Push Notifications
- **Environment Management:** expo-constants & dotenv (.env)
- **Image Handling:** expo-image-picker, expo-camera (Direct capture)
- **Lists/Grids:** @shopify/flash-list

## Folder Structure
- `/components`: Reusable UI components
  - `FeedCard.js`: Instagram-style post display
  - `FollowButton.js`: Real-time follow/unfollow toggle
- `/screens`: Main application screens
  - `Auth.js`: Unified Login/Sign-up with profile creation
  - `FeedScreen.js`: Main social feed (Followed businesses)
  - `ExploreScreen.js`: Discovery grid for all products
  - `SearchScreen.js`: Multi-filter search interface
  - `PostDetail.js`: Full-view screen for specific posts
  - `CreatePost.js`: Multi-photo upload with Gemini AI auto-fill
  - `BusinessProfile.js`: Public business page with post grid
  - `FounderDashboard.js`: Private admin dashboard (Dark Mode)
  - `ConnectionTest.js`: System diagnostic tool
- `/hooks`: Custom Supabase logic
  - `useMyFeed.js`: Fetches posts from followed businesses
- `/context`: Global state management
  - `AuthProvider.js`: Handles session, user, and profile state
- `supabase.js`: Supabase client and data helpers
- `gemini.js`: Gemini AI utility functions
- `notifications.js`: Push notification registration and triggering logic
- `App.js`: Main entry point and Root Navigator

## Key Features
- **Auth System:** Secure email/password auth with automatic `profiles` table syncing.
- **Push Notifications:** Automated alerts to followers when businesses post new content.
- **AI-Powered Creation:** Automatic extraction of product details and caption generation from photos.
- **Multi-Photo Posts:** Support for up to 5 photos per post with parallel Supabase Storage uploads.
- **Admin Insights:** Private dashboard for founders to monitor growth and engagement.

## Database Schema (Current)
- **profiles:** `id`, `email` (optional), `is_business`, `push_token`, `created_at`
- **businesses:** `id`, `business_name`, `logo_url`, `suburb`, `category`, `bio`, `address`
- **posts:** `id`, `business_id`, `image_url` (primary), `product_name`, `description`, `price`, `created_at`
- **post_images:** `id`, `post_id`, `image_url`, `order_index`
- **followers:** `user_id`, `business_id`
