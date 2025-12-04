export const FREQUENCY_OPTIONS = ["Daily", "Weekly", "Monthly"] as const;
export type Frequency = typeof FREQUENCY_OPTIONS[number];

export type Habit = {
  id: string | number;
  name: string;
  category: string | null;
  frequency: Frequency;
  completedDays: number;
};