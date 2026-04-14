import { useState } from "react";
import Footer from "../components/footer";
import { api } from "../api/client.js";

const Contact = () => {
  const [form, setForm] = useState({
    subject: "",
    message: "",
  });
  const [success, setSuccess] = useState(""); // message succès
  const [error, setError] = useState(""); // message erreur

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      // Envoi de la demande via la route API
      await api.post(
        "/api/requests/create",
        {
          objet: form.subject, // correspond à la clé attendue par l'API
          message: form.message,
        },
      );

      setSuccess("Demande envoyée avec succès !");
      setForm({ subject: "", message: "" }); // reset formulaire
    } catch (err) {
      console.error(
        "Erreur création demande :",
        err.response ? err.response.data : err.message,
      );
      setError(
        "Erreur lors de l'envoi de la demande. Vérifie la console pour plus de détails.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 relative overflow-x-hidden pt-20 sm:pt-24">
      {/* Contenu */}
      <div className="flex justify-center items-start sm:items-center min-h-[calc(100vh-5rem)] px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl min-h-[500px] sm:min-h-[600px] md:h-[700px] bg-zinc-800 rounded-lg p-4 sm:p-6 md:p-8 flex flex-col">
          {/* Titre */}
          <h1 className="flex justify-center text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
            Contact Support
          </h1>
          <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base text-center">
            Un problème, une question ? Notre équipe est là pour vous aider.
          </p>

          {/* Message succès / erreur */}
          {success && (
            <p className="text-green-400 mb-3 sm:mb-4 text-sm sm:text-base text-center">
              {success}
            </p>
          )}
          {error && (
            <p className="text-red-500 mb-3 sm:mb-4 text-sm sm:text-base text-center">
              {error}
            </p>
          )}

          {/* Formulaire */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:gap-4 flex-1"
          >
            {/* Sujet */}
            <div className="flex-shrink-0">
              <label className="text-white text-sm sm:text-base mb-1 sm:mb-2 block">
                Objet
              </label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Ex : Demande de rôle administrateur"
                className="w-full p-2 sm:p-3 rounded bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:border-orange-500 text-sm sm:text-base"
                required
              />
            </div>

            {/* Message */}
            <div className="flex-1 min-h-[200px] sm:min-h-[250px] md:min-h-[300px]">
              <label className="text-white text-sm sm:text-base mb-1 sm:mb-2 block">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Décris ton problème en détail..."
                className="w-full h-full min-h-[180px] sm:min-h-[220px] md:min-h-[280px] p-2 sm:p-3 rounded bg-zinc-700 text-white border border-zinc-600 resize-none focus:outline-none focus:border-orange-500 text-sm sm:text-base"
                required
              />
            </div>

            {/* Bouton */}
            <button
              type="submit"
              className="mt-2 sm:mt-4 bg-[#F04406] hover:bg-orange-700 text-white py-2 sm:py-3 rounded-lg transition font-semibold text-sm sm:text-base w-full sm:w-auto"
            >
              Envoyer au support
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;
