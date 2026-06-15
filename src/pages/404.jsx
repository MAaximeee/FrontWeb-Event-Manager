import React from 'react';
import { Link } from 'react-router-dom';

const NoPage = () => {
  return (
    <div className="min-h-screen bg-zinc-800 flex items-center justify-center px-4 ">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-orange-500">404</h1>
        <h2 className="text-4xl font-bold text-white mt-4">Page introuvable</h2>
        <p className="text-gray-400 mt-4 text-lg">
          Désolé, la page que vous recherchez n'existe pas.
        </p>
        <Link 
          to="/" 
          className="mt-8 inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NoPage;