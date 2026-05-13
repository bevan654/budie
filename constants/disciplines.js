export const BROAD_DISCIPLINES = [
  'Computer Science',
  'Engineering',
  'Mathematics',
  'Physics',
  'Biology',
  'Chemistry',
  'Business',
  'Economics',
  'Psychology',
  'Medicine',
  'Law',
  'Art',
  'Health',
];

// ILIKE patterns used to match a profile's free-text `course` field against
// a selected broad discipline. Patterns are case-insensitive substrings.
export const BROAD_DISCIPLINE_PATTERNS = {
  'Computer Science': ['%comput%', '%software%', '%data sci%', '%cyber%', '%information tech%', '%it %', '% ai %', '%machine learn%'],
  'Engineering': ['%engineer%'],
  'Mathematics': ['%math%', '%statist%'],
  'Physics': ['%physic%', '%astrophys%'],
  'Biology': ['%biolog%', '%biomed%', '%biochem%', '%genetic%', '%zoolog%', '%ecolog%'],
  'Chemistry': ['%chem%'],
  'Business': ['%business%', '%management%', '%marketing%', '%finance%', '%accounting%', '%mba%'],
  'Economics': ['%econom%'],
  'Psychology': ['%psych%'],
  'Medicine': ['%medic%', '%pharm%', '%nurs%', '%dent%', '%vetinary%', '%veterin%'],
  'Law': ['%law%', '%legal%', '%juris%'],
  'Art': ['%art%', '%design%', '%music%', '%film%', '%theatre%', '%theater%', '%architect%'],
  'Health': ['%health%', '%therap%', '%nutrition%', '%fitness%', '%public health%', '%kinesi%'],
};
