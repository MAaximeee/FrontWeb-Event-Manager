import React, { useEffect, useState } from "react";
import axios from "axios";

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/requests", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
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
      await axios.put(
        `http://localhost:8000/api/requests/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchRequests();
    } catch (err) {
      console.error("Erreur approbation :", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(
        `http://localhost:8000/api/requests/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchRequests();
    } catch (err) {
      console.error("Erreur refus :", err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <p className="text-white text-center mt-20">Chargement...</p>;

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const treatedRequests = requests.filter((r) => r.status === "accepted" || r.status === "rejected");

  return (
    <div className="min-h-screen bg-zinc-900 p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Demandes en attente</h1>
      {pendingRequests.length === 0 ? (
        <p className="text-gray-400 mb-8">Aucune demande en attente</p>
      ) : (
        <div className="flex flex-col gap-4 mb-8">
          {pendingRequests.map((request) => (
            <div key={request.id} className="bg-zinc-800 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{request.creator?.username}</p>
                  <p className="text-gray-400 text-sm">Objet : {request.objet}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleExpand(request.id)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                  >
                    {expandedId === request.id ? "Masquer" : "Voir"}
                  </button>
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
                </div>
              </div>
              {expandedId === request.id && (
                <div className="mt-4 p-4 bg-zinc-700 rounded">
                  <p className="text-gray-300 font-semibold">Message :</p>
                  <p className="text-white mt-2">{request.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-6">Demandes traitées</h1>
      {treatedRequests.length === 0 ? (
        <p className="text-gray-400">Aucune demande traitée</p>
      ) : (
        <div className="flex flex-col gap-4">
          {treatedRequests.map((request) => (
            <div key={request.id} className="bg-zinc-800 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{request.creator?.username}</p>
                  <p className="text-gray-400 text-sm">Objet : {request.objet}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => toggleExpand(request.id)}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                  >
                    {expandedId === request.id ? "Masquer" : "Voir"}
                  </button>
                  <span
                    className={`px-3 py-1 rounded ${
                      request.status === "accepted"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {request.status === "accepted" ? "Acceptée" : "Refusée"}
                  </span>
                </div>
              </div>
              {expandedId === request.id && (
                <div className="mt-4 p-4 bg-zinc-700 rounded">
                  <p className="text-gray-300 font-semibold">Message :</p>
                  <p className="text-white mt-2">{request.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestList;