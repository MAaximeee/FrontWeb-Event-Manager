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
<<<<<<< HEAD
  const [error, setError] = useState("");
=======
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107

  const navigate = useNavigate();

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
<<<<<<< HEAD
    setError("");
=======
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !values.username ||
      !values.email ||
      !values.password ||
      !values.confirmPassword
    ) {
<<<<<<< HEAD
      setError("Veuillez remplir tous les champs.");
=======
      alert("Veuillez remplir tous les champs");
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107
      return;
    }

    if (values.password !== values.confirmPassword) {
<<<<<<< HEAD
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
=======
      alert("Les mots de passe ne correspondent pas");
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107
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
<<<<<<< HEAD
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
=======
      alert(err.response?.data?.message || "Erreur lors de l’inscription");
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-zinc-900">
      <div className="w-full max-w-md p-8 bg-zinc-800 rounded-lg shadow-2xl">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-20 w-auto" />
        </div>

        <h2 className="text-2xl text-white font-bold text-center mb-6">
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
<<<<<<< HEAD
              placeholder="Mot de passe"
=======
              placeholder="Password"
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107
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

<<<<<<< HEAD
          <p className="text-xs text-zinc-400">
            Le mot de passe doit contenir au moins 12 caracteres, avec une
            minuscule, une majuscule, un chiffre et un caractere special.
          </p>

          {error && <p className="text-sm text-red-400">{error}</p>}

=======
>>>>>>> 17ba9c36e8a3e1e7833d387f6ecb484bd6ff0107
          <button
            type="submit"
            className="cursor-pointer w-full bg-orange-600 hover:bg-orange-700 text-black font-semibold py-2 rounded transition-colors"
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
