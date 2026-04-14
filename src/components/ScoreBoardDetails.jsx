import { useEffect, useState } from "react";

const ScoreBoardDetails = ({ event, onClose }) => {
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [timeToStart, setTimeToStart] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  // Récupération des équipes
  useEffect(() => {
    fetch(`https://event-manager.fr/api/event/${event.id}/teams`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setTeams(data.data);
        setLoadingTeams(false);
      })
      .catch(() => setLoadingTeams(false));
  }, [event]);

  // Timer pour match en direct ou countdown
  useEffect(() => {
    if (!event) return;

    if (event.status !== "pending") {
      const interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
      return () => clearInterval(interval);
    } else if (event.dueDate) {
      const updateCountdown = () => {
        const now = new Date();
        const start = new Date(event.dueDate);
        const diff = Math.max(0, Math.floor((start - now) / 1000));
        setTimeToStart(diff);
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [event]);

  if (loadingTeams)
    return <div className="text-white text-center py-4">Chargement des équipes...</div>;

  const teamA = teams[0]?.name ?? "Équipe A";
  const teamB = teams[1]?.name ?? "Équipe B";
  const eventDate = event.dueDate ? new Date(event.dueDate) : null;
  const isLive = event.status !== "pending";

  const formatCountdown = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  };

  const getTabClass = (tab) =>
    `px-4 py-1 text-sm font-semibold rounded cursor-pointer transition-colors duration-200 ${
      activeTab === tab ? "bg-orange-500 text-white" : "bg-zinc-700 text-gray-400 hover:bg-zinc-600"
    }`;

  return (
    <div className="w-full bg-zinc-900 rounded-xl p-6 shadow-lg flex flex-col gap-6 text-white">
      
      {/* Bouton retour */}
      <button
        className="self-start px-3 py-1 bg-zinc-800 text-orange-400 hover:bg-orange-500 hover:text-white cursor-pointer transition-colors rounded-md"
        onClick={onClose}
      >
        ← Retour
      </button>

      {/* Type de sport */}
      <div className="text-orange-400 text-lg font-semibold text-center">{event.type || "Sport inconnu"}</div>

      {/* Titre de l'événement */}
      <div className="text-white text-2xl font-bold text-center">{event.title}</div>

      {/* Score et équipes */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-700 p-4 rounded-lg border-l-4 border-orange-500">
        <div className="flex-1 text-center">
          <div className="text-gray-400 text-sm uppercase">Équipe A</div>
          <div className="text-xl font-semibold text-white">{teamA}</div>
        </div>

        <div className="hidden md:block border-l border-gray-600 h-16 mx-4" />

        <div className="flex-1 text-center flex flex-col items-center">
          {isLive ? (
            <>
              <span className="text-4xl font-bold text-orange-400">{event.scoreTeamA ?? 0} - {event.scoreTeamB ?? 0}</span>
              <span className="text-2xl font-mono mt-2 text-white/80">{Math.floor(elapsed/60)}:{("0"+(elapsed%60)).slice(-2)}</span>
              <span className="text-green-400 mt-1 text-sm uppercase font-semibold">En direct</span>
            </>
          ) : (
            <>
              <span className="animate-pulse text-orange-500/90 text-xl font-bold mt-2">Match à venir</span>
              {timeToStart !== null && (
                <span className="text-white/80 mt-1 font-mono text-lg">
                  Début dans : {formatCountdown(timeToStart)}
                </span>
              )}
            </>
          )}
        </div>

        <div className="hidden md:block border-l border-gray-600 h-16 mx-4" />

        <div className="flex-1 text-center">
          <div className="text-gray-400 text-sm uppercase">Équipe B</div>
          <div className="text-xl font-semibold text-white">{teamB}</div>
        </div>
      </div>

      {/* Onglets : détails / composition / tournoi */}
      <div className="flex gap-2 justify-center mt-4">
        {["details", "composition", "tournoi"].map(tab => (
          <button key={tab} className={getTabClass(tab)} onClick={() => setActiveTab(tab)}>
            {tab === "details" ? "Détails" : tab === "composition" ? "Composition" : "Tournoi"}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div className="mt-4">
        {activeTab === "details" && (
          <div className="bg-zinc-700 p-4 rounded-lg border-l-4 border-orange-400 flex flex-col gap-2">
            {eventDate && (
              <div className="text-gray-300 text-sm">
                Date : <span className="text-orange-400">{eventDate.toLocaleDateString("fr-FR")} à {eventDate.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span>
              </div>
            )}
            <div className="text-gray-300 text-sm">
              Statut : <span className="text-orange-400">{event.status}</span>
            </div>
            {event.description && <div className="text-gray-400 text-sm mt-1">{event.description}</div>}
          </div>
        )}

        {activeTab === "composition" && (
          <div className="bg-zinc-700 p-4 rounded-lg border-l-4 border-orange-400 flex flex-col gap-4">
            <div className="text-orange-400 font-semibold text-center">Terrain</div>
            <div className="relative w-full h-64 bg-green-900 rounded-lg border border-green-600">
              
              {/* Équipe A joueurs */}
              {teams[0]?.players?.map((player, idx) => (
                <div
                  key={idx}
                  className="absolute bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-md"
                  style={{
                    top: `${10 + idx*12}%`, // répartir verticalement
                    left: "20%", // côté gauche
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  {player.name}
                </div>
              ))}

              {/* Équipe B joueurs */}
              {teams[1]?.players?.map((player, idx) => (
                <div
                  key={idx}
                  className="absolute bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md"
                  style={{
                    top: `${10 + idx*12}%`, // répartir verticalement
                    right: "20%", // côté droit
                    transform: "translate(50%, -50%)"
                  }}
                >
                  {player.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tournoi" && (
          <div className="bg-zinc-700 p-4 rounded-lg border-l-4 border-orange-400 flex flex-col gap-2">
            <div className="text-orange-400 font-semibold">Tournoi / Événements associés</div>
            {event.tournament?.matches?.map((match, idx) => (
              <div key={idx} className="text-white text-sm pl-2">
                • {match.title} - {new Date(match.dueDate).toLocaleDateString("fr-FR")}
              </div>
            ))}
            {!event.tournament && <div className="text-gray-400 text-sm">Aucun tournoi associé</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreBoardDetails;