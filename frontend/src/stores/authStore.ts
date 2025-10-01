import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isLoggedIn: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  isLoggedIn: Boolean(localStorage.getItem('token')),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token, isLoggedIn: Boolean(token) });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, isLoggedIn: false });
    window.dispatchEvent(new Event('auth-change'));
  },
}));
