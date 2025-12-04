import { FREQUENCY_OPTIONS, type Frequency } from "../types/habit";

type NewHabitFormProps = {
	newHabit: { name: string; category: string; frequency: Frequency };
	setNewHabit: (updater: (prev: { name: string; category: string; frequency: Frequency }) => { name: string; category: string; frequency: Frequency }) => void;
	handleCreateHabit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function NewHabitForm({ newHabit, setNewHabit, handleCreateHabit }: NewHabitFormProps) {
	return (
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
	);
}
