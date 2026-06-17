import {
  eventHasTeamScore,
  formatElapsedSeconds,
  formatEventHeaderPill,
  formatEventKickoffTime,
  formatSportType,
  getUpcomingScheduleLabel,
  eventOrganizerName,
  PHASE_LABELS,
  teamAccentColor,
  teamMatchResultStyles,
} from "../utils/eventPresentation.js";
import { HomeEventPanelHeader } from "./HomeEventPanelHeader.jsx";
import {
  IndividualRacePanel,
  shouldUseIndividualRacePanel,
} from "./IndividualRacePanel.jsx";

function TeamColumn({ name, team, nameClassName = "text-white font-bold" }) {
  const color = teamAccentColor(team, "#f97316");
  const initial = (name || "?").charAt(0).toUpperCase();

  return (
    <div className="flex min-w-0 flex-col items-center gap-0.5 px-1 shrink">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-inner ring-2 ring-zinc-600/80"
        style={{ backgroundColor: color }}
        aria-hidden
      >
        {initial}
      </div>
      <p
        className={`flex min-h-[2.25rem] max-w-[6rem] items-center justify-center text-center text-xs leading-tight line-clamp-2 ${nameClassName}`}
      >
        {name}
      </p>
    </div>
  );
}

function ScoreDigits({ scoreA, scoreB, phase }) {
  const styleA = teamMatchResultStyles(scoreA, scoreB, phase);
  const styleB = teamMatchResultStyles(scoreB, scoreA, phase);

  return (
    <div className="flex items-center justify-center gap-1.5 tabular-nums tracking-tight">
      <span className={`text-2xl leading-none ${styleA.score}`}>{scoreA}</span>
      <span className="text-lg font-normal text-gray-500 leading-none">-</span>
      <span className={`text-2xl leading-none ${styleB.score}`}>{scoreB}</span>
    </div>
  );
}

function CenterUpcomingKickoff({ dueDate }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center self-center min-w-[4.5rem]">
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
    <div className="flex shrink-0 flex-col items-center justify-center self-center min-w-[4.5rem]">
      <ScoreDigits scoreA={scoreA} scoreB={scoreB} phase={phase} />
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
  detailAction = null,
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
        detailAction={detailAction}
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
  const organizer = eventOrganizerName(event);
  const headerPill =
    phase === "upcoming"
      ? formatEventHeaderPill(dueDate, { dateOnly: true })
      : formatEventHeaderPill(dueDate);
  const sport = formatSportType(event?.type);
  const title = event?.title || "";
  const nameStyleA = teamMatchResultStyles(scoreA, scoreB, phase).name;
  const nameStyleB = teamMatchResultStyles(scoreB, scoreA, phase).name;

  return (
    <div className="w-full min-w-0 max-w-lg min-[1800px]:max-w-xl mx-auto px-1 py-1 overflow-hidden">
      <HomeEventPanelHeader
        title={title}
        headerPill={headerPill}
        sport={sport}
        organizer={organizer}
        detailAction={detailAction}
      />

      {showScore ? (
        <section className="pt-1 w-full min-w-0 overflow-hidden">
          <div className="flex w-full min-w-0 max-w-md mx-auto items-start justify-between gap-x-4 sm:gap-x-6 min-[1800px]:gap-x-6">
            <TeamColumn name={nameA} team={teamA} nameClassName={nameStyleA} />

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

            <TeamColumn name={nameB} team={teamB} nameClassName={nameStyleB} />
          </div>
        </section>
      ) : (
        <section className="text-center py-2">
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
        </section>
      )}
    </div>
  );
}
