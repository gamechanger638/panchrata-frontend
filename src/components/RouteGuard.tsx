import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RouteGuard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Wait for auth state to be confirmed
    if (isLoading) return;

    const path = location.pathname;

    // 2. If not authenticated, force to login (except forgot-password)
    if (!isAuthenticated) {
      if (path !== "/login" && path !== "/forgot-password") {
        navigate("/login", { replace: true });
      }
      return;
    }

    // 3. If authenticated AND at / login page or root, send to their home
    if (isAuthenticated && (path === "/login" || path === "/")) {
      const targetPath = user?.role === "super_admin" ? "/admin" : "/volunteer";
      if (path !== targetPath) {
        navigate(targetPath, { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, location.pathname, navigate]);

  return null;
}
