import { useMemo } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/footer.jsx";
import Navbar from "./components/navbar.jsx";
import RouteProteger from "./components/RouteProteger.jsx";
import NoPage from "./pages/404.jsx";
import Calendrier from "./pages/Calendrier.jsx";
import EventDetailPage from "./pages/EventDetailPage.jsx";
import Contact from "./pages/Contact.jsx";
import Dashboard from "./pages/DashboardAdmin.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import GestionEvenements from "./pages/GestionEvenement.jsx";
import Profile from "./pages/profile.jsx";
import Register from "./pages/Register";
import RequestDashboard from "./pages/RequestDashboard.jsx";
import UsersDashboard from "./pages/UsersDashboard.jsx";
import ScoreBoardDetails from "./components/ScoreBoardDetails.jsx";

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
