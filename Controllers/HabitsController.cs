using HabitTracker.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace HabitTracker.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HabitsController : ControllerBase
    {

        private readonly HabitContext _context;

        public HabitsController(HabitContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<IEnumerable<Habit>> GetAll()
        {
            return Ok(_context.Habits.ToList());
        }

        [HttpGet("{id}")]
        public ActionResult<Habit> GetById(int id)
        {
            var habit = _context.Habits.Find(id);
            if (habit == null) return NotFound();
            return Ok(habit);
        }

        [HttpPost]
        public ActionResult<Habit> Create(Habit habit)
        {
            _context.Habits.Add(habit);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetById), new { id = habit.Id }, habit);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Habit updatedHabit)
        {
            var habit = _context.Habits.Find(id);
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
            var habit = _context.Habits.Find(id);
            if (habit == null) return NotFound();
            _context.Habits.Remove(habit);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
