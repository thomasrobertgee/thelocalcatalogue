# Changelog

## [2026-03-13]
### Added
- **Interactive Post Galleries:** Built `PostAlbum.js` using `@shopify/flash-list` for horizontal multi-photo swiping.
- **Micro-interactions:** Integrated `react-native-reanimated` and `gesture-handler` for an Instagram-style "double-tap to like" heart animation.
- **UI Indicators:** Added dynamic pagination dots to the photo album component.
- **Seeding & Data:** Integrated a powerful seeder tool in the Founder Dashboard to populate the app with businesses and posts for testing.
- **Business Tagging:** Added a new system for regular users to search for and tag businesses in their posts.
- **Self-Healing Accounts:** Implemented logic to automatically create missing profile rows, preventing "Follow" and "Post" errors.

### Fixed
- **React Navigation Crashes:** Hardened `App.js` with standard function declarations and removed nested conditional groups to eliminate the "type is invalid" error.
- **Database Alignment:** Corrected schema mismatches across all queries (`description` -> `caption`, `name` -> `business_name`, `location` -> `suburb`).
- **Icon Stability:** Standardized all icon names to prevent crashes caused by deprecated or renamed Lucide components.
- **Text String Errors:** Resolved "Text strings must be rendered within a <Text> component" errors in `ExploreScreen` and `BusinessProfile`.
- **Push Notification Crashes:** Implemented dynamic imports in `notifications.js` to shield Expo Go from SDK 54 errors.
