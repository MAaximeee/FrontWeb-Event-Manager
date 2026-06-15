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

const SCORE_STATUS_OPTIONS = [
  { value: "scheduled", label: "Prévu" },
  { value: "in_progress", label: "En cours" },
  { value: "finished", label: "Terminé" },
];

function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTabByEvent, setActiveTabByEvent] = useState({});
  const [participantsByEvent, setParticipantsByEvent] = useState({});
  const [teamsByEvent, setTeamsByEvent] = useState({});
  const [teamMembersByTeam, setTeamMembersByTeam] = useState({});
  const [expandedTeams, setExpandedTeams] = useState({});
  const [statusDraftByEvent, setStatusDraftByEvent] = useState({});
  const [statusSavingByEvent, setStatusSavingByEvent] = useState({});
  const [scoreByEvent, setScoreByEvent] = useState({});
  const [scoreLoadingByEvent, setScoreLoadingByEvent] = useState({});
  const [scoreSavingByEvent, setScoreSavingByEvent] = useState({});
  const [scoreDraftByEvent, setScoreDraftByEvent] = useState({});
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

    return events.filter(
      (event) => Number(event.creator?.id) === Number(currentUser.id),
    );
  }, [currentUser, events, isAdmin]);

  const canManageEvent = (event) =>
    isAdmin || Number(event.creator?.id) === Number(currentUser?.id);

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

  const loadScore = async (eventId) => {
    setScoreLoadingByEvent((prev) => ({ ...prev, [eventId]: true }));
    try {
      const res = await api.get(`/api/event/${eventId}/score-match`);
      const data = res.data?.data || null;
      setScoreByEvent((prev) => ({ ...prev, [eventId]: data }));
      setScoreDraftByEvent((prev) => ({
        ...prev,
        [eventId]: {
          teamAId: data?.teamA?.id ? String(data.teamA.id) : "",
          teamBId: data?.teamB?.id ? String(data.teamB.id) : "",
          scoreTeamA:
            data?.scoreTeamA === null || data?.scoreTeamA === undefined
              ? ""
              : String(data.scoreTeamA),
          scoreTeamB:
            data?.scoreTeamB === null || data?.scoreTeamB === undefined
              ? ""
              : String(data.scoreTeamB),
          status: data?.status || "scheduled",
        },
      }));
    } catch (error) {
      if (error.response?.status === 404) {
        setScoreByEvent((prev) => ({ ...prev, [eventId]: null }));
        setScoreDraftByEvent((prev) => ({
          ...prev,
          [eventId]: {
            teamAId: "",
            teamBId: "",
            scoreTeamA: "",
            scoreTeamB: "",
            status: "scheduled",
          },
        }));
      } else {
        setActionMessage(
          error.response?.data?.message || "Impossible de charger le score.",
        );
      }
    } finally {
      setScoreLoadingByEvent((prev) => ({ ...prev, [eventId]: false }));
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
      setScoreByEvent((prev) => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
      setScoreDraftByEvent((prev) => {
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

  useEffect(() => {
    managedEvents.forEach((event) => {
      setActiveTabByEvent((prev) => ({
        ...prev,
        [event.id]: prev[event.id] || "",
      }));

      if (!participantsByEvent[event.id]) {
        loadParticipants(event.id);
      }
      if (!teamsByEvent[event.id]) {
        loadTeams(event.id);
      }
      if (!Object.prototype.hasOwnProperty.call(scoreByEvent, event.id)) {
        loadScore(event.id);
      }
    });
  }, [managedEvents]);

  const handleScoreDraftChange = (eventId, field, value) => {
    setScoreDraftByEvent((prev) => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || {
          teamAId: "",
          teamBId: "",
          scoreTeamA: "",
          scoreTeamB: "",
          status: "scheduled",
        }),
        [field]: value,
      },
    }));
  };

  const handleSaveScore = async (event) => {
    const eventId = event.id;
    const draft = scoreDraftByEvent[eventId];
    if (!draft) return;

    const scoreA = draft.scoreTeamA === "" ? null : Number(draft.scoreTeamA);
    const scoreB = draft.scoreTeamB === "" ? null : Number(draft.scoreTeamB);
    const teamAId = draft.teamAId ? Number(draft.teamAId) : null;
    const teamBId = draft.teamBId ? Number(draft.teamBId) : null;

    if (teamAId && teamBId && teamAId === teamBId) {
      setActionMessage("Les deux équipes doivent être différentes.");
      return;
    }
    if (scoreA !== null && scoreA < 0) {
      setActionMessage("Le score de l'équipe A doit être positif.");
      return;
    }
    if (scoreB !== null && scoreB < 0) {
      setActionMessage("Le score de l'équipe B doit être positif.");
      return;
    }

    const payload = {
      teamAId,
      teamBId,
      scoreTeamA: scoreA,
      scoreTeamB: scoreB,
      status: draft.status || "scheduled",
    };

    setScoreSavingByEvent((prev) => ({ ...prev, [eventId]: true }));
    try {
      const hasScore = !!scoreByEvent[eventId];
      const res = hasScore
        ? await api.put(`/api/event/${eventId}/score-match/update`, payload)
        : await api.post(`/api/event/${eventId}/score-match/create`, payload);

      const savedScore = res.data?.data || null;
      setScoreByEvent((prev) => ({ ...prev, [eventId]: savedScore }));
      setScoreDraftByEvent((prev) => ({
        ...prev,
        [eventId]: {
          teamAId: savedScore?.teamA?.id ? String(savedScore.teamA.id) : "",
          teamBId: savedScore?.teamB?.id ? String(savedScore.teamB.id) : "",
          scoreTeamA:
            savedScore?.scoreTeamA === null ||
            savedScore?.scoreTeamA === undefined
              ? ""
              : String(savedScore.scoreTeamA),
          scoreTeamB:
            savedScore?.scoreTeamB === null ||
            savedScore?.scoreTeamB === undefined
              ? ""
              : String(savedScore.scoreTeamB),
          status: savedScore?.status || "scheduled",
        },
      }));
      setActionMessage("Score enregistré.");
    } catch (error) {
      setActionMessage(
        error.response?.data?.message || "Impossible d'enregistrer le score.",
      );
    } finally {
      setScoreSavingByEvent((prev) => ({ ...prev, [eventId]: false }));
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
              const activeTab = activeTabByEvent[event.id] || "";
              const currentStatus = event.status || "pending";
              const draftStatus = statusDraftByEvent[event.id] || currentStatus;
              const defaultTeamA = teams[0] || null;
              const defaultTeamB = teams[1] || null;
              const scoreDraft = scoreDraftByEvent[event.id] || {
                teamAId: "",
                teamBId: "",
                scoreTeamA: "",
                scoreTeamB: "",
                status: "scheduled",
              };
              const score = scoreByEvent[event.id] ?? null;
              const canManage = canManageEvent(event);

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

<<<<<<< HEAD
                  <div className="mt-4 border-t border-zinc-700 pt-4 flex flex-wrap items-center justify-end gap-2">
=======
                  <div className="mt-4 border-t border-zinc-700 pt-4 flex flex-wrap justify-end gap-2">
>>>>>>> 138995d12b1591c0b4841205a170de7e6f46c490
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
<<<<<<< HEAD
                      onClick={() =>
                        setActiveTabByEvent((prev) => ({
                          ...prev,
                          [event.id]: "details",
                        }))
                      }
                      className={`px-3 py-1.5 text-xs rounded-md transition ${
                        activeTab === "details"
                          ? "bg-orange-500 text-white"
                          : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                      }`}
                    >
                      Détails
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTabByEvent((prev) => ({
                          ...prev,
                          [event.id]: "teams",
                        }))
                      }
                      className={`px-3 py-1.5 text-xs rounded-md transition ${
                        activeTab === "teams"
                          ? "bg-orange-500 text-white"
                          : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                      }`}
                    >
                      Équipes et joueurs
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTabByEvent((prev) => ({
                          ...prev,
                          [event.id]: "score",
                        }))
                      }
                      className={`px-3 py-1.5 text-xs rounded-md transition ${
                        activeTab === "score"
                          ? "bg-orange-500 text-white"
                          : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                      }`}
                    >
                      Score
                    </button>

                  </div>

                  <div className="mt-4 border-t border-zinc-700 pt-4">
                      {activeTab === "details" && (
=======
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
>>>>>>> 138995d12b1591c0b4841205a170de7e6f46c490
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
<<<<<<< HEAD
                      )}

                      {activeTab === "teams" && (
                        <section className="border border-zinc-700 bg-zinc-900/60 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-zinc-200">
                              Équipes
                            </h3>
                            <span className="text-xs text-zinc-400">
                              {teams.length}
                            </span>
                          </div>

                          {!event.hasTeams ? (
                            <p className="text-sm text-zinc-400">
                              Cet événement ne gère pas d'équipes.
                            </p>
                          ) : teams.length === 0 ? (
                            <p className="text-sm text-zinc-400">
                              Aucune équipe pour cet événement.
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-72 overflow-auto pr-1">
                              {teams.map((team) => {
                                const members = teamMembersByTeam[team.id] || [];
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
                                          ? "Masquer joueurs"
                                          : "Voir joueurs"}
                                      </button>
                                    </div>

                                    {isTeamOpen && (
                                      <div className="mt-3 border-t border-zinc-700 pt-2">
                                        {members.length === 0 ? (
                                          <p className="text-xs text-zinc-400">
                                            Aucun joueur dans cette équipe.
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

                      {activeTab === "score" && (
                        <section className="border border-zinc-700 bg-zinc-900/60 p-3 space-y-3">
                          {scoreLoadingByEvent[event.id] ? (
                            <p className="text-sm text-zinc-400">
                              Chargement du score...
                            </p>
                          ) : (
                            <>
                              {score ? (
                                <div className="text-sm text-zinc-300">
                                  Score actuel :{" "}
                                  <span className="font-semibold text-white">
                                    {score.teamA?.name ||
                                      defaultTeamA?.name ||
                                      "Aucune équipe"}{" "}
                                    {score.scoreTeamA ?? 0} -{" "}
                                    {score.scoreTeamB ?? 0}{" "}
                                    {score.teamB?.name ||
                                      defaultTeamB?.name ||
                                      "Aucune équipe"}
                                  </span>
                                </div>
                              ) : (
                                <p className="text-sm text-zinc-400">
                                  Aucun score enregistré pour cet événement.
                                </p>
                              )}

                              {!canManage ? (
                                <p className="text-xs text-zinc-400">
                                  Seul l'organisateur ou un admin peut modifier
                                  ce score.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <select
                                    value={scoreDraft.teamAId}
                                    onChange={(e) =>
                                      handleScoreDraftChange(
                                        event.id,
                                        "teamAId",
                                        e.target.value,
                                      )
                                    }
                                    className="rounded bg-zinc-700 border border-zinc-600 px-2 py-2 text-sm"
                                  >
                                    <option value="">Choisir l'équipe A</option>
                                    {teams.map((team) => (
                                      <option key={team.id} value={team.id}>
                                        {team.name}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    value={scoreDraft.teamBId}
                                    onChange={(e) =>
                                      handleScoreDraftChange(
                                        event.id,
                                        "teamBId",
                                        e.target.value,
                                      )
                                    }
                                    className="rounded bg-zinc-700 border border-zinc-600 px-2 py-2 text-sm"
                                  >
                                    <option value="">Choisir l'équipe B</option>
                                    {teams.map((team) => (
                                      <option key={team.id} value={team.id}>
                                        {team.name}
                                      </option>
                                    ))}
                                  </select>

                                  <input
                                    type="number"
                                    min="0"
                                    value={scoreDraft.scoreTeamA}
                                    onChange={(e) =>
                                      handleScoreDraftChange(
                                        event.id,
                                        "scoreTeamA",
                                        e.target.value,
                                      )
                                    }
                                    className="rounded bg-zinc-700 border border-zinc-600 px-2 py-2 text-sm"
                                    placeholder="Score équipe A"
                                  />
                                  <input
                                    type="number"
                                    min="0"
                                    value={scoreDraft.scoreTeamB}
                                    onChange={(e) =>
                                      handleScoreDraftChange(
                                        event.id,
                                        "scoreTeamB",
                                        e.target.value,
                                      )
                                    }
                                    className="rounded bg-zinc-700 border border-zinc-600 px-2 py-2 text-sm"
                                    placeholder="Score équipe B"
                                  />

                                  <select
                                    value={scoreDraft.status}
                                    onChange={(e) =>
                                      handleScoreDraftChange(
                                        event.id,
                                        "status",
                                        e.target.value,
                                      )
                                    }
                                    className="rounded bg-zinc-700 border border-zinc-600 px-2 py-2 text-sm sm:col-span-2"
                                  >
                                    {SCORE_STATUS_OPTIONS.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() => handleSaveScore(event)}
                                    disabled={!!scoreSavingByEvent[event.id]}
                                    className="sm:col-span-2 rounded bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-600 px-3 py-2 text-sm font-medium transition"
                                  >
                                    {scoreSavingByEvent[event.id]
                                      ? "Enregistrement..."
                                      : score
                                        ? "Mettre à jour le score"
                                        : "Créer le score"}
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </section>
                      )}
                  </div>
=======

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
>>>>>>> 138995d12b1591c0b4841205a170de7e6f46c490
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
