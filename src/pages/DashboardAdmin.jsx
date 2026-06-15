import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-zinc-900 p-8 text-white flex items-center justify-center">
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Dashboard Admin</h1>

        <div className="flex-1 flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto w-full">
            <Link
              to="/RequestDashboard"
              className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg hover:border-orange-500 transition"
            >
              <h2 className="text-lg font-semibold text-orange-400">
                Gérer les demandes
              </h2>
              <p className="text-sm text-zinc-300 mt-2">
                Valider/refuser les demandes de rôle.
              </p>
            </Link>

            <Link
              to="/organisateur/evenements"
              className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg hover:border-orange-500 transition"
            >
              <h2 className="text-lg font-semibold text-orange-400">
                Gérer les événements
              </h2>
              <p className="text-sm text-zinc-300 mt-2">
                Modifier statuts, participants et équipes.
              </p>
            </Link>

            <Link
              to="/dashboard/users"
              className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg hover:border-orange-500 transition"
            >
              <h2 className="text-lg font-semibold text-orange-400">
                Gérer les utilisateurs
              </h2>
              <p className="text-sm text-zinc-300 mt-2">
                Gestion des utilisateurs et des organisateurs.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
