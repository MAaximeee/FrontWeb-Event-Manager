import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

// verif token expirer
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() > exp;
  } catch (err) {
    return true;
  }
};

const RouteProteger = ({ roles }) => {
  const [loading, setLoading] = useState(!!roles);
  const [hasAccess, setHasAccess] = useState(!roles);

  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    if (!roles) return;

    const checkAccess = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/auth/home', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const userRoles = res.data.user?.roles || [];
        const hasRole = roles.some(role => userRoles.includes(role));
        setHasAccess(hasRole);
      } catch (err) {
        console.error('Erreur vérification rôle:', err);
        setHasAccess(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [roles, token]);

  if (loading) {
    return <div className="text-white text-center mt-20">Chargement...</div>;
  }

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RouteProteger;
