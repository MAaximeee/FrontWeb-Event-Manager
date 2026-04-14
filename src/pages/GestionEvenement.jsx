import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const STATUS_LABELS = {
  pending: "En attente",
  in_progress: "En cours",
  completed: "Terminé",
};

const STATUS_BADGE_CLASS = {
  pending: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  in_progress: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  completed: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
};

function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [participantsByEvent, setParticipantsByEvent] = useState({});
  const [teamsByEvent, setTeamsByEvent] = useState({});
  const [teamMembersByTeam, setTeamMembersByTeam] = useState({});
  const [expandedTeams, setExpandedTeams] = useState({});
  const [statusDraftByEvent, setStatusDraftByEvent] = useState({});
  const [statusSavingByEvent, setStatusSavingByEvent] = useState({});
  const [actionMessage, setActionMessage] = useState("");

  const isAdmin = useMemo(
    () => currentUser?.roles?.includes("ROLE_ADMIN"),
    [currentUser],
  );

  const fetchCurrentUserAndEvents = async () => {
    setLoading(true);
    try {
      const [meRes, eventsRes] = await Promise.all([
        api.get("/api/me"),
        api.get("/api/event"),
      ]);

      const user = meRes.data?.data || null;
      const allEvents = eventsRes.data?.data || [];
      const initialDrafts = allEvents.reduce((acc, event) => {
        acc[event.id] = event.status || "pending";
        return acc;
      }, {});

      setCurrentUser(user);
      setEvents(allEvents);
      setStatusDraftByEvent(initialDrafts);
    } catch (error) {
      setActionMessage(
        error.response?.data?.message ||
          "Impossible de charger les événements.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUserAndEvents();
  }, []);

  useEffect(() => {
    if (!actionMessage) return;

    const timeoutId = setTimeout(() => {
      setActionMessage("");
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [actionMessage]);

  const managedEvents = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return events;

    return events.filter((event) => event.creator?.id === currentUser.id);
  }, [currentUser, events, isAdmin]);

  const loadParticipants = async (eventId) => {
    try {
      const res = await api.get(`/api/event/${eventId}/participants`);

      setParticipantsByEvent((prev) => ({
        ...prev,
        [eventId]: res.data?.data || [],
      }));
    } catch (error) {
      setActionMessage(
        error.response?.data?.message ||
          "Impossible de charger les participants.",
      );
    }
  };

  const toggleParticipants = async (eventId) => {
    const shouldOpen = expandedEventId !== eventId;
    setExpandedEventId(shouldOpen ? eventId : null);

    if (shouldOpen) {
      const loaders = [];

      if (!participantsByEvent[eventId]) {
        loaders.push(loadParticipants(eventId));
      }

      if (!teamsByEvent[eventId]) {
        loaders.push(loadTeams(eventId));
      }

      if (loaders.length > 0) {
        await Promise.all(loaders);
      }
    }
  };

  const loadTeams = async (eventId) => {
    try {
      const res = await api.get(`/api/event/${eventId}/teams`);

      setTeamsByEvent((prev) => ({
        ...prev,
        [eventId]: res.data?.data || [],
      }));
    } catch (error) {
      setActionMessage(
        error.response?.data?.message || "Impossible de charger les équipes.",
      );
    }
  };

  const toggleTeamMembers = async (eventId, teamId) => {
    const key = `${eventId}-${teamId}`;
    const isOpen = !!expandedTeams[key];

    setExpandedTeams((prev) => ({
      ...prev,
      [key]: !isOpen,
    }));

    if (!isOpen && !teamMembersByTeam[teamId]) {
      try {
        const res = await api.get(
          `/api/event/${eventId}/team/${teamId}/members`,
        );

        setTeamMembersByTeam((prev) => ({
          ...prev,
          [teamId]: res.data?.data || [],
        }));
      } catch (error) {
        setActionMessage(
          error.response?.data?.message ||
            "Impossible de charger les membres de l'équipe.",
        );
      }
    }
  };

  const handleStatusUpdate = async (eventId, status, previousStatus) => {
    setStatusSavingByEvent((prev) => ({
      ...prev,
      [eventId]: true,
    }));

    try {
      await api.put(`/api/event/${eventId}`, { status });

      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                status,
              }
            : event,
        ),
      );
      setStatusDraftByEvent((prev) => ({
        ...prev,
        [eventId]: status,
      }));
      setActionMessage("Statut mis à jour.");
    } catch (error) {
      setStatusDraftByEvent((prev) => ({
        ...prev,
        [eventId]: previousStatus,
      }));
      setActionMessage(
        error.response?.data?.message ||
          "Impossible de mettre à jour le statut.",
      );
    } finally {
      setStatusSavingByEvent((prev) => ({
        ...prev,
        [eventId]: false,
      }));
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmed = window.confirm("Supprimer cet événement ?");
    if (!confirmed) return;

    try {
      await api.delete(`/api/event/${eventId}`);

      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      setExpandedEventId((prev) => (prev === eventId ? null : prev));
      setParticipantsByEvent((prev) => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
      setTeamsByEvent((prev) => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
      setStatusDraftByEvent((prev) => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
      setActionMessage("Événement supprimé.");
    } catch (error) {
      setActionMessage(
        error.response?.data?.message || "Impossible de supprimer l'événement.",
      );
    }
  };

  if (loading) {
    return <p className="text-white text-center mt-24">Chargement...</p>;
  }

  return (
    <div className="min-h-screen bg-zinc-900 px-4 sm:px-6 pt-24 pb-12 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 rounded-xl p-5 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">
            Gestion des événements
          </h1>
          <p className="text-zinc-400">
            Gérez vos événements, mettez leur statut à jour et suivez les
            participants.
          </p>
        </div>

        {actionMessage && (
          <div className="mb-4 rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-sm text-orange-300">
            {actionMessage}
          </div>
        )}

        {managedEvents.length === 0 ? (
          <p className="text-zinc-400">
            Aucun événement à gérer pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {managedEvents.map((event) => {
              const participants = participantsByEvent[event.id] || [];
              const teams = teamsByEvent[event.id] || [];
              const currentStatus = event.status || "pending";
              const draftStatus = statusDraftByEvent[event.id] || currentStatus;

              return (
                <div
                  key={event.id}
                  className="rounded-none border border-zinc-700/80 bg-zinc-800/80 p-5 shadow-lg shadow-black/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {event.title}
                      </h2>
                      <p className="text-sm text-zinc-400 mt-1">
                        Date : {event.dueDate || "Non définie"}
                      </p>
                      <p className="text-sm text-zinc-400">
                        Type : {event.type || "-"}
                      </p>
                      <p className="text-sm text-zinc-400">
                        Visibilité : {event.visibility || "-"}
                      </p>
                      <span
                        className={`inline-flex mt-2 rounded-full px-2.5 py-1 text-xs ${STATUS_BADGE_CLASS[draftStatus] || "bg-zinc-700 text-zinc-300"}`}
                      >
                        {STATUS_LABELS[draftStatus] ||
                          draftStatus ||
                          "En attente"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="rounded-lg bg-red-700 hover:bg-red-800 px-2.5 py-1.5 text-xs transition shrink-0"
                    >
                      Supprimer événement
                    </button>
                  </div>

                  <div className="mt-4 border-t border-zinc-700 pt-4 flex flex-wrap justify-end gap-2">
                    <select
                      className="w-36 rounded-lg bg-zinc-700 border border-zinc-600 px-2.5 py-1.5 text-xs focus:border-orange-500 focus:outline-none"
                      value={draftStatus}
                      onChange={(e) => {
                        const nextStatus = e.target.value;
                        setStatusDraftByEvent((prev) => ({
                          ...prev,
                          [event.id]: nextStatus,
                        }));
                        handleStatusUpdate(event.id, nextStatus, currentStatus);
                      }}
                      disabled={!!statusSavingByEvent[event.id]}
                    >
                      <option value="pending">En attente</option>
                      <option value="in_progress">En cours</option>
                      <option value="completed">Terminé</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => toggleParticipants(event.id)}
                      className="rounded-lg bg-orange-500 hover:bg-orange-600 px-2.5 py-1.5 text-xs transition"
                    >
                      {expandedEventId === event.id
                        ? "Masquer participants"
                        : "Voir participants"}
                    </button>
                  </div>

                  {expandedEventId === event.id && (
                    <div className="mt-4 border-t border-zinc-700 pt-4">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        <section className="border border-zinc-700 bg-zinc-900/60 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-zinc-200">
                              Participants
                            </h3>
                            <span className="text-xs text-zinc-400">
                              {participants.length}
                            </span>
                          </div>

                          {participants.length === 0 ? (
                            <p className="text-sm text-zinc-400">
                              Aucun participant.
                            </p>
                          ) : (
                            <ul className="space-y-2 max-h-64 overflow-auto pr-1">
                              {participants.map((participant) => (
                                <li
                                  key={participant.id}
                                  className="text-sm text-zinc-300 flex items-center justify-between gap-3"
                                >
                                  <span>
                                    {participant.user?.username ||
                                      participant.user?.email ||
                                      "Utilisateur"}
                                  </span>
                                  <span className="text-xs rounded bg-zinc-700 px-2 py-1 text-zinc-300">
                                    {participant.status}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </section>

                        {event.hasTeams && (
                          <section className="border border-zinc-700 bg-zinc-900/60 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-semibold text-zinc-200">
                                Équipes
                              </h3>
                              <span className="text-xs text-zinc-400">
                                {teams.length}
                              </span>
                            </div>

                            {teams.length === 0 ? (
                              <p className="text-sm text-zinc-400">
                                Aucune équipe pour cet événement.
                              </p>
                            ) : (
                              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                                {teams.map((team) => {
                                  const members =
                                    teamMembersByTeam[team.id] || [];
                                  const teamKey = `${event.id}-${team.id}`;
                                  const isTeamOpen = !!expandedTeams[teamKey];

                                  return (
                                    <div
                                      key={team.id}
                                      className="border border-zinc-700 bg-zinc-900/80 p-3"
                                    >
                                      <div className="flex items-center justify-between gap-3">
                                        <div>
                                          <p className="text-sm font-medium text-white">
                                            {team.name}
                                          </p>
                                          {team.maxSize && (
                                            <p className="text-xs text-zinc-400">
                                              Taille max : {team.maxSize}
                                            </p>
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            toggleTeamMembers(event.id, team.id)
                                          }
                                          className="rounded-md bg-orange-500 hover:bg-orange-600 px-3 py-1 text-xs transition"
                                        >
                                          {isTeamOpen
                                            ? "Masquer utilisateurs"
                                            : "Voir utilisateurs"}
                                        </button>
                                      </div>

                                      {isTeamOpen && (
                                        <div className="mt-3 border-t border-zinc-700 pt-2">
                                          {members.length === 0 ? (
                                            <p className="text-xs text-zinc-400">
                                              Aucun utilisateur dans cette
                                              équipe.
                                            </p>
                                          ) : (
                                            <ul className="space-y-1">
                                              {members.map((member) => (
                                                <li
                                                  key={member.id}
                                                  className="text-xs text-zinc-300 flex items-center justify-between"
                                                >
                                                  <span>
                                                    {member.user?.username ||
                                                      member.user?.email ||
                                                      "Utilisateur"}
                                                  </span>
                                                  <span className="rounded bg-zinc-700 px-2 py-0.5 text-[10px] text-zinc-300">
                                                    {member.role}
                                                  </span>
                                                </li>
                                              ))}
                                            </ul>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </section>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizerEvents;
