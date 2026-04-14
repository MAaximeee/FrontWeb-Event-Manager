import { useEffect, useState } from "react";
import { api } from "../api/client.js";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const goToPreviousMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const goToNextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  const goToToday = () => setCurrentDate(new Date());

  useEffect(() => {
    api
      .get("/api/event")
      .then((res) => setEvents(res.data.data || []))
      .catch(() => {});
  }, []);

  const getEventsForDate = (date) => {
    return events.filter((event) => {
      if (!event.dueDate) return false;
      const eventDate = new Date(event.dueDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days = [];
    for (let i = startingDayOfWeek - 1; i >= 0; i--)
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    for (let day = 1; day <= lastDay.getDate(); day++)
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++)
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  const selectedEvents = getEventsForDate(selectedDate);

  return (
    <div className="h-full w-full flex flex-col bg-zinc-800 rounded-lg overflow-hidden">
      {/* Header navigation */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-700 text-white">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-zinc-700 rounded"
          >
            ←
          </button>
          <span className="font-semibold text-sm">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-zinc-700 rounded"
          >
            →
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-2 py-1 bg-orange-500 hover:bg-orange-600 rounded cursor-pointer text-xs text-white"
        >
          Aujourd'hui
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 border-b border-zinc-700 text-center text-gray-400 text-xs">
        {dayNames.map((day) => (
          <div key={day} className="p-1">
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          const isSelected =
            day.date.toDateString() === selectedDate.toDateString();
          const isToday = day.date.toDateString() === today.toDateString();

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(day.date)}
              className={`border-r border-b border-zinc-700 py-2 text-center text-xs cursor-pointer relative
                ${!day.isCurrentMonth ? "text-gray-500 bg-zinc-900" : "text-white hover:bg-zinc-700"}
                ${isToday ? "bg-orange-500 text-white font-bold" : ""}
                ${isSelected && !isToday ? "bg-zinc-600" : ""}
              `}
            >
              {day.date.getDate()}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Événements du jour sélectionné */}
      <div className="border-t border-zinc-700 p-2 text-white min-h-[80px] max-h-[100px]">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">
          {selectedDate.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>

        {selectedEvents.length === 0 ? (
          <p className="text-[11px] text-gray-500 text-center py-1">
            Aucun événement
          </p>
        ) : (
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[60px]">
            {selectedEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between px-2 py-1 bg-zinc-700 rounded text-[11px]"
              >
                <span className="truncate font-medium">{event.title}</span>
                <span className="text-gray-400 ml-2 flex-shrink-0">
                  {new Date(event.dueDate).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendar;
