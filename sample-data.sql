-- Sample data must be created through the app signup process
-- You cannot directly insert into profiles table without authenticated users

-- To create test accounts:
-- 1. Run the app and sign up with these test accounts:
--    - alice@test.com / password123
--    - bob@test.com / password123
--    - charlie@test.com / password123
--    - diana@test.com / password123
--    - evan@test.com / password123

-- 2. After signup, update each profile with the SQL below (replace USER_ID with actual IDs from auth.users):

-- Example update query (run after creating accounts):
-- UPDATE profiles SET
--   name = 'Alice Johnson',
--   course = 'Computer Science',
--   course_year = 'Year 2',
--   study_time = 'Mornings',
--   study_method = 'Group Study',
--   current_mood = 'Motivated',
--   age = 21,
--   pronouns = 'She/Her',
--   photo_url = 'https://i.pravatar.cc/400?img=5',
--   bio = 'Love coding and learning new technologies.'
-- WHERE email = 'alice@test.com';

-- For easier testing, here are complete update queries for all test accounts:

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
  bio = 'Love coding and learning new technologies.'
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
  bio = 'Math enthusiast who enjoys problem-solving sessions.'
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
  bio = 'First year engineering student looking to connect.'
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
  bio = 'Pre-med student who values structured study sessions.'
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
  bio = 'Business major finishing up final year.'
WHERE email = 'evan@test.com';
