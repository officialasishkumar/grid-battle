import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="min-h-screen bg-game-bg bg-grid-pattern">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
