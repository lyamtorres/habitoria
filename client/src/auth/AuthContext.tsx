/**
 * AuthContext - Authentication state management for Habitoria
 * 
 * SECURITY CONSIDERATIONS:
 * - JWT tokens are stored in localStorage, which is a common pattern for web applications.
 * - localStorage is vulnerable to XSS (Cross-Site Scripting) attacks. To mitigate this risk:
 *   1. Ensure Content Security Policy (CSP) headers are configured on the backend
 *   2. All user input must be properly sanitized to prevent XSS injection
 *   3. Use HTTPS in production to prevent token interception
 *   4. Keep tokens short-lived (configure appropriate expiration times on backend)
 * - The email address is extracted from the JWT token claims rather than stored separately,
 *   reducing redundancy and potential data inconsistency.
 * - Token validation and signature verification are performed on the backend.
 */

// React imports for context, state, and effects
import { createContext, useContext, useLayoutEffect, useMemo, useState } from "react";
// Helper to set the auth token for API requests
import { setAuthToken } from "../api/http";
// API functions for authentication
import * as authApi from "../api/auth";
// JWT decoding utility
import { getEmailFromToken } from "../lib/jwt";


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


// Keys for storing token in localStorage
const TOKEN_KEY = "habitoria_token";


// Provides authentication state and actions to the app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State for the JWT token, initialized from localStorage
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  // Derive email from token whenever token changes
  const email = useMemo(() => getEmailFromToken(token), [token]);

  // IMPORTANT: Make sure the API layer sees the token before other `useEffect`s run (e.g. habits fetch).
  useLayoutEffect(() => {
    setAuthToken(token);
  }, [token]);

  // Whenever the token changes, persist it to localStorage
  useLayoutEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  // Memoize the context value to avoid unnecessary re-renders
  const value = useMemo<AuthState>(() => {
    return {
      token,
      email,
      isAuthenticated: !!token,
      // Login: calls API, saves token (email is derived from token)
      async login(emailInput, password) {
        const res = await authApi.login(emailInput, password);
        setToken(res.token);
      },
      // Register: calls API, saves token (email is derived from token)
      async register(emailInput, password) {
        const res = await authApi.register(emailInput, password);
        setToken(res.token);
      },
      // Logout: calls API, clears token
      async logout() {
        try {
          await authApi.logout();
        } finally {
          setToken(null);
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