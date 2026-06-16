import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "./types";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import TermsModal from "./components/TermsModal";
import { ToastProvider } from "./components/Toast";

export default function App() {
  // Authentication coordinates
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Navigation coordinates: "home" | "login" | "register" | "dashboard" | "admin"
  const [currentView, setCurrentView] = useState<string>("home");

  // Terms and conditions modal toggle
  const [showTerms, setShowTerms] = useState<boolean>(false);

  // Sync session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("pf_user");
    const savedToken = localStorage.getItem("pf_token");

    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        setUser(parsed);
        setToken(savedToken);
        
        // Auto navigate based on previous state
        if (parsed.role === "admin") {
          setCurrentView("admin");
        } else {
          setCurrentView("dashboard");
        }
      } catch (e) {
        // Stale storage data, clean up
        localStorage.removeItem("pf_user");
        localStorage.removeItem("pf_token");
      }
    }
  }, []);

  // Handle successful login callbacks
  const handleLoginSuccess = (loggedInUser: User, sessionToken: string) => {
    setUser(loggedInUser);
    setToken(sessionToken);
    localStorage.setItem("pf_user", JSON.stringify(loggedInUser));
    localStorage.setItem("pf_token", sessionToken);

    // Redirect appropriately
    if (loggedInUser.role === "admin") {
      setCurrentView("admin");
    } else {
      setCurrentView("dashboard");
    }
  };

  // Handle registration success (redirect directly to login for simplicity and safety)
  const handleRegisterSuccess = (registeredUser: User) => {
    // Navigate straight to Login to authenticate session
    setCurrentView("login");
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("pf_user");
    localStorage.removeItem("pf_token");
    setCurrentView("home");
  };

  // Safe navigation director
  const handleNavigate = (view: string) => {
    // Force auth bounds checks
    if ((view === "dashboard" || view === "admin") && !user) {
      setCurrentView("login");
      return;
    }
    
    if (view === "admin" && user?.role !== "admin") {
      setCurrentView("dashboard");
      return;
    }

    if (view === "dashboard" && user?.role === "admin") {
      setCurrentView("admin");
      return;
    }

    setCurrentView(view);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-600 selection:text-white" id="app-root">
        {/* Dynamic shell navigation */}
        <Header
          user={user}
          onLogout={handleLogout}
          currentView={currentView}
          onNavigate={handleNavigate}
        />

        {/* Main Content Area with elegant fade-slip entering animations */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full h-full"
            >
              {currentView === "home" && (
                <LandingPage
                  onLoginClick={() => handleNavigate("login")}
                  onRegisterClick={() => handleNavigate("register")}
                  onNavigateToDashboard={() => handleNavigate("dashboard")}
                  isLoggedIn={!!user}
                  onShowTerms={() => setShowTerms(true)}
                />
              )}

              {currentView === "login" && (
                <LoginForm
                  onLoginSuccess={handleLoginSuccess}
                  onNavigateToRegister={() => handleNavigate("register")}
                  onBackToLanding={() => handleNavigate("home")}
                />
              )}

              {currentView === "register" && (
                <RegisterForm
                  onRegisterSuccess={handleRegisterSuccess}
                  onNavigateToLogin={() => handleNavigate("login")}
                  onBackToLanding={() => handleNavigate("home")}
                  onShowTerms={() => setShowTerms(true)}
                />
              )}

              {currentView === "dashboard" && user && token && (
                <UserDashboard user={user} token={token} />
              )}

              {currentView === "admin" && user && token && (
                <AdminDashboard token={token} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Terms and Conditions Overlay Modal */}
        <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      </div>
    </ToastProvider>
  );
}
