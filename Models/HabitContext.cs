using Microsoft.EntityFrameworkCore;

namespace HabitTracker.Models
{
    public class HabitContext : DbContext
    {
        public HabitContext(DbContextOptions<HabitContext> options) : base(options) { }

        public DbSet<Habit> Habits { get; set; }
    }
}