# Quick Setup Guide

## Step-by-Step Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Wait for the project to be ready

### 3. Create Database Tables

1. In your Supabase project, go to the SQL Editor
2. Copy and paste the entire contents of `supabase-schema.sql`
3. Click "Run" to create all tables, policies, and triggers

### 4. Create Test Accounts

Since profiles must be linked to authenticated users, you need to create test accounts through the app:

**Option A - Quick Testing (Single Account)**
1. Skip to step 5 and run the app
2. Sign up with any email and test with your own account

**Option B - Full Testing (Multiple Accounts for Matching)**
1. Skip to step 5 and run the app
2. Create 5 test accounts by signing up with these emails:
   - alice@test.com (password: password123)
   - bob@test.com (password: password123)
   - charlie@test.com (password: password123)
   - diana@test.com (password: password123)
   - evan@test.com (password: password123)
3. After creating all accounts, go back to Supabase SQL Editor
4. Run the UPDATE queries from `sample-data.sql` to populate profiles
5. Log in with your main account to see other profiles

### 5. Configure Environment

1. In Supabase, go to Project Settings > API
2. Copy your Project URL and anon/public key
3. Create a `.env` file in the project root
4. Add your credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. Create Asset Files

Create an `assets` folder with placeholder images:
- `icon.png` (1024x1024)
- `splash.png` (1284x2778)
- `adaptive-icon.png` (1024x1024)
- `favicon.png` (48x48)

You can use any placeholder images or generate them online.

### 7. Run the App

```bash
npx expo start
```

Options:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan QR code with Expo Go app on your phone

### 8. Test the App

**Single User Testing:**
1. Sign up with a new account (use any email format like test@test.com)
2. Your profile will be auto-created with default values
3. Edit your profile in the Profile tab
4. To see swipe functionality, create additional accounts

**Full Matching Testing:**
1. Create 3-5 test accounts (see step 4 above)
2. Update profiles in Supabase using sample-data.sql queries
3. Log in as your main account
4. Swipe right on profiles you like
5. Log in as another test account and swipe back
6. Check the Chats tab to see matches and start messaging

### Common Issues

**Issue**: Cannot connect to Supabase
**Solution**: Verify your .env file has the correct URL and key

**Issue**: No profiles showing
**Solution**: Make sure sample-data.sql was run successfully

**Issue**: App crashes on swipe
**Solution**: Run `npm install` again and restart with `npx expo start -c`

**Issue**: "Missing assets" error
**Solution**: Create the assets folder with placeholder images

## Next Steps

- Update your profile in the Profile tab
- Customize study preferences
- Test the chat functionality
- Invite friends to test with you
