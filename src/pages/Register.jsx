import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.svg';

const Register = () => {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const navigate = useNavigate();

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!values.username || !values.email || !values.password || !values.confirmPassword) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    if (values.password !== values.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/register`,
        {
          username: values.username,
          email: values.email,
          password: values.password,
        }
      )

      if (response.status === 201) {
        navigate("/login")
      }
    } catch (err) {
      console.error("Erreur inscription :", err);
      alert(err.response?.data?.message || "Erreur lors de l’inscription");
    }
  };


  return (
    <div className="min-h-screen flex justify-center items-center bg-zinc-900">
      <div className="w-full max-w-md p-8 bg-zinc-800 rounded-lg shadow-2xl"> 
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-20 w-auto" />
        </div>

        <h2 className="text-2xl text-white font-bold text-center mb-6">Inscription</h2>

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
              placeholder="Password"
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
              className="w-full px-3 py-2 rounded bg-white text-black focus:outline-none focus:border-orange-500"/>
          </div>

          <button
            type="submit"
            className="cursor-pointer w-full bg-orange-600 hover:bg-orange-700 text-black font-semibold py-2 rounded transition-colors">
            Nous rejoindre
          </button>
        </form>

        <div className="text-center mt-6 text-white">
          <span>Vous avez déjà un compte ? </span>
          <Link to="/login" className="text-orange-500 hover:underline">Connexion</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
