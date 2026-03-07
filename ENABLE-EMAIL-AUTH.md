# Enable Email Authentication in Supabase

## Steps to Enable Email Signups

1. Go to your Supabase project dashboard at https://supabase.com
2. Click on **Authentication** in the left sidebar
3. Click on **Providers**
4. Find **Email** in the list of providers
5. Make sure these settings are configured:

### Required Settings:

- **Enable Email provider**: Toggle this **ON** (must be enabled)
- **Enable email confirmations**: Toggle this **OFF** for testing (you can enable later)
- **Enable email autoconfirm**: Toggle this **ON** for testing (optional)

6. Click **Save**

## Alternative Method (via Settings)

If you don't see the Providers tab:

1. Go to **Authentication** > **Settings**
2. Scroll to **Auth Providers**
3. Enable **Email**
4. Save changes

## After Enabling

Once email auth is enabled:
- Try signing up again in the app
- You should be able to create an account with email/password
- With autoconfirm enabled, you'll be logged in immediately

If you still have issues, check that:
- Your Supabase project is active
- You have the correct SUPABASE_URL and SUPABASE_ANON_KEY in your .env file
