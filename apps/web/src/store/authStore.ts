import { create } from 'zustand';

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  accountType: 'client' | 'worker';
  verificationStatus: 'unverified' | 'pending' | 'verified';
  isEmailVerified: boolean;
  isAvailableNow?: boolean;
  badges: string[];
  avatar?: string;
  title?: string;
  language?: 'en' | 'bn';
  rating?: number;
  completedJobs?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (userUpdates: Partial<User>) => void;
  initialize: () => void;
}

/** Mirror token to a cookie so Next.js middleware can read it server-side */
function setCookie(value: string | null) {
  if (typeof document === 'undefined') return;
  if (value) {
    document.cookie = `collab_bd_token=${value};path=/;max-age=${60 * 60 * 24 * 7};SameSite=Lax`;
  } else {
    document.cookie = `collab_bd_token=;path=/;max-age=0`;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: (token: string, user: User) => {
    localStorage.setItem('collab_bd_token', token);
    localStorage.setItem('collab_bd_user', JSON.stringify(user));
    setCookie(token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('collab_bd_token');
    localStorage.removeItem('collab_bd_user');
    setCookie(null);
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: (userUpdates: Partial<User>) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...userUpdates };
      localStorage.setItem('collab_bd_user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },

  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('collab_bd_token');
      const userStr = localStorage.getItem('collab_bd_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setCookie(token); // Ensure cookie is fresh
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem('collab_bd_token');
          localStorage.removeItem('collab_bd_user');
          setCookie(null);
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    }
  },
}));
