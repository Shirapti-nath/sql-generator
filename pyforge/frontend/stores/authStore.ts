"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  display_name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      login: async (email, password) => {
        const tokens = await api.login(email, password);
        set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
        const user = await api.me(tokens.access_token);
        set({ user });
      },

      register: async (email, password, displayName) => {
        const tokens = await api.register(email, password, displayName);
        set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
        const user = await api.me(tokens.access_token);
        set({ user });
      },

      logout: () => set({ user: null, accessToken: null, refreshToken: null }),

      loadUser: async () => {
        const token = get().accessToken;
        if (!token) return;
        try {
          const user = await api.me(token);
          set({ user });
        } catch {
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },
    }),
    { name: "pyforge-auth" }
  )
);
