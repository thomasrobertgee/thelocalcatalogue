# Changelog

## [2026-03-13]
### Added
- **Authentication System:** Implemented `Auth.js` with Login/Sign-up toggles and `profiles` table integration.
- **Global Auth Context:** Created `AuthProvider.js` and `useAuth` hook for centralized session and profile management.
- **Push Notifications:** Set up `notifications.js` utility for Expo Push Token registration and real-time alerts for followers.
- **Advanced Content Creation:** Upgraded `CreatePost.js` to support:
  - Multi-photo selection (up to 5).
  - Direct camera capture using `expo-camera`.
  - Parallel image uploads to Supabase Storage.
  - Relational image storage in `post_images` table.
- **AI Integration:** Enhanced Gemini AI logic to analyze the first photo of a multi-photo post for auto-filling.
- **Founder Dashboard:** Developed a private, dark-mode admin screen for monitoring platform growth and trending businesses.
- **Business Profiles:** Implemented `BusinessProfile.js` with full stats and 3-column post grids.
- **System Diagnostics:** Created `ConnectionTest.js` to verify Supabase and Gemini connectivity.
- **Layout Optimization:** Standardized Safe Area handling across all screens and pushed up the bottom tab bar for better ergonomics.

### Fixed
- **Navigation Errors:** Resolved `NativeStackView` resolution issues by realigning navigation dependency versions.
- **Syntax Errors:** Corrected mismatched JSX tags in `BusinessProfile.js`.
- **Database Schema Mismatches:** Updated all queries to use `business_name` and `suburb` columns instead of `name` and `location`.
- **Git Security:** Added `.env` to `.gitignore` to prevent leaking API keys.
- **Auth Sync:** Removed redundant `email` column from profile creation to prevent schema cache errors.
