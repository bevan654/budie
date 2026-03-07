-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS '
DECLARE
  _dob DATE;
  _age INTEGER;
BEGIN
  _dob := NULL;
  IF NEW.raw_user_meta_data->>''dob'' IS NOT NULL AND NEW.raw_user_meta_data->>''dob'' ~ ''^\d{4}-\d{2}-\d{2}$'' THEN
    _dob := (NEW.raw_user_meta_data->>''dob'')::DATE;
  END IF;

  IF _dob IS NOT NULL THEN
    _age := DATE_PART(''year'', AGE(_dob));
  ELSE
    _age := 20;
  END IF;

  INSERT INTO public.profiles (
    id, email, name, university, course, course_year, dob,
    study_time, study_method, current_mood,
    age, pronouns, photo_url, bio
  )
  VALUES (
    NEW.id,
    NEW.email,
    CONCAT(
      COALESCE(NEW.raw_user_meta_data->>''first_name'', ''''),
      '' '',
      COALESCE(NEW.raw_user_meta_data->>''last_name'', '''')
    ),
    COALESCE(NEW.raw_user_meta_data->>''university'', ''''),
    COALESCE(NEW.raw_user_meta_data->>''course'', ''Undeclared''),
    COALESCE(NEW.raw_user_meta_data->>''course_year'', ''Year 1''),
    _dob,
    COALESCE(NEW.raw_user_meta_data->>''study_time'', ''Afternoons''),
    COALESCE(NEW.raw_user_meta_data->>''study_method'', ''Group Study''),
    COALESCE(NEW.raw_user_meta_data->>''current_mood'', ''Focused''),
    _age,
    ''They/Them'',
    ''https://via.placeholder.com/400'',
    COALESCE(NEW.raw_user_meta_data->>''bio'', '''')
  );
  RETURN NEW;
END;
';
