import { HabitCard } from "./HabitCard";
import { type Habit } from "../types/habit";

type HabitGridProps = {
	habits: Habit[];
	checkedToday: Set<Habit["id"]>;
	handleCheckHabit: (habit: Habit) => void;
	openEditModal: (habit: Habit) => void;
	handleDeleteHabit: (id: Habit["id"]) => void;
};

export function HabitGrid({ habits, checkedToday, handleCheckHabit, openEditModal, handleDeleteHabit }: HabitGridProps) {
	return (
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
	);
}
