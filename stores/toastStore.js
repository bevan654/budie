import { create } from 'zustand';

let toastTimeoutId = null;

const useToastStore = create((set) => ({
  toast: null,

  showToast: ({ message, type = 'info' }) => {
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    set({ toast: { message, type, key: Date.now() } });
    toastTimeoutId = setTimeout(() => {
      set({ toast: null });
    }, 3000);
  },

  dismissToast: () => {
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    set({ toast: null });
  },
}));

export default useToastStore;
