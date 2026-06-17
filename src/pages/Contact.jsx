import { useState } from "react";
import { api } from "../api/client.js";

const fieldClass =
  "w-full rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2.5 text-sm text-white placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition";

function FormAlert({ type, children }) {
  if (type === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border border-green-500 bg-green-500/10 p-4"
      >
        <p className="text-sm text-green-400">{children}</p>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="rounded-lg border border-red-500 bg-red-500/10 p-4"
    >
      <p className="text-sm text-red-400">{children}</p>
    </div>
  );
}

const Contact = () => {
  const [form, setForm] = useState({ subject: "", message: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setSubmitting(true);

    try {
      await api.post("/api/requests/create", {
        objet: form.subject,
        message: form.message,
      });

      setSuccess(
        "Votre message a bien été envoyé. Nous vous répondrons dès que possible.",
      );
      setForm({ subject: "", message: "" });
    } catch (err) {
      console.error(
        "Erreur création demande :",
        err.response ? err.response.data : err.message,
      );
      const apiMessage = err.response?.data?.message;
      setError(
        apiMessage ||
          "Impossible d'envoyer votre message pour le moment. Réessayez plus tard.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-white">
      <div className="mx-auto w-full max-w-lg">
        <header className="mb-6 border-b border-zinc-700/80 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-orange-500">
            Contact
          </h1>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Une question ou un problème ? Décrivez votre demande : notre équipe
            vous répondra rapidement.
          </p>
        </header>

        <div className="rounded-lg border border-zinc-700 bg-zinc-800 shadow-sm p-5 sm:p-6">
          {(success || error) && (
            <div className="mb-5 space-y-3">
              {success ? <FormAlert type="success">{success}</FormAlert> : null}
              {error ? <FormAlert type="error">{error}</FormAlert> : null}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="contact-subject"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Objet
              </label>
              <input
                id="contact-subject"
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Ex. demande d'accès organisateur"
                className={fieldClass}
                required
                disabled={submitting}
                autoComplete="off"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Décrivez votre demande en quelques lignes…"
                rows={6}
                className={`${fieldClass} resize-y min-h-[9rem]`}
                required
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Envoi en cours…" : "Envoyer le message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
