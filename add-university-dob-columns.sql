-- Add new columns to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university TEXT NOT NULL DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob DATE;

-- Update the trigger to use new signup metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _dob DATE;
  _age INTEGER;
BEGIN
  BEGIN
    _dob := (NEW.raw_user_meta_data->>'dob')::DATE;
  EXCEPTION WHEN OTHERS THEN
    _dob := NULL;
  END;

  IF _dob IS NOT NULL THEN
    _age := DATE_PART('year', AGE(_dob));
  ELSE
    _age := 20;
  END IF;

  INSERT INTO public.profiles (id, email, name, university, course, course_year, dob, study_time, study_method, current_mood, age, pronouns, photo_url)
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
    COALESCE(NEW.raw_user_meta_data->>'course_year', 'Year 1'),
    _dob,
    'Afternoons',
    'Group Study',
    'Focused',
    _age,
    'They/Them',
    'https://via.placeholder.com/400'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
