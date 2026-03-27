import Calendar from "../components/calendar";
import EventsComing from "../components/eventsComing";
import Scoreboard from "../components/ScoreBoard";

const Home = () => {
  return (
    <div className="flex flex-col lg:flex-row px-4 lg:px-12 gap-6 pt-24 pb-16">
      {/* Colonne gauche - Événements */}
      <div className="w-full lg:w-[320px] min-h-[300px] lg:min-h-[600px] bg-zinc-800 rounded-lg flex-shrink-0 p-4">
        <EventsComing />
      </div>

      {/* Colonne centre - Scoreboard en haut */}
      <div className="w-full flex-1 flex flex-col items-center justify-start gap-4">
        <Scoreboard />
      </div>

      {/* Colonne droite - Calendrier */}
      <div className="w-full lg:w-[320px] min-h-[300px] lg:min-h-[600px] bg-zinc-800 rounded-lg flex-shrink-0 p-4 flex flex-col gap-4">
        <Calendar />
      </div>
    </div>
  );
};

export default Home;
