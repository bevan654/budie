export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEduEmail = (email) => {
  if (!validateEmail(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  // TODO: Re-enable .edu.au check before production
  // if (!email.toLowerCase().endsWith('.edu.au')) {
  //   return { valid: false, message: 'You must use a valid Australian university email (.edu.au)' };
  // }
  return { valid: true };
};

export const validateDob = (dob) => {
  if (!dob) {
    return { valid: false, message: 'Date of birth is required' };
  }
  const dobDate = new Date(dob);
  if (isNaN(dobDate.getTime())) {
    return { valid: false, message: 'Please enter a valid date of birth' };
  }
  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }
  if (age < 16) {
    return { valid: false, message: 'You must be at least 16 years old to sign up' };
  }
  if (age > 100) {
    return { valid: false, message: 'Please enter a valid date of birth' };
  }
  return { valid: true, age };
};

export const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'Password must contain both letters and numbers' };
  }

  return { valid: true };
};

export const validateAge = (age) => {
  const ageNum = parseInt(age);

  if (isNaN(ageNum)) {
    return { valid: false, message: 'Age must be a number' };
  }

  if (ageNum < 18 || ageNum > 100) {
    return { valid: false, message: 'Age must be between 18 and 100' };
  }

  return { valid: true };
};

export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || value.trim() === '') {
    return { valid: false, message: `${fieldName} is required` };
  }

  return { valid: true };
};
