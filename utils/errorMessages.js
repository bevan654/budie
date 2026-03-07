export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';

  const message = error.message || error.toString();

  // Supabase auth errors
  if (message.includes('Invalid login credentials')) {
    return 'Email or password is incorrect';
  }

  if (message.includes('Email not confirmed')) {
    return 'Please check your email and confirm your account before logging in';
  }

  if (message.includes('User already registered')) {
    return 'This email is already registered. Please log in instead';
  }

  // Network errors
  if (message.includes('Network request failed') || message.includes('fetch')) {
    return 'Check your internet connection and try again';
  }

  // JWT errors
  if (message.includes('JWT expired') || message.includes('token')) {
    return 'Session expired. Please log in again';
  }

  // Permission errors
  if (message.includes('Permission') || message.includes('access')) {
    return 'You do not have permission to perform this action';
  }

  // Database errors
  if (message.includes('violates') || message.includes('constraint')) {
    return 'Invalid data. Please check your input and try again';
  }

  // Default: Return original message if no match
  return message;
};
