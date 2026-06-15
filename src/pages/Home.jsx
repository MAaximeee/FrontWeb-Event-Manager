import { useCallback, useState } from "react";

import Calendar from "../components/Calendar";
import EventsComing from "../components/EventsComing";
import Scoreboard from "../components/Scoreboard";
import ScoreBoardDetails from "../components/ScoreBoardDetails";
import { useEvents } from "../hooks/useEvents";
import { eventDayStart, startOfCalendarDay } from "../utils/eventPresentation.js";

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

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(17rem,20rem)_minmax(0,1fr)_minmax(17rem,20rem)] gap-5 lg:gap-6 lg:items-start w-full">
        <div className="min-h-[300px] lg:min-h-[600px] bg-zinc-800 border border-zinc-700 shadow-sm p-3 sm:p-4 rounded-lg flex flex-col overflow-hidden">
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
            <Scoreboard events={events} loading={loading} />
          )}
        </div>

        <div className="min-h-[300px] lg:min-h-[600px] bg-zinc-800 border border-zinc-700 shadow-sm p-3 sm:p-4 rounded-lg flex flex-col overflow-hidden min-w-0">
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
  );
}

export default Home;
