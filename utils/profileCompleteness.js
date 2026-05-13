// Returns 0-100 percentage of optional profile fields the user has filled.
export function getProfileCompleteness(profile) {
  if (!profile) return 0;
  const checks = [
    !!profile.bio,
    Array.isArray(profile.prompts) && profile.prompts.length > 0,
    Array.isArray(profile.subjects) && profile.subjects.length > 0,
    Array.isArray(profile.interests) && profile.interests.length > 0,
    Array.isArray(profile.availability) && profile.availability.length > 0,
    !!profile.pronouns,
    !!profile.study_style,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
