# Changelog

## [2026-03-13]
### Added
- **Project Initialization:** Bootstrapped Expo project with SDK 54.
- **Navigation:** Configured `BottomTabNavigator` with 5 tabs and `Lucide` icons.
- **Feed Component:** Implemented `FeedCard` with business info, images, and action buttons.
- **Feed Screen:** Created `FeedScreen` with `FlatList` and dummy data.
- **Explore Screen:** Built `ExploreScreen` with image grid and product details modal.
- **Supabase Integration:** Set up `supabase.js` client and `.env` variable handling.
- **Explore Helper:** Added `getExplorePosts` utility for joined data fetching.
- **My Feed Hook:** Developed `useMyFeed` custom hook for user-specific business following posts.
- **Search Hook:** Implemented `useSearchPosts` with `.ilike()` and `.contains()` functionality.
- **Follow Logic:** Created `FollowButton` component for real-time `followers` table updates.
- **Documentation:** Added `architecture.md` and `changelog.md`.

### Fixed
- **Version Mismatch:** Downgraded from SDK 55 to SDK 54 for Expo Go compatibility.
- **Dependency Issues:** Installed `expo-asset` and corrected `expo-status-bar` versions.
- **UI Error:** Resolved "type is invalid" by swapping `FlashList` for `FlatList` in `ExploreScreen`.
