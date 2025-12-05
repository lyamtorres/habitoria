import { useState, useEffect } from "react";
import { type Habit, type Frequency } from "../types/habit";
import { listHabits, createHabit, updateHabit, deleteHabit } from "../api/habits";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newHabit, setNewHabit] = useState<{ name: string; category: string; frequency: Frequency}>(
    { name: "", category: "", frequency: "Daily" }
  );

  const [checkedToday, setCheckedToday] = useState<Set<Habit["id"]>>(new Set());
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [editFrequency, setEditFrequency] = useState<Frequency>("Daily");
  const [editName, setEditName] = useState<string>("");

  useEffect(() => {
    const fetchHabits = async () => {
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
    fetchHabits();
  }, []);

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