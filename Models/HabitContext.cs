using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HabitTracker.Models
{
    /// <summary>
    /// Represents the Entity Framework database context for the Habit application,
    /// including identity management and the Habits table.
    /// </summary>
    public class HabitContext : IdentityDbContext<ApplicationUser>
    {
        public HabitContext(DbContextOptions<HabitContext> options) : base(options) { }

        public DbSet<Habit> Habits { get; set; }
    }
}