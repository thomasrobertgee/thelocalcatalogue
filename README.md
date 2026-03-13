# TheLocalCatalogue

TheLocalCatalogue is a local-first social discovery app built with React Native and Expo. It connects users with local businesses, allowing them to follow their favorite shops, discover new products through an interactive grid, and get directions directly from posts.

## 🚀 Features

- **Personalized Feed:** See the latest posts from businesses you follow.
- **Explore Grid:** Discover new products and services with a dynamic visual grid.
- **Real-Time Following:** Follow and unfollow local businesses instantly with Supabase integration.
- **Product Details:** High-resolution image views with full product descriptions.
- **Native Maps Integration:** Get directions to any business with a single tap.
- **Smart Search:** Search by keywords or filter by tags (e.g., #Sale, #NewArrivals).

## 🛠️ Tech Stack

- **Framework:** [Expo](https://expo.dev/) (React Native)
- **Database/Backend:** [Supabase](https://supabase.com/)
- **Navigation:** [React Navigation](https://reactnavigation.org/)
- **Icons:** [Lucide React Native](https://lucide.dev/)
- **UI:** Custom components with standard React Native StyleSheet

## 📦 Getting Started

### Prerequisites

- Node.js (LTS)
- npm or yarn
- Expo Go app on your mobile device (iOS/Android)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/thomasrobertgee/thelocalcatalogue.git
   cd thelocalcatalogue
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the app:
   ```bash
   npx expo start -c
   ```

5. Scan the QR code with your **Expo Go** app to test on your device!

## 📂 Project Structure

- `/components`: UI building blocks (FeedCard, FollowButton).
- `/screens`: Primary application views (Feed, Explore, Search, Detail).
- `/hooks`: Custom logic for data fetching and search.
- `/supabase.js`: Supabase client configuration.

## 📄 License

This project is private and for demonstration purposes.
