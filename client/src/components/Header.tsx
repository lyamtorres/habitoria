type HeaderProps = {
	isDarkMode: boolean;
	toggleDarkMode: () => void;
};

export function Header({ isDarkMode, toggleDarkMode }: HeaderProps) {
	return (
		<header className="app-header">
			<div>
				<h1 className="app-title">Habitoria</h1>
				<p className="app-subtitle">
					Create habits, track your streaks, stay consistent.
				</p>
			</div>
			<div className="app-header-actions">
				<button
					type="button"
					className="icon-button"
					onClick={toggleDarkMode}
					aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
				>
					{isDarkMode ? "☀️" : "🌙"}
				</button>
			</div>
		</header>
	);
}
