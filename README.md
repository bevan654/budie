# budie - Study Partner Matching App

A Tinder-like mobile application for students to find study partners built with React Native, Expo, and Supabase.

## Features

- Swipe-based matching system
- Real-time chat messaging
- User profiles with study preferences
- Likes and matches tracking
- In-person study mode
- Professional authentication

## Tech Stack

- React Native
- Expo
- Supabase (Backend & Auth)
- React Navigation
- React Native Gesture Handler

## Setup Instructions

### 1. Prerequisites

- Node.js installed
- Expo CLI installed globally: `npm install -g expo-cli`
- Supabase account

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase-schema.sql` in the Supabase SQL Editor
3. Get your project URL and anon key from Project Settings > API
4. Create test accounts through the app (see Testing section)

### 3. Environment Configuration

1. Create a `.env` file in the root directory
2. Copy contents from `.env.example`
3. Add your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the App

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your physical device

## Project Structure

```
.
├── App.js
├── screens/
│   ├── AuthScreen.js
│   ├── HomeScreen.js
│   ├── ProfileScreen.js
│   ├── ProfileDetailScreen.js
│   ├── ChatScreen.js
│   ├── ChatDetailScreen.js
│   └── SettingsScreen.js
├── components/
│   └── SwipeCard.js
├── navigation/
│   └── AppNavigator.js
├── lib/
│   └── supabase.js
└── package.json
```

## Database Schema

### Tables

- `profiles` - User profile information
- `likes` - Tracks who liked whom
- `matches` - Mutual likes become matches
- `messages` - Chat messages between matches

### Key Features

- Automatic match creation via database trigger when mutual likes occur
- Row Level Security policies for data protection
- Real-time subscriptions for chat messages

## Usage

1. Sign up with email and password
2. Complete your profile with study preferences
3. Swipe right to like, left to pass on potential study partners
4. View who liked you in the Chats tab under Likes
5. Chat with your matches
6. Update your profile and preferences anytime

## Testing

### Creating Test Data

Since Supabase requires authenticated users, create test accounts through the app:

1. Sign up with multiple test emails:
   - alice@test.com
   - bob@test.com
   - charlie@test.com
   - etc.

2. After signup, enhance profiles using the SQL queries in `sample-data.sql`:
   - Go to Supabase SQL Editor
   - Run the UPDATE queries to add better profile data
   - This adds photos, bios, and varied study preferences

3. Test the full flow:
   - Log in as one account
   - Swipe through other profiles
   - Log in as another account and swipe back
   - Test matching and chat features

## Notes

- This app is configured for Expo Go compatibility
- In-Person mode is the only mode implemented
- Online features, verification, and monetization are not included
- Profile photos use placeholder images from pravatar.cc
