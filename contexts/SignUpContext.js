import React, { createContext, useState, useContext, useCallback } from 'react';

const SignUpContext = createContext();

const INITIAL_STATE = {
  email: '',
  firstName: '',
  lastName: '',
  dob: '',
  university: '',
  course: '',
  yearOfStudy: '',
  studyTime: [],
  studyMethod: [],
  currentMood: [],
  prompts: [],
  subjects: [],
  interests: [],
  availability: [],
  bio: '',
  photoUri: null,
  password: '',
  confirmPassword: '',
  consentTC: false,
  consentPrivacy: false,
};

export function SignUpProvider({ children }) {
  const [formData, setFormData] = useState(INITIAL_STATE);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateFields = useCallback((fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_STATE);
  }, []);

  return (
    <SignUpContext.Provider value={{ formData, updateField, updateFields, resetForm }}>
      {children}
    </SignUpContext.Provider>
  );
}

export function useSignUp() {
  const context = useContext(SignUpContext);
  if (!context) {
    throw new Error('useSignUp must be used within a SignUpProvider');
  }
  return context;
}
