import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { api } from "../api/client.js";

// verif token expirer
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    return Date.now() > exp;
  } catch {
    return true;
  }
};

const RouteProteger = ({ roles }) => {
  const [loading, setLoading] = useState(!!roles);
  const [hasAccess, setHasAccess] = useState(!roles);

  const token = localStorage.getItem("token");
  const isInvalidToken = !token || isTokenExpired(token);

  useEffect(() => {
    if (isInvalidToken) {
      localStorage.removeItem("token");
      setLoading(false);
      return;
    }

    if (!roles) return;

    const checkAccess = async () => {
      try {
        const res = await api.get("/api/auth/home");

        const userRoles = res.data.user?.roles || [];
        const hasRole = roles.some((role) => userRoles.includes(role));
        setHasAccess(hasRole);
      } catch (err) {
        console.error("Erreur vérification rôle:", err);
        setHasAccess(false);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [roles, token, isInvalidToken]);

  if (isInvalidToken) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="text-white text-center mt-20">Chargement...</div>;
  }

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RouteProteger;
