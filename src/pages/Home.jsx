import { useCallback, useState } from "react";

import Calendar from "../components/Calendar";
import EventsComing from "../components/EventsComing";
import ScoreBoardDetails from "../components/ScoreBoardDetails";
import { useEvents } from "../hooks/useEvents";
import {
  eventDayStart,
  startOfCalendarDay,
} from "../utils/eventPresentation.js";

function Home() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDay, setSelectedDay] = useState(() => startOfCalendarDay());
  const { events, loading, error } = useEvents();

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);

    const day = event?.dueDate ? eventDayStart(event.dueDate) : null;
    if (day) {
      setSelectedDay(day);
    }
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="w-full 2xl:mx-auto 2xl:max-w-[82rem]">
        <div
          className={[
            "grid grid-cols-1 gap-5 lg:gap-6 lg:items-start w-full",
            "lg:grid-cols-[minmax(17rem,20rem)_minmax(0,1fr)_minmax(17rem,20rem)]",
            "min-[1800px]:grid-cols-[minmax(15rem,20rem)_minmax(22rem,34rem)_minmax(15rem,20rem)] min-[1800px]:justify-center",
          ].join(" ")}
        >
          <div className="min-h-[300px] lg:min-h-[600px] min-[1800px]:min-h-[min(600px,calc(100vh-9rem))] min-[1800px]:max-h-[calc(100vh-9rem)] bg-zinc-800 border border-zinc-700 shadow-sm p-3 sm:p-4 rounded-lg flex flex-col overflow-hidden">
            <EventsComing
              events={events}
              loading={loading}
              onSelectEvent={handleSelectEvent}
              selectedEventId={selectedEvent?.id ?? null}
              selectedDay={selectedDay}
              onSelectedDayChange={setSelectedDay}
            />
          </div>

          <div className="self-start bg-zinc-800 border border-zinc-700 shadow-sm rounded-lg p-4 sm:p-5 min-w-0">
            {selectedEvent ? (
              <ScoreBoardDetails event={selectedEvent} />
            ) : (
              <p className="py-12 text-center text-sm text-gray-400">
                {loading
                  ? "Chargement…"
                  : "Sélectionnez un événement dans la liste ou le calendrier."}
              </p>
            )}
          </div>

          <div className="min-h-[300px] lg:min-h-[600px] min-[1800px]:min-h-[min(600px,calc(100vh-9rem))] min-[1800px]:max-h-[calc(100vh-9rem)] bg-zinc-800 border border-zinc-700 shadow-sm p-3 sm:p-4 rounded-lg flex flex-col overflow-hidden min-w-0">
            <Calendar
              events={events}
              onSelectEvent={handleSelectEvent}
              selectedEventId={selectedEvent?.id ?? null}
              selectedDay={selectedDay}
              onSelectedDayChange={setSelectedDay}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
