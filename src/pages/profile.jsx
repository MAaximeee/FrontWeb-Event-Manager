import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ username: '', email: '' });
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const getToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  const fetchUser = useCallback(async () => {
    const token = getToken();
    
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.get('/api/auth/home');

      if (res.data?.user) {
        setUserData({ 
          username: res.data.user.username || '', 
          email: res.data.user.email || '' 
        });
      } else if (res.data?.success === false) {
        throw new Error(res.data.message || 'Erreur lors de la récupération du profil');
      }
    } catch (err) {
      console.error('Erreur fetch user:', err.response?.data || err.message);
      
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.response?.data?.message || 'Impossible de récupérer votre profil');
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, navigate]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setPasswordErrors('');
    setError('');
  };

  const validatePasswords = () => {
    if (form.password && form.password.length < 6) {
      setPasswordErrors('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (form.password && form.password !== form.confirmPassword) {
      setPasswordErrors('Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validatePasswords()) {
      return;
    }

    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    const payload = {};
    
    // N'envoyer que les champs modifiés
    if (form.username.trim()) {
      payload.username = form.username.trim();
    }
    if (form.email.trim()) {
      payload.email = form.email.trim();
    }
    if (form.password) {
      payload.password = form.password;
    }

    // Si aucun champ n'est modifié
    if (Object.keys(payload).length === 0) {
      setError('Veuillez modifier au moins un champ');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put('/api/auth/profile', payload);

      if (res.data?.success) {
        setSuccess('Profil mis à jour avec succès');
        
        if (res.data?.user) {
          setUserData({ 
            username: res.data.user.username || '', 
            email: res.data.user.email || '' 
          });
        }
        
        setForm({ username: '', email: '', password: '', confirmPassword: '' });
        setIsEditing(false);
        setShowPasswordSection(false);
      } else {
        throw new Error(res.data?.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      console.error('Erreur update:', err.response?.data || err.message);
      
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 409) {
        setError('Cet email est déjà utilisé par un autre compte');
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm({ username: '', email: '', password: '', confirmPassword: '' });
    setIsEditing(false);
    setError('');
    setPasswordErrors('');
    setShowPasswordSection(false);
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Chargement du profil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 py-12 px-4 sm:px-6 lg:px-8 pt-22 pb-20 flex items-center">
      <div className="w-full max-w-2xl mx-auto">

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <div className="bg-zinc-800 rounded-xl shadow-2xl overflow-hidden px-6 sm:px-10 py-10">
          {/* Titre principal profil*/}
          <h1 className="text-3xl font-bold text-[#F04406] text-center mb-8">
            Information de compte
          </h1>

          {/* Affichage des infos */}
          {!isEditing && (
            <div>
              <div className="space-y-6">
                  <div>
                    <p className="text-zinc-400 text-sm font-medium mb-2">Nom d'utilisateur</p>
                    <p className="text-white text-lg font-semibold">{userData.username || 'Non défini'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm font-medium mb-2">Adresse Email</p>
                    <p className="text-white text-lg font-semibold">{userData.email || 'Non défini'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-6 w-full bg-[#F04406] hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-full transition-colors duration-200"
                >
                  Modifier mon profil
                </button>
              </div>
            )}

          {/* Formulaire d'édition */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 max-w-md mx-auto">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-white font-medium mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={form.username}
                    onChange={handleInputChange}
                    placeholder={userData.username || 'Entrez un nom d\'utilisateur'}
                    className="w-full px-4 py-3 bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 rounded-lg focus:outline-none focus:border-[#F04406] focus:ring-2 focus:ring-[#F04406]/20 transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-white font-medium mb-2">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder={userData.email || 'Entrez un email'}
                    className="w-full px-4 py-3 bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 rounded-lg focus:outline-none focus:border-[#F04406] focus:ring-2 focus:ring-[#F04406]/20 transition"
                  />
                </div>

                <div className="border-t border-zinc-700 my-4"></div>

                {/* Section mot de passe */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className="w-full flex items-center justify-between text-white font-semibold mb-4 py-2 px-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    <span>Changer le mot de passe</span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${showPasswordSection ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showPasswordSection && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label htmlFor="password" className="block text-white font-medium mb-2">
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={form.password}
                          onChange={handleInputChange}
                          placeholder="Minimum 6 caractères"
                          className="w-full px-4 py-3 bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 rounded-lg focus:outline-none focus:border-[#F04406] focus:ring-2 focus:ring-[#F04406]/20 transition"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-white font-medium mb-2">
                          Confirmer le mot de passe
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Répétez le mot de passe"
                          className="w-full px-4 py-3 bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 rounded-lg focus:outline-none focus:border-[#F04406] focus:ring-2 focus:ring-[#F04406]/20 transition"
                        />
                      </div>

                      {passwordErrors && (
                        <p className="text-red-400 text-sm mt-2">{passwordErrors}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6 max-w-md mx-auto">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#F04406] hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-full transition-colors duration-200"
                >
                  {submitting ? 'Mise à jour...' : 'Nous rejoindre'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Lien retour */}
        <div className="text-center mt-8">
          <Link to="/" className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
