import { useState } from "react";

import EventsComing from "./EventsComing";
import Scoreboard from "./Scoreboard";
import ScoreBoardDetails from "./ScoreBoardDetails";

function DashboardEvents() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <EventsComing onSelectEvent={handleSelectEvent} />

      {selectedEvent ? (
        <ScoreBoardDetails event={selectedEvent} onClose={handleCloseDetails} />
      ) : (
        <Scoreboard />
      )}
    </div>
  );
}

export default DashboardEvents;
