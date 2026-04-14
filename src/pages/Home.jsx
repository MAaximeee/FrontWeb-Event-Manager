import { useState } from "react";
import EventsComing from "../components/EventsComing";
import Scoreboard from "../components/scoreboard";
import ScoreBoardDetails from "../components/ScoreBoardDetails";
import Calendar from "../components/Calendar";

const Home = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="flex flex-col lg:flex-row px-4 lg:px-12 gap-6 pt-24 pb-16">
      
      {/* Colonne gauche - EventsComing */}
      <div className="w-full lg:w-[320px] min-h-[300px] lg:min-h-[600px] bg-zinc-800 border border-zinc-700 shadow-sm flex-shrink-0 p-4 rounded-lg">
        <EventsComing onSelectEvent={setSelectedEvent} />
      </div>

      {/* Colonne centre - Scoreboard ou détails de l'événement */}
      <div className="w-full flex-1 flex flex-col items-center justify-start gap-4">
        {selectedEvent ? (
          <ScoreBoardDetails
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        ) : (
          <div className="w-full bg-zinc-800 border border-zinc-700 shadow-sm p-4 rounded-lg">
            <Scoreboard />
          </div>
        )}
      </div>

      {/* Colonne droite - Calendar */}
      <div className="w-full lg:w-[320px] min-h-[300px] lg:min-h-[600px] bg-zinc-800 border border-zinc-700 shadow-sm flex-shrink-0 p-4 flex flex-col gap-4 rounded-lg">
        <Calendar />
      </div>

    </div>
  );
};

export default Home;