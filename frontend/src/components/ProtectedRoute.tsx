import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  // Roles allowed to view this route, e.g. ["Owner", "IT Staff"].
  allowedRoles: string[];
}

export function getSessionRole(): string | null {
  try {
    const stored = sessionStorage.getItem("user");
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return parsed?.role || null;
  } catch {
    return null;
  }
}

// Where to send someone who's logged in but hit a route that isn't
// theirs — their own home, not the login page.
export function getHomeForRole(role: string | null): string {
  if (role === "Owner" || role === "IT Staff") return "/owner-dashboard";
  if (role === "Customer") return "/home";
  return "/";
}

/**
 * Wrap a <Route element> with this to require login + a matching
 * role. Reads identity from sessionStorage, which is tab-isolated —
 * so an admin session in one tab can never leak into (or gate) a
 * customer route open in another tab, and vice versa.
 */
function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = sessionStorage.getItem("token");
  const role = getSessionRole();

  // Not logged in at all (in this tab) — send to Login.
  if (!token || !role) {
    return <Navigate to="/" replace />;
  }

  // Logged in, but as the wrong role for this route — send them to
  // their own dashboard rather than rendering a page that isn't
  // theirs (even partially, before an API call fails).
  if (!allowedRoles.includes(role)) {
    return <Navigate to={getHomeForRole(role)} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
