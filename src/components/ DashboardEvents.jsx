import { useState } from "react";
import EventsComing from "./EventsComing";
import Scoreboard from "./scoreboard";
import ScoreBoardDetails from "./ScoreBoardDetails";

const DashboardEvents = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  console.log("selectedEvent actuel:", selectedEvent);

  // Fonction à passer à EventsComing
  const handleSelectEvent = (event) => {
    console.log("Événement sélectionné :", event);
    setSelectedEvent(event);
  };

  const handleCloseDetails = () => {
    console.log("Fermeture du détail événement");
    setSelectedEvent(null);
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Liste des événements */}
      <EventsComing onSelectEvent={handleSelectEvent} />

      {/* Affichage conditionnel */}
      {selectedEvent ? (
        <ScoreBoardDetails
          event={selectedEvent}
          onClose={handleCloseDetails}
        />
      ) : (
        <Scoreboard />
      )}
    </div>
  );
};

export default DashboardEvents;