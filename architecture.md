# TheLocalCatalogue Architecture

## Tech Stack
- **Frontend:** React Native with Expo (SDK 54)
- **Navigation:** React Navigation (Hardened Bottom Tabs + Root Stack)
- **Animations:** React Native Reanimated
- **Gestures:** React Native Gesture Handler
- **Icons:** Lucide-react-native
- **Backend/Database:** Supabase (PostgreSQL, Auth, Storage, Real-time)
- **AI Integration:** Google Gemini 1.5 Flash
- **Lists/Grids:** @shopify/flash-list, @react-native-seoul/masonry-list

## Folder Structure
- `/components`: Reusable UI components
  - `FeedCard.js`: Social feed card with dynamic "Follow" visibility
  - `PostAlbum.js`: Multi-photo interactive gallery with double-tap-to-like
  - `FollowButton.js`: Resilient real-time follow/unfollow toggle
- `/screens`: Main application screens
  - `Auth.js`: Unified Login/Sign-up with profile creation
  - `FeedScreen.js`: Main social feed
  - `ExploreScreen.js`: Discovery grid
  - `SearchScreen.js`: Multi-filter search interface
  - `PostDetail.js`: Full-view screen for specific posts
  - `CreatePost.js`: Role-based content creation with AI auto-fill
  - `BusinessProfile.js`: Public business page with post grid
  - `FounderDashboard.js`: Private admin dashboard
- `/hooks`: Custom Supabase logic
  - `useMyFeed.js`: Fetches posts from followed businesses
- `/context`: Global state management
  - `AuthProvider.js`: Centralized session and self-healing profile state
- `supabase.js`: Supabase client and data helpers
- `gemini.js`: Gemini AI utility functions
- `notifications.js`: Push logic (Dynamic imports for Expo Go safety)
- `App.js`: Main entry point

## Key Features
- **Interactive Post Albums:** Swipeable multi-photo galleries with double-tap-to-like heart animations.
- **Self-Healing Profiles:** Automated database profile recovery.
- **Role-Based Creation:** Dynamic forms for Businesses vs. Regular Users.
- **AI-Powered Generation:** Automated metadata extraction and localized caption generation.
- **Admin Insights:** Private dashboard for platform metrics and developer tools.

## Database Schema (Current)
- **profiles:** `id`, `is_business`, `push_token`, `created_at`
- **businesses:** `id`, `business_name`, `suburb`, `category`, `bio`, `address`
- **posts:** `id`, `business_id`, `image_url` (primary), `caption`, `price` (optional), `created_at`
- **post_images:** `id`, `post_id`, `image_url`, `order_index`
- **followers:** `user_id`, `business_id`
