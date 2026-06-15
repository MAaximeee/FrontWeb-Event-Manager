<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import {
  eventDayStart,
  getEventPhase,
  PHASE_BADGE_CLASS,
  startOfCalendarDay,
} from "../utils/eventPresentation.js";

function isSameCalendarDay(a, b) {
  return startOfCalendarDay(a).getTime() === startOfCalendarDay(b).getTime();
}

function Calendar({
  events = [],
  onSelectEvent,
  selectedEventId,
  selectedDay: selectedDayProp,
  onSelectedDayChange,
}) {
  const [internalDay, setInternalDay] = useState(() => startOfCalendarDay());
  const listDay = selectedDayProp ?? internalDay;
  const setListDay = onSelectedDayChange ?? setInternalDay;

  const [currentDate, setCurrentDate] = useState(
    () => new Date(listDay.getFullYear(), listDay.getMonth(), 1),
  );

  const listDayKey = listDay.getTime();

  useEffect(() => {
    setCurrentDate(new Date(listDay.getFullYear(), listDay.getMonth(), 1));
  }, [listDayKey]);
=======
import { useEffect, useState } from "react";
import { api } from "../api/client.js";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107

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

<<<<<<< HEAD
  const today = useMemo(() => startOfCalendarDay(), []);

=======
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107
  const goToPreviousMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const goToNextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
<<<<<<< HEAD
  const goToToday = () => {
    const now = startOfCalendarDay();
    setListDay(now);
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const pickDay = (date) => {
    setListDay(startOfCalendarDay(date));
  };

  const getEventsForDate = (date) => {
    const target = startOfCalendarDay(date).getTime();
    return events.filter((event) => {
      const day = eventDayStart(event.dueDate);
      return day && day.getTime() === target;
=======
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
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107
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
<<<<<<< HEAD
  const selectedEvents = getEventsForDate(listDay);

  return (
    <div className="h-full w-full flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between p-2 border-b border-zinc-700 text-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-zinc-700 rounded"
            aria-label="Mois précédent"
=======
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
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107
          >
            ←
          </button>
          <span className="font-semibold text-sm">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
<<<<<<< HEAD
            type="button"
            onClick={goToNextMonth}
            className="p-1 hover:bg-zinc-700 rounded"
            aria-label="Mois suivant"
=======
            onClick={goToNextMonth}
            className="p-1 hover:bg-zinc-700 rounded"
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107
          >
            →
          </button>
        </div>
        <button
<<<<<<< HEAD
          type="button"
          onClick={goToToday}
          className="px-2 py-1 bg-orange-500 hover:bg-orange-600 rounded cursor-pointer text-xs text-white"
        >
          Aujourd&apos;hui
        </button>
      </div>

=======
          onClick={goToToday}
          className="px-2 py-1 bg-orange-500 hover:bg-orange-600 rounded cursor-pointer text-xs text-white"
        >
          Aujourd'hui
        </button>
      </div>

      {/* Jours de la semaine */}
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107
      <div className="grid grid-cols-7 border-b border-zinc-700 text-center text-gray-400 text-xs">
        {dayNames.map((day) => (
          <div key={day} className="p-1">
            {day}
          </div>
        ))}
      </div>

<<<<<<< HEAD
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          const isSelected = isSameCalendarDay(day.date, listDay);
          const isToday = isSameCalendarDay(day.date, today);

          return (
            <button
              type="button"
              key={index}
              onClick={() => pickDay(day.date)}
              className={`border-r border-b border-zinc-700 py-2 text-center text-xs cursor-pointer relative transition
                ${!day.isCurrentMonth ? "text-gray-500 bg-zinc-900" : "text-white hover:bg-zinc-700"}
                ${isSelected ? "bg-orange-500 text-white font-bold hover:bg-orange-600" : ""}
                ${isToday && !isSelected ? "ring-1 ring-inset ring-orange-500/80 font-semibold" : ""}
              `}
            >
              {day.date.getDate()}
              {dayEvents.length > 0 && !isSelected && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full" />
              )}
            </button>
=======
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
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107
          );
        })}
      </div>

<<<<<<< HEAD
      <div className="border-t border-zinc-700 p-2 text-white min-h-[80px] flex-1">
        <p className="text-[10px] text-gray-400 tracking-widest mb-2 capitalize">
          {listDay.toLocaleDateString("fr-FR", {
=======
      {/* Événements du jour sélectionné */}
      <div className="border-t border-zinc-700 p-2 text-white min-h-[80px] max-h-[100px]">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">
          {selectedDate.toLocaleDateString("fr-FR", {
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107
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
<<<<<<< HEAD
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px]">
            {selectedEvents.map((ev) => (
              <button
                type="button"
                key={ev.id}
                onClick={() => onSelectEvent?.(ev)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[11px] text-left transition ${
                  selectedEventId === ev.id
                    ? "bg-zinc-500/25 hover:bg-zinc-500/25"
                    : "hover:bg-white/5"
                }`}
              >
                <span className="truncate font-medium">{ev.title}</span>
                <span
                  className={`shrink-0 ml-2 text-[9px] px-1 rounded ${PHASE_BADGE_CLASS[getEventPhase(ev)]}`}
                >
                  {getEventPhase(ev) === "live"
                    ? "Live"
                    : getEventPhase(ev) === "upcoming"
                      ? "À venir"
                      : "Passé"}
                </span>
              </button>
=======
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
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendar;
