import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import NavBar from "./components/UI/NavBar";
import Footer from "./components/UI/Footer";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Check if browser was closed and more than 1 hour passed
  useEffect(() => {
    const token = localStorage.getItem("token");
    const sessionActive = sessionStorage.getItem("session_active");

    if (token && !sessionActive) {
      const lastActive = localStorage.getItem("lastActive");
      if (lastActive) {
        const elapsed = Date.now() - parseInt(lastActive, 10);
        if (elapsed > 3600000) {
          // 1 hour in milliseconds
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("lastActive");
          navigate("/login");
        } else {
          sessionStorage.setItem("session_active", "true");
        }
      } else {
        localStorage.setItem("lastActive", Date.now().toString());
        sessionStorage.setItem("session_active", "true");
      }
    }
  }, [navigate]);

  // Update last active timestamp on navigation
  useEffect(() => {
    if (localStorage.getItem("token")) {
      localStorage.setItem("lastActive", Date.now().toString());
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("lastActive");
    sessionStorage.removeItem("session_active");
    navigate("/login");
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-black"
      data-path={location.pathname}
    >
      <NavBar user={token} onLogout={handleLogout} />
      <main className="flex-1 w-full text-white bg-black">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
