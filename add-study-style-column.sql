-- Adds a study_style column to profiles.
-- Allowed values are enforced client-side; keep flexible to allow future styles.
alter table public.profiles
  add column if not exists study_style text;

create index if not exists profiles_study_style_idx
  on public.profiles (study_style);
