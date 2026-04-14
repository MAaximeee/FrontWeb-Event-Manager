import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { getAuthToken } from "../utils/auth";

export function useEventTeams({ eventId, currentUserId, canChooseTeam }) {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamActionLoading, setTeamActionLoading] = useState(false);
  const [teamMessage, setTeamMessage] = useState("");
  const [userTeamId, setUserTeamId] = useState(null);

  const currentUserTeam = useMemo(
    () => teams.find((team) => team.id === userTeamId) || null,
    [teams, userTeamId],
  );

  const fetchTeams = useCallback(async () => {
    if (!canChooseTeam || !eventId) return;
    if (!getAuthToken()) return;

    setTeamsLoading(true);

    try {
      const listRes = await api.get(
        `/api/event/${eventId}/teams`,
      );

      const baseTeams = listRes.data?.data || [];

      const detailedTeams = await Promise.all(
        baseTeams.map(async (team) => {
          try {
            const detailRes = await api.get(
              `/api/event/${eventId}/team/${team.id}`,
            );

            const details = detailRes.data?.data || {};
            const members = details.members || [];
            const isCurrentUserMember = members.some(
              (member) => member.user?.id === currentUserId,
            );

            return {
              ...team,
              memberCount: details.memberCount ?? members.length,
              isCurrentUserMember,
            };
          } catch {
            return {
              ...team,
              memberCount: null,
              isCurrentUserMember: false,
            };
          }
        }),
      );

      setTeams(detailedTeams);

      const userTeam = detailedTeams.find((team) => team.isCurrentUserMember);
      setUserTeamId(userTeam?.id ?? null);
    } catch (error) {
      setTeams([]);
      setUserTeamId(null);
      setTeamMessage(
        error.response?.data?.message || "Impossible de charger les équipes.",
      );
    } finally {
      setTeamsLoading(false);
    }
  }, [canChooseTeam, currentUserId, eventId]);

  useEffect(() => {
    setTeams([]);
    setSelectedTeamId("");
    setUserTeamId(null);
    setTeamMessage("");

    if (canChooseTeam) {
      fetchTeams();
    }
  }, [eventId, currentUserId, canChooseTeam, fetchTeams]);

  const joinTeam = useCallback(async () => {
    if (!selectedTeamId) {
      setTeamMessage("Sélectionnez une équipe.");
      return;
    }

    if (!getAuthToken()) {
      setTeamMessage("Vous devez être connecté.");
      return;
    }

    setTeamActionLoading(true);
    setTeamMessage("");

    try {
      const response = await api.post(
        `/api/event/${eventId}/team/${selectedTeamId}/join`,
        {},
      );

      setTeamMessage(response.data?.message || "Vous avez rejoint l'équipe.");
      setSelectedTeamId("");
      await fetchTeams();
    } catch (error) {
      setTeamMessage(
        error.response?.data?.message || "Impossible de rejoindre l'équipe.",
      );
    } finally {
      setTeamActionLoading(false);
    }
  }, [eventId, fetchTeams, selectedTeamId]);

  const leaveTeam = useCallback(async () => {
    if (!userTeamId) {
      setTeamMessage("Vous n'êtes dans aucune équipe.");
      return;
    }

    if (!getAuthToken()) {
      setTeamMessage("Vous devez être connecté.");
      return;
    }

    setTeamActionLoading(true);
    setTeamMessage("");

    try {
      const response = await api.delete(
        `/api/event/${eventId}/team/${userTeamId}/leave`,
      );

      setTeamMessage(response.data?.message || "Vous avez quitté l'équipe.");
      setSelectedTeamId("");
      await fetchTeams();
    } catch (error) {
      setTeamMessage(
        error.response?.data?.message || "Impossible de quitter l'équipe.",
      );
    } finally {
      setTeamActionLoading(false);
    }
  }, [eventId, fetchTeams, userTeamId]);

  return {
    teams,
    selectedTeamId,
    setSelectedTeamId,
    teamsLoading,
    teamActionLoading,
    teamMessage,
    userTeamId,
    currentUserTeam,
    joinTeam,
    leaveTeam,
    refreshTeams: fetchTeams,
  };
}
