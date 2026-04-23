import { create } from 'zustand';
import { authAPI } from '../utils/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  initialized: false,

  init: async () => {
    const token = localStorage.getItem('token');
    if (!token) return set({ initialized: true });
    try {
      const { user } = await authAPI.getMe();
      set({ user, token, initialized: true });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, initialized: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { token, user } = await authAPI.login({ email, password });
      localStorage.setItem('token', token);
      set({ user, token, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: err.message };
    }
  },

  register: async (name, email, password, domain) => {
    set({ loading: true });
    try {
      const { token, user } = await authAPI.register({ name, email, password, domain });
      localStorage.setItem('token', token);
      set({ user, token, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: err.message };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  updateUser: (user) => set({ user }),
}));

export default useAuthStore;
