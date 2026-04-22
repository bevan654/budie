-- Private profile-photos bucket + policies.
-- Run in Supabase SQL Editor AFTER creating the 'profile-photos' bucket
-- (Dashboard -> Storage -> New bucket, name = profile-photos, Public = OFF).

-- Drop any prior policies from a public-bucket setup
DROP POLICY IF EXISTS "Users can upload own profile photo"   ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile photo"   ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile photo"   ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile photos"       ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view profile photos" ON storage.objects;

-- INSERT: authenticated user can write only to their own folder (<uid>/...)
CREATE POLICY "Users can upload own profile photo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: same — upsert/replace their own photos
CREATE POLICY "Users can update own profile photo"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: same — remove their own photos
CREATE POLICY "Users can delete own profile photo"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT: any authenticated user can read — required for createSignedUrl to work
-- when rendering other users' photos during swipe/chat/likes.
-- Unauthenticated requests (scrapers, leaked URLs outside the app) are blocked.
CREATE POLICY "Authenticated users can view profile photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-photos');
