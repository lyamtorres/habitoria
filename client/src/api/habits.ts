import type { Habit, Frequency } from "../types/habit";

export async function listHabits(): Promise<Habit[]> {
  const response = await fetch("/api/habits");
  if (!response.ok) throw new Error("Failed to load habits.");
  return response.json();
}

export async function createHabit(habit: {
  name: string;
  category: string | null;
  frequency: Frequency;
  completedDays: number;
}): Promise<Habit> {
  const response = await fetch("/api/habits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(habit),
  });
  if (!response.ok) throw new Error("Failed to create habit.");
  return response.json();
}

export async function updateHabit(habit: Habit): Promise<Habit> {
  const response = await fetch(`/api/habits/${habit.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(habit),
  });
  if (!response.ok) throw new Error("Failed to update habit.");
  const text = await response.text();
  return text ? JSON.parse(text) : habit;
}

export async function deleteHabit(id: Habit["id"]): Promise<void> {
  const response = await fetch(`/api/habits/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete habit.");
}