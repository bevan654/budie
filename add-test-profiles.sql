-- Add Test Profiles for Development
-- Run this in Supabase SQL Editor

-- NOTE: These profiles won't have auth users, so they're for display/testing only
-- You won't be able to log in as these users, they're just for swiping

-- Delete existing test profiles if they exist
DELETE FROM profiles WHERE email IN ('alice@test.com', 'bob@test.com', 'charlie@test.com', 'diana@test.com', 'evan@test.com');

-- Temporarily disable RLS and foreign key
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Insert test profiles
INSERT INTO profiles (id, email, name, course, course_year, study_time, study_method, current_mood, age, pronouns, photo_url, bio)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
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
    '22222222-2222-2222-2222-222222222222',
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
    '33333333-3333-3333-3333-333333333333',
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
    '44444444-4444-4444-4444-444444444444',
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
    '55555555-5555-5555-5555-555555555555',
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
  );

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verify the profiles were created
SELECT id, email, name, course, age FROM profiles ORDER BY name;
