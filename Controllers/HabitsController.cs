using HabitTracker.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HabitTracker.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HabitsController : ControllerBase
    {

        private readonly HabitContext _context;

        public HabitsController(HabitContext context)
        {
            _context = context;
        }

        private string CurrentUserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier) 
            ?? throw new InvalidOperationException("User ID claim is missing. This should not happen with [Authorize].");

        public record CreateHabitRequest(string Name, string? Category, string Frequency, int CompletedDays);


        [HttpGet]
        public ActionResult<IEnumerable<Habit>> GetAll()
        {
            var uid = CurrentUserId;
            return Ok(_context.Habits.Where(h => h.UserId == uid).ToList());
        }

        [HttpGet("{id}")]
        public ActionResult<Habit> GetById(int id)
        {
            var uid = CurrentUserId;
            var habit = _context.Habits.FirstOrDefault(h => h.Id == id && h.UserId == uid);
            if (habit == null) return NotFound();
            return Ok(habit);
        }

        [HttpPost]
        public ActionResult<Habit> Create(CreateHabitRequest req)
        {
            var uid = CurrentUserId;

            var habit = new Habit
            {
                UserId = uid,
                Name = req.Name,
                Category = req.Category,
                Frequency = req.Frequency,
                CompletedDays = req.CompletedDays
            };

            _context.Habits.Add(habit);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetById), new { id = habit.Id }, habit);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Habit updatedHabit)
        {
            var uid = CurrentUserId;

            var habit = _context.Habits.FirstOrDefault(h => h.Id == id && h.UserId == uid);
            if (habit == null) return NotFound();

            habit.Name = updatedHabit.Name;
            habit.Category = updatedHabit.Category;
            habit.Frequency = updatedHabit.Frequency;
            habit.CompletedDays = updatedHabit.CompletedDays;

            _context.SaveChanges();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var uid = CurrentUserId;

            var habit = _context.Habits.FirstOrDefault(h => h.Id == id && h.UserId == uid);
            if (habit == null) return NotFound();

            _context.Habits.Remove(habit);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
