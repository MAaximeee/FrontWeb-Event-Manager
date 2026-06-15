import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { ParticipationButtons } from "../components/ParticipationButtons";
import { useEventTeams } from "../hooks/useEventTeams";

function formatSportType(type) {
  if (!type) return null;
  const map = {
    football: "Football",
    basketball: "Basketball",
    tennis: "Tennis",
    rugby: "Rugby",
    handball: "Handball",
  };
  return map[type] || type;
}

function formatParticipantStatus(status) {
  if (status === "pending") return "En attente";
  if (status === "confirmed") return "Confirmé";
  if (status === "cancelled") return "Annulé";
  return status;
}

function formatVisibility(v) {
  if (v === "public") return "Public";
  if (v === "private") return "Privé";
  return v || "—";
}

function formatTeamMemberRole(role) {
  if (role === "captain") return "Capitaine";
  if (role === "member") return "Membre";
  return role;
}

function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const id = Number(eventId);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [joiningEventId, setJoiningEventId] = useState(null);
  const [participationMessage, setParticipationMessage] = useState("");
  const [teamsDetail, setTeamsDetail] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  const loadTeamsDetail = useCallback(async (ev) => {
    if (!ev?.id || !ev.hasTeams) {
      setTeamsDetail([]);
      return;
    }
    setTeamsLoading(true);
    try {
      const listRes = await api.get(`/api/event/${ev.id}/teams`);
      const baseTeams = listRes.data?.data || [];
      const detailed = await Promise.all(
        baseTeams.map(async (team) => {
          try {
            const detailRes = await api.get(
              `/api/event/${ev.id}/team/${team.id}`,
            );
            return detailRes.data?.data || { ...team, members: [] };
          } catch {
            return { ...team, members: [], memberCount: 0 };
          }
        }),
      );
      setTeamsDetail(detailed);
    } catch {
      setTeamsDetail([]);
    } finally {
      setTeamsLoading(false);
    }
  }, []);

  const loadPage = useCallback(async () => {
    if (Number.isNaN(id)) {
      setError("Identifiant d'événement invalide.");
      setLoading(false);
      setEvent(null);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/event/${id}`);
      const ev = res.data?.data;
      if (!ev) {
        setError("Événement introuvable.");
        setEvent(null);
        setTeamsDetail([]);
        return;
      }
      setEvent(ev);
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de charger l'événement.",
      );
      setEvent(null);
      setTeamsDetail([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCurrentUser(null);
      return;
    }
    (async () => {
      try {
        const res = await api.get("/api/me");
        const userData = res.data?.user || res.data?.data || null;
        setCurrentUser(userData);
      } catch {
        setCurrentUser(null);
      }
    })();
  }, []);

  const eventParticipants = useMemo(
    () => event?.participants || [],
    [event?.participants],
  );

  const isUserParticipant = useMemo(() => {
    if (!currentUser || !event || !Array.isArray(eventParticipants))
      return false;
    return eventParticipants.some(
      (p) => p.user?.id === currentUser.id || p.userId === currentUser.id,
    );
  }, [currentUser, event, eventParticipants]);

  const isConfirmedParticipant = useMemo(() => {
    if (!currentUser || !Array.isArray(eventParticipants)) return false;
    return eventParticipants.some((p) => {
      const uid = p.user?.id || p.userId;
      return uid === currentUser.id && p.status === "confirmed";
    });
  }, [currentUser, eventParticipants]);

  const isStandardUser =
    !!currentUser?.roles?.includes("ROLE_USER") &&
    !currentUser?.roles?.includes("ROLE_ORGANISATEUR") &&
    !currentUser?.roles?.includes("ROLE_ADMIN");

  const canChooseTeam =
    isStandardUser &&
    !!event?.hasTeams &&
    isUserParticipant &&
    isConfirmedParticipant;

  const {
    teams,
    selectedTeamId,
    setSelectedTeamId,
    teamsLoading: teamChoiceLoading,
    teamActionLoading,
    teamMessage,
    userTeamId,
    currentUserTeam,
    joinTeam,
    leaveTeam,
  } = useEventTeams({
    eventId: event?.id,
    currentUserId: currentUser?.id,
    canChooseTeam,
  });

  useEffect(() => {
    if (!event?.id) {
      setTeamsDetail([]);
      return;
    }
    if (!event.hasTeams) {
      setTeamsDetail([]);
      return;
    }
    loadTeamsDetail(event);
  }, [event, userTeamId, loadTeamsDetail]);

  const handleJoinEvent = async (eid) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setParticipationMessage("Vous devez être connecté pour participer");
      return;
    }
    try {
      setJoiningEventId(eid);
      await api.post(`/api/event/${eid}/join`, {});
      setParticipationMessage("Inscription réussie");
      await loadPage();
      setTimeout(() => setParticipationMessage(""), 3500);
    } catch (err) {
      setParticipationMessage(
        err.response?.data?.message || "Impossible de participer",
      );
      setTimeout(() => setParticipationMessage(""), 3500);
    } finally {
      setJoiningEventId(null);
    }
  };

  const handleLeaveEvent = async (eid) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setParticipationMessage("Vous devez être connecté");
      return;
    }
    try {
      setJoiningEventId(eid);
      await api.delete(`/api/event/${eid}/leave`);
      setParticipationMessage("Désinscription réussie");
      await loadPage();
      setTimeout(() => setParticipationMessage(""), 3500);
    } catch (err) {
      setParticipationMessage(
        err.response?.data?.message || "Impossible de vous désinscrire",
      );
      setTimeout(() => setParticipationMessage(""), 3500);
    } finally {
      setJoiningEventId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 px-4 sm:px-6 pt-24 pb-16 text-white flex items-center justify-center">
        <p className="text-zinc-400">Chargement de l'événement...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-zinc-900 px-4 sm:px-6 pt-24 pb-16 text-white">
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => navigate("/calendrier")}
            className="text-orange-400 hover:text-orange-300 text-sm mb-6"
          >
            ← Retour au calendrier
          </button>
          <div className="rounded-xl border border-red-700/60 bg-red-900/20 px-4 py-3 text-red-200">
            {error || "Événement introuvable."}
          </div>
        </div>
      </div>
    );
  }

  const participantCount = eventParticipants.length;
  const sportLabel = formatSportType(event.type);

  return (
    <div className="min-h-screen bg-zinc-900 px-4 sm:px-6 pt-24 pb-16 text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link
            to="/calendrier"
            className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-medium transition"
          >
            ← Retour au calendrier
          </Link>
        </div>

        <header className="rounded-2xl border border-zinc-700 bg-zinc-800/80 p-6 sm:p-8 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-orange-500 break-words">
                {event.title}
              </h1>
              <p className="mt-2 text-zinc-300 text-lg">
                {event.dueDate
                  ? new Date(event.dueDate + "T12:00:00").toLocaleDateString(
                      "fr-FR",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )
                  : "Date à définir"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-zinc-700 px-3 py-1 text-xs font-medium text-zinc-200">
                  Statut :{" "}
                  {event.status === "pending"
                    ? "En attente"
                    : event.status === "in_progress"
                      ? "En cours"
                      : event.status === "completed"
                        ? "Terminé"
                        : event.status}
                </span>
                {sportLabel && (
                  <span className="inline-flex items-center rounded-full bg-zinc-700 px-3 py-1 text-xs font-medium text-zinc-200">
                    {sportLabel}
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-zinc-700 px-3 py-1 text-xs font-medium text-zinc-200">
                  Visibilité : {formatVisibility(event.visibility)}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-600 bg-zinc-900/60 p-4 min-w-[200px]">
              <p className="text-zinc-400 text-xs uppercase tracking-wide">
                Participants
              </p>
              <p className="text-2xl font-semibold text-white mt-1">
                {participantCount}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {event.description && (
              <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-white mb-3">
                  Description
                </h2>
                <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </section>
            )}

            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Organisateur
              </h2>
              {event.creator ? (
                <div>
                  <p className="font-medium text-white">
                    {event.creator.username || "—"}
                  </p>
                  <p className="text-sm text-zinc-400">{event.creator.email}</p>
                </div>
              ) : (
                <p className="text-zinc-400 text-sm">Non renseigné</p>
              )}
            </section>

            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Personnes inscrites ({participantCount})
              </h2>
              {participantCount === 0 ? (
                <p className="text-zinc-400 text-sm">
                  Aucun participant pour le moment.
                </p>
              ) : (
                <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {eventParticipants.map((p) => {
                    const u = p.user;
                    const name = u?.username || u?.email || "Utilisateur";
                    return (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-zinc-600/80 bg-zinc-900/40 px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white truncate">
                            {name}
                          </p>
                          {u?.email && (
                            <p className="text-xs text-zinc-500 truncate">
                              {u.email}
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 text-xs font-medium px-2 py-1 rounded ${
                            p.status === "confirmed"
                              ? "bg-emerald-900/40 text-emerald-200"
                              : p.status === "pending"
                                ? "bg-amber-900/40 text-amber-200"
                                : "bg-zinc-700 text-zinc-300"
                          }`}
                        >
                          {formatParticipantStatus(p.status)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {event.hasTeams && (
              <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-white mb-2">
                  Équipes et compositions
                </h2>
                <p className="text-zinc-400 text-sm mb-4">
                  Détail de chaque équipe et des membres inscrits.
                </p>
                {teamsLoading ? (
                  <p className="text-zinc-400 text-sm">
                    Chargement des équipes...
                  </p>
                ) : teamsDetail.length === 0 ? (
                  <p className="text-zinc-400 text-sm">
                    Aucune équipe n'a encore été créée pour cet événement.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {teamsDetail.map((team) => {
                      const members = team.members || [];
                      const max = team.maxSize;
                      const count = team.memberCount ?? members.length ?? 0;
                      return (
                        <div
                          key={team.id}
                          className="rounded-xl border border-zinc-600 overflow-hidden bg-zinc-900/50"
                        >
                          <div
                            className="flex items-center gap-3 px-4 py-3 border-b border-zinc-600/80"
                            style={{
                              borderLeftWidth: 4,
                              borderLeftColor: team.color || "#f97316",
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white truncate">
                                {team.name}
                              </h3>
                              <p className="text-xs text-zinc-400 mt-0.5">
                                {max != null
                                  ? `${count} / ${max} places`
                                  : `${count} membre${count > 1 ? "s" : ""}`}
                              </p>
                            </div>
                          </div>
                          {members.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-zinc-500">
                              Aucun membre dans cette équipe.
                            </p>
                          ) : (
                            <ul className="divide-y divide-zinc-700/80">
                              {members.map((m) => {
                                const u = m.user;
                                const display =
                                  u?.username || u?.email || "Membre";
                                return (
                                  <li
                                    key={m.id}
                                    className="px-4 py-2.5 flex items-center justify-between gap-3"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-white truncate">
                                        {display}
                                      </p>
                                      {u?.email && (
                                        <p className="text-xs text-zinc-500 truncate">
                                          {u.email}
                                        </p>
                                      )}
                                    </div>
                                    <span className="shrink-0 text-xs text-orange-300/90 font-medium">
                                      {formatTeamMemberRole(m.role)}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-5 sm:p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4">
                Participer
              </h2>
              {!currentUser && (
                <p className="text-sm text-zinc-400 mb-4">
                  Connectez-vous pour vous inscrire à cet événement.
                </p>
              )}
              {currentUser &&
                (currentUser.roles?.includes("ROLE_ORGANISATEUR") ||
                  currentUser.roles?.includes("ROLE_ADMIN")) && (
                  <p className="text-sm text-zinc-400 mb-4">
                    En tant qu'organisateur ou administrateur, gérez les
                    événements depuis l'espace dédié.
                  </p>
                )}

              <ParticipationButtons
                currentUser={currentUser}
                selectedEvent={event}
                isUserParticipant={isUserParticipant}
                joiningEventId={joiningEventId}
                participationMessage={participationMessage}
                onJoin={handleJoinEvent}
                onLeave={handleLeaveEvent}
              />

              {event.hasTeams && isStandardUser && (
                <div className="mt-6 pt-6 border-t border-zinc-700 space-y-3">
                  <h3 className="text-sm font-semibold text-white">
                    Mon équipe
                  </h3>

                  {!currentUser && (
                    <p className="text-sm text-zinc-400">
                      Connectez-vous pour choisir une équipe.
                    </p>
                  )}

                  {currentUser && isStandardUser && !isUserParticipant && (
                    <p className="text-sm text-zinc-400">
                      Inscrivez-vous à l'événement pour pouvoir rejoindre une
                      équipe.
                    </p>
                  )}

                  {currentUser &&
                    isUserParticipant &&
                    !isConfirmedParticipant && (
                      <p className="text-sm text-zinc-400">
                        Votre inscription est en attente de validation par
                        l'organisateur.
                      </p>
                    )}

                  {canChooseTeam && (
                    <>
                      {teamMessage && (
                        <p className="text-sm text-orange-400">{teamMessage}</p>
                      )}

                      {teamChoiceLoading ? (
                        <p className="text-sm text-zinc-400">
                          Chargement des équipes...
                        </p>
                      ) : teams.length === 0 ? (
                        <p className="text-sm text-zinc-400">
                          Aucune équipe disponible pour le moment.
                        </p>
                      ) : userTeamId ? (
                        <>
                          <p className="text-sm text-zinc-300">
                            Vous êtes dans l'équipe{" "}
                            <span className="font-semibold text-white">
                              {currentUserTeam?.name || "sélectionnée"}
                            </span>
                            .
                          </p>
                          <button
                            type="button"
                            onClick={leaveTeam}
                            disabled={teamActionLoading}
                            className="w-full bg-zinc-700 hover:bg-zinc-600 disabled:bg-gray-700 text-white font-medium py-2 px-3 rounded transition"
                          >
                            {teamActionLoading
                              ? "Traitement..."
                              : "Quitter mon équipe"}
                          </button>
                        </>
                      ) : (
                        <>
                          <select
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-orange-700 focus:outline-none"
                            disabled={teamActionLoading}
                          >
                            <option value="">Sélectionner une équipe</option>
                            {teams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.name}
                                {typeof team.memberCount === "number" &&
                                team.maxSize
                                  ? ` (${team.memberCount}/${team.maxSize})`
                                  : ""}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={joinTeam}
                            disabled={teamActionLoading || !selectedTeamId}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white font-medium py-2 px-3 rounded transition"
                          >
                            {teamActionLoading
                              ? "Traitement..."
                              : "Rejoindre l'équipe"}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {(event.createdAt || event.updatedAt) && (
                <p className="mt-6 text-xs text-zinc-500 border-t border-zinc-700 pt-4">
                  {event.createdAt && (
                    <>
                      Créé le{" "}
                      {new Date(event.createdAt).toLocaleString("fr-FR")}
                    </>
                  )}
                  {event.updatedAt && (
                    <>
                      {event.createdAt ? " · " : ""}
                      Mis à jour le{" "}
                      {new Date(event.updatedAt).toLocaleString("fr-FR")}
                    </>
                  )}
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default EventDetailPage;
