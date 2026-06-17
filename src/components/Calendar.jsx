import { useEffect, useMemo, useState } from "react";
import {
  eventDayStart,
  eventOrganizerName,
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

  const today = useMemo(() => startOfCalendarDay(), []);

  const goToPreviousMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const goToNextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
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
  const selectedEvents = getEventsForDate(listDay);

  return (
    <div className="h-full w-full min-w-0 flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b border-zinc-700 text-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-zinc-700 rounded"
            aria-label="Mois précédent"
          >
            ←
          </button>
          <span className="font-semibold text-sm">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            type="button"
            onClick={goToNextMonth}
            className="p-1 hover:bg-zinc-700 rounded"
            aria-label="Mois suivant"
          >
            →
          </button>
        </div>
        <button
          type="button"
          onClick={goToToday}
          className="px-2 py-1 bg-orange-500 hover:bg-orange-600 rounded cursor-pointer text-xs text-white"
        >
          Aujourd&apos;hui
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-zinc-700 text-center text-gray-400 text-xs">
        {dayNames.map((day) => (
          <div key={day} className="p-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 min-w-0">
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
          );
        })}
      </div>

      <div className="border-t border-zinc-700 p-2 text-white flex-1 min-h-0 flex flex-col overflow-hidden">
        <p className="shrink-0 text-[10px] text-gray-400 tracking-widest mb-2 capitalize">
          {listDay.toLocaleDateString("fr-FR", {
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
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 -mr-0.5">
            <div className="flex flex-col gap-1.5">
            {selectedEvents.map((ev) => {
              const organizer = eventOrganizerName(ev);
              return (
              <button
                type="button"
                key={ev.id}
                onClick={() => onSelectEvent?.(ev)}
                className={`w-full flex items-start justify-between gap-2 px-2 py-2 rounded text-[11px] text-left transition ${
                  selectedEventId === ev.id
                    ? "bg-zinc-500/25 hover:bg-zinc-500/25"
                    : "hover:bg-white/5"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-snug line-clamp-2">
                    {ev.title}
                  </span>
                  {organizer && (
                    <span className="block truncate text-[10px] text-gray-500 mt-0.5 leading-tight">
                      Par {organizer}
                    </span>
                  )}
                </span>
                <span
                  className={`shrink-0 mt-0.5 text-[9px] px-1 rounded ${PHASE_BADGE_CLASS[getEventPhase(ev)]}`}
                >
                  {getEventPhase(ev) === "live"
                    ? "Live"
                    : getEventPhase(ev) === "upcoming"
                      ? "À venir"
                      : "Passé"}
                </span>
              </button>
            );
            })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendar;
