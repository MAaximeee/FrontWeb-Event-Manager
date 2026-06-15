import { useEffect, useMemo, useState } from "react";

import { api } from "../api/client.js";
import {
  eventHasTeamScore,
  findPrimaryScoreboardEvent,
  getEventLiveElapsedSeconds,
  getEventPhase,
  isEventInProgress,
  isEventUpcoming,
  isIndividualSport,
  parseEventDate,
} from "../utils/eventPresentation.js";
import { HomeEventPanel } from "./HomeEventPanel.jsx";

function Scoreboard({ events, loading: eventsLoading }) {
  const [teams, setTeams] = useState([]);
  const [scoreMatch, setScoreMatch] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timeToStart, setTimeToStart] = useState(null);
  const [fullEvent, setFullEvent] = useState(null);
  const [raceResults, setRaceResults] = useState([]);

  const event = useMemo(() => findPrimaryScoreboardEvent(events), [events]);
  const phase = event ? getEventPhase(event) : null;
  const participantCount = event?.participants?.length ?? null;

  useEffect(() => {
    let cancelled = false;
    if (!event?.id || !isIndividualSport(event.type)) {
      setFullEvent(null);
      setRaceResults([]);
      return;
    }
    Promise.all([
      api.get(`/api/event/${event.id}`),
      api.get(`/api/event/${event.id}/resultat-course`).catch(() => null),
    ])
      .then(([eventRes, raceRes]) => {
        if (cancelled) return;
        setFullEvent(eventRes.data?.data || event);
        setRaceResults(
          raceRes?.data?.success ? raceRes.data.data || [] : [],
        );
      })
      .catch(() => {
        if (!cancelled) {
          setFullEvent(event);
          setRaceResults([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [event]);

  const participants =
    fullEvent?.participants ?? event?.participants ?? [];

  useEffect(() => {
    let cancelled = false;

    const loadDetails = async () => {
      if (!event?.id) {
        setTeams([]);
        setScoreMatch(null);
        return;
      }

      if (!eventHasTeamScore(event)) {
        setTeams([]);
        setScoreMatch(null);
        return;
      }

      setDetailLoading(true);
      try {
        const [teamsRes, scoreRes] = await Promise.all([
          api.get(`/api/event/${event.id}/teams`).catch(() => ({ data: {} })),
          api
            .get(`/api/event/${event.id}/score-match`)
            .catch(() => ({ data: {} })),
        ]);
        if (cancelled) return;
        setTeams(teamsRes.data?.data || []);
        setScoreMatch(scoreRes.data?.data ?? null);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };

    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [event]);

  useEffect(() => {
    if (!event) return;

    if (isEventInProgress(event)) {
      const tick = () => setElapsed(getEventLiveElapsedSeconds(event));
      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }

    setElapsed(0);

    if (isEventUpcoming(event)) {
      const updateCountdown = () => {
        const start = parseEventDate(event.dueDate);
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
  }, [event]);

  if (eventsLoading || detailLoading) {
    return (
      <p className="text-gray-400 text-center py-16 text-sm">Chargement…</p>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-white text-sm">Aucun match à la une</p>
        <p className="text-gray-500 text-xs mt-2">
          Sélectionnez un événement dans la liste
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full">
      <HomeEventPanel
        event={event}
        phase={phase}
        scoreMatch={scoreMatch}
        teams={teams}
        elapsed={elapsed}
        timeToStart={timeToStart}
        participantCount={participantCount}
        participants={participants}
        raceResults={raceResults}
      />
    </div>
  );
}

export default Scoreboard;
