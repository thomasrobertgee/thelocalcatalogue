# TheLocalCatalogue

**TheLocalCatalogue** is a local-first social discovery platform built with **React Native (Expo)** and **Supabase**. It connects local residents with small businesses through a visually rich, discovery-driven interface.

---

## 📋 Project Status
The app is currently a **fully functional prototype**. It features a hardened architecture for Expo SDK 54, real-time Supabase integration, and interactive Instagram-style media components.

---

## 🚀 Core Features

### 1. Interactive Media (New!)
- **Post Albums:** Standardized `PostAlbum` component for swiping through multi-photo posts.
- **Micro-animations:** High-quality "Double-tap to Like" heart animations powered by `Reanimated` and `Gesture Handler`.
- **UI Indicators:** Native pagination dots for multi-image navigation.

### 2. Social & Discovery
- **My Feed:** Personalized content from followed local businesses.
- **Explore Grid:** Performance-optimized masonry discovery grid for all local updates.
- **Advanced Search:** Real-time filtering by categories (Cafe, Fitness, etc.) and suburbs.
- **Business Profiles:** Rich profiles featuring real-time stats and full product galleries.

### 3. AI-Powered Content Creation
- **Auto-fill Metadata:** **Google Gemini 1.5 Flash** analyzes photos to extract product names, prices, and generate catchy captions.
- **Dynamic Tagging:** Users can tag businesses in their posts via a searchable database modal.
- **Media Capture:** Integrated custom camera interface and multi-select gallery picker.

---

## 🛠️ Tech Stack
- **Frontend:** Expo SDK 54 (React Native)
- **Backend:** Supabase (Auth, DB, Storage, Real-time)
- **Animations:** React Native Reanimated & Gesture Handler
- **AI:** Google Gemini 1.5 Flash
- **Grid Rendering:** @shopify/flash-list

---

## 🧪 Seeding for AI Suggestion Review
Admin users (thomasrobertgee@gmail.com) can access the **Founder Dashboard** to:
1. Trigger the **Seed Database** tool.
2. Instantly populate the app with **5 businesses** and **15 multi-photo posts**.
3. Verify interactive features like "Following" and "Liking."

---

## 📦 Getting Started
1. `npm install`
2. Configure `.env` from `.env.example`
3. `npx expo start -c`
