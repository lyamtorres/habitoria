import React, { useEffect, useState } from "react";
import "./App.css";
const FREQUENCY_OPTIONS = ["Daily", "Weekly", "Monthly"] as const;
type Frequency = typeof FREQUENCY_OPTIONS[number];
type Habit = {
  id: string | number;
  name: string;
  category: string | null;
  frequency: Frequency;
  completedDays: number;
};
type HabitCardProps = {
  habit: Habit;
  isChecked: boolean;
  onCheck: () => void;
  onEditClick: () => void;
  onDelete: () => void;
};

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newHabit, setNewHabit] = useState<{ name: string; category: string; frequency: Frequency}>(
    {
      name: "",
      category: "",
      frequency: "Daily",
    }
  );

  const [checkedToday, setCheckedToday] = useState<Set<Habit["id"]>>(new Set());

  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [editFrequency, setEditFrequency] = useState<Frequency>("Daily");
  const [editName, setEditName] = useState<string>("");

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize dark mode from OS preference
  useEffect(() => {
    if (window.matchMedia) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Fetch habits on mount
  useEffect(() => {
    const fetchHabits = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/habits");
        if (!response.ok) {
          throw new Error("Failed to load habits.");
        }
        const data = (await response.json()) as Habit[];
        setHabits(data || []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load habits.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  // Create habit
  const handleCreateHabit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!newHabit.name.trim()) {
      setError("Habit name is required.");
      return;
    }

    const habitToCreate = {
      name: newHabit.name.trim(),
      category: newHabit.category.trim() || null,
      frequency: newHabit.frequency,
      completedDays: 0,
    };

    try {
      const response = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habitToCreate),
      });

      if (!response.ok) {
        throw new Error("Failed to create habit.");
      }

      const created = (await response.json()) as Habit;
      setHabits((prev) => [...prev, created]);
      setNewHabit({
        name: "",
        category: "",
        frequency: "Daily",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create habit.";
      setError(msg);
    }
  };

  // Check habit: +1 completedDays & disable checkbox for this session
  const handleCheckHabit = async (habit: Habit) => {
    if (checkedToday.has(habit.id)) return; // already checked

    setError(null);

    const updatedHabit = {
      ...habit,
      completedDays: habit.completedDays + 1,
    };

    try {
      const response = await fetch(`/api/habits/${habit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedHabit),
      });

      if (!response.ok) {
        throw new Error("Failed to update habit.");
      }

      setHabits((prev) =>
        prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
      );

      setCheckedToday((prev) => {
        const next = new Set(prev);
        next.add(habit.id);
        return next;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update habit.";
      setError(msg);
    }
  };

  // Open edit modal for frequency
  const openEditModal = (habit: Habit) => {
    setEditHabit(habit);
    setEditFrequency(habit.frequency || "Daily");
    setEditName(habit.name || "");
  };

  const closeEditModal = () => {
    setEditHabit(null);
  };

  // Save frequency change
  const handleSaveFrequency = async () => {
    if (!editHabit) return;

    setError(null);

    const updatedHabit = {
      ...editHabit,
      name: editName.trim(),
      frequency: editFrequency,
    };

    if (!updatedHabit.name) {
      setError("Habit name is required.");
      return;
    }

    try {
      const response = await fetch(`/api/habits/${editHabit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedHabit),
      });

      if (!response.ok) {
        throw new Error("Failed to update habit.");
      }

      setHabits((prev) =>
        prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
      );
      closeEditModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update habit.";
      setError(msg);
    }
  };

  // Delete habit
  const handleDeleteHabit = async (id: Habit["id"]) => {
    setError(null);

    const ok = window.confirm("Delete this habit?");
    if (!ok) return;

    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete habit.");
      }

      setHabits((prev) => prev.filter((h) => h.id !== id));
      setCheckedToday((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete habit.";
      setError(msg);
    }
  };

  return (
    <div className={`app ${isDarkMode ? "dark" : ""}`}>
      <div className="app-shell">
        <header className="app-header">
          <div>
            <h1 className="app-title">Habit Tracker</h1>
            <p className="app-subtitle">
              Create habits, track your streaks, stay consistent.
            </p>
          </div>

          <div className="app-header-actions">
            <button
              type="button"
              className="icon-button"
              onClick={() => setIsDarkMode((m) => !m)}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        <section className="panel">
          <h2 className="panel-title">Add a new habit</h2>
          <form className="new-habit-form" onSubmit={handleCreateHabit}>
            <div className="field">
              <label className="field-label">Name</label>
              <input
                type="text"
                className="field-input"
                placeholder="Drink water, read 10 pages..."
                value={newHabit.name}
                onChange={(e) =>
                  setNewHabit((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="field">
              <label className="field-label">Category (optional)</label>
              <input
                type="text"
                className="field-input"
                placeholder="Health, Learning, Work..."
                value={newHabit.category}
                onChange={(e) =>
                  setNewHabit((prev) => ({ ...prev, category: e.target.value }))
                }
              />
            </div>

            <div className="field">
              <label className="field-label">Frequency</label>
              <select
                className="field-input"
                value={newHabit.frequency}
                onChange={(e) =>
                  setNewHabit((prev) => ({ ...prev, frequency: e.target.value as Frequency }))
                }
              >
                {FREQUENCY_OPTIONS.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>

            <div className="field submit-field">
              <button type="submit" className="btn-primary">
                + Add Habit
              </button>
            </div>
          </form>
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
            <div className="habits-grid">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isChecked={checkedToday.has(habit.id)}
                  onCheck={() => handleCheckHabit(habit)}
                  onEditClick={() => openEditModal(habit)}
                  onDelete={() => handleDeleteHabit(habit.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {editHabit && (
        <div className="modal-backdrop" onClick={closeEditModal}>
          <div
            className="modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
                <h2 className="modal-title">Modify habit</h2>
            <p className="modal-subtitle">{editHabit.name}</p>

                <div className="field">
                  <label className="field-label">Name</label>
                  <input
                    type="text"
                    className="field-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter habit name"
                  />
                </div>

            <div className="field">
              <label className="field-label">Frequency</label>
              <select
                className="field-input"
                value={editFrequency}
                onChange={(e) => setEditFrequency(e.target.value as Frequency)}
              >
                {FREQUENCY_OPTIONS.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-ghost" type="button" onClick={closeEditModal}>
                Cancel
              </button>
              <button
                className="btn-primary"
                type="button"
                onClick={handleSaveFrequency}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HabitCard({ habit, isChecked, onCheck, onEditClick, onDelete }: HabitCardProps) {
  return (
    <article className="habit-card">
      <div className="habit-main">
        <label className="habit-checkbox-wrapper">
          <input
            type="checkbox"
            checked={isChecked}
            disabled={isChecked}
            onChange={onCheck}
          />
          <span className="custom-checkbox" />
        </label>

        <div className="habit-text">
          <div className="habit-title-row">
            <h2 className="habit-name">{habit.name}</h2>
            {habit.category && (
              <span className="habit-category">{habit.category}</span>
            )}
          </div>

          <div className="habit-meta">
            <span className="habit-frequency">{habit.frequency}</span>
            <span className="habit-streak">
              <span className="streak-dot" />
              <span className="habit-streak-value">{habit.completedDays}</span>
              <span className="habit-streak-label">
                {habit.completedDays === 1 ? "day" : "days"}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="habit-actions">
        <button type="button" className="btn-ghost" onClick={onEditClick}>
          Modify
        </button>
        <button
          type="button"
          className="btn-icon-danger"
          onClick={onDelete}
          aria-label="Delete habit"
        >
          🗑
        </button>
      </div>
    </article>
  );
}

export default App;
