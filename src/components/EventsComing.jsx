import { useEffect, useState } from "react";

const EventsComing = ({ onSelectEvent }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [teamsByEvent, setTeamsByEvent] = useState({});
  const [selectedEventId, setSelectedEventId] = useState(null); // <-- nouvel état

  // Récupération des événements
  useEffect(() => {
    fetch("http://localhost:8000/api/event")
      .then(res => res.json())
      .then(data => {
        if (data.success) setEvents(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Récupération des équipes pour chaque événement
  useEffect(() => {
    events.forEach(ev => {
      fetch(`http://localhost:8000/api/event/${ev.id}/teams`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTeamsByEvent(prev => ({ ...prev, [ev.id]: data.data }));
          }
        });
    });
  }, [events]);

  const today = new Date();
  today.setHours(0,0,0,0);

  const upcomingEvents = events.filter(ev => {
    if (!ev.dueDate) return false;
    const evDate = new Date(ev.dueDate); evDate.setHours(0,0,0,0);
    return evDate > today;
  });
  const liveEvents = events.filter(ev => {
    if (!ev.dueDate) return false;
    const evDate = new Date(ev.dueDate); evDate.setHours(0,0,0,0);
    return evDate.getTime() === today.getTime();
  });
  const pastEvents = events.filter(ev => {
    if (!ev.dueDate) return false;
    const evDate = new Date(ev.dueDate); evDate.setHours(0,0,0,0);
    return evDate < today;
  });

  const renderEvents = activeTab === "upcoming" ? upcomingEvents :
                       activeTab === "live" ? liveEvents : pastEvents;

  if (loading) return <div className="text-white text-center py-6">Chargement...</div>;

  const getTabClass = (tab) => `px-4 py-1 text-sm font-semibold rounded transition-colors duration-200 cursor-pointer ${
    activeTab === tab ? "bg-orange-500 text-white" : "bg-zinc-700 text-gray-400 hover:bg-zinc-600"
  }`;

  // Grouper par sport
  const eventsBySport = renderEvents.reduce((acc, ev) => {
    const type = ev.type || "Sport inconnu";
    if (!acc[type]) acc[type] = [];
    acc[type].push(ev);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {/* Onglets */}
      <div className="flex gap-2 justify-center mb-4">
        {["upcoming","live","past"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={getTabClass(tab)}>
            {tab === "upcoming" ? "À venir" : tab === "live" ? "En direct" : "Passés"}
          </button>
        ))}
      </div>

      {Object.keys(eventsBySport).length === 0 && (
        <div className="text-white text-center py-4">Aucun événement disponible</div>
      )}

      {Object.entries(eventsBySport).map(([sport, sportEvents]) => (
        <div key={sport} className="flex flex-col gap-2">
          {/* Nom du sport */}
          <div className="text-orange-400 font-semibold uppercase text-sm mb-1">{sport}</div>

          {sportEvents.map(ev => {
            const eventDate = new Date(ev.dueDate);
            const teams = teamsByEvent[ev.id] || [];
            const teamA = teams[0]?.name ?? "Équipe A";
            const teamB = teams[1]?.name ?? "Équipe B";

            // Déterminer si c'est l'événement sélectionné
            const isSelected = ev.id === selectedEventId;

            return (
              <div
                key={ev.id}
                className={`flex items-center text-white px-2 py-1 rounded cursor-pointer transition-colors duration-200 ${
                  isSelected ? "bg-black-700" : "hover:bg-zinc-700"
                }`}
                onClick={() => {
                  setSelectedEventId(ev.id);
                  onSelectEvent?.(ev);
                }}
              >
                {/* Date / Heure */}
                <div className="text-gray-400 text-xs w-[80px] text-left">
                  {eventDate.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"})}{" "}
                  {eventDate.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
                </div>

                {/* Séparateur vertical */}
                <div className="border-l border-gray-600 mx-2 h-10" />

                {/* Équipes verticales */}
                <div className="flex-1 flex flex-col items-center text-sm">
                  <span className="font-medium">{teamA}</span>
                  <div className="w-full border-t border-gray-600 my-1" />
                  <span className="font-medium">{teamB}</span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default EventsComing;