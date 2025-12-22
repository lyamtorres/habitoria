import "./App.css";
import { useHabits } from "./hooks/useHabits";
import { useDarkMode } from "./hooks/useDarkMode";
import { HabitGrid } from "./components/HabitGrid";
import { Header } from "./components/Header";
import { EditHabitModal } from "./components/EditHabitModal";
import { NewHabitForm } from "./components/NewHabitForm";
import { useAuth } from "./auth/AuthContext";
import { AuthPanel } from "./components/AuthPanel";

function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isAuthenticated, logout, email } = useAuth();

  const {
    habits, loading, error, newHabit, setNewHabit, checkedToday,
    editHabit, editFrequency, editName, setEditFrequency, setEditName,
    handleCreateHabit, handleCheckHabit, openEditModal, closeEditModal,
    handleSaveFrequency, handleDeleteHabit
  } = useHabits(isAuthenticated);

  return (
    <div className={`app ${isDarkMode ? "dark" : ""}`}>
      <div className="app-shell">
        <Header
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          isAuthenticated={isAuthenticated}
          email={email}
          onLogout={logout}
        />

        {!isAuthenticated ? (
          <AuthPanel />
        ) : (
          <>
            <section className="panel">
              <h2 className="panel-title">Add a new habit</h2>
              <NewHabitForm
                newHabit={newHabit}
                setNewHabit={setNewHabit}
                handleCreateHabit={handleCreateHabit}
              />
            </section>

            {error && <div className="alert error">{error}</div>}

            <main className="main-content">
              {loading ? (
                <div className="loading-state">Loading habits…</div>
              ) : habits.length === 0 ? (
                <div className="empty-state">
                  <p>No habits yet.</p>
                  <p>Start by adding your first habit above.</p>
                </div>
              ) : (
                <HabitGrid
                  habits={habits}
                  checkedToday={checkedToday}
                  handleCheckHabit={handleCheckHabit}
                  openEditModal={openEditModal}
                  handleDeleteHabit={handleDeleteHabit}
                />
              )}
            </main>

            <EditHabitModal
              editHabit={editHabit}
              editName={editName}
              setEditName={setEditName}
              editFrequency={editFrequency}
              setEditFrequency={setEditFrequency}
              handleSaveFrequency={handleSaveFrequency}
              closeEditModal={closeEditModal}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;