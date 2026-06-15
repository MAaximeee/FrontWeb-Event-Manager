import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client.js";
import {
  eventHasTeamScore,
  filterEventsByCalendarDay,
  formatCalendarNavLabel,
  formatMatchListStatus,
  formatSportType,
  getEventPhase,
  PHASE_BADGE_CLASS,
  PHASE_LABELS,
  shiftCalendarDay,
  startOfCalendarDay,
  teamAccentColor,
} from "../utils/eventPresentation.js";

function NavChevron({ direction }) {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === "left" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  );
}

function CalendarDayNav({ day, onDayChange }) {
  const label = formatCalendarNavLabel(day);

  return (
    <div className="shrink-0 w-full">
      <div className="flex items-center justify-between w-full rounded-full border border-zinc-600 bg-zinc-900/50 px-1.5 py-1">
        <button
          type="button"
          onClick={() => onDayChange(shiftCalendarDay(day, -1))}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-orange-500 shadow-md ring-1 ring-zinc-700/80 hover:bg-zinc-700 transition-colors"
          aria-label="Jour précédent"
        >
          <NavChevron direction="left" />
        </button>
        <span className="flex-1 min-w-0 text-center text-sm font-bold text-orange-500 px-2 truncate">
          {label}
        </span>
        <button
          type="button"
          onClick={() => onDayChange(shiftCalendarDay(day, 1))}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-orange-500 shadow-md ring-1 ring-zinc-700/80 hover:bg-zinc-700 transition-colors"
          aria-label="Jour suivant"
        >
          <NavChevron direction="right" />
        </button>
      </div>
    </div>
  );
}

function MatchListRow({ event, teams, score, isSelected, onSelect }) {
  const phase = getEventPhase(event);
  const showScore = eventHasTeamScore(event);
  const teamA = score?.teamA ?? teams?.[0];
  const teamB = score?.teamB ?? teams?.[1];
  const nameA = teamA?.name ?? event.title;
  const nameB = teamB?.name ?? "—";
  const scoreA =
    score?.scoreTeamA !== undefined && score?.scoreTeamA !== null
      ? score.scoreTeamA
      : null;
  const scoreB =
    score?.scoreTeamB !== undefined && score?.scoreTeamB !== null
      ? score.scoreTeamB
      : null;
  const status = formatMatchListStatus(event, phase);
  const participantsCount = event.participants?.length ?? 0;

  return (
    <li className="w-full">
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full min-w-full text-left border-b border-zinc-700 transition-colors ${
          isSelected
            ? "bg-zinc-500/25 hover:bg-zinc-500/25"
            : "hover:bg-white/5"
        }`}
      >
        <div className="flex w-[6.75rem] min-w-[6.75rem] shrink-0 flex-col items-center justify-center border-r border-zinc-700 py-2.5 pl-3 sm:pl-4 pr-2.5 sm:pr-3">
          {status.live ? (
            <>
              <span className="text-[10px] font-bold text-orange-500">LIVE</span>
              {status.secondary && (
                <span className="text-[10px] font-mono tabular-nums text-orange-400/80 mt-0.5">
                  {status.secondary}
                </span>
              )}
            </>
          ) : (
            <>
              <span
                className={`max-w-full text-[11px] sm:text-xs font-semibold tabular-nums text-center leading-snug px-0.5 ${
                  phase === "past" ? "text-gray-400" : "text-white"
                }`}
              >
                {status.primary}
              </span>
              {status.secondary && (
                <span className="text-[10px] text-gray-500 mt-1 text-center leading-tight capitalize">
                  {status.secondary}
                </span>
              )}
            </>
          )}
        </div>

        <div className="min-w-0 flex-1 py-2.5 pl-3 pr-3 sm:pr-4">
          {showScore && teams?.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-5 w-5 shrink-0 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                  style={{ backgroundColor: teamAccentColor(teamA) }}
                >
                  {nameA.charAt(0)}
                </span>
                <span className="flex-1 truncate text-sm text-white">{nameA}</span>
                {scoreA !== null && (
                  <span className="text-sm font-bold tabular-nums text-orange-400 w-5 text-right">
                    {scoreA}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-5 w-5 shrink-0 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                  style={{ backgroundColor: teamAccentColor(teamB, "#52525b") }}
                >
                  {nameB.charAt(0)}
                </span>
                <span className="flex-1 truncate text-sm text-white">{nameB}</span>
                {scoreB !== null && (
                  <span className="text-sm font-bold tabular-nums text-orange-400 w-5 text-right">
                    {scoreB}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-white truncate">{event.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{formatSportType(event.type)}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] ${PHASE_BADGE_CLASS[phase]}`}
                >
                  {PHASE_LABELS[phase]}
                </span>
                {participantsCount > 0 && (
                  <span>
                    · {participantsCount} inscrit{participantsCount > 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </button>
    </li>
  );
}

const EventsComing = ({
  events,
  loading,
  onSelectEvent,
  selectedEventId: selectedFromParent,
  selectedDay: selectedDayProp,
  onSelectedDayChange,
}) => {
  const [internalDay, setInternalDay] = useState(() => startOfCalendarDay());
  const selectedDay = selectedDayProp ?? internalDay;
  const setSelectedDay = onSelectedDayChange ?? setInternalDay;
  const [teamsByEvent, setTeamsByEvent] = useState({});
  const [scoresByEvent, setScoresByEvent] = useState({});
  const loadedTeamIds = useRef(new Set());
  const loadedScoreIds = useRef(new Set());
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    if (selectedFromParent != null) {
      setSelectedEventId(selectedFromParent);
    }
  }, [selectedFromParent]);

  const filteredEvents = useMemo(() => {
    return filterEventsByCalendarDay(events, selectedDay);
  }, [events, selectedDay]);

  const hasLiveOnDay = useMemo(
    () => filteredEvents.some((ev) => getEventPhase(ev) === "live"),
    [filteredEvents],
  );

  const [, setLiveTick] = useState(0);
  useEffect(() => {
    if (!hasLiveOnDay) return;
    const timer = setInterval(() => setLiveTick((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, [hasLiveOnDay]);

  useEffect(() => {
    filteredEvents.forEach((ev) => {
      if (!eventHasTeamScore(ev)) return;
      if (!loadedTeamIds.current.has(ev.id)) {
        loadedTeamIds.current.add(ev.id);
        api
          .get(`/api/event/${ev.id}/teams`)
          .then((res) => {
            if (res.data?.success) {
              setTeamsByEvent((prev) => ({ ...prev, [ev.id]: res.data.data }));
            }
          })
          .catch(() => {});
      }
      if (
        (getEventPhase(ev) === "live" || getEventPhase(ev) === "past") &&
        !loadedScoreIds.current.has(ev.id)
      ) {
        loadedScoreIds.current.add(ev.id);
        api
          .get(`/api/event/${ev.id}/score-match`)
          .then((res) => {
            if (res.data?.success && res.data?.data) {
              setScoresByEvent((prev) => ({ ...prev, [ev.id]: res.data.data }));
            }
          })
          .catch(() => {});
      }
    });
  }, [filteredEvents]);

  const eventsBySport = useMemo(() => {
    return filteredEvents.reduce((acc, ev) => {
      const type = formatSportType(ev.type);
      if (!acc[type]) acc[type] = [];
      acc[type].push(ev);
      return acc;
    }, {});
  }, [filteredEvents]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-8">
        Chargement…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      <CalendarDayNav day={selectedDay} onDayChange={setSelectedDay} />

      <div className="flex-1 overflow-y-auto min-h-[12rem] max-h-[28rem] lg:max-h-none border-t border-zinc-700 -mx-3 sm:-mx-4">
        {filteredEvents.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-10 px-4">
            Aucun événement pour cette journée.
          </p>
        ) : (
          Object.entries(eventsBySport).map(([sport, sportEvents]) => (
            <div key={sport}>
              <div className="sticky top-0 z-10 bg-zinc-800 px-3 sm:px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-orange-400 border-b border-zinc-700">
                {sport}
              </div>
              <ul className="m-0 list-none p-0">
                {sportEvents.map((ev) => (
                  <MatchListRow
                    key={ev.id}
                    event={ev}
                    teams={teamsByEvent[ev.id]}
                    score={scoresByEvent[ev.id]}
                    isSelected={ev.id === selectedEventId}
                    onSelect={() => {
                      setSelectedEventId(ev.id);
                      onSelectEvent?.(ev);
                    }}
                  />
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsComing;
