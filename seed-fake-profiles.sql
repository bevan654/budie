-- Seed 15 fake profiles for swipe testing
-- Run in Supabase SQL Editor. Profile-only (no auth users) — cannot log in as these.
-- Requires add-profile-depth-columns.sql to have been run first.
-- Run drop-study-method-column.sql FIRST if you haven't — this file no longer inserts study_method.

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

DELETE FROM profiles WHERE email LIKE '%@seed.test';

INSERT INTO profiles (
  id, email, name, university, course, course_year, dob,
  study_time, current_mood,
  age, pronouns, photo_url, bio,
  prompts, subjects, interests, availability
) VALUES
  (gen_random_uuid(), 'mia@seed.test',    'Mia Chen',       'University of Melbourne',           'Computer Science',           '2nd Year',  '2004-03-12', 'Morning',   'Focused',    20, 'She/Her',  'https://i.pravatar.cc/400?img=47', 'CS nerd, love ML. Coffee addict.',
    '[{"question":"My ideal study session is…","answer":"Silent library, cold brew, phone face-down."},{"question":"A class I actually love is…","answer":"COMP30027 Machine Learning. The assignments are brutal but fun."}]'::jsonb,
    ARRAY['COMP30027','COMP30022','MAST30001'], ARRAY['Coding','Coffee','Gym','Music'], ARRAY['Mon','Tue','Wed','Thu']),

  (gen_random_uuid(), 'liam@seed.test',   'Liam O''Brien',  'University of Sydney',              'Mechanical Engineering',     '3rd Year',  '2003-07-22', 'Evening',   'Motivated',  21, 'He/Him',   'https://i.pravatar.cc/400?img=12', 'Gym, CAD, good vibes.',
    '[{"question":"After a long study day I…","answer":"Hit the gym then reward myself with a kebab."}]'::jsonb,
    ARRAY['MECH3361','MECH3110','AMME2700'], ARRAY['Gym','Gaming','Sports','Cooking'], ARRAY['Tue','Thu','Sat','Sun']),

  (gen_random_uuid(), 'aisha@seed.test',  'Aisha Patel',    'University of New South Wales',     'Medicine',                   '4th Year',  '2002-11-03', 'Night',     'Focused',    22, 'She/Her',  'https://i.pravatar.cc/400?img=32', 'Med student surviving on espresso.',
    '[{"question":"What I''m working toward…","answer":"Finishing med school without losing my mind."},{"question":"I procrastinate by…","answer":"Reorganising my Notion setup. Again."},{"question":"A study snack I can''t go without is…","answer":"Dark chocolate. Non-negotiable."}]'::jsonb,
    ARRAY['Cardiology','Neuroanatomy','Pharmacology'], ARRAY['Reading','Yoga','Coffee','Podcasts'], ARRAY['Wed','Thu','Fri','Sat']),

  (gen_random_uuid(), 'noah@seed.test',   'Noah Williams',  'Monash University',                 'Law',                        '2nd Year',  '2004-01-18', 'Afternoon', 'Chill',      20, 'He/Him',   'https://i.pravatar.cc/400?img=14', 'Law + philosophy, down to debate.',
    '[{"question":"Study with me if…","answer":"You want to argue about moral philosophy over iced lattes."},{"question":"My study playlist is heavy on…","answer":"Lo-fi beats and the occasional Phoebe Bridgers."}]'::jsonb,
    ARRAY['LAW2101','LAW2102','PHL2610'], ARRAY['Reading','Writing','Podcasts','Coffee'], ARRAY['Mon','Wed','Fri']),

  (gen_random_uuid(), 'zoe@seed.test',    'Zoe Nguyen',     'University of Queensland',          'Psychology',                 '1st Year',  '2005-05-09', 'Morning',   'Motivated',  19, 'She/Her',  'https://i.pravatar.cc/400?img=45', 'First year psych, love study groups.',
    '[{"question":"My ideal study session is…","answer":"Five friends, a whiteboard, too much boba."}]'::jsonb,
    ARRAY['PSYC1030','PSYC1040','STAT1201'], ARRAY['Music','Dance','Travel','Art'], ARRAY['Mon','Tue','Wed','Thu','Fri']),

  (gen_random_uuid(), 'ethan@seed.test',  'Ethan Ross',     'University of Adelaide',            'Physics',                    '3rd Year',  '2003-09-28', 'Night',     'Curious',    21, 'He/Him',   'https://i.pravatar.cc/400?img=33', 'Quantum mechanics or bust.',
    '[{"question":"A subject I''ll gladly explain is…","answer":"Literally anything involving eigenvalues. Please ask."}]'::jsonb,
    ARRAY['PHYS3501','PHYS3100','MATHS3014'], ARRAY['Coding','Reading','Hiking','Anime'], ARRAY['Tue','Wed','Thu','Sun']),

  (gen_random_uuid(), 'priya@seed.test',  'Priya Sharma',   'Flinders University',               'Biomedical Science',         '2nd Year',  '2004-04-15', 'Afternoon', 'Focused',    20, 'She/Her',  'https://i.pravatar.cc/400?img=48', 'Bio labs are life. Taylor Swift fan.',
    '[{"question":"My study spot of choice is…","answer":"Central Library, level 3, the corner with the big window."},{"question":"I procrastinate by…","answer":"Making increasingly unhinged Spotify playlists."}]'::jsonb,
    ARRAY['BIOL2722','BIOL2702','CHEM2701'], ARRAY['Music','Running','Reading','Coffee'], ARRAY['Mon','Tue','Wed','Fri']),

  (gen_random_uuid(), 'jack@seed.test',   'Jack Thompson',  'RMIT University',                   'Architecture',               '3rd Year',  '2003-12-04', 'Evening',   'Chill',      21, 'He/Him',   'https://i.pravatar.cc/400?img=8',  'Sketch, build, repeat.',
    '[{"question":"Study with me if…","answer":"You''re cool with me sketching on every piece of paper in sight."}]'::jsonb,
    ARRAY['ARCH2045','ARCH2046','BUIL1229'], ARRAY['Art','Photography','Coffee','Travel'], ARRAY['Wed','Thu','Fri','Sat']),

  (gen_random_uuid(), 'olivia@seed.test', 'Olivia Tran',    'University of Technology Sydney',   'Graphic Design',             '1st Year',  '2005-02-26', 'Afternoon', 'Curious',    19, 'She/Her',  'https://i.pravatar.cc/400?img=44', 'Figma wizard. Cat mom.',
    '[{"question":"My study playlist is heavy on…","answer":"Mitski, Clairo, and one unhinged K-pop song per hour."},{"question":"A class I actually love is…","answer":"Visual Communication. I could talk typography forever."}]'::jsonb,
    ARRAY['DES10001','DES10002','VC10123'], ARRAY['Art','Photography','Anime','Music'], ARRAY['Mon','Wed','Fri','Sun']),

  (gen_random_uuid(), 'lucas@seed.test',  'Lucas Hayes',    'Australian National University',    'Economics',                  '2nd Year',  '2004-06-17', 'Morning',   'Motivated',  20, 'He/Him',   'https://i.pravatar.cc/400?img=11', 'Markets, running, coffee.',
    '[{"question":"What I''m working toward…","answer":"A summer internship at the RBA. Manifesting."}]'::jsonb,
    ARRAY['ECON2101','ECON2102','STAT2008'], ARRAY['Running','Podcasts','Coffee','Reading'], ARRAY['Mon','Tue','Wed','Thu']),

  (gen_random_uuid(), 'harper@seed.test', 'Harper Lee',     'Macquarie University',              'Marketing',                  '3rd Year',  '2003-08-30', 'Flexible',  'Social',     21, 'They/Them','https://i.pravatar.cc/400?img=26', 'Brand strategy + karaoke nights.',
    '[{"question":"After a long study day I…","answer":"Karaoke. No notes."},{"question":"Study with me if…","answer":"You laugh at your own jokes before finishing them."}]'::jsonb,
    ARRAY['MKTG3110','MKTG3120','MGMT2705'], ARRAY['Music','Dance','Movies','Travel'], ARRAY['Tue','Fri','Sat','Sun']),

  (gen_random_uuid(), 'finn@seed.test',   'Finn Kelly',     'University of Western Australia',   'Marine Biology',             '4th Year',  '2002-10-11', 'Morning',   'Focused',    22, 'He/Him',   'https://i.pravatar.cc/400?img=15', 'Ocean > land. Dive buddy wanted.',
    '[{"question":"My ideal study session is…","answer":"Field notes on the beach at golden hour. Unbeatable."}]'::jsonb,
    ARRAY['BIOL4411','MARI4002','ENVT4410'], ARRAY['Hiking','Photography','Travel','Running'], ARRAY['Mon','Thu','Sat','Sun']),

  (gen_random_uuid(), 'ava@seed.test',    'Ava Richardson', 'Queensland University of Technology','Nursing',                   '2nd Year',  '2004-07-05', 'Night',     'Chill',      20, 'She/Her',  'https://i.pravatar.cc/400?img=20', 'Nursing placements + yoga.',
    '[{"question":"After a long study day I…","answer":"Yoga flow + tea + candle. Restoring my main character energy."}]'::jsonb,
    ARRAY['NSB231','NSB233','LSB231'], ARRAY['Yoga','Reading','Cooking','Music'], ARRAY['Wed','Thu','Sat']),

  (gen_random_uuid(), 'kai@seed.test',    'Kai Anderson',   'Griffith University',               'Game Development',           '1st Year',  '2005-01-14', 'Evening',   'Curious',    19, 'They/Them','https://i.pravatar.cc/400?img=7',  'Making indie games. D&D Fridays.',
    '[{"question":"A subject I''ll gladly explain is…","answer":"Shader math. Warning: I will use too many gifs."},{"question":"Study with me if…","answer":"You want to rage at Unity together at 2am."}]'::jsonb,
    ARRAY['1611ICT','2613ICT','1607ICT'], ARRAY['Gaming','Coding','Anime','Art'], ARRAY['Mon','Tue','Wed','Thu','Fri']),

  (gen_random_uuid(), 'sienna@seed.test', 'Sienna Kowalski','Deakin University',                 'International Relations',    'Honours',   '2001-09-20', 'Afternoon', 'Motivated',  23, 'She/Her',  'https://i.pravatar.cc/400?img=31', 'Thesis grind. Languages: EN, PL, FR.',
    '[{"question":"What I''m working toward…","answer":"Finishing this thesis and finally sleeping."},{"question":"My study playlist is heavy on…","answer":"Baroque strings on loop. Judge me."}]'::jsonb,
    ARRAY['AIX700','AIX701','POL702'], ARRAY['Reading','Travel','Writing','Podcasts'], ARRAY['Mon','Tue','Wed','Thu','Fri']);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

SELECT name, university, course, array_length(subjects,1) AS n_subjects, jsonb_array_length(prompts) AS n_prompts FROM profiles WHERE email LIKE '%@seed.test' ORDER BY name;
