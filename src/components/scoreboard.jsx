import { useEffect, useState } from "react";

const Scoreboard = () => {
  const [event, setEvent] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [timeToStart, setTimeToStart] = useState(null);

  useEffect(() => {
    fetch("https://event-manager.fr/api/event")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const todayEvent = data.data.find((ev) => {
            if (!ev.dueDate) return false;
            const evDate = new Date(ev.dueDate);
            evDate.setHours(0, 0, 0, 0);
            return evDate.getTime() === today.getTime();
          });

          if (todayEvent) {
            setEvent(todayEvent);

            fetch(`https://event-manager.fr/api/event/${todayEvent.id}/teams`)
              .then((res) => res.json())
              .then((teamData) => {
                if (teamData.success) setTeams(teamData.data);
                setLoading(false);
              })
              .catch(() => setLoading(false));
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  // Timer pour match en direct
  useEffect(() => {
    if (!event) return;

    if (event.status !== "pending") {
      const interval = setInterval(() => setElapsed((prev) => prev + 1), 1000);
      return () => clearInterval(interval);
    } else if (event.dueDate) {
      // Compteur avant le match
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

  if (loading)
    return <p className="text-white text-center py-10 text-lg">Chargement...</p>;

  if (!event) {
    return (
      <div className="w-full bg-zinc-800 rounded-xl px-6 py-8 text-center text-white shadow-lg">
        Aucun match aujourd'hui
      </div>
    );
  }

  const isLive = event.status !== "pending";
  const teamA = teams[0]?.name ?? "Équipe A";
  const teamB = teams[1]?.name ?? "Équipe B";

  // Calcul du countdown sous forme hh:mm:ss
  const formatCountdown = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full bg-zinc-800 rounded-xl p-6 shadow-lg flex flex-col gap-6 items-center text-white">
      {/* Type de sport */}
      <div className="text-white text-lg font-semibold">{event.type || "Sport inconnu"}</div>

      {/* Titre : date de l'événement */}
      <div className="text-white text-2xl font-bold text-center">
        {event.dueDate
          ? new Date(event.dueDate).toLocaleDateString("fr-FR") +
            " " +
            new Date(event.dueDate).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Date inconnue"}
      </div>

      {/* Scoreboard */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Team A */}
        <div className="flex-1 text-center text-lg font-semibold">{teamA}</div>

        {/* Score ou countdown */}
        <div className="flex-1 text-center flex flex-col items-center">
          {isLive ? (
            <>
              <span className="text-4xl font-bold">
                {event.scoreTeamA ?? 0} - {event.scoreTeamB ?? 0}
              </span>
              <span className="text-2xl font-mono mt-2">
                {Math.floor(elapsed / 60)}:{("0" + (elapsed % 60)).slice(-2)}
              </span>
              <span className="text-green-400 mt-1 text-sm uppercase font-semibold">
                En direct
              </span>
            </>
          ) : (
            <>
              <span className="animate-pulse text-red-500 text-xl font-bold mt-2">
                Match à venir
              </span>
              {timeToStart !== null && (
                <span className="text-white/80 mt-1 font-mono text-lg">
                  Début dans : {formatCountdown(timeToStart)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Team B */}
        <div className="flex-1 text-center text-lg font-semibold">{teamB}</div>
      </div>
    </div>
  );
};

export default Scoreboard;