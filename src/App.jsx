import { useMemo } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import RouteProteger from "./components/RouteProteger";
import ScoreBoardDetails from "./components/ScoreBoardDetails";
import Calendrier from "./pages/Calendrier";
import Contact from "./pages/Contact";
import Dashboard from "./pages/DashboardAdmin";
import EventDetailPage from "./pages/EventDetailPage";
import GestionEvenements from "./pages/GestionEvenement";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NoPage from "./pages/404";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import RequestDashboard from "./pages/RequestDashboard";
import UsersDashboard from "./pages/UsersDashboard";

function App() {
  const adminRoles = useMemo(() => ["ROLE_ADMIN"], []);
  const organizerOrAdminRoles = useMemo(
    () => ["ROLE_ORGANISATEUR", "ROLE_ADMIN"],
    [],
  );

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-900 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<RouteProteger />}>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/calendrier" element={<Calendrier />} />
              <Route
                path="/calendrier/evenement/:eventId"
                element={<EventDetailPage />}
              />
              <Route path="/contact" element={<Contact />} />
            </Route>

            <Route element={<RouteProteger roles={adminRoles} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/RequestDashboard" element={<RequestDashboard />} />
              <Route path="/dashboard/users" element={<UsersDashboard />} />
              <Route path="ScoreboardDetails" element={<ScoreBoardDetails />} />
            </Route>

            <Route element={<RouteProteger roles={organizerOrAdminRoles} />}>
              <Route
                path="/organisateur/evenements"
                element={<GestionEvenements />}
              />
            </Route>

            <Route path="*" element={<NoPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
