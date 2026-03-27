import axios from "axios";
import { useState } from "react";

const AddEvent = ({ isOpen, onClose, onEventAdded }) => {
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start: "",
    color: "#3b82f6",
    visibility: "public",
    type: "football",
    customType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const token = localStorage.getItem("token");
      const eventType =
        newEvent.type === "autres" ? newEvent.customType : newEvent.type;
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/event/create`,
        {
          title: newEvent.title,
          description: newEvent.description || null,
          status: "pending",
          dueDate: newEvent.start,
          type: eventType,
          visibility: newEvent.visibility,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        // Réinitialiser le formulaire
        setNewEvent({
          title: "",
          description: "",
          start: "",
        });

        if (onEventAdded) {
          onEventAdded(response.data.data);
        }

        onClose();
      }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-orange-500">
            Nouvel événement
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

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
              onClick={onClose}
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
      </div>
    </div>
  );
};

export default AddEvent;
