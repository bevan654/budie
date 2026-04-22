-- Add prompts, subjects, interests, availability to profiles.
-- Run in Supabase SQL Editor.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS prompts      JSONB  NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subjects     TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests    TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability TEXT[] NOT NULL DEFAULT '{}';

-- Update handle_new_user trigger to read the new fields from signup metadata.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _dob          DATE;
  _age          INTEGER;
  _prompts      JSONB  := '[]'::jsonb;
  _subjects     TEXT[] := ARRAY[]::text[];
  _interests    TEXT[] := ARRAY[]::text[];
  _availability TEXT[] := ARRAY[]::text[];
BEGIN
  -- DOB
  IF NEW.raw_user_meta_data->>'dob' ~ '^\d{4}-\d{2}-\d{2}$' THEN
    _dob := (NEW.raw_user_meta_data->>'dob')::DATE;
  END IF;
  _age := COALESCE(DATE_PART('year', AGE(_dob))::INTEGER, 20);

  -- prompts: jsonb array of {question, answer}
  BEGIN
    IF jsonb_typeof(NEW.raw_user_meta_data->'prompts') = 'array' THEN
      _prompts := NEW.raw_user_meta_data->'prompts';
    END IF;
  EXCEPTION WHEN OTHERS THEN _prompts := '[]'::jsonb;
  END;

  -- subjects / interests / availability: jsonb arrays of strings
  BEGIN
    IF jsonb_typeof(NEW.raw_user_meta_data->'subjects') = 'array' THEN
      _subjects := ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'subjects'));
    END IF;
  EXCEPTION WHEN OTHERS THEN _subjects := ARRAY[]::text[];
  END;

  BEGIN
    IF jsonb_typeof(NEW.raw_user_meta_data->'interests') = 'array' THEN
      _interests := ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'interests'));
    END IF;
  EXCEPTION WHEN OTHERS THEN _interests := ARRAY[]::text[];
  END;

  BEGIN
    IF jsonb_typeof(NEW.raw_user_meta_data->'availability') = 'array' THEN
      _availability := ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'availability'));
    END IF;
  EXCEPTION WHEN OTHERS THEN _availability := ARRAY[]::text[];
  END;

  INSERT INTO public.profiles (
    id, email, name, university, course, course_year, dob,
    study_time, study_method, current_mood,
    age, pronouns, photo_url, bio,
    prompts, subjects, interests, availability
  )
  VALUES (
    NEW.id,
    NEW.email,
    CONCAT(
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      ' ',
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    ),
    COALESCE(NEW.raw_user_meta_data->>'university', ''),
    COALESCE(NEW.raw_user_meta_data->>'course', 'Undeclared'),
    COALESCE(NEW.raw_user_meta_data->>'course_year', '1st Year'),
    _dob,
    COALESCE(NEW.raw_user_meta_data->>'study_time', 'Afternoon'),
    COALESCE(NEW.raw_user_meta_data->>'study_method', 'Group'),
    COALESCE(NEW.raw_user_meta_data->>'current_mood', 'Focused'),
    _age,
    'They/Them',
    NULL,
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    _prompts,
    _subjects,
    _interests,
    _availability
  );
  RETURN NEW;
END;
$$;
