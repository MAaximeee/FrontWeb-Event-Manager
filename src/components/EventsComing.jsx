import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client.js";
import {
  eventHasTeamScore,
  filterEventsByCalendarDay,
  formatCalendarNavLabel,
  formatMatchListStatus,
  formatSportType,
  getEventPhase,
  normalizeSportTypeKey,
  parseEventDate,
  SPORT_FILTER_TYPE_KEYS,
  shiftCalendarDay,
  startOfCalendarDay,
  teamAccentColor,
  teamMatchResultStyles,
} from "../utils/eventPresentation.js";

function ListModeTabs({ mode, onModeChange }) {
  const tabClass = (active) =>
    `flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition ${
      active ? "bg-orange-500 text-white" : "text-gray-400 hover:text-zinc-200"
    }`;

  return (
    <div
      className="flex min-w-0 flex-1 gap-0.5 rounded-lg border border-zinc-600/80 bg-zinc-900/60 p-0.5"
      role="tablist"
      aria-label="Affichage des événements"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "day"}
        className={tabClass(mode === "day")}
        onClick={() => onModeChange("day")}
      >
        Journée
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "upcoming"}
        className={tabClass(mode === "upcoming")}
        onClick={() => onModeChange("upcoming")}
      >
        À venir
      </button>
    </div>
  );
}

function SportFilter({ value, options, onChange }) {
  if (options.length === 0) return null;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filtrer par sport"
      className="w-[7.25rem] shrink-0 rounded-lg border border-zinc-600/80 bg-zinc-900/80 px-2 py-1.5 text-[11px] text-white focus:border-orange-500/60 focus:outline-none"
    >
      <option value="all">Tous</option>
      {options.map((type) => (
        <option key={type} value={type}>
          {formatSportType(type)}
        </option>
      ))}
    </select>
  );
}

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
    <div className="flex items-center justify-between gap-1 w-full">
      <button
        type="button"
        onClick={() => onDayChange(shiftCalendarDay(day, -1))}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-orange-500 hover:bg-zinc-700/80 transition-colors"
        aria-label="Jour précédent"
      >
        <NavChevron direction="left" />
      </button>
      <span className="flex-1 min-w-0 text-center text-xs font-semibold text-zinc-300 px-1 truncate">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onDayChange(shiftCalendarDay(day, 1))}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-orange-500 hover:bg-zinc-700/80 transition-colors"
        aria-label="Jour suivant"
      >
        <NavChevron direction="right" />
      </button>
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
  const showResultScores = phase === "live" || phase === "past";
  const scoreA = showResultScores
    ? (score?.scoreTeamA ?? event?.scoreTeamA ?? 0)
    : null;
  const scoreB = showResultScores
    ? (score?.scoreTeamB ?? event?.scoreTeamB ?? 0)
    : null;
  const styleA = teamMatchResultStyles(scoreA, scoreB, phase);
  const styleB = teamMatchResultStyles(scoreB, scoreA, phase);
  const status = formatMatchListStatus(event, phase);
  const sport = formatSportType(event.type);
  const showTeams = showScore && teams?.length > 0;

  return (
    <li className="w-full">
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full max-w-full min-w-0 text-left border-b border-zinc-700 transition-colors ${
          isSelected
            ? "bg-zinc-500/25 hover:bg-zinc-500/25"
            : "hover:bg-white/5"
        }`}
      >
        <div className="flex w-[6rem] min-w-[6rem] shrink-0 flex-col items-center justify-center self-stretch border-r border-zinc-700 py-2 pl-2 sm:pl-3 pr-2 sm:pr-2.5">
          {status.live ? (
            <>
              <span className="text-[10px] font-bold text-orange-500">
                LIVE
              </span>
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

        <div className="min-w-0 flex-1 py-2 pl-3 pr-2 sm:pr-3">
          <p className="text-[11px] font-semibold text-zinc-200 leading-none">
            {sport}
          </p>
          {showTeams ? (
            <div className="flex mt-1.5 gap-2">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5 min-h-[1.125rem]">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full text-[8px] font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: teamAccentColor(teamA) }}
                  >
                    {nameA.charAt(0)}
                  </span>
                  <span className={`flex-1 truncate text-xs ${styleA.name}`}>
                    {nameA}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 min-h-[1.125rem]">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full text-[8px] font-bold flex items-center justify-center text-white"
                    style={{
                      backgroundColor: teamAccentColor(teamB, "#52525b"),
                    }}
                  >
                    {nameB.charAt(0)}
                  </span>
                  <span className={`flex-1 truncate text-xs ${styleB.name}`}>
                    {nameB}
                  </span>
                </div>
              </div>
              {showResultScores && (
                <div className="flex shrink-0 flex-col justify-between py-0.5 w-7 text-right tabular-nums">
                  <span className={`text-xs leading-none ${styleA.score}`}>
                    {scoreA}
                  </span>
                  <span className={`text-xs leading-none ${styleB.score}`}>
                    {scoreB}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs font-medium text-white truncate mt-1">
              {event.title}
            </p>
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
  const [listMode, setListMode] = useState("day");
  const [sportFilter, setSportFilter] = useState("all");

  useEffect(() => {
    if (selectedFromParent != null) {
      setSelectedEventId(selectedFromParent);
    }
  }, [selectedFromParent]);

  const dayEvents = useMemo(() => {
    return filterEventsByCalendarDay(events, selectedDay);
  }, [events, selectedDay]);

  const upcomingEvents = useMemo(() => {
    return [...(events || [])]
      .filter((ev) => getEventPhase(ev) === "upcoming")
      .sort(
        (a, b) =>
          (parseEventDate(a.dueDate)?.getTime() ?? Infinity) -
          (parseEventDate(b.dueDate)?.getTime() ?? Infinity),
      );
  }, [events]);

  const sportOptions = SPORT_FILTER_TYPE_KEYS;

  const sourceEvents = listMode === "upcoming" ? upcomingEvents : dayEvents;

  const filteredEvents = useMemo(() => {
    if (sportFilter === "all") return sourceEvents;
    const filterKey = normalizeSportTypeKey(sportFilter);
    return sourceEvents.filter(
      (ev) => normalizeSportTypeKey(ev.type) === filterKey,
    );
  }, [sourceEvents, sportFilter]);

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

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const phaseRank = { live: 0, upcoming: 1, past: 2, unknown: 3 };
      const rankA = phaseRank[getEventPhase(a)] ?? 3;
      const rankB = phaseRank[getEventPhase(b)] ?? 3;
      if (rankA !== rankB) return rankA - rankB;
      return (
        (parseEventDate(a.dueDate)?.getTime() ?? Infinity) -
        (parseEventDate(b.dueDate)?.getTime() ?? Infinity)
      );
    });
  }, [filteredEvents]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-8">
        Chargement…
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden">
      <div className="shrink-0 space-y-2 border-b border-zinc-700 pb-2 mb-0">
        <div className="flex items-center gap-2">
          <ListModeTabs mode={listMode} onModeChange={setListMode} />
          <SportFilter
            value={sportFilter}
            options={sportOptions}
            onChange={setSportFilter}
          />
        </div>
        {listMode === "day" && (
          <CalendarDayNav day={selectedDay} onDayChange={setSelectedDay} />
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-[12rem] max-h-[28rem] lg:max-h-none min-[1800px]:max-h-[calc(100vh-14rem)] mt-2">
        {sortedEvents.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-10 px-4">
            {sportFilter !== "all"
              ? "Aucun événement."
              : listMode === "upcoming"
                ? "Aucun événement à venir."
                : "Aucun événement pour cette journée."}
          </p>
        ) : (
          <ul className="m-0 list-none p-0">
            {sortedEvents.map((ev) => (
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
        )}
      </div>
    </div>
  );
};

export default EventsComing;
