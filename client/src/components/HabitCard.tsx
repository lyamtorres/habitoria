import { type Habit } from "../types/habit";

export type HabitCardProps = {
	habit: Habit;
	isChecked: boolean;
	onCheck: () => void;
	onEditClick: () => void;
	onDelete: () => void;
};

export function HabitCard({ habit, isChecked, onCheck, onEditClick, onDelete }: HabitCardProps) {
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
