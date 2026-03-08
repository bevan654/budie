import { create } from 'zustand';

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
  bio: '',
  photoUri: null,
  password: '',
  confirmPassword: '',
  consentTC: false,
  consentPrivacy: false,
};

const useSignupStore = create((set) => ({
  formData: { ...INITIAL_STATE },

  updateField: (field, value) =>
    set((state) => ({ formData: { ...state.formData, [field]: value } })),

  updateFields: (fields) =>
    set((state) => ({ formData: { ...state.formData, ...fields } })),

  resetForm: () => set({ formData: { ...INITIAL_STATE } }),
}));

export default useSignupStore;
