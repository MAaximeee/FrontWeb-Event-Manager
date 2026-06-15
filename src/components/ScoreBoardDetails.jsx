import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import {
  eventHasTeamScore,
  getEventLiveElapsedSeconds,
  getEventPhase,
  isEventInProgress,
  isEventUpcoming,
  isIndividualSport,
  memberDisplayName,
  parseEventDate,
} from "../utils/eventPresentation.js";
import { HomeEventPanel } from "./HomeEventPanel.jsx";

const ScoreBoardDetails = ({ event }) => {
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState(event);
  const [teamsDetail, setTeamsDetail] = useState([]);
  const [scoreMatch, setScoreMatch] = useState(null);
  const [raceResults, setRaceResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timeToStart, setTimeToStart] = useState(null);

  useEffect(() => {
    setEventDetails(event);
    setShowDetails(false);
  }, [event]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!event?.id) return;
      setLoading(true);
      try {
        const [eventRes, meRes] = await Promise.all([
          api.get(`/api/event/${event.id}`),
          api.get("/api/me").catch(() => null),
        ]);

        if (cancelled) return;

        const fullEvent = eventRes.data?.data || event;
        setEventDetails(fullEvent);
        setCurrentUser(meRes?.data?.user || meRes?.data?.data || null);

        const withScore = eventHasTeamScore(fullEvent);

        if (withScore) {
          const scoreRes = await api
            .get(`/api/event/${event.id}/score-match`)
            .catch(() => null);
          if (!cancelled) setScoreMatch(scoreRes?.data?.data ?? null);
        } else {
          setScoreMatch(null);
        }

        if (fullEvent.hasTeams && withScore) {
          const listRes = await api.get(`/api/event/${event.id}/teams`);
          const baseTeams = listRes.data?.data || [];
          const detailed = await Promise.all(
            baseTeams.map(async (team) => {
              try {
                const detailRes = await api.get(
                  `/api/event/${event.id}/team/${team.id}`,
                );
                return detailRes.data?.data || { ...team, members: [] };
              } catch {
                return { ...team, members: [] };
              }
            }),
          );
          if (!cancelled) setTeamsDetail(detailed);
        } else {
          setTeamsDetail([]);
        }

        if (isIndividualSport(fullEvent.type)) {
          const raceRes = await api
            .get(`/api/event/${event.id}/resultat-course`)
            .catch(() => null);
          if (!cancelled) {
            setRaceResults(
              raceRes?.data?.success ? raceRes.data.data || [] : [],
            );
          }
        } else if (!cancelled) {
          setRaceResults([]);
        }
      } catch {
        if (!cancelled) {
          setEventDetails(event);
          setTeamsDetail([]);
          setRaceResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [event]);

  useEffect(() => {
    const ev = eventDetails;
    if (!ev) return;

    if (isEventInProgress(ev)) {
      const tick = () => setElapsed(getEventLiveElapsedSeconds(ev));
      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }

    setElapsed(0);

    if (isEventUpcoming(ev)) {
      const updateCountdown = () => {
        const start = parseEventDate(ev.dueDate);
        if (!start) {
          setTimeToStart(null);
          return;
        }
        setTimeToStart(
          Math.max(0, Math.floor((start.getTime() - Date.now()) / 1000)),
        );
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }

    setTimeToStart(null);
  }, [eventDetails]);

  if (loading) {
    return (
      <div className="text-zinc-400 text-center py-12 text-sm">
        Chargement de l&apos;événement…
      </div>
    );
  }

  const ev = eventDetails || event;
  const phase = getEventPhase(ev);
  const showTeamScore = eventHasTeamScore(ev);
  const participants = ev.participants || [];
  const currentUserId = currentUser?.id != null ? Number(currentUser.id) : null;
  const isRegistered =
    currentUserId != null &&
    participants.some(
      (p) =>
        Number(p.user?.id ?? p.userId) === currentUserId &&
        p.status !== "cancelled",
    );

  const canGoToParticipation = isRegistered && phase === "upcoming";

  return (
    <div className="flex flex-col gap-4 text-white max-w-lg mx-auto w-full">
      <HomeEventPanel
        event={ev}
        phase={phase}
        scoreMatch={scoreMatch}
        teams={teamsDetail}
        elapsed={elapsed}
        timeToStart={timeToStart}
        participantCount={participants.length}
        participants={participants}
        raceResults={raceResults}
      />

      <div className="flex flex-wrap gap-2 justify-center pt-1">
        {showTeamScore && (
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm font-medium transition text-white"
          >
            {showDetails ? "Masquer la composition" : "Composition"}
          </button>
        )}
        {canGoToParticipation && (
          <button
            type="button"
            onClick={() => navigate(`/calendrier/evenement/${ev.id}`)}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-sm font-semibold transition"
          >
            Accéder à mon événement
          </button>
        )}
      </div>

      {showDetails && showTeamScore && ev.hasTeams && (
        <div className="w-full border-t border-zinc-700 pt-4 text-sm flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 max-w-md mx-auto">
            {teamsDetail.map((team) => (
              <div key={team.id} className="min-w-[8.5rem] text-center">
                <h4 className="text-orange-400 font-semibold mb-2">
                  {team.name}
                </h4>
                {(team.members || []).length === 0 ? (
                  <p className="text-xs text-gray-500">Aucun joueur</p>
                ) : (
                  <ul className="space-y-1 text-gray-300">
                    {team.members.map((member) => (
                      <li key={member.id}>
                        {memberDisplayName(member)}
                        {member.role === "captain" && (
                          <span className="text-orange-400/80 text-xs ml-1">
                            · cap.
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreBoardDetails;
