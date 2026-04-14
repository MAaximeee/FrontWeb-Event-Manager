/**
 * Composant pour afficher la grille du calendrier
 */
export function CalendarGrid({
  currentDate,
  calendarDays,
  monthNames,
  dayNames,
  today,
  getEventsForDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onSelectEvent,
  canAddEvent,
  onToggleAddForm,
}) {
  const isSelectable = typeof onSelectEvent === "function";

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg bg-zinc-800 p-4 sm:p-6">
      {/* Header avec contrôles */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-500">Calendrier</h2>
        {canAddEvent && (
          <button
            onClick={onToggleAddForm}
            className="bg-orange-500 hover:bg-orange-700 text-white p-2 rounded-full transition"
            title="Ajouter un événement"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Calendrier */}
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full min-h-0 min-w-[600px] flex-col rounded-lg bg-zinc-800 sm:min-w-0">
          {/* Navigation du mois */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            <div className="flex items-center gap-4">
              <button
                onClick={onPreviousMonth}
                className="p-2 hover:bg-zinc-700 rounded text-white transition"
              >
                ←
              </button>
              <h3 className="text-xl font-semibold text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={onNextMonth}
                className="p-2 hover:bg-zinc-700 rounded text-white transition"
              >
                →
              </button>
            </div>
            <button
              onClick={onToday}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-700 text-white rounded transition"
            >
              Aujourd'hui
            </button>
          </div>

          {/* En-tête des jours */}
          <div className="grid grid-cols-7 border-b border-zinc-700">
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-gray-400 font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grille des jours */}
          <div className="flex-1 grid grid-cols-7 auto-rows-fr">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              const isToday = day.date.toDateString() === today.toDateString();
              return (
                <div
                  key={index}
                  className={`border-r border-b border-zinc-700 p-2 min-h-[60px] transition ${
                    isSelectable ? "cursor-pointer hover:bg-orange-500" : ""
                  } ${
                    !day.isCurrentMonth
                      ? "bg-zinc-900 text-gray-500"
                      : "text-white"
                  } ${isToday ? "bg-orange-700 text-white" : ""}`}
                >
                  <div className="font-medium mb-1">{day.date.getDate()}</div>
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSelectable) onSelectEvent(event);
                      }}
                      className={`bg-zinc-700 text-white text-xs p-1 rounded truncate mb-1 transition ${
                        isSelectable ? "cursor-pointer hover:bg-zinc-600" : ""
                      }`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
