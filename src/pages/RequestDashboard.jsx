import { useEffect, useState } from "react";
import { api } from "../api/client.js";
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
        const res = await api.get("/api/auth/home");
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
    return <div className="text-white text-center mt-24">Chargement...</div>;
  }

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  if (!isAdmin) {
    return (
      <div className="text-white text-center mt-24">
        Accès refusé : Admin seulement
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 px-4 sm:px-6 pt-24 pb-12 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 rounded-xl p-5 backdrop-blur-sm text-center">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">
            Gestion des demandes
          </h1>
          <p className="text-zinc-400">Validez ou refusez les demandes</p>
        </div>
        <RequestList />
      </div>
    </div>
  );
};

export default RequestDashboard;
