namespace HabitTracker.Models
{
    public class Habit
    {
        public int Id { get; set; }

        // Owner
        public string UserId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string Frequency { get; set; } = string.Empty; // e.g., "Daily", "Weekly"
        public int CompletedDays { get; set; }
    }
}