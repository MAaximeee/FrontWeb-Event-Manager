import { useState } from "react";
import { api } from "../api/client.js";

// Correspondance sport -> nombre de personnes par équipe
const SPORT_TEAM_SIZE = {
  football: 11,
  futsal: 5,
  volleyball: 6,
  basketball: 5,
  handball: 7,
  tennis: 1,
  badminton: 2,
  ping_pong: 1,
  rugby: 15,
  american_football: 11,
};

const getTeamSizeForSport = (sportType) => {
  if (!sportType) return null;
  const normalizedType = String(sportType)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  return SPORT_TEAM_SIZE[normalizedType] || null;
};

const isSportWithoutTeams = (sportType) => {
  const normalizedType = String(sportType || "")
    .trim()
    .toLowerCase();

  const noTeamKeywords = ["course", "running", "jogging", "marathon"];
  return noTeamKeywords.some((keyword) => normalizedType.includes(keyword));
};

const MIN_TEAMS_REQUIRED = 2;

const AddEvent = ({ isOpen, onClose, onEventAdded }) => {
  const initialEventState = {
    title: "",
    description: "",
    start: "",
    visibility: "public",
    type: "football",
    customType: "",
  };

  const [newEvent, setNewEvent] = useState({
    ...initialEventState,
  });
  const [activeTab, setActiveTab] = useState("event");
  const [draftEventPayload, setDraftEventPayload] = useState(null);
  const [createdTeams, setCreatedTeams] = useState([]);
  const [teamForm, setTeamForm] = useState({
    name: "",
    maxSize: "",
  });
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamMessage, setTeamMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetAllStates = () => {
    setNewEvent({ ...initialEventState });
    setDraftEventPayload(null);
    setCreatedTeams([]);
    setActiveTab("event");
    setTeamForm({ name: "", maxSize: "" });
    setTeamMessage("");
    setError("");
    setLoading(false);
    setTeamLoading(false);
  };

  const handleClose = () => {
    resetAllStates();
    onClose();
  };

  const handleFinish = () => {
    if (createdTeams.length < MIN_TEAMS_REQUIRED) {
      return;
    }

    finalizeCreation();
  };

  const finalizeCreation = async () => {
    if (!draftEventPayload) {
      setTeamMessage("Données d'événement manquantes.");
      return;
    }

    setTeamLoading(true);
    setTeamMessage("");

    try {
      const createEventResponse = await api.post(
        "/api/event/create",
        draftEventPayload,
      );

      const createdEvent = createEventResponse.data?.data;

      if (!createdEvent?.id) {
        throw new Error("Événement créé sans identifiant");
      }

      for (const team of createdTeams) {
        await api.post(
          `/api/event/${createdEvent.id}/team`,
          {
            name: team.name,
            maxSize: team.maxSize,
          },
        );
      }

      if (onEventAdded) {
        onEventAdded(createdEvent);
      }

      handleClose();
    } catch (err) {
      setTeamMessage(
        err.response?.data?.message ||
          "Impossible de finaliser la création de l'événement.",
      );
    } finally {
      setTeamLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!newEvent.title || !newEvent.start) {
      setError("Veuillez remplir tous les champs obligatoires");
      setLoading(false);
      return;
    }

    try {
      const eventType =
        newEvent.type === "autres" ? newEvent.customType : newEvent.type;

      // Récupérer la taille d'équipe basée sur le type de sport
      const teamSize = getTeamSizeForSport(eventType);

      const hasTeams = !isSportWithoutTeams(eventType) && (teamSize || 0) > 1;

      const payload = {
        title: newEvent.title,
        description: newEvent.description || null,
        status: "pending",
        dueDate: newEvent.start,
        type: eventType,
        visibility: newEvent.visibility,
        hasTeams,
        allowParticipantCreateTeam: hasTeams,
        defaultTeamSize: hasTeams ? teamSize : null,
      };

      if (!hasTeams) {
        const response = await api.post("/api/event/create", payload);

        if (response.data?.success && onEventAdded) {
          onEventAdded(response.data?.data);
        }

        handleClose();
        return;
      }

      setDraftEventPayload(payload);

      setCreatedTeams([]);
      setActiveTab("team");
      setTeamForm({
        name: "",
        maxSize: teamSize ? String(teamSize) : "",
      });
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'événement:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'ajout de l'événement. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setNewEvent((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    if (!draftEventPayload) {
      setTeamMessage("Aucun événement en préparation.");
      return;
    }

    if (!teamForm.name.trim()) {
      setTeamMessage("Le nom de l'équipe est obligatoire.");
      return;
    }

    setTeamMessage("");

    const computedMaxSize = getTeamSizeForSport(draftEventPayload?.type);
    setCreatedTeams((prev) => [
      ...prev,
      {
        name: teamForm.name.trim(),
        maxSize: computedMaxSize,
      },
    ]);

    setTeamMessage("Équipe ajoutée. Cliquez sur Terminer pour valider.");
    setTeamForm((prev) => ({
      ...prev,
      name: "",
      maxSize: computedMaxSize ? String(computedMaxSize) : "",
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-orange-500">
            Nouvel événement
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl transition"
            disabled={loading || teamLoading}
          >
            ×
          </button>
        </div>

        {draftEventPayload?.hasTeams && (
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("event")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                activeTab === "event"
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              Événement
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("team")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                activeTab === "team"
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              Création d'équipe
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        {activeTab === "event" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Titre de l'événement"
                className="w-full px-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-orange-700 focus:outline-none"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            {/* Visibilité et type d'événement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="visibility"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Visibilité
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={newEvent.visibility}
                  onChange={(e) => handleChange("visibility", e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-orange-700 focus:outline-none"
                  disabled={loading}
                >
                  <option value="public">Public</option>
                  <option value="private">Privé</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Type de sport
                </label>
                <select
                  id="type"
                  name="type"
                  value={newEvent.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-orange-700 focus:outline-none mb-2"
                  disabled={loading}
                >
                  <option value="football">Football</option>
                  <option value="basketball">Basketball</option>
                  <option value="tennis">Tennis</option>
                  <option value="rugby">Rugby</option>
                  <option value="handball">Handball</option>
                  <option value="course_a_pied">Course à pied</option>
                  <option value="autres">Autres</option>
                </select>

                {newEvent.type === "autres" && (
                  <input
                    type="text"
                    value={newEvent.customType}
                    onChange={(e) => handleChange("customType", e.target.value)}
                    placeholder="Précisez le type de sport"
                    className="w-full px-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-orange-700 focus:outline-none"
                    disabled={loading}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Date et heure de début *
              </label>
              <input
                type="datetime-local"
                value={newEvent.start}
                onChange={(e) => handleChange("start", e.target.value)}
                className="w-full px-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-orange-700 focus:outline-none"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Description de l'événement (optionnel)"
                rows={3}
                className="w-full px-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-orange-700 focus:outline-none resize-none"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition border border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "team" && draftEventPayload?.hasTeams && (
          <div className="space-y-4">
            <div className="p-3 rounded border border-zinc-700 bg-zinc-900/40">
              <p className="text-sm text-zinc-300">
                Événement :{" "}
                <span className="text-white font-medium">
                  {draftEventPayload.title}
                </span>
              </p>
              <p className="text-xs text-orange-300 mt-1">
                Équipes ajoutées : {createdTeams.length} / {MIN_TEAMS_REQUIRED}
              </p>
            </div>

            {createdTeams.length > 0 && (
              <div className="p-3 rounded border border-zinc-700 bg-zinc-900/40">
                <p className="text-sm text-white font-medium mb-2">
                  Équipes préparées
                </p>
                <ul className="space-y-1 text-sm text-zinc-300">
                  {createdTeams.map((team, index) => (
                    <li key={`${team.name}-${index}`}>
                      {index + 1}. {team.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {teamMessage && (
              <div className="p-3 bg-zinc-900/50 border border-zinc-700 rounded text-sm text-orange-300">
                {teamMessage}
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nom de l'équipe *
                </label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) =>
                    setTeamForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ex: Team Orange"
                  className="w-full px-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-orange-700 focus:outline-none"
                  disabled={teamLoading}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition border border-zinc-600 disabled:opacity-50"
                  disabled={
                    teamLoading || createdTeams.length < MIN_TEAMS_REQUIRED
                  }
                >
                  {teamLoading ? "Validation..." : "Terminer"}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-700 transition disabled:opacity-50"
                  disabled={teamLoading}
                >
                  {teamLoading ? "Création..." : "Créer l'équipe"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEvent;
