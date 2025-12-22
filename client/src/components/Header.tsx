import logo from "../assets/logo.png";

type HeaderProps = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAuthenticated: boolean;
  email: string | null;
  onLogout: () => Promise<void>;
};

export function Header({ isDarkMode, toggleDarkMode, isAuthenticated, email, onLogout }: HeaderProps) {
  return (
    <header className="app-header">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <img
          src={logo}
          alt="Habitoria logo"
          style={{ width: 80, height: 80, objectFit: "contain" }}
        />
        <div>
          <h1 className="app-title">Habitoria</h1>
          <p className="app-subtitle">
            Create habits, track your streaks, stay consistent.
            {isAuthenticated && email ? ` Signed in as ${email}.` : ""}
          </p>
        </div>
      </div>

      <div className="app-header-actions">
        {isAuthenticated && (
          <button type="button" className="btn-ghost" onClick={() => void onLogout()}>
            Logout
          </button>
        )}
        <button
          type="button"
          className="icon-button"
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}