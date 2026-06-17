import {
  eventOrganizerName,
  formatEventStatusLabelForEvent,
  formatParticipantStatusLabel,
  formatRaceDuration,
  formatSportType,
  formatEventDateTime,
  eventStatusBadgeClassName,
  getEventOrganizerCapabilities,
  ORGANIZER_EVENT_SPORT_TYPES,
  participantDisplayName,
} from "../utils/eventPresentation.js";

const SCORE_STATUS_OPTIONS = [
  { value: "scheduled", label: "Prévu" },
  { value: "in_progress", label: "En cours" },
  { value: "finished", label: "Terminé" },
];

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-md transition ${
        active
          ? "bg-orange-500 text-white"
          : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
      }`}
    >
      {children}
    </button>
  );
}

export function OrganizerEventManageModal({
  event,
  onClose,
  activeTab,
  onTabChange,
  canManage,
  participants,
  teams,
  raceStandings,
  draftStatus,
  currentStatus,
  statusSaving,
  onStatusChange,
  onDelete,
  score,
  scoreDraft,
  scoreLoading,
  scoreSaving,
  onScoreDraftChange,
  onSaveScore,
  raceLoading,
  raceDraftByParticipant,
  raceSavingKey,
  onRaceDraftChange,
  onSaveRaceResult,
  expandedTeams,
  teamMembersByTeam,
  onToggleTeamMembers,
  infoDraft,
  infoSaving,
  onInfoDraftChange,
  onSaveInfo,
}) {
  const caps = getEventOrganizerCapabilities(event);
  const defaultTeamA = teams[0] || null;
  const defaultTeamB = teams[1] || null;
  const organizer = eventOrganizerName(event);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-t-2xl border border-zinc-700 bg-zinc-900 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-manage-title"
      >
        <header className="shrink-0 border-b border-zinc-700 px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2
                id="event-manage-title"
                className="text-lg font-semibold text-white truncate"
              >
                {infoDraft?.title?.trim() || event.title}
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                {formatSportType(
                  infoDraft?.type === "autres"
                    ? infoDraft?.customType || event.type
                    : infoDraft?.type || event.type,
                )}{" "}
                · {formatEventDateTime(event.dueDate) || "Date non définie"}
              </p>
              {organizer && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  Organisateur : {organizer}
                </p>
              )}
              <span
                className={`inline-flex mt-2 rounded-full px-2.5 py-1 text-xs ${eventStatusBadgeClassName({ status: draftStatus, dueDate: event.dueDate })}`}
              >
                {formatEventStatusLabelForEvent({
                  status: draftStatus,
                  dueDate: event.dueDate,
                })}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="shrink-0 flex flex-wrap items-center gap-2 border-b border-zinc-700 px-4 py-3 sm:px-5">
          <select
            className="w-full sm:w-36 rounded-lg bg-zinc-700 border border-zinc-600 px-2.5 py-1.5 text-xs focus:border-orange-500 focus:outline-none disabled:opacity-50"
            value={draftStatus}
            onChange={(e) => onStatusChange(e.target.value, currentStatus)}
            disabled={!canManage || statusSaving}
          >
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
          </select>

          <TabButton
            active={activeTab === "details"}
            onClick={() => onTabChange("details")}
          >
            Participants
          </TabButton>
          <TabButton
            active={activeTab === "info"}
            onClick={() => onTabChange("info")}
          >
            Informations
          </TabButton>
          {caps.showTeamsTab && (
            <TabButton
              active={activeTab === "teams"}
              onClick={() => onTabChange("teams")}
            >
              Équipes
            </TabButton>
          )}
          {caps.showScoreTab && (
            <TabButton
              active={activeTab === "score"}
              onClick={() => onTabChange("score")}
            >
              Score
            </TabButton>
          )}
          {caps.showRaceTab && (
            <TabButton
              active={activeTab === "race"}
              onClick={() => onTabChange("race")}
            >
              Classement
            </TabButton>
          )}

          {canManage && (
            <button
              type="button"
              onClick={onDelete}
              className="ml-auto rounded-lg bg-red-700 hover:bg-red-800 px-2.5 py-1.5 text-xs transition"
            >
              Supprimer
            </button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {activeTab === "info" && (
            <section className="border border-zinc-700 bg-zinc-900/60 p-3 rounded-lg space-y-4">
              {!canManage ? (
                <p className="text-sm text-zinc-400">
                  Seul l&apos;organisateur ou un administrateur peut modifier
                  ces informations.
                </p>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Titre *
                    </label>
                    <input
                      type="text"
                      value={infoDraft.title}
                      onChange={(e) =>
                        onInfoDraftChange("title", e.target.value)
                      }
                      className="w-full rounded-lg bg-zinc-700 border border-zinc-600 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                      disabled={infoSaving}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Visibilité
                      </label>
                      <select
                        value={infoDraft.visibility}
                        onChange={(e) =>
                          onInfoDraftChange("visibility", e.target.value)
                        }
                        className="w-full rounded-lg bg-zinc-700 border border-zinc-600 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                        disabled={infoSaving}
                      >
                        <option value="public">Public</option>
                        <option value="private">Privé</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Type de sport
                      </label>
                      <select
                        value={infoDraft.type}
                        onChange={(e) =>
                          onInfoDraftChange("type", e.target.value)
                        }
                        className="w-full rounded-lg bg-zinc-700 border border-zinc-600 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                        disabled={infoSaving}
                      >
                        {ORGANIZER_EVENT_SPORT_TYPES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {infoDraft.type === "autres" && (
                        <input
                          type="text"
                          value={infoDraft.customType}
                          onChange={(e) =>
                            onInfoDraftChange("customType", e.target.value)
                          }
                          placeholder="Précisez le type de sport"
                          className="mt-2 w-full rounded-lg bg-zinc-700 border border-zinc-600 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                          disabled={infoSaving}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Date et heure de début
                    </p>
                    <p className="rounded-lg bg-zinc-800/80 border border-zinc-700 px-3 py-2 text-sm text-zinc-300">
                      {formatEventDateTime(event.dueDate) || "Non définie"}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      Définie à la création de l&apos;événement (non modifiable
                      ici).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={infoDraft.description}
                      onChange={(e) =>
                        onInfoDraftChange("description", e.target.value)
                      }
                      rows={4}
                      className="w-full rounded-lg bg-zinc-700 border border-zinc-600 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none resize-none"
                      disabled={infoSaving}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={onSaveInfo}
                    disabled={infoSaving}
                    className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-600 px-3 py-2 text-sm font-medium transition"
                  >
                    {infoSaving
                      ? "Enregistrement…"
                      : "Enregistrer les informations"}
                  </button>
                </>
              )}
            </section>
          )}

          {activeTab === "details" && (
            <section className="border border-zinc-700 bg-zinc-900/60 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-zinc-200">
                  {caps.individual ? "Coureurs inscrits" : "Participants"}
                </h3>
                <span className="text-xs text-zinc-400">
                  {participants.length}
                </span>
              </div>
              {participants.length === 0 ? (
                <p className="text-sm text-zinc-400">Aucun participant.</p>
              ) : (
                <ul className="space-y-2">
                  {participants.map((participant) => (
                    <li
                      key={participant.id}
                      className="text-sm text-zinc-300 flex items-center justify-between gap-3"
                    >
                      <span>
                        {participant.user?.username ||
                          participant.user?.email ||
                          "Utilisateur"}
                      </span>
                      <span className="text-xs rounded bg-zinc-700 px-2 py-1 text-zinc-300">
                        {formatParticipantStatusLabel(participant.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeTab === "teams" && caps.showTeamsTab && (
            <section className="border border-zinc-700 bg-zinc-900/60 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-zinc-200">Équipes</h3>
                <span className="text-xs text-zinc-400">{teams.length}</span>
              </div>
              {teams.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Aucune équipe pour cet événement.
                </p>
              ) : (
                <div className="space-y-2">
                  {teams.map((team) => {
                    const members = teamMembersByTeam[team.id] || [];
                    const teamKey = `${event.id}-${team.id}`;
                    const isTeamOpen = !!expandedTeams[teamKey];

                    return (
                      <div
                        key={team.id}
                        className="border border-zinc-700 bg-zinc-900/80 p-3 rounded-lg"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {team.name}
                            </p>
                            {team.maxSize && (
                              <p className="text-xs text-zinc-400">
                                Taille max : {team.maxSize}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onToggleTeamMembers(team.id)}
                            className="rounded-md bg-orange-500 hover:bg-orange-600 px-3 py-1 text-xs transition"
                          >
                            {isTeamOpen ? "Masquer joueurs" : "Voir joueurs"}
                          </button>
                        </div>
                        {isTeamOpen && (
                          <div className="mt-3 border-t border-zinc-700 pt-2">
                            {members.length === 0 ? (
                              <p className="text-xs text-zinc-400">
                                Aucun joueur dans cette équipe.
                              </p>
                            ) : (
                              <ul className="space-y-1">
                                {members.map((member) => (
                                  <li
                                    key={member.id}
                                    className="text-xs text-zinc-300 flex items-center justify-between"
                                  >
                                    <span>
                                      {member.user?.username ||
                                        member.user?.email ||
                                        "Utilisateur"}
                                    </span>
                                    <span className="rounded bg-zinc-700 px-2 py-0.5 text-[10px] text-zinc-300">
                                      {member.role}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === "score" && caps.showScoreTab && (
            <section className="border border-zinc-700 bg-zinc-900/60 p-3 space-y-3 rounded-lg">
              {scoreLoading ? (
                <p className="text-sm text-zinc-400">Chargement du score...</p>
              ) : (
                <>
                  {score ? (
                    <div className="text-sm text-zinc-300">
                      Score actuel :{" "}
                      <span className="font-semibold text-white">
                        {score.teamA?.name ||
                          defaultTeamA?.name ||
                          "Aucune équipe"}{" "}
                        {score.scoreTeamA ?? 0} - {score.scoreTeamB ?? 0}{" "}
                        {score.teamB?.name ||
                          defaultTeamB?.name ||
                          "Aucune équipe"}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400">
                      Aucun score enregistré pour cet événement.
                    </p>
                  )}
                  {!canManage ? (
                    <p className="text-xs text-zinc-400">
                      Seul l&apos;organisateur ou un admin peut modifier ce
                      score.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={scoreDraft.teamAId}
                        onChange={(e) =>
                          onScoreDraftChange("teamAId", e.target.value)
                        }
                        className="rounded bg-zinc-700 border border-zinc-600 px-2 py-2 text-sm"
                      >
                        <option value="">Choisir l&apos;équipe A</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={scoreDraft.teamBId}
                        onChange={(e) =>
                          onScoreDraftChange("teamBId", e.target.value)
                        }
                        className="rounded bg-zinc-700 border border-zinc-600 px-2 py-2 text-sm"
                      >
                        <option value="">Choisir l&apos;équipe B</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={scoreDraft.scoreTeamA}
                        onChange={(e) =>
                          onScoreDraftChange("scoreTeamA", e.target.value)
                        }
                        className="rounded bg-zinc-700 border border-zinc-600 px-2 py-2 text-sm"
                        placeholder="Score équipe A"
                      />
                      <input
                        type="number"
                        min="0"
                        value={scoreDraft.scoreTeamB}
                        onChange={(e) =>
                          onScoreDraftChange("scoreTeamB", e.target.value)
                        }
                        className="rounded bg-zinc-700 border border-zinc-600 px-2 py-2 text-sm"
                        placeholder="Score équipe B"
                      />
                      <select
                        value={scoreDraft.status}
                        onChange={(e) =>
                          onScoreDraftChange("status", e.target.value)
                        }
                        className="rounded bg-zinc-700 border border-zinc-600 px-2 py-2 text-sm sm:col-span-2"
                      >
                        {SCORE_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={onSaveScore}
                        disabled={scoreSaving}
                        className="sm:col-span-2 rounded bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-600 px-3 py-2 text-sm font-medium transition"
                      >
                        {scoreSaving
                          ? "Enregistrement..."
                          : score
                            ? "Mettre à jour le score"
                            : "Créer le score"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {activeTab === "race" && caps.showRaceTab && (
            <section className="border border-zinc-700 bg-zinc-900/60 p-3 space-y-3 rounded-lg">
              {raceLoading ? (
                <p className="text-sm text-zinc-400">
                  Chargement du classement…
                </p>
              ) : participants.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Aucun coureur inscrit pour saisir des résultats.
                </p>
              ) : (
                <>
                  <p className="text-xs text-zinc-400">
                    Classement et temps (ex. 42:05 ou 1:02:30).
                  </p>
                  <ul className="space-y-3">
                    {participants
                      .filter((p) => p.status !== "cancelled")
                      .map((participant) => {
                        const pid = String(participant.id);
                        const draft = raceDraftByParticipant[pid] || {
                          place: "",
                          temps: "",
                        };
                        const saveKey = `${event.id}-${participant.id}`;
                        const standing = raceStandings.find(
                          (row) =>
                            Number(row.participant.id) ===
                            Number(participant.id),
                        );

                        return (
                          <li
                            key={participant.id}
                            className="rounded-lg border border-zinc-700 bg-zinc-900/80 p-3"
                          >
                            <p className="text-sm font-medium text-white">
                              {participantDisplayName(participant)}
                            </p>
                            {standing?.timeSeconds != null && (
                              <p className="text-xs text-zinc-500 mt-0.5">
                                Enregistré : #{standing.position} ·{" "}
                                {formatRaceDuration(standing.timeSeconds)}
                              </p>
                            )}
                            {!canManage ? (
                              <p className="text-xs text-zinc-500 mt-2">
                                Lecture seule.
                              </p>
                            ) : (
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={draft.place}
                                  onChange={(e) =>
                                    onRaceDraftChange(
                                      participant.id,
                                      "place",
                                      e.target.value,
                                    )
                                  }
                                  className="rounded bg-zinc-700 border border-zinc-600 px-2 py-2 text-sm"
                                  placeholder="Classement"
                                />
                                <input
                                  type="text"
                                  value={draft.temps}
                                  onChange={(e) =>
                                    onRaceDraftChange(
                                      participant.id,
                                      "temps",
                                      e.target.value,
                                    )
                                  }
                                  className="rounded bg-zinc-700 border border-zinc-600 px-2 py-2 text-sm"
                                  placeholder="Temps (mm:ss)"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    onSaveRaceResult(participant.id)
                                  }
                                  disabled={raceSavingKey === saveKey}
                                  className="rounded bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-600 px-3 py-2 text-sm font-medium transition"
                                >
                                  {raceSavingKey === saveKey
                                    ? "Enregistrement…"
                                    : "Enregistrer"}
                                </button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                  </ul>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
