# Changelog

## [2026-03-13]
### Added
- **Dynamic Business Tagging:** Regular users can now search for and tag businesses when creating a post via a new search modal.
- **Self-Healing Profiles:** `AuthProvider` now automatically creates a database profile row if a user logs in but is missing one, preventing foreign key crashes.
- **Database Seeder:** Integrated a "Seed Database" tool in the Founder Dashboard to populate the app with 5 businesses and 15 posts instantly.
- **Improved Profile Tab:** Users can now view a live list of every business they follow and navigate directly to their profiles.
- **Delete Account Option:** Added "Delete My Profile Data" functionality for easier testing and account resetting.
- **Media UI:** Upgraded the Create tab with large, accessible "Take Photo" and "Gallery" buttons.

### Fixed
- **React Navigation Crashes:** Hardened `App.js` with standard function declarations and removed nested conditional groups to eliminate the "type is invalid" error.
- **Database Alignment:** Corrected schema mismatches across all queries (`description` -> `caption`, `name` -> `business_name`, `location` -> `suburb`).
- **Icon Stability:** Standardized all icon names to prevent crashes caused by deprecated or renamed Lucide components.
- **Text String Errors:** Resolved "Text strings must be rendered within a <Text> component" errors in `ExploreScreen` and `BusinessProfile` by cleaning up stray whitespace and template literals.
- **Push Notification Crashes:** Implemented dynamic imports in `notifications.js` to completely shield Expo Go from SDK 54 notification errors.
- **Logo Fallbacks:** Added letter-circle fallbacks for businesses without `logo_url` data.
