using HabitTracker.Models;
using HabitTracker.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HabitTracker.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _users;
        private readonly JwtTokenService _tokens;

        public AuthController(UserManager<ApplicationUser> users, JwtTokenService tokens)
        {
            _users = users;
            _tokens = tokens;
        }

        public record RegisterRequest(string Email, string Password);
        public record LoginRequest(string Email, string Password);
        public record AuthResponse(string Token, string Email);

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email))
                return BadRequest("Email is required.");
            if (string.IsNullOrWhiteSpace(req.Password))
                return BadRequest("Password is required.");

            var email = req.Email.Trim().ToLowerInvariant();

            var existing = await _users.FindByEmailAsync(email);
            if (existing != null) return Conflict("Email already registered.");

            var user = new ApplicationUser
            {
                UserName = email,
                Email = email
            };

            var result = await _users.CreateAsync(user, req.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            var token = _tokens.CreateToken(user);
            return Ok(new AuthResponse(token, user.Email!));
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Email))
                return BadRequest("Email is required.");
            if (string.IsNullOrWhiteSpace(req.Password))
                return BadRequest("Password is required.");

            var email = req.Email.Trim().ToLowerInvariant();
            var user = await _users.FindByEmailAsync(email);
            if (user == null) return Unauthorized("Invalid credentials.");

            var ok = await _users.CheckPasswordAsync(user, req.Password);
            if (!ok) return Unauthorized("Invalid credentials.");

            var token = _tokens.CreateToken(user);
            return Ok(new AuthResponse(token, user.Email!));
        }

        // JWT logout is client-side (forget token); endpoint included for acceptance criteria.
        [HttpPost("logout")]
        public IActionResult Logout() => Ok();

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<object>> Me()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            var user = await _users.FindByIdAsync(userId);
            if (user == null) return Unauthorized();

            return Ok(new { user.Email, user.Id });
        }
    }
}