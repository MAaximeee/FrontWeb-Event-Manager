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

/** Horodatage API (ISO) — pas la date planifiée seule. */
export function parseEventInstant(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function eventDueDateHasExplicitTime(dueDate) {
  return typeof dueDate === "string" && dueDate.includes("T");
}

export const ORGANIZER_EVENT_SPORT_TYPES = [
  { value: "football", label: "Football" },
  { value: "basketball", label: "Basketball" },
  { value: "tennis", label: "Tennis" },
  { value: "rugby", label: "Rugby" },
  { value: "handball", label: "Handball" },
  { value: "course_a_pied", label: "Course à pied" },
  { value: "autres", label: "Autres" },
];

const ORGANIZER_PREDEFINED_SPORT_VALUES = new Set(
  ORGANIZER_EVENT_SPORT_TYPES.filter((o) => o.value !== "autres").map(
    (o) => o.value,
  ),
);

export function eventToInfoDraft(event) {
  const rawType = String(event?.type || "football").trim();
  const isPredefined = ORGANIZER_PREDEFINED_SPORT_VALUES.has(rawType);
  return {
    title: event?.title || "",
    description: event?.description || "",
    visibility: event?.visibility || "public",
    type: isPredefined ? rawType : "autres",
    customType: isPredefined ? "" : rawType,
  };
}

/** Champs acceptés par PUT /api/event/{id} (sans dueDate). */
export function buildEventUpdatePayload(draft) {
  const title = draft.title?.trim() || "";
  if (!title) {
    return { error: "Le titre est obligatoire." };
  }
  const eventType =
    draft.type === "autres"
      ? draft.customType?.trim() || ""
      : draft.type;
  if (!eventType) {
    return { error: "Précisez le type de sport." };
  }
  return {
    payload: {
      title,
      description: draft.description?.trim() || null,
      type: eventType,
      visibility: draft.visibility || "public",
    },
  };
}

function liveStartStorageKey(eventId) {
  return `offi-event-live-start:${eventId}`;
}

/** Horodatage local du passage « en cours » (l’API n’expose pas startedAt). */
export function recordEventLiveStart(eventId, instant = new Date()) {
  if (eventId == null || typeof sessionStorage === "undefined") return;
  const iso =
    instant instanceof Date ? instant.toISOString() : String(instant);
  sessionStorage.setItem(liveStartStorageKey(eventId), iso);
}

export function clearEventLiveStart(eventId) {
  if (eventId == null || typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(liveStartStorageKey(eventId));
}

function readStoredLiveStart(eventId) {
  if (eventId == null || typeof sessionStorage === "undefined") return null;
  return parseEventInstant(sessionStorage.getItem(liveStartStorageKey(eventId)));
}

/**
 * Début effectif du live : champs API dédiés, sinon horodatage enregistré au passage « en cours ».
 * On n’utilise pas updatedAt (toute modif) ni dueDate à 12h par défaut.
 */
export function getEventLiveStartInstant(event, scoreMatch = null) {
  if (!event) return null;

  const explicit = [
    event.startedAt,
    event.matchStartedAt,
    event.startTime,
    event.liveStartedAt,
    scoreMatch?.startedAt,
    scoreMatch?.matchStartedAt,
    scoreMatch?.startTime,
  ];
  for (const raw of explicit) {
    const d = parseEventInstant(raw);
    if (d) return d;
  }

  const status = normalizeEventStatus(event.status);
  if (status !== "in_progress") return null;

  let stored = readStoredLiveStart(event.id);
  if (!stored) {
    recordEventLiveStart(event.id, new Date());
    stored = readStoredLiveStart(event.id);
  }
  return stored;
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

/** API peut renvoyer `ongoing` au lieu de `in_progress`. */
export function normalizeEventStatus(status) {
  const s = String(status ?? "").trim().toLowerCase();
  if (!s) return "pending";
  if (s === "ongoing") return "in_progress";
  return s;
}

const EVENT_STATUS_LABELS_FR = {
  pending: "En attente",
  in_progress: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
};

export function formatEventStatusLabel(status) {
  const key = normalizeEventStatus(status);
  return EVENT_STATUS_LABELS_FR[key] ?? (status ? String(status) : "—");
}

/** Statut affiché en UI : la date prime sur un `in_progress` / `ongoing` incohérent. */
export function getDisplayEventStatus(event) {
  if (!event) return "pending";
  const status = normalizeEventStatus(event.status);
  if (status === "completed") return "completed";
  const dueDate = event.dueDate;
  if (dueDate) {
    if (isEventDayAfterToday(dueDate) && status === "in_progress") {
      return "pending";
    }
    if (isEventDayBeforeToday(dueDate) && status === "in_progress") {
      return "completed";
    }
  }
  return status;
}

export function formatEventStatusLabelForEvent(event) {
  return formatEventStatusLabel(getDisplayEventStatus(event));
}

export function eventStatusBadgeKey(event) {
  return normalizeEventStatus(getDisplayEventStatus(event));
}

/** Classes Tailwind pour badges de statut événement (gestion organisateur, modales). */
export const EVENT_STATUS_BADGE_CLASS = {
  pending: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  in_progress: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  completed: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
};

export function eventStatusBadgeClassName(event) {
  const key = eventStatusBadgeKey(event);
  return (
    EVENT_STATUS_BADGE_CLASS[key] || "bg-zinc-700 text-zinc-300 border border-zinc-600/30"
  );
}

export function formatParticipantStatusLabel(status) {
  const s = String(status ?? "").trim().toLowerCase();
  const map = {
    pending: "En attente",
    confirmed: "Confirmé",
    cancelled: "Annulé",
    ongoing: "En cours",
  };
  return map[s] ?? (status ? String(status) : "—");
}

export function normalizeMatchScoreStatus(status) {
  const s = String(status ?? "").trim().toLowerCase();
  if (!s) return "scheduled";
  if (s === "ongoing") return "in_progress";
  return s;
}

const MATCH_SCORE_STATUS_LABELS_FR = {
  scheduled: "Prévu",
  in_progress: "En cours",
  finished: "Terminé",
};

export function formatMatchScoreStatusLabel(status) {
  const key = normalizeMatchScoreStatus(status);
  return MATCH_SCORE_STATUS_LABELS_FR[key] ?? (status ? String(status) : "—");
}

/**
 * Phase affichée côté Home (date calendaire + statut).
 * Un match d'un jour passé n'est jamais « en cours », même si le statut API est bloqué.
 */
export function getEventPhase(event) {
  if (!event) return "unknown";

  const status = normalizeEventStatus(event.status);

  if (status === "completed") return "past";

  if (isEventDayBeforeToday(event.dueDate)) return "past";

  if (isEventDayAfterToday(event.dueDate)) return "upcoming";

  if (status === "in_progress") {
    if (!event.dueDate || isEventToday(event.dueDate)) return "live";
    return "upcoming";
  }

  if (status === "pending") {
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

/** Nom + score (panneau central, liste) selon phase et résultat. */
export function teamMatchResultStyles(score, otherScore, phase) {
  if (score == null || otherScore == null) {
    return { name: "text-white font-bold", score: "text-white font-bold" };
  }

  if (phase === "live") {
    return {
      name: "text-white font-bold",
      score: "text-white font-bold",
    };
  }

  if (phase === "past") {
    if (score > otherScore) {
      return {
        name: "text-zinc-100 font-medium",
        score: "text-white font-bold",
      };
    }
    if (score < otherScore) {
      return {
        name: "text-gray-500 font-normal",
        score: "text-gray-500 font-normal",
      };
    }
    return {
      name: "text-white font-bold",
      score: "text-gray-500 font-normal",
    };
  }

  return { name: "text-white font-bold", score: "text-orange-400 font-bold" };
}

export function normalizeSportTypeKey(type) {
  const n = String(type || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (!n) return "";
  if (n === "course" || n === "course_a_pied" || n === "courseapied") {
    return "course_a_pied";
  }
  return n;
}

const SPORT_TYPE_LABELS = {
  football: "Football",
  basketball: "Basketball",
  tennis: "Tennis",
  rugby: "Rugby",
  handball: "Handball",
  course_a_pied: "Course à pied",
};

/** Sports proposés dans les filtres (liste fixe, indépendante des événements chargés). */
export const SPORT_FILTER_TYPE_KEYS = Object.keys(SPORT_TYPE_LABELS);

export function formatSportType(type) {
  if (!type) return "Sport inconnu";
  const key = normalizeSportTypeKey(type);
  return SPORT_TYPE_LABELS[key] || key.replace(/_/g, " ");
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

/** Onglets et chargements côté page « Gérer les événements ». */
export function getEventOrganizerCapabilities(event) {
  const individual = isIndividualSport(event?.type);
  const teamScore = eventHasTeamScore(event);
  return {
    individual,
    teamScore,
    showTeamsTab: Boolean(event?.hasTeams) && !individual,
    showScoreTab: teamScore,
    showRaceTab: individual,
  };
}

/** Saisie organisateur : « 42:05 », « 1:02:30 » ou secondes. */
export function parseRaceTimeInput(value) {
  const v = String(value ?? "").trim();
  if (!v) return null;
  if (/^\d+$/.test(v)) return Number(v);
  const parts = v.split(":").map((p) => Number(p.trim()));
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
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

export function getEventLiveElapsedSeconds(event, scoreMatch = null) {
  const start = getEventLiveStartInstant(event, scoreMatch);
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

/** Événements strictement après aujourd'hui (calendrier, listes latérales). */
export function listUpcomingEventsAfterToday(events) {
  const today = startOfCalendarDay();
  return [...(events || [])]
    .filter((ev) => {
      const day = eventDayStart(ev.dueDate);
      return day && day.getTime() > today.getTime();
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
 * - aujourd’hui (à venir ou terminé ce jour) → « Aujourd’hui » (+ heure si connue)
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

  if (phase === "past") {
    if (isEventToday(dueDateRaw)) {
      const timeStr = formatTimeLabel(d, dueDateRaw);
      return {
        primary: formatDateNumeric(d),
        secondary: timeStr ? `Aujourd'hui · ${timeStr}` : "Aujourd'hui",
        live: false,
      };
    }
    return {
      primary: formatDateNumeric(d),
      secondary: formatWeekdayAndTime(d, dueDateRaw),
      live: false,
    };
  }

  if (isEventTomorrow(dueDateRaw)) {
    const timeStr = formatTimeLabel(d, dueDateRaw);
    return {
      primary: formatDateNumeric(d),
      secondary: timeStr ? `Demain · ${timeStr}` : "Demain",
      live: false,
    };
  }

  if (isEventToday(dueDateRaw)) {
    const timeStr = formatTimeLabel(d, dueDateRaw);
    return {
      primary: formatDateNumeric(d),
      secondary: timeStr ? `Aujourd'hui · ${timeStr}` : "Aujourd'hui",
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

/** Nom affichable de l'organisateur (créateur) — jamais l'e-mail (affichage public). */
export function eventOrganizerName(event) {
  const creator = event?.creator;
  if (!creator) return null;
  const full = [creator.firstName, creator.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || creator.username?.trim() || null;
}

export function memberDisplayName(member) {
  const user = member?.user;
  if (!user) return "Joueur";
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.username || "Joueur";
}

export function participantDisplayName(participant) {
  const user = participant?.user;
  if (!user) return "Coureur";
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.username || "Coureur";
}

/** Sous-titre public : pas d'e-mail (RGPD). */
export function participantSubtitle() {
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
