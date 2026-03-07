-- Simple Test Profiles (No Auth Users)
-- Run this in Supabase SQL Editor

-- Temporarily disable foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Insert test profiles with random UUIDs
INSERT INTO profiles (id, email, name, course, course_year, study_time, study_method, current_mood, age, pronouns, photo_url, bio)
VALUES
  (
    gen_random_uuid(),
    'alice@test.com',
    'Alice Johnson',
    'Computer Science',
    'Year 2',
    'Mornings',
    'Group Study',
    'Motivated',
    21,
    'She/Her',
    'https://i.pravatar.cc/400?img=5',
    'Love coding and learning new technologies. Always looking for study partners who are passionate about CS.'
  ),
  (
    gen_random_uuid(),
    'bob@test.com',
    'Bob Smith',
    'Mathematics',
    'Year 3',
    'Afternoons',
    'One-on-One',
    'Focused',
    22,
    'He/Him',
    'https://i.pravatar.cc/400?img=12',
    'Math enthusiast who enjoys problem-solving sessions. Prefer quiet study environments.'
  ),
  (
    gen_random_uuid(),
    'charlie@test.com',
    'Charlie Davis',
    'Engineering',
    'Year 1',
    'Evenings',
    'Group Study',
    'Energetic',
    19,
    'They/Them',
    'https://i.pravatar.cc/400?img=23',
    'First year engineering student looking to connect with others. Love collaborative learning.'
  ),
  (
    gen_random_uuid(),
    'diana@test.com',
    'Diana Martinez',
    'Biology',
    'Year 2',
    'Mornings',
    'Library Study',
    'Determined',
    20,
    'She/Her',
    'https://i.pravatar.cc/400?img=32',
    'Pre-med student who values structured study sessions. Coffee before studying is a must.'
  ),
  (
    gen_random_uuid(),
    'evan@test.com',
    'Evan Wilson',
    'Business',
    'Year 4',
    'Flexible',
    'Cafe Study',
    'Relaxed',
    23,
    'He/Him',
    'https://i.pravatar.cc/400?img=51',
    'Business major finishing up final year. Open to various study methods and times.'
  )
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  course = EXCLUDED.course,
  course_year = EXCLUDED.course_year,
  study_time = EXCLUDED.study_time,
  study_method = EXCLUDED.study_method,
  current_mood = EXCLUDED.current_mood,
  age = EXCLUDED.age,
  pronouns = EXCLUDED.pronouns,
  photo_url = EXCLUDED.photo_url,
  bio = EXCLUDED.bio;

-- Re-add foreign key constraint (optional - only if you want auth integration)
-- ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey
--   FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Verify the profiles were created
SELECT id, email, name, course FROM profiles ORDER BY created_at DESC;
