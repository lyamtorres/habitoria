import type { Habit, Frequency } from "../types/habit";
import { apiFetch } from "./http";

export async function listHabits(): Promise<Habit[]> {
  const response = await apiFetch("/api/habits");
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function createHabit(habit: {
  name: string;
  category: string | null;
  frequency: Frequency;
  completedDays: number;
}): Promise<Habit> {
  const response = await apiFetch("/api/habits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(habit),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function updateHabit(habit: Habit): Promise<Habit> {
  const response = await apiFetch(`/api/habits/${habit.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(habit),
  });
  if (!response.ok) throw new Error(await response.text());

  // API returns 204 NoContent; keep current behavior
  const text = await response.text();
  return text ? (JSON.parse(text) as Habit) : habit;
}

export async function deleteHabit(id: Habit["id"]): Promise<void> {
  const response = await apiFetch(`/api/habits/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await response.text());
}