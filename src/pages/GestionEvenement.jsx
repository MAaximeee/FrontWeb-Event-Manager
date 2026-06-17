import { useEffect, useMemo, useState } from "react";
import { OrganizerEventManageModal } from "../components/OrganizerEventManageModal.jsx";
import { api } from "../api/client.js";
import { normalizeSessionUser, userIsAdmin } from "../utils/auth.js";
import {
  buildEventUpdatePayload,
  buildRaceStandings,
  clearEventLiveStart,
  eventOrganizerName,
  eventToInfoDraft,
  formatEventStatusLabelForEvent,
  formatRaceDuration,
  formatSportType,
  eventStatusBadgeClassName,
  getEventOrganizerCapabilities,
  normalizeEventStatus,
  normalizeMatchScoreStatus,
  parseRaceTimeInput,
  participantDisplayName,
  recordEventLiveStart,
} from "../utils/eventPresentation.js";

function GestionEvenement() {
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
  const [raceResultsByEvent, setRaceResultsByEvent] = useState({});
  const [raceLoadingByEvent, setRaceLoadingByEvent] = useState({});
  const [raceDraftByEvent, setRaceDraftByEvent] = useState({});
  const [raceSavingKey, setRaceSavingKey] = useState(null);
  const [infoDraftByEvent, setInfoDraftByEvent] = useState({});
  const [infoSavingByEvent, setInfoSavingByEvent] = useState({});
  const [actionMessage, setActionMessage] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(null);

  const isAdmin = useMemo(() => userIsAdmin(currentUser), [currentUser]);

  const fetchCurrentUserAndEvents = async () => {
    setLoading(true);
    try {
      const [meRes, homeRes, eventsRes] = await Promise.all([
        api.get("/api/me"),
        api.get("/api/auth/home").catch(() => null),
        api.get("/api/event"),
      ]);

      const user = normalizeSessionUser(meRes, homeRes);
      const allEvents = eventsRes.data?.data || [];
      const initialDrafts = allEvents.reduce((acc, event) => {
        acc[event.id] = normalizeEventStatus(event.status || "pending");
        return acc;
      }, {});
      const initialInfoDrafts = allEvents.reduce((acc, event) => {
        acc[event.id] = eventToInfoDraft(event);
        return acc;
      }, {});

      setCurrentUser(user);
      setEvents(allEvents);
      setStatusDraftByEvent(initialDrafts);
      setInfoDraftByEvent(initialInfoDrafts);
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

  useEffect(() => {
    if (selectedEventId == null) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeEventModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedEventId]);

  const managedEvents = useMemo(() => {
    if (!currentUser) return [];
    if (isAdmin) return events;

    return events.filter(
      (event) => Number(event.creator?.id) === Number(currentUser.id),
    );
  }, [currentUser, events, isAdmin]);

  const canManageEvent = (event) =>
    isAdmin || Number(event.creator?.id) === Number(currentUser?.id);

  const openEventModal = (eventId) => {
    setSelectedEventId(eventId);
    setActiveTabByEvent((prev) => ({
      ...prev,
      [eventId]: "details",
    }));
    const ev = managedEvents.find((e) => e.id === eventId);
    if (ev) {
      setInfoDraftByEvent((prev) => ({
        ...prev,
        [eventId]: eventToInfoDraft(ev),
      }));
    }
    if (
      ev &&
      getEventOrganizerCapabilities(ev).showRaceTab &&
      !Object.prototype.hasOwnProperty.call(raceResultsByEvent, eventId)
    ) {
      loadRaceResults(eventId);
    }
  };

  const closeEventModal = () => setSelectedEventId(null);

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
          status: normalizeMatchScoreStatus(data?.status || "scheduled"),
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

  const loadRaceResults = async (eventId) => {
    setRaceLoadingByEvent((prev) => ({ ...prev, [eventId]: true }));
    try {
      const res = await api.get(`/api/event/${eventId}/resultat-course`);
      const raw = res.data?.data;
      const list = Array.isArray(raw)
        ? raw
        : res.data?.success
          ? res.data.data || []
          : [];
      setRaceResultsByEvent((prev) => ({ ...prev, [eventId]: list }));
      setRaceDraftByEvent((prev) => {
        const drafts = { ...(prev[eventId] || {}) };
        list.forEach((row) => {
          const pid = String(row.participantId);
          if (!drafts[pid]) {
            drafts[pid] = {
              place:
                row.place != null && row.place !== "" ? String(row.place) : "",
              temps:
                row.temps != null && row.temps !== ""
                  ? formatRaceDuration(Number(row.temps))
                  : "",
            };
          }
        });
        return { ...prev, [eventId]: drafts };
      });
    } catch (error) {
      setRaceResultsByEvent((prev) => ({ ...prev, [eventId]: [] }));
      if (import.meta.env.DEV) {
        console.warn(
          "Résultats course non chargés:",
          eventId,
          error.response?.status || error.message,
        );
      }
    } finally {
      setRaceLoadingByEvent((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const handleRaceDraftChange = (eventId, participantId, field, value) => {
    const pid = String(participantId);
    setRaceDraftByEvent((prev) => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || {}),
        [pid]: {
          place: "",
          temps: "",
          ...(prev[eventId]?.[pid] || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleSaveRaceResult = async (event, participantId) => {
    const eventId = event.id;
    const pid = String(participantId);
    const draft = raceDraftByEvent[eventId]?.[pid] || {};
    const placeRaw = draft.place?.trim();
    const place = placeRaw === "" ? null : Number(placeRaw);
    const temps = parseRaceTimeInput(draft.temps);

    if (place != null && (!Number.isInteger(place) || place < 1)) {
      setActionMessage("Le classement doit être un entier ≥ 1.");
      return;
    }
    if (draft.temps?.trim() && temps == null) {
      setActionMessage("Temps invalide (ex. 42:05 ou 2525 secondes).");
      return;
    }
    if (place == null && temps == null) {
      setActionMessage("Indiquez au moins un classement ou un temps.");
      return;
    }

    const existing = (raceResultsByEvent[eventId] || []).find(
      (r) => Number(r.participantId) === Number(participantId),
    );
    const payload = {
      participantId: Number(participantId),
      place,
      temps,
    };

    const saveKey = `${eventId}-${participantId}`;
    setRaceSavingKey(saveKey);
    try {
      if (existing?.id) {
        await api.put(
          `/api/event/${eventId}/resultat-course/${existing.id}/update`,
          payload,
        );
      } else {
        await api.post(`/api/event/${eventId}/resultat-course/create`, payload);
      }
      setActionMessage("Résultat enregistré.");
      await loadRaceResults(eventId);
    } catch (error) {
      setActionMessage(
        error.response?.data?.message ||
          "Impossible d'enregistrer le résultat.",
      );
    } finally {
      setRaceSavingKey(null);
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

  const handleInfoDraftChange = (eventId, field, value) => {
    setInfoDraftByEvent((prev) => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || eventToInfoDraft({})),
        [field]: value,
      },
    }));
  };

  const handleSaveEventInfo = async (event) => {
    const eventId = event.id;
    const draft = infoDraftByEvent[eventId];
    if (!draft) return;

    const built = buildEventUpdatePayload(draft);
    if (built.error) {
      setActionMessage(built.error);
      return;
    }

    setInfoSavingByEvent((prev) => ({ ...prev, [eventId]: true }));
    try {
      const res = await api.put(`/api/event/${eventId}`, built.payload);
      const saved = res.data?.data;
      if (saved) {
        setEvents((prev) =>
          prev.map((ev) => (ev.id === eventId ? { ...ev, ...saved } : ev)),
        );
        setInfoDraftByEvent((prev) => ({
          ...prev,
          [eventId]: eventToInfoDraft(saved),
        }));
      } else {
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === eventId ? { ...ev, ...built.payload } : ev,
          ),
        );
      }
      setActionMessage("Informations enregistrées.");
      setSelectedEventId(null);
    } catch (error) {
      setActionMessage(
        error.response?.data?.message ||
          "Impossible de mettre à jour l'événement.",
      );
    } finally {
      setInfoSavingByEvent((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const handleStatusUpdate = async (eventId, status, previousStatus) => {
    setStatusSavingByEvent((prev) => ({
      ...prev,
      [eventId]: true,
    }));

    try {
      await api.put(`/api/event/${eventId}`, { status });

      const statusChangedAt = new Date().toISOString();
      if (status === "in_progress") {
        recordEventLiveStart(eventId, statusChangedAt);
      } else {
        clearEventLiveStart(eventId);
      }
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                status,
                updatedAt: statusChangedAt,
                liveStartedAt:
                  status === "in_progress" ? statusChangedAt : undefined,
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
      setRaceResultsByEvent((prev) => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
      setRaceDraftByEvent((prev) => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
      setInfoDraftByEvent((prev) => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
      if (selectedEventId === eventId) {
        setSelectedEventId(null);
      }
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
      const caps = getEventOrganizerCapabilities(event);
      if (caps.showTeamsTab && !teamsByEvent[event.id]) {
        loadTeams(event.id);
      }
      if (
        caps.showScoreTab &&
        !Object.prototype.hasOwnProperty.call(scoreByEvent, event.id)
      ) {
        loadScore(event.id);
      }
    });
  }, [managedEvents]);

  const selectedEvent = useMemo(() => {
    if (selectedEventId == null) return null;
    return managedEvents.find((e) => e.id === selectedEventId) ?? null;
  }, [managedEvents, selectedEventId]);

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
          status: normalizeMatchScoreStatus(savedScore?.status || "scheduled"),
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
            {isAdmin ? "Administrateur : tous les événements. " : ""}
            Cliquez sur un événement pour tout gérer dans une fenêtre.
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
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {managedEvents.map((event) => {
              const currentStatus = event.status || "pending";
              const draftStatus = statusDraftByEvent[event.id] || currentStatus;
              const organizer = eventOrganizerName(event);

              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => openEventModal(event.id)}
                    className="flex h-full w-full flex-col rounded-xl border border-zinc-700/80 bg-zinc-800/80 p-4 text-left shadow-lg shadow-black/20 transition hover:border-orange-500/40 hover:bg-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base font-semibold text-white line-clamp-2">
                        {event.title}
                      </h2>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${eventStatusBadgeClassName(event)}`}
                      >
                        {formatEventStatusLabelForEvent({
                          status: draftStatus,
                          dueDate: event.dueDate,
                        })}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">
                      {formatSportType(event.type)}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {event.dueDate || "Date non définie"}
                    </p>
                    {isAdmin && organizer && (
                      <p className="mt-1 text-xs text-zinc-500 truncate">
                        {organizer}
                      </p>
                    )}
                    <span className="mt-3 text-xs font-medium text-orange-400">
                      Gérer l&apos;événement →
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {selectedEvent && (
          <OrganizerEventManageModal
            event={selectedEvent}
            onClose={closeEventModal}
            activeTab={activeTabByEvent[selectedEvent.id] || "details"}
            onTabChange={(tab) => {
              setActiveTabByEvent((prev) => ({
                ...prev,
                [selectedEvent.id]: tab,
              }));
              if (
                tab === "race" &&
                getEventOrganizerCapabilities(selectedEvent).showRaceTab &&
                !Object.prototype.hasOwnProperty.call(
                  raceResultsByEvent,
                  selectedEvent.id,
                )
              ) {
                loadRaceResults(selectedEvent.id);
              }
            }}
            canManage={canManageEvent(selectedEvent)}
            participants={participantsByEvent[selectedEvent.id] || []}
            teams={teamsByEvent[selectedEvent.id] || []}
            raceStandings={buildRaceStandings(
              participantsByEvent[selectedEvent.id] || [],
              raceResultsByEvent[selectedEvent.id] || [],
            )}
            draftStatus={
              statusDraftByEvent[selectedEvent.id] ||
              selectedEvent.status ||
              "pending"
            }
            currentStatus={selectedEvent.status || "pending"}
            statusSaving={!!statusSavingByEvent[selectedEvent.id]}
            onStatusChange={(nextStatus, previousStatus) => {
              setStatusDraftByEvent((prev) => ({
                ...prev,
                [selectedEvent.id]: nextStatus,
              }));
              handleStatusUpdate(selectedEvent.id, nextStatus, previousStatus);
            }}
            onDelete={() => handleDeleteEvent(selectedEvent.id)}
            score={scoreByEvent[selectedEvent.id] ?? null}
            scoreDraft={
              scoreDraftByEvent[selectedEvent.id] || {
                teamAId: "",
                teamBId: "",
                scoreTeamA: "",
                scoreTeamB: "",
                status: "scheduled",
              }
            }
            scoreLoading={!!scoreLoadingByEvent[selectedEvent.id]}
            scoreSaving={!!scoreSavingByEvent[selectedEvent.id]}
            onScoreDraftChange={(field, value) =>
              handleScoreDraftChange(selectedEvent.id, field, value)
            }
            onSaveScore={() => handleSaveScore(selectedEvent)}
            raceLoading={!!raceLoadingByEvent[selectedEvent.id]}
            raceDraftByParticipant={raceDraftByEvent[selectedEvent.id] || {}}
            raceSavingKey={raceSavingKey}
            onRaceDraftChange={(participantId, field, value) =>
              handleRaceDraftChange(
                selectedEvent.id,
                participantId,
                field,
                value,
              )
            }
            onSaveRaceResult={(participantId) =>
              handleSaveRaceResult(selectedEvent, participantId)
            }
            expandedTeams={expandedTeams}
            teamMembersByTeam={teamMembersByTeam}
            onToggleTeamMembers={(teamId) =>
              toggleTeamMembers(selectedEvent.id, teamId)
            }
            infoDraft={
              infoDraftByEvent[selectedEvent.id] ||
              eventToInfoDraft(selectedEvent)
            }
            infoSaving={!!infoSavingByEvent[selectedEvent.id]}
            onInfoDraftChange={(field, value) =>
              handleInfoDraftChange(selectedEvent.id, field, value)
            }
            onSaveInfo={() => handleSaveEventInfo(selectedEvent)}
          />
        )}
      </div>
    </div>
  );
}

export default GestionEvenement;
