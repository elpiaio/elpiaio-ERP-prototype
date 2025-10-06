// src/Store/authStore.ts
import { create } from "zustand";

export type User = { id: string; name: string };

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// Convenience: set a default dev user (opcional)
if (typeof window !== "undefined") {
  // Only set default if not present
  const s = useAuthStore.getState();
  if (!s.user) {
    useAuthStore.setState({ user: { id: "u1", name: "Operador Demo" } });
  }
}
