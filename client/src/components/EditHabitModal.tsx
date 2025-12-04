import React from "react";
import { FREQUENCY_OPTIONS, type Frequency } from "../types/habit";

type EditHabitModalProps = {
	editHabit: { name: string } | null;
	editName: string;
	setEditName: (name: string) => void;
	editFrequency: Frequency;
	setEditFrequency: (freq: Frequency) => void;
	handleSaveFrequency: () => void;
	closeEditModal: () => void;
};

export function EditHabitModal({
	editHabit,
	editName,
	setEditName,
	editFrequency,
	setEditFrequency,
	handleSaveFrequency,
	closeEditModal,
}: EditHabitModalProps) {
	if (!editHabit) return null;
	return (
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
	);
}
