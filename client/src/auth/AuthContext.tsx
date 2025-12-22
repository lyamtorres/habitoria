
// React imports for context, state, and effects
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
// Helper to set the auth token for API requests
import { setAuthToken } from "../api/http";
// API functions for authentication
import * as authApi from "../api/auth";


// The shape of the authentication context
type AuthState = {
  token: string | null; // JWT token for API authentication
  email: string | null; // User's email
  isAuthenticated: boolean; // True if user is logged in
  login: (email: string, password: string) => Promise<void>; // Login function
  register: (email: string, password: string) => Promise<void>; // Register function
  logout: () => Promise<void>; // Logout function
};


// Create the authentication context
const AuthContext = createContext<AuthState | null>(null);


// Keys for storing token and email in localStorage
const TOKEN_KEY = "habitoria_token";
const EMAIL_KEY = "habitoria_email";


// Provides authentication state and actions to the app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State for the JWT token and user email, initialized from localStorage
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem(EMAIL_KEY));

  // IMPORTANT: Make sure the API layer sees the token before other `useEffect`s run (e.g. habits fetch).
  useLayoutEffect(() => {
    setAuthToken(token);
  }, [token]);

  // Whenever the token changes, persist it
  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  // Whenever the email changes, update localStorage
  useEffect(() => {
    if (email) localStorage.setItem(EMAIL_KEY, email);
    else localStorage.removeItem(EMAIL_KEY);
  }, [email]);

  // Memoize the context value to avoid unnecessary re-renders
  const value = useMemo<AuthState>(() => {
    return {
      token,
      email,
      isAuthenticated: !!token,
      // Login: calls API, saves token/email
      async login(emailInput, password) {
        const res = await authApi.login(emailInput, password);
        setToken(res.token);
        setEmail(res.email);
      },
      // Register: calls API, saves token/email
      async register(emailInput, password) {
        const res = await authApi.register(emailInput, password);
        setToken(res.token);
        setEmail(res.email);
      },
      // Logout: calls API, clears token/email
      async logout() {
        try {
          await authApi.logout();
        } finally {
          setToken(null);
          setEmail(null);
        }
      },
    };
  }, [token, email]);

  // Provide the authentication context to child components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to access the authentication context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}