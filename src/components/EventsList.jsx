/**
 * Liste latérale : hauteur fixe, défilement interne uniquement.
 */
import { eventOrganizerName } from "../utils/eventPresentation.js";

function formatSelectedDayLabel(date) {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function EventRow({ event, variant, onSelect }) {
  const highlighted = variant === "today";
  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
        highlighted
          ? "bg-orange-500/90 text-white hover:bg-orange-600"
          : "bg-zinc-900/60 text-white hover:bg-zinc-700/80 border border-zinc-700/80"
      }`}
    >
      <p className="font-medium truncate">{event.title}</p>
      <p
        className={`mt-0.5 text-xs truncate ${
          highlighted ? "text-orange-100/90" : "text-zinc-400"
        }`}
      >
        {event.dueDate}
        {eventOrganizerName(event)
          ? ` · ${eventOrganizerName(event)}`
          : ""}
      </p>
    </button>
  );
}

export function EventsList({
  todayEvents,
  upcomingEvents,
  selectedDay,
  selectedDayEvents,
  loading,
  onSelectEvent,
  onShowTodayAndUpcoming,
}) {
  const showDayFilter = selectedDay != null;
  const selectedDayIsToday =
    showDayFilter &&
    selectedDay.toDateString() === new Date().toDateString();

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 p-4">
      <div className="flex shrink-0 items-start justify-between gap-2">
        <h2 className="text-lg font-bold text-white">Événements</h2>
        {showDayFilter && (
          <button
            type="button"
            onClick={onShowTodayAndUpcoming}
            className="shrink-0 text-xs font-medium text-orange-400 hover:text-orange-300"
          >
            Aujourd&apos;hui &amp; à venir
          </button>
        )}
      </div>

      {showDayFilter ? (
        <section className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
          <h3 className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-400 capitalize">
            {selectedDayIsToday
              ? "Aujourd'hui"
              : formatSelectedDayLabel(selectedDay)}
          </h3>
          {loading ? (
            <p className="text-sm text-zinc-500">Chargement…</p>
          ) : selectedDayEvents.length === 0 ? (
            <p className="text-sm text-zinc-500">Aucun événement ce jour-là</p>
          ) : (
            <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-0.5">
              {selectedDayEvents.map((event) => (
                <li key={event.id}>
                  <EventRow
                    event={event}
                    variant={selectedDayIsToday ? "today" : "upcoming"}
                    onSelect={onSelectEvent}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          <section className="mt-4 flex max-h-[38%] min-h-0 shrink-0 flex-col border-b border-zinc-700/80 pb-3">
            <h3 className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Aujourd&apos;hui
            </h3>
            {loading ? (
              <p className="text-sm text-zinc-500">Chargement…</p>
            ) : todayEvents.length === 0 ? (
              <p className="text-sm text-zinc-500">Aucun événement</p>
            ) : (
              <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-0.5">
                {todayEvents.map((event) => (
                  <li key={event.id}>
                    <EventRow
                      event={event}
                      variant="today"
                      onSelect={onSelectEvent}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
            <h3 className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Prochainement
            </h3>
            {loading ? (
              <p className="text-sm text-zinc-500">Chargement…</p>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-zinc-500">Aucun événement à venir</p>
            ) : (
              <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-0.5">
                {upcomingEvents.map((event) => (
                  <li key={event.id}>
                    <EventRow
                      event={event}
                      variant="upcoming"
                      onSelect={onSelectEvent}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </aside>
  );
}
