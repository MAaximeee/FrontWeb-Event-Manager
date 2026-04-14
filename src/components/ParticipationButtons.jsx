export function ParticipationButtons({
  currentUser,
  selectedEvent,
  isUserParticipant,
  joiningEventId,
  participationMessage,
  onJoin,
  onLeave,
}) {
  if (
    !currentUser ||
    !currentUser.roles ||
    !currentUser.roles.includes("ROLE_USER") ||
    currentUser.roles.includes("ROLE_ORGANISATEUR")
  ) {
    return null;
  }

  return (
    <div className="pt-4 border-t border-zinc-700">
      {participationMessage && (
        <p className="text-sm mb-2 text-orange-500 font-medium">
          {participationMessage}
        </p>
      )}
      {isUserParticipant ? (
        <button
          onClick={() => onLeave(selectedEvent.id)}
          disabled={joiningEventId === selectedEvent.id}
          className="w-full bg-zinc-700 hover:bg-zinc-600 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded transition"
        >
          {joiningEventId === selectedEvent.id
            ? "Désinscription en cours..."
            : "Se désinscrire"}
        </button>
      ) : (
        <button
          onClick={() => onJoin(selectedEvent.id)}
          disabled={joiningEventId === selectedEvent.id}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded transition"
        >
          {joiningEventId === selectedEvent.id
            ? "Inscription en cours..."
            : "Participer à cet événement"}
        </button>
      )}
    </div>
  );
}
