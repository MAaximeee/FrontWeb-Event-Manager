/**
 * Grille mensuelle à hauteur fixe (6 lignes) — pastilles, pas de titres dans les cases.
 */
export function CalendarGrid({
  currentDate,
  calendarDays,
  monthNames,
  dayNames,
  today,
  selectedDay,
  getEventsForDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onSelectDay,
  canAddEvent,
  onToggleAddForm,
}) {
  const todayKey = today.toDateString();
  const selectedKey = selectedDay?.toDateString() ?? null;

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-700 px-3 py-3 sm:px-4 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onPreviousMonth}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-700 transition"
            aria-label="Mois précédent"
          >
            ←
          </button>
          <h2 className="truncate text-base font-semibold text-white sm:text-lg">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            type="button"
            onClick={onNextMonth}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-700 transition"
            aria-label="Mois suivant"
          >
            →
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToday}
            className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition sm:text-sm"
          >
            Aujourd&apos;hui
          </button>
          {canAddEvent && (
            <button
              type="button"
              onClick={onToggleAddForm}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 transition"
              title="Ajouter un événement"
              aria-label="Ajouter un événement"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
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
      </div>

      <div className="grid shrink-0 grid-cols-7 border-b border-zinc-700 bg-zinc-900/40">
        {dayNames.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-xs font-medium text-zinc-500 sm:py-3"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          const isToday = day.date.toDateString() === todayKey;
          const isSelected = selectedKey === day.date.toDateString();
          const count = dayEvents.length;

          return (
            <button
              type="button"
              key={index}
              onClick={() => onSelectDay(day.date)}
              className={`relative flex min-h-0 flex-col border-b border-r border-zinc-700/90 p-2 text-left transition sm:p-3 ${
                !day.isCurrentMonth
                  ? "bg-zinc-900/80 text-zinc-600"
                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700/50"
              } ${isToday ? "ring-1 ring-inset ring-orange-500/80" : ""} ${
                isSelected ? "bg-zinc-700/60 ring-1 ring-inset ring-orange-400/70" : ""
              }`}
            >
              <span
                className={`text-sm font-semibold tabular-nums sm:text-base ${
                  isToday ? "text-orange-400" : isSelected ? "text-orange-300" : ""
                }`}
              >
                {day.date.getDate()}
              </span>

              {count > 0 && (
                <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <span
                      key={ev.id}
                      className="h-2 w-2 shrink-0 rounded-full bg-orange-500"
                      title={ev.title}
                    />
                  ))}
                  {count > 3 && (
                    <span className="text-[10px] leading-none text-zinc-500">
                      +{count - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
