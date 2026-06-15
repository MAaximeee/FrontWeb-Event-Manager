import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/api/requests");
      setRequests(res.data.data || []);
    } catch (err) {
      console.error("Erreur récupération demandes :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/requests/${id}/accept`, {});
      fetchRequests();
    } catch (err) {
      console.error("Erreur approbation :", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/api/requests/${id}/reject`, {});
      fetchRequests();
    } catch (err) {
      console.error("Erreur refus :", err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return <p className="text-white text-center mt-20">Chargement...</p>;
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const treatedRequests = requests.filter(
    (r) => r.status === "accepted" || r.status === "rejected",
  );

  const statusBadgeClass = (status) =>
    status === "accepted"
      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
      : "bg-red-500/20 text-red-300 border border-red-500/30";

  return (
    <div className="text-white">
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Demandes en attente</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-zinc-400">Aucune demande en attente</p>
        ) : (
          <div className="flex flex-col gap-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-xl border border-zinc-700 bg-zinc-800/80 p-4 shadow-lg shadow-black/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      {request.creator?.username || "Utilisateur"}
                    </p>
                    <p className="text-zinc-400 text-sm">Objet : {request.objet}</p>
                    {request.creator?.email && (
                      <p className="text-zinc-500 text-xs mt-1">
                        {request.creator.email}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleExpand(request.id)}
                      className="rounded-lg bg-zinc-700 hover:bg-zinc-600 px-3 py-2 text-xs sm:text-sm transition"
                    >
                      {expandedId === request.id ? "Masquer" : "Voir"}
                    </button>
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="rounded-lg bg-orange-500 hover:bg-orange-600 px-3 py-2 text-xs sm:text-sm transition"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="rounded-lg bg-red-700 hover:bg-red-800 px-3 py-2 text-xs sm:text-sm transition"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
                {expandedId === request.id && (
                  <div className="mt-4 border-t border-zinc-700 pt-4">
                    <p className="text-zinc-300 font-semibold text-sm">Message</p>
                    <p className="text-white mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                      {request.message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Demandes traitées</h2>
        {treatedRequests.length === 0 ? (
          <p className="text-zinc-400">Aucune demande traitée</p>
        ) : (
          <div className="flex flex-col gap-4">
            {treatedRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-xl border border-zinc-700 bg-zinc-800/80 p-4 shadow-lg shadow-black/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">
                      {request.creator?.username || "Utilisateur"}
                    </p>
                    <p className="text-zinc-400 text-sm">Objet : {request.objet}</p>
                    {request.creator?.email && (
                      <p className="text-zinc-500 text-xs mt-1">
                        {request.creator.email}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <button
                      onClick={() => toggleExpand(request.id)}
                      className="rounded-lg bg-zinc-700 hover:bg-zinc-600 px-3 py-2 text-xs sm:text-sm transition"
                    >
                      {expandedId === request.id ? "Masquer" : "Voir"}
                    </button>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${statusBadgeClass(request.status)}`}
                    >
                      {request.status === "accepted" ? "Acceptée" : "Refusée"}
                    </span>
                  </div>
                </div>
                {expandedId === request.id && (
                  <div className="mt-4 border-t border-zinc-700 pt-4">
                    <p className="text-zinc-300 font-semibold text-sm">Message</p>
                    <p className="text-white mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                      {request.message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RequestList;