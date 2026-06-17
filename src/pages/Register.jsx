import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import logo from "../assets/logo.svg";

const Register = () => {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !values.username ||
      !values.email ||
      !values.password ||
      !values.confirmPassword
    ) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (values.password !== values.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (values.password.length < 12) {
      setError("Le mot de passe doit contenir au moins 12 caracteres.");
      return;
    }

    if (
      !/[a-z]/.test(values.password) ||
      !/[A-Z]/.test(values.password) ||
      !/[0-9]/.test(values.password) ||
      !/[^A-Za-z0-9]/.test(values.password)
    ) {
      setError(
        "Le mot de passe doit contenir une minuscule, une majuscule, un chiffre et un caractere special.",
      );
      return;
    }

    if (!acceptedTerms) {
      setError(
        "Vous devez accepter les conditions d'utilisation et la politique de confidentialité.",
      );
      return;
    }

    try {
      const response = await api.post("/api/register", {
        username: values.username,
        email: values.email,
        password: values.password,
      });

      if (response.status === 201) {
        navigate("/login");
      }
    } catch (err) {
      console.error("Erreur inscription :", err);
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-zinc-900">
      <div className="w-full max-w-md p-8 bg-zinc-800 rounded-lg shadow-2xl">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-20 w-auto" />
        </div>

        <h2 className="text-2xl text-orange-500 font-bold text-center mb-6">
          Inscription
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="text-white block mb-1"></label>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              name="username"
              onChange={handleChanges}
              className="w-full px-3 py-2 rounded bg-white text-black focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-black block mb-1"></label>
            <input
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChanges}
              className="w-full px-3 py-2 rounded bg-white text-black focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-black block mb-1"></label>
            <input
              type="password"
              placeholder="Mot de passe"
              name="password"
              onChange={handleChanges}
              className="w-full px-3 py-2 rounded bg-white text-black focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-white block mb-1"></label>
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              name="confirmPassword"
              onChange={handleChanges}
              className="w-full px-3 py-2 rounded bg-white text-black focus:outline-none focus:border-orange-500"
            />
          </div>

          <p className="text-xs text-zinc-400">
            Le mot de passe doit contenir au moins 12 caracteres, avec une
            minuscule, une majuscule, un chiffre et un caractere special.
          </p>

          <label
            className="flex items-start gap-2 text-xs text-zinc-300 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                setError("");
              }}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-500 bg-zinc-700 text-orange-500 focus:ring-orange-500/40"
            />
            <span>
              En créant un compte, j&apos;accepte les{" "}
              <Link
                to="/legal/conditions-utilisation"
                className="text-orange-500 hover:text-orange-400 underline"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                conditions d&apos;utilisation
              </Link>
              {" et la "}
              <Link
                to="/legal/politique-confidentialite"
                className="text-orange-500 hover:text-orange-400 underline"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                politique de confidentialité
              </Link>
              .
            </span>
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={!acceptedTerms}
            className="cursor-pointer w-full bg-orange-500 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 text-white font-semibold py-2 rounded transition-colors"
          >
            Nous rejoindre
          </button>
        </form>

        <div className="text-center mt-6 text-white">
          <span>Vous avez déjà un compte ? </span>
          <Link to="/login" className="text-orange-500 hover:underline">
            Connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
