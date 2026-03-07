# Disable Email Confirmation for Testing

By default, Supabase requires users to confirm their email before they can log in. For testing, you can disable this.

## Steps to Disable Email Confirmation

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers** (or **Settings**)
3. Scroll down to **Email Auth**
4. Find the setting **"Enable email confirmations"**
5. **Toggle it OFF** (disable it)
6. Click **Save**

## Alternative: Use Confirmed Email for Testing

If you want to keep email confirmation enabled:

1. After signing up, check your email inbox
2. Click the confirmation link in the email from Supabase
3. Then you can log in

## What the App Does Now

- If signup succeeds with a session: Shows "Account created successfully!"
- If signup succeeds but needs email confirmation: Shows "Check your email to confirm"
- If email already exists: Shows "This email is already registered"
- If there's an error: Shows the error message

Try signing up again after disabling email confirmation and you should see a success message!
