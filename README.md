# TheLocalCatalogue

**TheLocalCatalogue** is a local-first social discovery platform built with **React Native (Expo)** and **Supabase**. It aims to revitalize community engagement by connecting local residents with small businesses through a visual, discovery-driven interface.

---

## 📋 Current Project Status
The app is currently in a **functional prototype stage**. The core architecture is "hardened" for Expo SDK 54, with a fully integrated Supabase backend, AI-powered content creation, and a private founder dashboard for platform management.

---

## 🚀 Core Features

### 1. Social & Discovery
- **My Feed:** A personalized stream showing real-time updates from only the businesses a user follows.
- **Explore Grid:** A high-performance, 2-column masonry grid (powered by `@shopify/flash-list`) for discovering all local products and services.
- **Advanced Search:** Real-time, debounced search that filters by keywords, business categories (Cafe, Fitness, etc.), and specific suburbs (Altona North, Williamstown, etc.).
- **Business Profiles:** Detailed profile pages for local shops featuring their logo, location, real-time follower counts, and a dedicated 3-column gallery of their posts.

### 2. Intelligent Content Creation
- **Role-Based Posting:** 
  - **Businesses:** Can share updates with price tags and captions.
  - **Regular Users:** Can share photos by **tagging** a local business from a searchable database.
- **Multi-Media Support:** Users can take photos directly via a custom camera interface or select up to 5 photos from their gallery.
- **Gemini AI Integration:** Utilizes **Google Gemini 1.5 Flash** to analyze uploaded photos, automatically extracting product names and prices while generating catchy, localized Instagram-style captions with hashtags.
- **Parallel Uploads:** Fast media handling with parallel Supabase Storage uploads.

### 3. Authentication & Security
- **Unified Auth:** Secure Email/Password login and sign-up with automatic user profile creation.
- **Self-Healing Profiles:** A robust `AuthProvider` that detects and fixes missing database rows automatically to ensure data integrity.
- **Private Admin Access:** A secret **Founder Dashboard** accessible only to verified admin emails, featuring platform metrics and development tools.

### 4. System & Notifications
- **Push Notifications:** Integrated Expo Push logic with follower-targeting (Notifications are currently optimized for Development Builds).
- **Diagnostic Tools:** A built-in "Connection Test" screen to verify Supabase and Gemini API keys are active.

---

## 🛠️ Tech Stack
- **Framework:** Expo SDK 54 (React Native)
- **Backend:** Supabase (PostgreSQL, Real-time, Auth, Storage)
- **AI:** Google Gemini 1.5 Flash API
- **Icons:** Lucide React Native (Standardized set)
- **Navigation:** React Navigation (Tabs + Native Stack)
- **Styling:** Standard React Native StyleSheet with a clean "Startup" aesthetic.

---

## 🗄️ Database Schema (Current)
- **profiles:** User metadata (`id`, `is_business`, `push_token`).
- **businesses:** Local shop details (`business_name`, `suburb`, `category`, `address`).
- **posts:** Central content table (`business_id`, `image_url`, `caption`, `price`).
- **post_images:** Support for multi-photo posts (`post_id`, `image_url`, `order_index`).
- **followers:** Real-time relationship map between users and businesses.

---

## 🧪 Testing & Seeding
For rapid content testing, use the **Founder Dashboard** (accessible from the Profile tab if logged in as the admin):
1. Tap **Founder Dashboard**.
2. Tap **Seed Database**.
3. This adds 5 businesses and 15 posts (including multi-photo albums) to your Supabase instance instantly.

---

## 📦 Getting Started
1. **Clone & Install:** `npm install`
2. **Setup Env:** Create a `.env` file using the keys provided in `.env.example`.
3. **Run:** `npx expo start -c`

---

## 📄 License
Private development project. All rights reserved.
