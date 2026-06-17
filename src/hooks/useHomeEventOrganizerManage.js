import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { userIsAdmin } from "../utils/auth.js";
import {
  buildEventUpdatePayload,
  buildRaceStandings,
  clearEventLiveStart,
  eventToInfoDraft,
  formatRaceDuration,
  getEventOrganizerCapabilities,
  normalizeEventStatus,
  normalizeMatchScoreStatus,
  parseRaceTimeInput,
  recordEventLiveStart,
} from "../utils/eventPresentation.js";

export function useHomeEventOrganizerManage(initialEvent, currentUser) {
  const eventId = initialEvent?.id;
  const [event, setEvent] = useState(initialEvent);
  const [activeTab, setActiveTab] = useState("details");
  const [participants, setParticipants] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamMembersByTeam, setTeamMembersByTeam] = useState({});
  const [expandedTeams, setExpandedTeams] = useState({});
  const [draftStatus, setDraftStatus] = useState(
    normalizeEventStatus(initialEvent?.status || "pending"),
  );
  const [statusSaving, setStatusSaving] = useState(false);
  const [score, setScore] = useState(null);
  const [scoreDraft, setScoreDraft] = useState({
    teamAId: "",
    teamBId: "",
    scoreTeamA: "",
    scoreTeamB: "",
    status: "scheduled",
  });
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreSaving, setScoreSaving] = useState(false);
  const [raceResults, setRaceResults] = useState([]);
  const [raceLoading, setRaceLoading] = useState(false);
  const [raceDraftByParticipant, setRaceDraftByParticipant] = useState({});
  const [raceSavingKey, setRaceSavingKey] = useState(null);
  const [infoDraft, setInfoDraft] = useState(eventToInfoDraft(initialEvent));
  const [infoSaving, setInfoSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const canManage = useMemo(() => {
    if (!currentUser || !event) return false;
    if (userIsAdmin(currentUser)) return true;
    return Number(event.creator?.id) === Number(currentUser.id);
  }, [currentUser, event]);

  const refreshEvent = useCallback(async () => {
    if (!eventId) return null;
    try {
      const res = await api.get(`/api/event/${eventId}`);
      const ev = res.data?.data;
      if (ev) {
        setEvent(ev);
        setDraftStatus(normalizeEventStatus(ev.status || "pending"));
        setInfoDraft(eventToInfoDraft(ev));
        return ev;
      }
    } catch {
      /* ignore */
    }
    return null;
  }, [eventId]);

  const loadParticipants = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await api.get(`/api/event/${eventId}/participants`);
      setParticipants(res.data?.data || []);
    } catch {
      setActionMessage("Impossible de charger les participants.");
    }
  }, [eventId]);

  const loadTeams = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await api.get(`/api/event/${eventId}/teams`);
      setTeams(res.data?.data || []);
    } catch {
      setActionMessage("Impossible de charger les équipes.");
    }
  }, [eventId]);

  const loadScore = useCallback(async () => {
    if (!eventId) return;
    setScoreLoading(true);
    try {
      const res = await api.get(`/api/event/${eventId}/score-match`);
      const data = res.data?.data || null;
      setScore(data);
      setScoreDraft({
        teamAId: data?.teamA?.id ? String(data.teamA.id) : "",
        teamBId: data?.teamB?.id ? String(data.teamB.id) : "",
        scoreTeamA:
          data?.scoreTeamA == null ? "" : String(data.scoreTeamA),
        scoreTeamB:
          data?.scoreTeamB == null ? "" : String(data.scoreTeamB),
        status: normalizeMatchScoreStatus(data?.status || "scheduled"),
      });
    } catch (error) {
      if (error.response?.status === 404) {
        setScore(null);
        setScoreDraft({
          teamAId: "",
          teamBId: "",
          scoreTeamA: "",
          scoreTeamB: "",
          status: "scheduled",
        });
      } else {
        setActionMessage("Impossible de charger le score.");
      }
    } finally {
      setScoreLoading(false);
    }
  }, [eventId]);

  const loadRaceResults = useCallback(async () => {
    if (!eventId) return;
    setRaceLoading(true);
    try {
      const res = await api.get(`/api/event/${eventId}/resultat-course`);
      const raw = res.data?.data;
      const list = Array.isArray(raw)
        ? raw
        : res.data?.success
          ? res.data.data || []
          : [];
      setRaceResults(list);
      const drafts = {};
      list.forEach((row) => {
        const pid = String(row.participantId);
        drafts[pid] = {
          place: row.place != null && row.place !== "" ? String(row.place) : "",
          temps:
            row.temps != null && row.temps !== ""
              ? formatRaceDuration(Number(row.temps))
              : "",
        };
      });
      setRaceDraftByParticipant(drafts);
    } catch {
      setRaceResults([]);
    } finally {
      setRaceLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    setEvent(initialEvent);
    setDraftStatus(normalizeEventStatus(initialEvent?.status || "pending"));
    setInfoDraft(eventToInfoDraft(initialEvent));
    setActiveTab("details");
  }, [initialEvent?.id]);

  useEffect(() => {
    if (!eventId || !event) return;
    loadParticipants();
    const caps = getEventOrganizerCapabilities(event);
    if (caps.showTeamsTab) loadTeams();
    if (caps.showScoreTab) loadScore();
    if (caps.showRaceTab) loadRaceResults();
  }, [eventId, event?.type, event?.hasTeams, loadParticipants, loadTeams, loadScore, loadRaceResults]);

  useEffect(() => {
    if (!actionMessage) return;
    const t = setTimeout(() => setActionMessage(""), 3000);
    return () => clearTimeout(t);
  }, [actionMessage]);

  const handleStatusChange = async (nextStatus, previousStatus) => {
    if (!eventId) return;
    setDraftStatus(nextStatus);
    setStatusSaving(true);
    try {
      await api.put(`/api/event/${eventId}`, { status: nextStatus });
      const statusChangedAt = new Date().toISOString();
      if (nextStatus === "in_progress") {
        recordEventLiveStart(eventId, statusChangedAt);
      } else {
        clearEventLiveStart(eventId);
      }
      setEvent((prev) => ({
        ...prev,
        status: nextStatus,
        updatedAt: statusChangedAt,
        liveStartedAt:
          nextStatus === "in_progress" ? statusChangedAt : undefined,
      }));
      setActionMessage("Statut mis à jour.");
      await refreshEvent();
    } catch (error) {
      setDraftStatus(previousStatus);
      setActionMessage(
        error.response?.data?.message ||
          "Impossible de mettre à jour le statut.",
      );
    } finally {
      setStatusSaving(false);
    }
  };

  const handleDeleteEvent = async (onDeleted) => {
    if (!eventId) return;
    if (!window.confirm("Supprimer cet événement ?")) return;
    try {
      await api.delete(`/api/event/${eventId}`);
      setActionMessage("Événement supprimé.");
      onDeleted?.();
    } catch (error) {
      setActionMessage(
        error.response?.data?.message || "Impossible de supprimer l'événement.",
      );
    }
  };

  const handleScoreDraftChange = (field, value) => {
    setScoreDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveScore = async () => {
    if (!eventId) return;
    const scoreA =
      scoreDraft.scoreTeamA === "" ? null : Number(scoreDraft.scoreTeamA);
    const scoreB =
      scoreDraft.scoreTeamB === "" ? null : Number(scoreDraft.scoreTeamB);
    const teamAId = scoreDraft.teamAId ? Number(scoreDraft.teamAId) : null;
    const teamBId = scoreDraft.teamBId ? Number(scoreDraft.teamBId) : null;

    if (teamAId && teamBId && teamAId === teamBId) {
      setActionMessage("Les deux équipes doivent être différentes.");
      return;
    }

    const payload = {
      teamAId,
      teamBId,
      scoreTeamA: scoreA,
      scoreTeamB: scoreB,
      status: scoreDraft.status || "scheduled",
    };

    setScoreSaving(true);
    try {
      const res = score
        ? await api.put(`/api/event/${eventId}/score-match/update`, payload)
        : await api.post(`/api/event/${eventId}/score-match/create`, payload);
      const savedScore = res.data?.data || null;
      setScore(savedScore);
      setActionMessage("Score enregistré.");
      await refreshEvent();
    } catch (error) {
      setActionMessage(
        error.response?.data?.message || "Impossible d'enregistrer le score.",
      );
    } finally {
      setScoreSaving(false);
    }
  };

  const handleRaceDraftChange = (participantId, field, value) => {
    const pid = String(participantId);
    setRaceDraftByParticipant((prev) => ({
      ...prev,
      [pid]: {
        place: "",
        temps: "",
        ...(prev[pid] || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveRaceResult = async (participantId) => {
    if (!eventId) return;
    const pid = String(participantId);
    const draft = raceDraftByParticipant[pid] || {};
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

    const existing = raceResults.find(
      (r) => Number(r.participantId) === Number(participantId),
    );
    const payload = { participantId: Number(participantId), place, temps };
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
      await loadRaceResults();
      await refreshEvent();
    } catch (error) {
      setActionMessage(
        error.response?.data?.message ||
          "Impossible d'enregistrer le résultat.",
      );
    } finally {
      setRaceSavingKey(null);
    }
  };

  const toggleTeamMembers = async (teamId) => {
    if (!eventId) return;
    const key = `${eventId}-${teamId}`;
    const isOpen = !!expandedTeams[key];
    setExpandedTeams((prev) => ({ ...prev, [key]: !isOpen }));
    if (!isOpen && !teamMembersByTeam[teamId]) {
      try {
        const res = await api.get(`/api/event/${eventId}/team/${teamId}/members`);
        setTeamMembersByTeam((prev) => ({
          ...prev,
          [teamId]: res.data?.data || [],
        }));
      } catch {
        setActionMessage("Impossible de charger les membres de l'équipe.");
      }
    }
  };

  const handleInfoDraftChange = (field, value) => {
    setInfoDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEventInfo = async () => {
    if (!eventId) return;
    const built = buildEventUpdatePayload(infoDraft);
    if (built.error) {
      setActionMessage(built.error);
      return;
    }
    setInfoSaving(true);
    try {
      const res = await api.put(`/api/event/${eventId}`, built.payload);
      const saved = res.data?.data;
      if (saved) {
        setEvent((prev) => ({ ...prev, ...saved }));
        setInfoDraft(eventToInfoDraft(saved));
      }
      setActionMessage("Informations enregistrées.");
      await refreshEvent();
    } catch (error) {
      setActionMessage(
        error.response?.data?.message ||
          "Impossible de mettre à jour l'événement.",
      );
    } finally {
      setInfoSaving(false);
    }
  };

  const onTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "race" && getEventOrganizerCapabilities(event).showRaceTab) {
      loadRaceResults();
    }
  };

  return {
    event,
    canManage,
    actionMessage,
    refreshEvent,
    modalProps: {
      event,
      activeTab,
      onTabChange,
      canManage,
      participants,
      teams,
      raceStandings: buildRaceStandings(participants, raceResults),
      draftStatus,
      currentStatus: event?.status || "pending",
      statusSaving,
      onStatusChange: handleStatusChange,
      score,
      scoreDraft,
      scoreLoading,
      scoreSaving,
      onScoreDraftChange: handleScoreDraftChange,
      onSaveScore: handleSaveScore,
      raceLoading,
      raceDraftByParticipant,
      raceSavingKey,
      onRaceDraftChange: handleRaceDraftChange,
      onSaveRaceResult: handleSaveRaceResult,
      expandedTeams,
      teamMembersByTeam,
      onToggleTeamMembers: toggleTeamMembers,
      infoDraft,
      infoSaving,
      onInfoDraftChange: handleInfoDraftChange,
      onSaveInfo: handleSaveEventInfo,
    },
    handleDeleteEvent,
  };
}
