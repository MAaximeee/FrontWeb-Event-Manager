/**
 * Composant Modal pour afficher les détails d'un événement
 * Inclut les boutons de participation
 */
import { useMemo } from "react";
import { useEventTeams } from "../hooks/useEventTeams";
import { ParticipationButtons } from "./ParticipationButtons";

export function EventDetailModal({
  selectedEvent,
  currentUser,
  isUserParticipant,
  joiningEventId,
  participationMessage,
  onClose,
  onJoin,
  onLeave,
}) {
  const eventId = selectedEvent?.id;
  const eventParticipants = useMemo(
    () => selectedEvent?.participants || [],
    [selectedEvent?.participants],
  );
  const eventHasTeams = !!selectedEvent?.hasTeams;

  const isConfirmedParticipant = useMemo(() => {
    if (!currentUser || !Array.isArray(eventParticipants)) return false;

    return eventParticipants.some((participant) => {
      const participantUserId = participant.user?.id || participant.userId;
      return (
        participantUserId === currentUser.id &&
        participant.status === "confirmed"
      );
    });
  }, [currentUser, eventParticipants]);

  const isStandardUser =
    !!currentUser?.roles?.includes("ROLE_USER") &&
    !currentUser?.roles?.includes("ROLE_ORGANISATEUR") &&
    !currentUser?.roles?.includes("ROLE_ADMIN");

  const canChooseTeam =
    isStandardUser &&
    eventHasTeams &&
    isUserParticipant &&
    isConfirmedParticipant;

  const {
    teams,
    selectedTeamId,
    setSelectedTeamId,
    teamsLoading,
    teamActionLoading,
    teamMessage,
    userTeamId,
    currentUserTeam,
    joinTeam,
    leaveTeam,
  } = useEventTeams({
    eventId,
    currentUserId: currentUser?.id,
    canChooseTeam,
  });

  if (!selectedEvent) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-zinc-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-zinc-700">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-orange-500">
            {selectedEvent.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Contenu */}
        <div className="space-y-3 text-white">
          {/* Date */}
          <div>
            <span className="text-gray-400 text-sm block">Date</span>
            <p className="font-medium">
              {selectedEvent.dueDate
                ? new Date(
                    selectedEvent.dueDate + "T12:00:00",
                  ).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Non définie"}
            </p>
          </div>

          {/* Statut */}
          <div>
            <span className="text-gray-400 text-sm block">Statut</span>
            <p className="font-medium capitalize">
              {selectedEvent.status === "pending"
                ? "En attente"
                : selectedEvent.status === "in_progress"
                  ? "En cours"
                  : selectedEvent.status === "completed"
                    ? "Terminé"
                    : selectedEvent.status}
            </p>
          </div>

          {/* Type de sport */}
          {selectedEvent.type && (
            <div>
              <span className="text-gray-400 text-sm block">Type de sport</span>
              <p className="font-medium capitalize">
                {selectedEvent.type === "football"
                  ? "Football"
                  : selectedEvent.type === "basketball"
                    ? "Basketball"
                    : selectedEvent.type === "tennis"
                      ? "Tennis"
                      : selectedEvent.type === "rugby"
                        ? "Rugby"
                        : selectedEvent.type === "handball"
                          ? "Handball"
                          : selectedEvent.type}
              </p>
            </div>
          )}

          {/* Description */}
          {selectedEvent.description && (
            <div>
              <span className="text-gray-400 text-sm block">Description</span>
              <p className="text-gray-200 text-sm whitespace-pre-wrap">
                {selectedEvent.description}
              </p>
            </div>
          )}

          {/* Date de création */}
          {selectedEvent.createdAt && (
            <div className="pt-2 border-t border-zinc-700">
              <span className="text-gray-500 text-xs">
                Créé le{" "}
                {new Date(selectedEvent.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
          )}

          {/* Boutons de participation */}
          <ParticipationButtons
            currentUser={currentUser}
            selectedEvent={selectedEvent}
            isUserParticipant={isUserParticipant}
            joiningEventId={joiningEventId}
            participationMessage={participationMessage}
            onJoin={onJoin}
            onLeave={onLeave}
          />

          {selectedEvent.hasTeams && isStandardUser && (
            <div className="pt-4 border-t border-zinc-700 space-y-3">
              <h4 className="text-sm font-semibold text-white">
                Choix d'équipe
              </h4>

              {!currentUser && (
                <p className="text-sm text-zinc-400">
                  Connectez-vous pour choisir une équipe.
                </p>
              )}

              {currentUser && isStandardUser && !isUserParticipant && (
                <p className="text-sm text-zinc-400">
                  Inscrivez-vous à l'événement pour pouvoir choisir une équipe.
                </p>
              )}

              {currentUser && isUserParticipant && !isConfirmedParticipant && (
                <p className="text-sm text-zinc-400">
                  Votre inscription est en attente de validation.
                </p>
              )}

              {canChooseTeam && (
                <>
                  {teamMessage && (
                    <p className="text-sm text-orange-400">{teamMessage}</p>
                  )}

                  {teamsLoading ? (
                    <p className="text-sm text-zinc-400">
                      Chargement des équipes...
                    </p>
                  ) : teams.length === 0 ? (
                    <p className="text-sm text-zinc-400">
                      Aucune équipe disponible pour le moment.
                    </p>
                  ) : (
                    <>
                      {userTeamId ? (
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
