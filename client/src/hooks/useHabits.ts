import { useState, useEffect } from "react";
import { type Habit, type Frequency } from "../types/habit";
import { listHabits, createHabit, updateHabit, deleteHabit } from "../api/habits";

// NOTE: This hook used to always load habits on mount.
// After introducing authentication, the habits endpoints are protected and require a valid token.
//
// We therefore accept `isAuthenticated` so the hook can:
// - Avoid making requests that will reliably fail with 401 when logged out.
// - Clear any previously-loaded habits when a user logs out (prevents showing stale data).
// - Re-fetch habits as soon as a user logs in (since the previous `[]` dependency only ran once).
export function useHabits(isAuthenticated: boolean) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newHabit, setNewHabit] = useState<{ name: string; category: string; frequency: Frequency }>(
    { name: "", category: "", frequency: "Daily" }
  );

  const [checkedToday, setCheckedToday] = useState<Set<Habit["id"]>>(new Set());
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [editFrequency, setEditFrequency] = useState<Frequency>("Daily");
  const [editName, setEditName] = useState<string>("");

  useEffect(() => {
    const fetchHabits = async () => {
      // When the user is not authenticated, we intentionally do NOT call the API.
      // This prevents noisy 401 errors and ensures the UI reflects "logged out"
      // instead of showing an error state.
      if (!isAuthenticated) {
        setHabits([]);
        setCheckedToday(new Set());
        setEditHabit(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await listHabits();
        setHabits(data || []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load habits.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    // `void` makes it explicit we are intentionally not awaiting inside the effect.
    // (It also keeps TypeScript/ESLint happy in stricter configs.)
    void fetchHabits();
  }, [isAuthenticated]);

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
      const created = await createHabit(habitToCreate);
      setHabits((prev) => [...prev, created]);
      setNewHabit({ name: "", category: "", frequency: "Daily" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create habit.";
      setError(msg);
    }
  };

  const handleCheckHabit = async (habit: Habit) => {
    if (checkedToday.has(habit.id)) return;
    setError(null);

    const updatedHabit = { ...habit, completedDays: habit.completedDays + 1 };

    try {
      await updateHabit(updatedHabit);
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

  const openEditModal = (habit: Habit) => {
    setEditHabit(habit);
    setEditFrequency(habit.frequency || "Daily");
    setEditName(habit.name || "");
  };

  const closeEditModal = () => {
    setEditHabit(null);
  };

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
      await updateHabit(updatedHabit);
      setHabits((prev) =>
        prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h))
      );
      closeEditModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update habit.";
      setError(msg);
    }
  };

  const handleDeleteHabit = async (id: Habit["id"]) => {
    setError(null);
    const ok = window.confirm("Delete this habit?");
    if (!ok) return;

    try {
      await deleteHabit(id);
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

  return {
    habits,
    loading,
    error,
    newHabit,
    setNewHabit,
    checkedToday,
    editHabit,
    editFrequency,
    editName,
    setEditFrequency,
    setEditName,
    handleCreateHabit,
    handleCheckHabit,
    openEditModal,
    closeEditModal,
    handleSaveFrequency,
    handleDeleteHabit,
    setCheckedToday,
    setHabits,
    setError,
  };
}