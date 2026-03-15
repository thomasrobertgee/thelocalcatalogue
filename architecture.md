# TheLocalCatalogue Architecture

## Tech Stack
- **Frontend:** React Native with Expo (SDK 54)
- **Navigation:** React Navigation (Hardened Bottom Tabs + Root Stack)
- **Icons:** Lucide-react-native (Standardized set for stability)
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage, Real-time)
- **AI Integration:** Google Gemini 1.5 Flash (Auto-fill captions & metadata)
- **Notifications:** Expo Push Notifications (Optimized for Development Builds)
- **Environment Management:** expo-constants & dotenv (.env)
- **Image Handling:** expo-image-picker, expo-camera (Custom modal capture)
- **Lists/Grids:** @shopify/flash-list

## Folder Structure
- `/components`: Reusable UI components
  - `FeedCard.js`: Social feed card with dynamic "Follow" visibility
  - `FollowButton.js`: Resilient real-time follow/unfollow toggle
- `/screens`: Main application screens
  - `Auth.js`: Unified Login/Sign-up with profile creation
  - `FeedScreen.js`: Main social feed (Followed content)
  - `ExploreScreen.js`: Performance-optimized discovery grid
  - `SearchScreen.js`: Multi-filter search interface
  - `PostDetail.js`: Full-view screen for specific posts
  - `CreatePost.js`: Role-based content creation (Price for business, Tagging for users)
  - `BusinessProfile.js`: Public business page with post grid
  - `FounderDashboard.js`: Private admin dashboard with Data Seeding tools
- `/hooks`: Custom Supabase logic
  - `useMyFeed.js`: Fetches posts from followed businesses
- `/context`: Global state management
  - `AuthProvider.js`: Centralized session, user, and self-healing profile state
- `supabase.js`: Supabase client and data helpers
- `gemini.js`: Gemini AI utility functions
- `notifications.js`: Cloaked push logic (Dynamic imports for Expo Go safety)
- `App.js`: Main entry point and Hardened Root Navigator

## Key Features
- **Self-Healing Profiles:** Automatically creates missing database profiles upon first login.
- **Role-Based Creation:** Businesses post with prices; users post by tagging local businesses.
- **Dynamic Tagging:** Searchable modal for users to link posts to specific local shops.
- **Admin Tools:** On-device database seeding for rapid testing and Founder metrics.
- **Following Feed:** Personalized content stream with automated follower list management in the Profile tab.

## Database Schema (Current)
- **profiles:** `id`, `is_business`, `push_token`, `created_at`
- **businesses:** `id`, `business_name`, `suburb`, `category`, `bio` (fallback), `address`
- **posts:** `id`, `business_id`, `image_url` (primary), `caption`, `price` (optional), `created_at`
- **post_images:** `id`, `post_id`, `image_url`, `order_index`
- **followers:** `user_id`, `business_id`
