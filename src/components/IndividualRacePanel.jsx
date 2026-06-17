import { useEffect, useState } from "react";

import {
  buildRaceStandings,
  formatElapsedSeconds,
  formatEventHeaderPill,
  formatRaceDuration,
  formatSportType,
  eventOrganizerName,
  getEventLiveElapsedSeconds,
  isIndividualSport,
  participantDisplayName,
  participantSubtitle,
  PHASE_BADGE_CLASS,
  PHASE_LABELS,
} from "../utils/eventPresentation.js";
import { HomeEventPanelHeader } from "./HomeEventPanelHeader.jsx";

function RaceGeneralTable({ event, participants, raceResults, phase }) {
  const standings = buildRaceStandings(participants, raceResults);
  const showTimes = phase === "past" || phase === "live";
  const hasRecordedTimes = standings.some((r) => r.timeSeconds != null);

  if (standings.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500 py-10">
        Aucun coureur inscrit pour le moment.
      </p>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_5.5rem] gap-x-3 px-1 pb-2 text-[11px] text-gray-500">
        <span>Pos.</span>
        <span>Coureur</span>
        <span className="text-right">Temps</span>
      </div>

      <ul className="border-t border-zinc-700">
        {standings.map((row) => {
          const p = row.participant;
          const name = participantDisplayName(p);
          const sub = participantSubtitle(p);

          let timeLabel = "—";
          if (showTimes) {
            if (row.timeSeconds != null) {
              timeLabel = formatRaceDuration(row.timeSeconds);
            } else if (phase === "live" && row.position === 1 && !hasRecordedTimes) {
              timeLabel = formatElapsedSeconds(getEventLiveElapsedSeconds(event));
            }
          }

          const subLine =
            sub ?? (phase === "upcoming" ? "Inscrit" : null);

          return (
            <li
              key={p.id}
              className="grid grid-cols-[2.25rem_minmax(0,1fr)_5.5rem] gap-x-3 items-center py-3 px-1 border-b border-zinc-700/80 last:border-b-0"
            >
              <span className="text-sm tabular-nums text-gray-400 self-start pt-0.5">
                {row.position}
              </span>
              <div className="min-w-0 self-start">
                <p className="text-sm font-bold text-white leading-snug truncate">
                  {name}
                </p>
                {subLine && (
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate leading-snug">
                    {subLine}
                  </p>
                )}
              </div>
              <span className="text-right text-sm font-semibold tabular-nums text-white self-start pt-0.5">
                {timeLabel}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function IndividualRacePanel({
  event,
  phase,
  participants = [],
  raceResults = [],
  detailAction = null,
}) {
  const live = phase === "live";
  const organizer = eventOrganizerName(event);
  const headerPill = formatEventHeaderPill(event?.dueDate);

  const [, setLiveTick] = useState(0);
  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => setLiveTick((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, [live]);

  return (
    <div className="w-full max-w-lg min-[1800px]:max-w-xl mx-auto px-1 py-1">
      <HomeEventPanelHeader
        title={event?.title || "Course"}
        headerPill={headerPill}
        sport={formatSportType(event?.type)}
        organizer={organizer}
        detailAction={detailAction}
      />

      <div className="mb-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${PHASE_BADGE_CLASS[phase] || PHASE_BADGE_CLASS.unknown}`}
        >
          {live ? (
            <>
              Live ·{" "}
              <span className="tabular-nums ml-0.5">
                {formatElapsedSeconds(getEventLiveElapsedSeconds(event))}
              </span>
            </>
          ) : (
            PHASE_LABELS[phase]
          )}
        </span>
      </div>

      <div className="border-b border-zinc-700 mb-3">
        <span className="inline-block pb-2 text-sm font-semibold text-white border-b-2 border-orange-500">
          Général
        </span>
      </div>

      <RaceGeneralTable
        event={event}
        participants={participants}
        raceResults={raceResults}
        phase={phase}
      />
    </div>
  );
}

export function shouldUseIndividualRacePanel(event) {
  return event && isIndividualSport(event.type);
}
