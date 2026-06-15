import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

function UsersDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/admin/users");
        setUsers(res.data?.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Impossible de charger les utilisateurs.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const usersOnly = useMemo(
    () =>
      users.filter(
        (user) =>
          user.roles?.includes("ROLE_USER") &&
          !user.roles?.includes("ROLE_ORGANISATEUR") &&
          !user.roles?.includes("ROLE_ADMIN"),
      ),
    [users],
  );

  const organizers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.roles?.includes("ROLE_ORGANISATEUR") &&
          !user.roles?.includes("ROLE_ADMIN"),
      ),
    [users],
  );

  const renderUserCard = (user) => (
    <div
      key={user.id}
      className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-3"
    >
      <p className="text-white font-medium truncate">{user.username || "-"}</p>
      <p className="text-zinc-400 text-sm truncate">{user.email}</p>
    </div>
  );

  if (loading) {
    return <p className="text-white text-center mt-24">Chargement...</p>;
  }

  return (
    <div className="min-h-screen bg-zinc-900 px-4 sm:px-6 pt-24 pb-12 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-orange-500 mb-2">
            Gestion des utilisateurs
          </h1>
          <p className="text-zinc-400">
            Gestion des utilisateurs et des organisateurs.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-700/60 bg-red-900/20 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Utilisateurs</h2>
              <span className="text-sm text-zinc-400">{usersOnly.length}</span>
            </div>
            {usersOnly.length === 0 ? (
              <p className="text-zinc-400 text-sm">Aucun utilisateur.</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
                {usersOnly.map(renderUserCard)}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">
                Organisateurs
              </h2>
              <span className="text-sm text-zinc-400">{organizers.length}</span>
            </div>
            {organizers.length === 0 ? (
              <p className="text-zinc-400 text-sm">Aucun organisateur.</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
                {organizers.map(renderUserCard)}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default UsersDashboard;
