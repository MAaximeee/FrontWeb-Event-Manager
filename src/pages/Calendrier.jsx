import axios from "axios";
import { useEffect, useState } from "react";
import AddEvent from "../components/AddEvent";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Calendrier() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canAddEvent, setCanAddEvent] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/event`,
      );
      console.log("Réponse API:", response.data);
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error);
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

    // Vérifie le rôle de l'utilisateur : seuls les ORGANISATEUR et ADMIN peuvent ajouter un événement
    const checkRoles = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userRoles = res.data?.data?.roles || [];
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

  // Obtenir les événements pour une date donnée
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

  // Navigation du calendrier
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
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Lundi = 0

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

  // État pour le formulaire d'ajout d'événement
  const [showAddForm, setShowAddForm] = useState(false);

  // État pour l'événement sélectionné (affichage des détails)
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Callback appelé après l'ajout d'un événement
  const handleEventAdded = (eventData) => {
    console.log("Événement ajouté:", eventData);
    fetchEvents();
  };

  const todayEvents = getTodayEvents();
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="min-h-screen bg-zinc-900 px-4 sm:px-6 pt-24 pb-20 overflow-x-hidden overflow-y-auto">
      <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-6">
        {/* Container Événements actuels et prochains */}
        <div className="w-full lg:w-80 bg-zinc-800 p-4 sm:p-6 flex flex-col mb-6 lg:mb-0 rounded-lg">
          <h2 className="text-2xl font-bold text-orange-500 mb-6">
            Événements
          </h2>

          {/* Événements actuels */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Aujourd'hui
            </h3>
            {loading ? (
              <p className="text-gray-400 text-sm">Chargement...</p>
            ) : todayEvents.length > 0 ? (
              <div className="space-y-2">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="bg-orange-500 p-2 rounded text-white text-sm cursor-pointer hover:bg-orange-700 transition"
                  >
                    <p className="font-medium">{event.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Aucun événement aujourd'hui
              </p>
            )}
          </div>

          {/* Événements prochains */}
          <div className="flex-1 overflow-hidden">
            <h3 className="text-lg font-semibold text-white mb-3">
              Prochainement
            </h3>
            {loading ? (
              <p className="text-gray-400 text-sm">Chargement...</p>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-2 overflow-y-auto max-h-64">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="bg-zinc-700 p-2 rounded text-white text-sm cursor-pointer hover:bg-zinc-600 transition"
                  >
                    <p className="font-medium">{event.title}</p>
                    <p className="text-gray-400 text-xs">{event.dueDate}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Aucun événement prévu</p>
            )}
          </div>
        </div>

        {/* Container Calendrier */}
        <div className="flex-1 bg-zinc-800 p-4 sm:p-6 flex flex-col rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-orange-500">Calendrier</h2>
            {canAddEvent && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-orange-500 hover:bg-orange-700 text-white p-2 rounded-full transition"
                title="Ajouter un événement"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Composant d'ajout d'événement */}
          {canAddEvent && (
            <AddEvent
              isOpen={showAddForm}
              onClose={() => setShowAddForm(false)}
              onEventAdded={handleEventAdded}
            />
          )}

          {/* Calendrier */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="bg-zinc-800 rounded-lg h-full flex flex-col min-w-[600px] sm:min-w-0">
              {/* Header de navigation */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-zinc-700 rounded text-white transition"
                  >
                    ←
                  </button>
                  <h3 className="text-xl font-semibold text-white">
                    {monthNames[currentDate.getMonth()]}{" "}
                    {currentDate.getFullYear()}
                  </h3>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-zinc-700 rounded text-white transition"
                  >
                    →
                  </button>
                </div>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-700 text-white rounded transition"
                >
                  Aujourd'hui
                </button>
              </div>

              {/* Jours de la semaine */}
              <div className="grid grid-cols-7 border-b border-zinc-700">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center text-gray-400 font-medium"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille du calendrier */}
              <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day.date);
                  const isToday =
                    day.date.toDateString() === today.toDateString();
                  return (
                    <div
                      key={index}
                      className={`border-r border-b border-zinc-700 p-2 min-h-[60px] hover:bg-orange-500 transition cursor-pointer ${
                        !day.isCurrentMonth
                          ? "bg-zinc-900 text-gray-500"
                          : "text-white"
                      } ${isToday ? "bg-orange-700 text-white" : ""}`}
                    >
                      <div className="font-medium mb-1">
                        {day.date.getDate()}
                      </div>
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className="bg-zinc-700 text-white text-xs p-1 rounded truncate mb-1 cursor-pointer hover:bg-zinc-600 transition"
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-400">
                          +{dayEvents.length - 2}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model qui permet a l'ajout de l'évènement de pouvoir voir les détails de l'évènement pour un utilisateur non professionnel */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-zinc-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-zinc-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-orange-500">
                {selectedEvent.title}
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-white">
              <div>
                <span className="text-gray-400 text-sm block">Date</span>
                <p className="font-medium">
                  {selectedEvent.dueDate
                    ? new Date(
                        selectedEvent.dueDate + "T12:00:00",
                      ).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Non définie"}
                </p>
              </div>

              <div>
                <span className="text-gray-400 text-sm block">Statut</span>
                <p className="font-medium capitalize">
                  {selectedEvent.status === "pending"
                    ? "En attente"
                    : selectedEvent.status === "in_progress"
                      ? "En cours"
                      : selectedEvent.status === "completed"
                        ? "Terminé"
                        : selectedEvent.status}
                </p>
              </div>

              {selectedEvent.type && (
                <div>
                  <span className="text-gray-400 text-sm block">
                    Type de sport
                  </span>
                  <p className="font-medium capitalize">
                    {selectedEvent.type === "football"
                      ? "Football"
                      : selectedEvent.type === "basketball"
                        ? "Basketball"
                        : selectedEvent.type === "tennis"
                          ? "Tennis"
                          : selectedEvent.type === "rugby"
                            ? "Rugby"
                            : selectedEvent.type === "handball"
                              ? "Handball"
                              : selectedEvent.type}
                  </p>
                </div>
              )}

              {selectedEvent.description && (
                <div>
                  <span className="text-gray-400 text-sm block">
                    Description
                  </span>
                  <p className="text-gray-200 text-sm whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {selectedEvent.createdAt && (
                <div className="pt-2 border-t border-zinc-700">
                  <span className="text-gray-500 text-xs">
                    Créé le{" "}
                    {new Date(selectedEvent.createdAt).toLocaleDateString(
                      "fr-FR",
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendrier;
