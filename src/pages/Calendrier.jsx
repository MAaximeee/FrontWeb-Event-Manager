import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import AddEvent from "../components/AddEvent";
import { CalendarGrid } from "../components/CalendarGrid";
import { EventsList } from "../components/EventsList";

function Calendrier() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canAddEvent, setCanAddEvent] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/event");
      console.log("Réponse API complète:", response.data);

      const eventData = response.data?.data || response.data;
      console.log("Données d'événements:", eventData);

      if (Array.isArray(eventData)) {
        setEvents(eventData);
      } else {
        console.warn("Structure de réponse inattendue:", response.data);
        setEvents([]);
      }
    } catch (error) {
      console.error(
        "Erreur complète:",
        error.response || error.message || error,
      );
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
        const hasRightRole =
          userRoles.includes("ROLE_ORGANISATEUR") ||
          userRoles.includes("ROLE_ADMIN");

        setCanAddEvent(hasRightRole);
      } catch (err) {
        console.error("Erreur lors de la vérification des rôles:", err);
        setCanAddEvent(false);
      }
    };

    checkRoles();
  }, []);

  const getEventsForDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    return events.filter((event) => {
      if (!event.dueDate) return false;
      let eventDate = event.dueDate;
      if (eventDate.length === 8) eventDate = `20${eventDate}`;
      return eventDate === dateStr;
    });
  };

  const getTodayEvents = () => getEventsForDate(new Date());

  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter((event) => {
        if (!event.dueDate) return false;
        const eventDateObj = new Date(event.dueDate + "T00:00:00");
        return eventDateObj > today;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

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
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days = [];

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();

  const [showAddForm, setShowAddForm] = useState(false);

  const handleEventAdded = (eventData) => {
    console.log("Événement ajouté:", eventData);
    fetchEvents();
  };

  const goToEventDetail = (event) => {
    if (event?.id != null) {
      navigate(`/calendrier/evenement/${event.id}`);
    }
  };

  const todayEvents = getTodayEvents();
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="min-h-screen bg-zinc-900 px-4 sm:px-6 pt-24 pb-20 overflow-x-hidden overflow-y-auto">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)] lg:items-stretch">
        <EventsList
          todayEvents={todayEvents}
          upcomingEvents={upcomingEvents}
          loading={loading}
          onSelectEvent={goToEventDetail}
        />

        <CalendarGrid
          currentDate={currentDate}
          calendarDays={calendarDays}
          monthNames={monthNames}
          dayNames={dayNames}
          today={today}
          getEventsForDate={getEventsForDate}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
          onSelectEvent={goToEventDetail}
          canAddEvent={canAddEvent}
          onToggleAddForm={() => setShowAddForm(!showAddForm)}
        />

        {canAddEvent && (
          <AddEvent
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onEventAdded={handleEventAdded}
          />
        )}
      </div>
    </div>
  );
}

export default Calendrier;
