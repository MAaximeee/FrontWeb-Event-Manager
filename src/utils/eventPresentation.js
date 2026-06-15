/**
 * Module de presentation pour les evenements côté front.
 * On regroupe ici le formatage des dates, les phases (à venir / live / terminé),
 * le filtre par jour calendrier, et l’affichage course à pied (classement ResultatCourse).
 * Ca évite de dupliquer la meme logique dans Home, Scoreboard, EventsComing, etc.
 */

export function formatCountdown(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/** Date/heure de début de l'événement. */
export function parseEventDate(dueDate) {
  if (!dueDate) return null;
  const iso = dueDate.includes("T") ? dueDate : `${dueDate}T12:00:00`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatEventDateTime(dueDate) {
  const d = parseEventDate(dueDate);
  if (!d) return "Date inconnue";
  const hasTime = typeof dueDate === "string" && dueDate.includes("T");
  if (hasTime) {
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Début de journée locale pour une date d'événement. */
export function eventDayStart(dueDate) {
  const d = parseEventDate(dueDate);
  if (!d) return null;
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  return day;
}

export function isEventDayBeforeToday(dueDate) {
  const eventDay = eventDayStart(dueDate);
  if (!eventDay) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDay.getTime() < today.getTime();
}

export function isEventDayAfterToday(dueDate) {
  const eventDay = eventDayStart(dueDate);
  if (!eventDay) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDay.getTime() > today.getTime();
}

/**
 * Phase affichée côté Home (date calendaire + statut).
 * Un match d'un jour passé n'est jamais « en cours », même si le statut API est bloqué.
 */
export function getEventPhase(event) {
  if (!event) return "unknown";

  if (event.status === "completed") return "past";

  if (isEventDayBeforeToday(event.dueDate)) return "past";

  if (event.status === "in_progress") return "live";

  if (event.status === "pending") {
    if (!event.dueDate) return "upcoming";
    if (isEventDayAfterToday(event.dueDate)) return "upcoming";
    // même jour calendaire, encore pending
    return "upcoming";
  }

  if (isEventDayAfterToday(event.dueDate)) return "upcoming";
  return "past";
}

export function isEventInProgress(event) {
  return getEventPhase(event) === "live";
}

export function isEventUpcoming(event) {
  return getEventPhase(event) === "upcoming";
}

export function isEventPast(event) {
  return getEventPhase(event) === "past";
}

export function findNearestUpcomingEvent(events) {
  return [...(events || [])]
    .filter((ev) => getEventPhase(ev) === "upcoming")
    .sort(
      (a, b) =>
        (parseEventDate(a.dueDate)?.getTime() ?? Infinity) -
        (parseEventDate(b.dueDate)?.getTime() ?? Infinity),
    )[0];
}

export function findPrimaryScoreboardEvent(events) {
  const list = events || [];
  const live = list
    .filter((ev) => getEventPhase(ev) === "live")
    .sort(
      (a, b) =>
        (parseEventDate(b.dueDate)?.getTime() ?? 0) -
        (parseEventDate(a.dueDate)?.getTime() ?? 0),
    )[0];
  if (live) return live;
  return findNearestUpcomingEvent(list);
}

export const PHASE_LABELS = {
  live: "En cours",
  upcoming: "À venir",
  past: "Terminé",
  unknown: "—",
};

export const PHASE_BADGE_CLASS = {
  live: "bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/40",
  upcoming: "bg-zinc-600/50 text-gray-300 ring-1 ring-zinc-500/40",
  past: "bg-zinc-700/80 text-gray-400 ring-1 ring-zinc-600/40",
  unknown: "bg-zinc-700 text-gray-400",
};

export function formatSportType(type) {
  if (!type) return "Sport inconnu";
  const map = {
    football: "Football",
    basketball: "Basketball",
    tennis: "Tennis",
    rugby: "Rugby",
    handball: "Handball",
    course_a_pied: "Course à pied",
  };
  return map[type] || type.replace(/_/g, " ");
}

const INDIVIDUAL_SPORT_KEYWORDS = [
  "course",
  "running",
  "jogging",
  "marathon",
  "trail",
];

export function isIndividualSport(type) {
  const normalized = String(type || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  return INDIVIDUAL_SPORT_KEYWORDS.some((keyword) =>
    normalized.includes(keyword),
  );
}

export function eventHasTeamScore(event) {
  if (!event) return false;
  if (isIndividualSport(event.type)) return false;
  return Boolean(event.hasTeams);
}

export function getPhaseHeadline(event, phase) {
  const teamSport = eventHasTeamScore(event);
  if (phase === "live") {
    return teamSport ? "Match en cours" : "Épreuve en cours";
  }
  if (phase === "upcoming") {
    return teamSport ? "Prochain match" : "Prochaine épreuve";
  }
  return PHASE_LABELS[phase] ?? PHASE_LABELS.unknown;
}

export function formatElapsedSeconds(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function getEventLiveElapsedSeconds(event) {
  const start = parseEventDate(event?.dueDate);
  if (!start) return 0;
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
}

function startOfToday() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

function startOfTomorrow() {
  const t = startOfToday();
  t.setDate(t.getDate() + 1);
  return t;
}

function startOfYesterday() {
  const t = startOfToday();
  t.setDate(t.getDate() - 1);
  return t;
}

/** Jour sélectionné (minuit local). */
export function startOfCalendarDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function shiftCalendarDay(day, deltaDays) {
  const d = startOfCalendarDay(day);
  d.setDate(d.getDate() + deltaDays);
  return d;
}

export function formatCalendarNavLabel(day) {
  const d = startOfCalendarDay(day);
  if (d.getTime() === startOfToday().getTime()) return "Aujourd'hui";
  if (d.getTime() === startOfTomorrow().getTime()) return "Demain";
  if (d.getTime() === startOfYesterday().getTime()) return "Hier";
  const label = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function filterEventsByCalendarDay(events, day) {
  const target = startOfCalendarDay(day).getTime();
  return [...(events || [])]
    .filter((ev) => {
      const eventDay = eventDayStart(ev.dueDate);
      return eventDay && eventDay.getTime() === target;
    })
    .sort(
      (a, b) =>
        (parseEventDate(a.dueDate)?.getTime() ?? 0) -
        (parseEventDate(b.dueDate)?.getTime() ?? 0),
    );
}

export function isEventToday(dueDate) {
  const day = eventDayStart(dueDate);
  if (!day) return false;
  return day.getTime() === startOfToday().getTime();
}

export function isEventTomorrow(dueDate) {
  const day = eventDayStart(dueDate);
  if (!day) return false;
  return day.getTime() === startOfTomorrow().getTime();
}

function formatTimeLabel(d, dueDateRaw) {
  const hasTime =
    typeof dueDateRaw === "string" && dueDateRaw.includes("T");
  if (!hasTime) return null;
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateNumeric(d) {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatEventHeaderPill(dueDate, options = {}) {
  const d = parseEventDate(dueDate);
  if (!d) return "—";
  const date = formatDateNumeric(d);
  if (options.dateOnly) return date;
  const time = formatTimeLabel(d, dueDate);
  return time ? `${date} • ${time}` : date;
}

/** Heure de coup d’envoi affichée au centre (à la place du score). */
export function formatEventKickoffTime(dueDate) {
  const d = parseEventDate(dueDate);
  if (!d) return "—";
  return (
    formatTimeLabel(d, dueDate) ??
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  );
}

/** Sous-titre centre pour match à venir : Demain, Aujourd'hui, etc. */
export function getUpcomingScheduleLabel(dueDate) {
  if (isEventTomorrow(dueDate)) return "Demain";
  if (isEventToday(dueDate)) return "Aujourd'hui";
  const d = parseEventDate(dueDate);
  if (!d) return "À venir";
  const weekday = d.toLocaleDateString("fr-FR", { weekday: "long" });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

function formatWeekdayAndTime(d, dueDateRaw) {
  const weekday = d.toLocaleDateString("fr-FR", { weekday: "long" });
  const label = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const time = formatTimeLabel(d, dueDateRaw);
  return time ? `${label} · ${time}` : label;
}

/**
 * Colonne date/heure liste (type Sofascore) :
 * - demain → heure + « Demain »
 * - aujourd’hui (à venir) → heure + « Aujourd’hui »
 * - sinon → JJ/MM/AAAA + jour · heure en gris
 */
export function formatEventListDateColumn(event, phase) {
  if (phase === "live") {
    return {
      primary: "LIVE",
      secondary: formatElapsedSeconds(getEventLiveElapsedSeconds(event)),
      live: true,
    };
  }

  const dueDateRaw = event?.dueDate;
  const d = parseEventDate(dueDateRaw);
  if (!d) {
    return { primary: "—", secondary: null, live: false };
  }

  const time = formatTimeLabel(d, dueDateRaw) ?? "—";

  if (phase === "past") {
    return {
      primary: formatDateNumeric(d),
      secondary: formatWeekdayAndTime(d, dueDateRaw),
      live: false,
    };
  }

  if (isEventTomorrow(dueDateRaw)) {
    return {
      primary: time,
      secondary: "Demain",
      live: false,
    };
  }

  if (isEventToday(dueDateRaw)) {
    return {
      primary: time,
      secondary: "Aujourd'hui",
      live: false,
    };
  }

  return {
    primary: formatDateNumeric(d),
    secondary: formatWeekdayAndTime(d, dueDateRaw),
    live: false,
  };
}

/** @deprecated alias */
export function formatMatchListStatus(event, phase) {
  return formatEventListDateColumn(event, phase);
}

export function teamAccentColor(team, fallback = "#374151") {
  const c = team?.color;
  if (c && /^#[0-9A-Fa-f]{6}$/.test(c)) return c;
  return fallback;
}

export function memberDisplayName(member) {
  const user = member?.user;
  if (!user) return "Joueur";
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.username || user.email || "Joueur";
}

export function participantDisplayName(participant) {
  const user = participant?.user;
  if (!user) return "Coureur";
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.username || user.email || "Coureur";
}

export function participantSubtitle(participant) {
  const user = participant?.user;
  if (!user) return null;
  if (user.username && user.email && user.username !== user.email) {
    return user.email;
  }
  return null;
}

/** Durée course (secondes) → 3:57:35 ou 42:05 */
export function formatRaceDuration(totalSeconds) {
  if (totalSeconds == null || Number.isNaN(Number(totalSeconds))) return "—";
  const s = Math.max(0, Math.floor(Number(totalSeconds)));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** Écart au leader (secondes) → — ou +0:39 */
export function formatRaceGap(gapSeconds) {
  if (gapSeconds == null || gapSeconds <= 0) return "—";
  const s = Math.floor(gapSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `+${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  return `+${m}:${String(sec).padStart(2, "0")}`;
}

/**
 * Fusionne participants + résultats API (resultat-course).
 * @returns {{ participant, result, position, timeSeconds, gapSeconds }[]}
 */
export function buildRaceStandings(participants = [], raceResults = []) {
  const byParticipantId = new Map(
    (raceResults || []).map((r) => [Number(r.participantId), r]),
  );

  const rows = (participants || [])
    .filter((p) => p.status !== "cancelled")
    .map((participant) => {
      const result = byParticipantId.get(Number(participant.id)) ?? null;
      const timeSeconds =
        result?.temps != null ? Number(result.temps) : null;
      return {
        participant,
        result,
        timeSeconds,
        place: result?.place != null ? Number(result.place) : null,
      };
    });

  rows.sort((a, b) => {
    if (a.place != null && b.place != null) return a.place - b.place;
    if (a.timeSeconds != null && b.timeSeconds != null) {
      return a.timeSeconds - b.timeSeconds;
    }
    if (a.place != null) return -1;
    if (b.place != null) return 1;
    if (a.timeSeconds != null) return -1;
    if (b.timeSeconds != null) return 1;
    return Number(a.participant.id) - Number(b.participant.id);
  });

  const leaderTime = rows.find((r) => r.timeSeconds != null)?.timeSeconds ?? null;

  return rows.map((row, index) => {
    const position = row.place ?? index + 1;
    const gapSeconds =
      leaderTime != null && row.timeSeconds != null
        ? row.timeSeconds - leaderTime
        : null;
    return {
      ...row,
      position,
      gapSeconds,
    };
  });
}

export function filterEventsByPhase(events, phase) {
  return (events || []).filter((ev) => getEventPhase(ev) === phase);
}
