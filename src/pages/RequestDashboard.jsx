import React, { useEffect, useState } from "react";
import axios from "axios";
import RequestList from "../components/RequestList";

const RequestDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await axios.get("http://localhost:8000/api/auth/home", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Erreur récupération utilisateur :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div className="text-white text-center mt-20">Chargement...</div>;
  }

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  if (!isAdmin) {
    return (
      <div className="text-white text-center mt-20">
        Accès refusé : Admin seulement
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <h1 className="text-3xl font-bold text-white mb-6">RequestDashboard</h1>
      <RequestList />
    </div>
  );
};

export default RequestDashboard; 