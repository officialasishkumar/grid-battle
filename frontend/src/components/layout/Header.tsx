import { useAuthStore } from "../../store/authStore";
import { useNavigate, useLocation } from "react-router-dom";

export function Header() {
  const { username, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const navItems = [
    { path: "/lobby", label: "Lobby" },
    { path: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <header className="border-b border-game-border/50 bg-game-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate("/lobby")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="7.5" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
              <rect x="14" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="1" y="7.5" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
              <rect x="7.5" y="7.5" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="14" y="7.5" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
              <rect x="1" y="14" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
              <rect x="7.5" y="14" width="5" height="5" rx="1" fill="white" fillOpacity="0.5" />
              <rect x="14" y="14" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            Grid Battle
          </span>
        </button>

        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === item.path
                  ? "bg-neon-blue/10 text-neon-blue"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-game-card/50 border border-game-border/30">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-sm text-slate-300">{username}</span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
