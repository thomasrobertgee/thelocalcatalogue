# TheLocalCatalogue Architecture

## Tech Stack
- **Frontend:** React Native with Expo (SDK 54)
- **Navigation:** React Navigation (@react-navigation/bottom-tabs)
- **Icons:** Lucide-react-native
- **Backend/Database:** Supabase (PostgreSQL, Auth, Real-time)
- **Environment Management:** expo-constants & dotenv (.env)

## Folder Structure
- `/components`: Reusable UI components (FeedCard, FollowButton)
- `/screens`: Main application screens (FeedScreen, ExploreScreen)
- `/hooks`: Custom Supabase logic (useMyFeed, useSearchPosts)
- `supabase.js`: Supabase client initialization and utility functions
- `App.js`: Main entry point and Navigation Container

## Key Features
- **Bottom Tab Navigation:** 5-tab layout (My Feed, Explore, Search, Placeholder 1, Placeholder 2).
- **Social Feed:** Instagram-style feed with business information and images.
- **Explore Grid:** Grid layout for discovering new products with interactive popups.
- **Follow System:** Real-time follow/unfollow logic synced with Supabase.
- **Search:** Keyword and tag-based search functionality.

## Database Schema (Expected)
- **businesses:** `id`, `name`, `logo_url`, `location`
- **posts:** `id`, `business_id`, `image_url`, `description`, `tags`, `created_at`
- **followers:** `user_id`, `business_id`
