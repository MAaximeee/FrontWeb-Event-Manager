import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // filtre par statut
  const [sortByDate, setSortByDate] = useState("desc"); // tri par date

  // Récupérer toutes les demandes
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/requests", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRequests(res.data.data);
    } catch (err) {
      console.error(
        "Erreur récupération demandes :",
        err.response ? err.response.data : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Accepter une demande
  const handleApprove = async (id) => {
    try {
      await axios.put(
        `http://localhost:8000/api/requests/${id}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchRequests();
    } catch (err) {
      console.error(
        "Erreur approbation :",
        err.response ? err.response.data : err.message
      );
    }
  };

  // Refuser une demande
  const handleReject = async (id) => {
    try {
      await axios.put(
        `http://localhost:8000/api/requests/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchRequests();
    } catch (err) {
      console.error(
        "Erreur refus :",
        err.response ? err.response.data : err.message
      );
    }
  };

  // Filtrer et trier les demandes avant affichage
  const filteredRequests = requests
    .filter((req) => filterStatus === "all" || req.status === filterStatus)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortByDate === "asc" ? dateA - dateB : dateB - dateA;
    });

  if (loading)
    return <p className="text-white text-center mt-20">Chargement...</p>;

  return (
    <div className="min-h-screen bg-zinc-900 p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">
        Demandes de changement de rôle
      </h1>

      {/* Filtres */}
      <div className="flex gap-4 mb-6 items-center">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-zinc-800 p-2 rounded"
        >
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="accepted">Acceptée</option>
          <option value="rejected">Refusée</option>
        </select>

        <select
          value={sortByDate}
          onChange={(e) => setSortByDate(e.target.value)}
          className="bg-zinc-800 p-2 rounded"
        >
          <option value="desc">Date décroissante</option>
          <option value="asc">Date croissante</option>
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <p>Aucune demande à afficher</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-zinc-800 p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                {/* Affichage prénom, nom et email */}
                <p className="font-semibold">
                  {request.user?.firstName || ""}{" "}
                  {request.user?.lastName || ""} (
                  {request.user?.email || "Email inconnu"})
                </p>

                <p className="text-gray-400 text-sm">Objet : {request.objet}</p>
                <p className="text-gray-400 text-sm">Message : {request.message}</p>
                <p className="text-gray-400 text-sm">
                  Date de la demande :{" "}
                  {new Date(request.createdAt).toLocaleString("fr-FR")}
                </p>
                <p className="text-gray-400 text-sm">
                  Statut : {request.status || "En attente"}
                </p>
              </div>

              {/* Boutons Accepter / Refuser */}
              <div className="flex gap-2">
                {request.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                    >
                      Refuser
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;