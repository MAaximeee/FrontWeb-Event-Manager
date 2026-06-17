import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import AddEvent from "../components/AddEvent";
import { CalendarGrid } from "../components/CalendarGrid";
import { EventsList } from "../components/EventsList";
import { useEvents } from "../hooks/useEvents";
import {
  filterEventsByCalendarDay,
  listUpcomingEventsAfterToday,
  startOfCalendarDay,
} from "../utils/eventPresentation.js";

function Calendrier() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events, loading, refresh } = useEvents();
  const [canAddEvent, setCanAddEvent] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCanAddEvent(false);
      return;
    }

    const checkRoles = async () => {
      try {
        const res = await api.get("/api/me");
        const userData = res.data?.user || res.data?.data || null;
        const userRoles = userData?.roles || [];
        setCanAddEvent(
          userRoles.includes("ROLE_ORGANISATEUR") ||
            userRoles.includes("ROLE_ADMIN"),
        );
      } catch (err) {
        console.error("Erreur lors de la vérification des rôles:", err);
        setCanAddEvent(false);
      }
    };

    checkRoles();
  }, []);

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

  const getEventsForDate = (date) => filterEventsByCalendarDay(events, date);

  const todayEvents = useMemo(
    () => filterEventsByCalendarDay(events, new Date()),
    [events],
  );

  const upcomingEvents = useMemo(
    () => listUpcomingEventsAfterToday(events),
    [events],
  );

  const selectedDayEvents = useMemo(
    () => (selectedDay ? filterEventsByCalendarDay(events, selectedDay) : []),
    [events, selectedDay],
  );

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  const handleSelectDay = (date) => {
    setSelectedDay(startOfCalendarDay(date));
  };

  const showTodayAndUpcoming = () => setSelectedDay(null);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days = [];

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  const today = new Date();

  const goToEventDetail = (event) => {
    if (event?.id != null) {
      navigate(`/calendrier/evenement/${event.id}`);
    }
  };

  return (
    <div className="box-border flex h-[calc(100dvh-6rem)] max-h-[calc(100dvh-6rem)] flex-col overflow-hidden px-4 pb-3 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,2.2fr)] gap-4 overflow-hidden lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-5">
        <EventsList
          todayEvents={todayEvents}
          upcomingEvents={upcomingEvents}
          selectedDay={selectedDay}
          selectedDayEvents={selectedDayEvents}
          loading={loading}
          onSelectEvent={goToEventDetail}
          onShowTodayAndUpcoming={showTodayAndUpcoming}
        />

        <CalendarGrid
          currentDate={currentDate}
          calendarDays={calendarDays}
          monthNames={monthNames}
          dayNames={dayNames}
          today={today}
          selectedDay={selectedDay}
          getEventsForDate={getEventsForDate}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
          onSelectDay={handleSelectDay}
          canAddEvent={canAddEvent}
          onToggleAddForm={() => setShowAddForm((open) => !open)}
        />

        {canAddEvent && (
          <AddEvent
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onEventAdded={refresh}
          />
        )}
      </div>
    </div>
  );
}

export default Calendrier;
