import { create } from "zustand";
import { nakama } from "../services/nakama";

async function getErrorMessage(err: unknown, fallback: string): Promise<string> {
  if (err instanceof Response) {
    try {
      const data = await err.clone().json() as { message?: string };
      if (typeof data.message === "string" && data.message.length > 0) {
        return data.message;
      }
    } catch {
      // Fall back below if the response body isn't JSON.
    }

    if (err.statusText) {
      return err.statusText;
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === "object" && err !== null && "message" in err && typeof err.message === "string") {
    return err.message;
  }

  return fallback;
}

interface AuthState {
  userId: string | null;
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  loginEmail: (email: string, password: string, username?: string) => Promise<void>;
  loginGuest: (username?: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  username: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  loginEmail: async (email, password, username) => {
    set({ isLoading: true, error: null });
    try {
      const session = await nakama.authenticateEmail(email, password, username);
      set({
        userId: session.user_id,
        username: session.username,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: await getErrorMessage(err, "Authentication failed"),
        isLoading: false,
      });
    }
  },

  loginGuest: async (username) => {
    set({ isLoading: true, error: null });
    try {
      const session = await nakama.authenticateDevice(username);
      set({
        userId: session.user_id,
        username: session.username,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: await getErrorMessage(err, "Authentication failed"),
        isLoading: false,
      });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const restored = await nakama.restoreSession();
      if (restored) {
        set({
          userId: nakama.userId,
          username: nakama.username,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  logout: () => {
    nakama.logout();
    set({
      userId: null,
      username: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
