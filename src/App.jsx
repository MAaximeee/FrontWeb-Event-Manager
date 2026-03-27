import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/footer.jsx";
import Navbar from "./components/navbar.jsx";
import RouteProteger from "./components/RouteProteger.jsx";
import NoPage from "./pages/404.jsx";
import Calendrier from "./pages/Calendrier.jsx";
import Contact from "./pages/Contact.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile.jsx";
import Register from "./pages/Register";
import RequestDashboard from "./pages/RequestDashboard.jsx";

function App() {
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
              <Route path="/contact" element={<Contact />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route element={<RouteProteger roles={["ROLE_ADMIN"]} />}>
              <Route path="/RequestDashboard" element={<RequestDashboard />} />
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
