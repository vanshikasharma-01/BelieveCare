// Single source of truth for the backend's base URL. All api/*.ts
// files should build their axios instances from this instead of
// hardcoding "http://localhost:5000" — that only works for local
// development and silently breaks the app the moment it's deployed
// anywhere else.
//
// Set VITE_API_URL in frontend/.env to override (e.g.
// VITE_API_URL=https://api.yourdomain.com/api in production).
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
