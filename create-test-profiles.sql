-- Create Test Profiles for Development
-- Run this in Supabase SQL Editor

-- Note: This creates auth users which will trigger automatic profile creation
-- Then we update those profiles with better test data

-- Insert test users into auth.users (this will trigger profile creation)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'alice@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"name": "Alice Johnson"}'::jsonb,
    NOW(),
    NOW(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'bob@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"name": "Bob Smith"}'::jsonb,
    NOW(),
    NOW(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'charlie@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"name": "Charlie Davis"}'::jsonb,
    NOW(),
    NOW(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'diana@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"name": "Diana Martinez"}'::jsonb,
    NOW(),
    NOW(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'evan@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"name": "Evan Wilson"}'::jsonb,
    NOW(),
    NOW(),
    '',
    ''
  )
ON CONFLICT (email) DO NOTHING;

-- Update the profiles with better test data
UPDATE profiles SET
  name = 'Alice Johnson',
  course = 'Computer Science',
  course_year = 'Year 2',
  study_time = 'Mornings',
  study_method = 'Group Study',
  current_mood = 'Motivated',
  age = 21,
  pronouns = 'She/Her',
  photo_url = 'https://i.pravatar.cc/400?img=5',
  bio = 'Love coding and learning new technologies. Always looking for study partners who are passionate about CS.'
WHERE email = 'alice@test.com';

UPDATE profiles SET
  name = 'Bob Smith',
  course = 'Mathematics',
  course_year = 'Year 3',
  study_time = 'Afternoons',
  study_method = 'One-on-One',
  current_mood = 'Focused',
  age = 22,
  pronouns = 'He/Him',
  photo_url = 'https://i.pravatar.cc/400?img=12',
  bio = 'Math enthusiast who enjoys problem-solving sessions. Prefer quiet study environments.'
WHERE email = 'bob@test.com';

UPDATE profiles SET
  name = 'Charlie Davis',
  course = 'Engineering',
  course_year = 'Year 1',
  study_time = 'Evenings',
  study_method = 'Group Study',
  current_mood = 'Energetic',
  age = 19,
  pronouns = 'They/Them',
  photo_url = 'https://i.pravatar.cc/400?img=23',
  bio = 'First year engineering student looking to connect with others. Love collaborative learning.'
WHERE email = 'charlie@test.com';

UPDATE profiles SET
  name = 'Diana Martinez',
  course = 'Biology',
  course_year = 'Year 2',
  study_time = 'Mornings',
  study_method = 'Library Study',
  current_mood = 'Determined',
  age = 20,
  pronouns = 'She/Her',
  photo_url = 'https://i.pravatar.cc/400?img=32',
  bio = 'Pre-med student who values structured study sessions. Coffee before studying is a must.'
WHERE email = 'diana@test.com';

UPDATE profiles SET
  name = 'Evan Wilson',
  course = 'Business',
  course_year = 'Year 4',
  study_time = 'Flexible',
  study_method = 'Cafe Study',
  current_mood = 'Relaxed',
  age = 23,
  pronouns = 'He/Him',
  photo_url = 'https://i.pravatar.cc/400?img=51',
  bio = 'Business major finishing up final year. Open to various study methods and times.'
WHERE email = 'evan@test.com';

-- Verify the profiles were created
SELECT id, email, name, course FROM profiles ORDER BY created_at DESC LIMIT 10;
