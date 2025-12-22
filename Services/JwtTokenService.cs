using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HabitTracker.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HabitTracker.Services
{
    public sealed class JwtTokenService
    {
        private readonly IConfiguration _config;

        public JwtTokenService(IConfiguration config)
        {
            _config = config;
        }

        public string CreateToken(ApplicationUser user)
        {
            var jwtSection = _config.GetSection("Jwt");
            var issuer = jwtSection["Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer missing");
            var audience = jwtSection["Audience"] ?? throw new InvalidOperationException("Jwt:Audience missing");
            var key = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key missing");

            var expiresMinutes = int.TryParse(jwtSection["ExpiresMinutes"], out var m) ? m : 60;

            // Validate JWT key meets minimum security requirements
            var keyBytes = Encoding.UTF8.GetBytes(key);
            const int minimumKeyLengthBytes = 32; // 256 bits for HMAC-SHA256
            
            if (keyBytes.Length < minimumKeyLengthBytes)
            {
                throw new InvalidOperationException(
                    $"JWT signing key must be at least {minimumKeyLengthBytes} bytes ({minimumKeyLengthBytes * 8} bits) for HMAC-SHA256. " +
                    $"Current key length: {keyBytes.Length} bytes.");
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? user.Email ?? user.Id),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
            };

            var signingKey = new SymmetricSecurityKey(keyBytes);
            var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}