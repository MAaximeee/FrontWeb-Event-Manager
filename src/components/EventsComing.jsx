import { useEffect, useState } from "react";
 
const EventsComing = ({ events = [], selectedDate, loading }) => {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
 
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await fetch("/api/matches/upcoming");
        const data = await res.json();
        setUpcomingMatches(data);
      } catch (err) {
        console.error("Erreur API :", err);
      } finally {
        setSummaryLoading(false);
      }
    };
 
    fetchUpcoming();
  }, []);
 
  if (loading) {
    return <div className="text-white">Chargement...</div>;
  }
 
  const todayMatches = upcomingMatches.filter(match => {
    const today = new Date().toDateString();
    return new Date(match.date).toDateString() === today;
  });
 
  const nextMatch = upcomingMatches[0];
 
  return (
    <div className="flex flex-col gap-4">
 
      {/* 🔥 RÉSUMÉ */}
      <div className="bg-zinc-800 p-4 rounded-xl text-white">
        {summaryLoading ? (
          <div>Chargement du résumé...</div>
        ) : (
          <>
            <div>Total des matchs à venir : {upcomingMatches.length}</div>
            <div>Matchs aujourd’hui : {todayMatches.length}</div>
            {nextMatch && (
              <div>
                Prochain match : {nextMatch.title} à{" "}
                {new Date(nextMatch.date).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </>
        )}
      </div>
 
      {/* 📅 MATCHS PAR DATE */}
      {!events.length ? (
        <div className="text-white mt-10 flex justify-center ">
          Aucun événement pour cette date
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold text-white">
            Événements du {selectedDate.toLocaleDateString("fr-FR")}
          </h2>
 
          {events.map(event => (
            <div
              key={event.id}
              className="bg-zinc-700 p-3 rounded-lg"
            >
              <div className="text-white font-semibold">
                {event.title}
              </div>
 
              <div className="text-gray-300 text-sm">
                {new Date(event.date).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
 
export default EventsComing;