import {
  eventHasTeamScore,
  formatElapsedSeconds,
  formatEventHeaderPill,
  formatEventKickoffTime,
  formatSportType,
  getUpcomingScheduleLabel,
  PHASE_LABELS,
  teamAccentColor,
} from "../utils/eventPresentation.js";
import {
  IndividualRacePanel,
  shouldUseIndividualRacePanel,
} from "./IndividualRacePanel.jsx";

function TeamColumn({ name, team }) {
  const color = teamAccentColor(team, "#f97316");
  const initial = (name || "?").charAt(0).toUpperCase();

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 px-1">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-inner ring-2 ring-zinc-600/80"
        style={{ backgroundColor: color }}
        aria-hidden
      >
        {initial}
      </div>
      <p className="max-w-[7rem] text-center text-sm font-bold leading-snug text-white line-clamp-2">
        {name}
      </p>
    </div>
  );
}

function ScoreDigits({ scoreA, scoreB }) {
  const aWins = scoreA > scoreB;
  const bWins = scoreB > scoreA;

  return (
    <div className="flex items-baseline gap-1.5 text-4xl font-bold tabular-nums tracking-tight">
      <span className={aWins || scoreA === scoreB ? "text-white" : "text-gray-500"}>
        {scoreA}
      </span>
      <span className="text-xl font-normal text-gray-500 pb-0.5">-</span>
      <span className={bWins || scoreA === scoreB ? "text-white" : "text-gray-500"}>
        {scoreB}
      </span>
    </div>
  );
}

function CenterUpcomingKickoff({ dueDate }) {
  return (
    <div className="flex flex-col items-center justify-center min-w-[4.5rem] pt-2">
      <span className="text-2xl font-semibold tabular-nums text-white">
        {formatEventKickoffTime(dueDate)}
      </span>
      <span className="mt-0.5 text-xs text-gray-400">
        {getUpcomingScheduleLabel(dueDate)}
      </span>
    </div>
  );
}

function CenterLiveOrPast({ phase, scoreA, scoreB, elapsed }) {
  return (
    <div className="flex flex-col items-center justify-center min-w-[5.5rem] pt-3">
      <ScoreDigits scoreA={scoreA} scoreB={scoreB} />
      {phase === "live" ? (
        <div className="mt-1 flex flex-col items-center gap-0.5">
          <span className="text-xs font-bold uppercase tracking-wide text-orange-500">
            Live
          </span>
          <span className="text-sm tabular-nums text-gray-400">
            {formatElapsedSeconds(elapsed)}
          </span>
        </div>
      ) : (
        <p className="mt-1 text-sm text-gray-400">{PHASE_LABELS.past}</p>
      )}
    </div>
  );
}

export function HomeEventPanel({
  event,
  phase,
  scoreMatch,
  teams = [],
  elapsed = 0,
  timeToStart = null,
  participantCount = null,
  participants = [],
  raceResults = [],
}) {
  const showScore = eventHasTeamScore(event);

  if (shouldUseIndividualRacePanel(event)) {
    return (
      <IndividualRacePanel
        event={event}
        phase={phase}
        participants={participants}
        raceResults={raceResults}
        elapsed={elapsed}
      />
    );
  }
  const teamA = scoreMatch?.teamA ?? teams[0];
  const teamB = scoreMatch?.teamB ?? teams[1];
  const nameA = teamA?.name ?? "Équipe A";
  const nameB = teamB?.name ?? "Équipe B";
  const scoreA = scoreMatch?.scoreTeamA ?? 0;
  const scoreB = scoreMatch?.scoreTeamB ?? 0;
  const dueDate = event?.dueDate;
  const headerPill =
    phase === "upcoming"
      ? formatEventHeaderPill(dueDate, { dateOnly: true })
      : formatEventHeaderPill(dueDate);

  return (
    <div className="w-full max-w-lg mx-auto px-1 py-2">
      <p className="text-center text-xs text-gray-400 tabular-nums mb-4">
        {headerPill}
      </p>

      {event?.title && (
        <p className="text-center text-[11px] text-gray-500 mb-4 line-clamp-1">
          {event.title}
          <span className="text-gray-600"> · </span>
          {formatSportType(event?.type)}
        </p>
      )}

      {showScore ? (
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-4">
          <TeamColumn name={nameA} team={teamA} />

          {phase === "upcoming" ? (
            <CenterUpcomingKickoff dueDate={dueDate} />
          ) : (
            <CenterLiveOrPast
              phase={phase}
              scoreA={scoreA}
              scoreB={scoreB}
              elapsed={elapsed}
            />
          )}

          <TeamColumn name={nameB} team={teamB} />
        </div>
      ) : (
        <div className="text-center py-2">
          <p className="text-lg font-bold text-white mb-3">{event?.title}</p>
          <p className="text-sm text-orange-400 mb-4">
            {formatSportType(event?.type)}
          </p>
          {phase === "upcoming" ? (
            <CenterUpcomingKickoff dueDate={dueDate} />
          ) : phase === "live" ? (
            <>
              <p className="text-4xl font-mono tabular-nums text-white">
                {formatElapsedSeconds(elapsed)}
              </p>
              <span className="text-xs font-bold uppercase text-orange-500 mt-2 inline-block">
                Live
              </span>
            </>
          ) : (
            <p className="text-sm text-gray-400">{PHASE_LABELS.past}</p>
          )}
          {participantCount != null && participantCount > 0 && (
            <p className="mt-4 text-sm text-gray-500">
              {participantCount} participant
              {participantCount > 1 ? "s" : ""} inscrit
              {participantCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
