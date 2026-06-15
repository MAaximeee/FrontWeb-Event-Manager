/**
 * Composant pour afficher la liste des événements (aujourd'hui et prochainement)
 */
export function EventsList({
  todayEvents,
  upcomingEvents,
  loading,
  onSelectEvent,
}) {
  return (
    <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-lg bg-zinc-800 p-4 sm:p-6 lg:h-full">
      <h2 className="text-2xl font-bold text-orange-500 mb-4 shrink-0">
        Événements
      </h2>

      {/* Événements actuels */}
      <div className="mb-4 shrink-0">
        <h3 className="text-lg font-semibold text-white mb-3">Aujourd'hui</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Chargement...</p>
        ) : todayEvents.length > 0 ? (
          <div className="space-y-2">
            {todayEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className="bg-orange-500 p-2 rounded text-white text-sm cursor-pointer hover:bg-orange-700 transition"
              >
                <p className="font-medium">{event.title}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Aucun événement aujourd'hui</p>
        )}
      </div>

      {/* Événements prochains */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <h3 className="mb-2 shrink-0 text-lg font-semibold text-white">
          Prochainement
        </h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Chargement...</p>
        ) : upcomingEvents.length > 0 ? (
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className="bg-zinc-700 p-2 rounded text-white text-sm cursor-pointer hover:bg-zinc-600 transition"
              >
                <p className="font-medium">{event.title}</p>
                <p className="text-gray-400 text-xs">{event.dueDate}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Aucun événement prévu</p>
        )}
      </div>
    </div>
  );
}
