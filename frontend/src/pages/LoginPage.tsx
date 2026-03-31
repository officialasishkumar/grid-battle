import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { loginEmail, loginGuest, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginEmail(email, password, mode === "register" ? username : undefined);
    if (useAuthStore.getState().isAuthenticated) {
      navigate("/lobby");
    }
  };

  const handleGuest = async () => {
    const guestName = `Player${Math.floor(Math.random() * 9999)}`;
    await loginGuest(guestName);
    if (useAuthStore.getState().isAuthenticated) {
      navigate("/lobby");
    }
  };

  return (
    <div className="min-h-screen bg-game-bg bg-grid-pattern flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          >
            <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
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
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            Grid Battle
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Real-time multiplayer strategy
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-6">
          {/* Tabs */}
          <div className="flex mb-6 bg-game-bg/50 rounded-lg p-1">
            <button
              onClick={() => { setMode("login"); clearError(); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-game-card text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); clearError(); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                mode === "register"
                  ? "bg-game-card text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a display name"
                  required
                  minLength={3}
                  className="w-full px-4 py-3 rounded-xl bg-game-bg/50 border border-game-border/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 transition-all text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-game-bg/50 border border-game-border/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-game-bg/50 border border-game-border/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connecting...
                </span>
              ) : (
                mode === "login" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-game-border/30" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-slate-500 bg-game-card">or</span>
            </div>
          </div>

          {/* Guest play */}
          <button
            onClick={handleGuest}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-game-card/50 text-slate-300 font-medium hover:bg-game-card transition-colors border border-game-border/30 disabled:opacity-50"
          >
            Play as Guest
          </button>
        </div>
      </motion.div>
    </div>
  );
}
