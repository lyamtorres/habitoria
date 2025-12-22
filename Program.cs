using System.Text;
using HabitTracker.Models;
using HabitTracker.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

// Create a builder for the web application
var builder = WebApplication.CreateBuilder(args);

// Register DbContext with SQLite
// In Azure App Service, use a writable absolute path under /home
var connString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connString))
{
    connString = builder.Environment.IsDevelopment()
        ? "Data Source=habits.db"
        : "Data Source=/home/site/wwwroot/habits.db";
}

builder.Services.AddDbContext<HabitContext>(options =>
    options.UseSqlite(connString));

// Identity
builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        // Reasonable defaults; adjust as needed
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireUppercase = false;
        options.Password.RequireLowercase = false;
        options.Password.RequireNonAlphanumeric = false;
    })
    .AddEntityFrameworkStores<HabitContext>()
    .AddSignInManager();

builder.Services.AddScoped<JwtTokenService>();

// JWT auth
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"] ?? "";
var jwtIssuer = jwtSection["Issuer"];
var jwtAudience = jwtSection["Audience"];

// Validate JWT key meets minimum security requirements
var jwtKeyBytes = Encoding.UTF8.GetBytes(jwtKey);
const int minimumKeyLengthBytes = 32; // 256 bits for HMAC-SHA256

if (jwtKeyBytes.Length < minimumKeyLengthBytes)
{
    throw new InvalidOperationException(
        $"JWT signing key must be at least {minimumKeyLengthBytes} bytes ({minimumKeyLengthBytes * 8} bits) for HMAC-SHA256. " +
        $"Current key length: {jwtKeyBytes.Length} bytes. " +
        "Please configure a secure key in appsettings.json or environment variables.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(jwtKeyBytes),
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });

builder.Services.AddAuthorization();

// Register CORS to allow requests from the Vite dev server (http://localhost:5173)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Apply EF Core migrations at startup (creates DB/tables if missing)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HabitContext>();
    db.Database.Migrate();

    // Optional dev-only seed: create a demo user (no habits seeded to avoid leaking defaults)
    if (app.Environment.IsDevelopment())
    {
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var demoEmail = "demo@habitoria.local";
        var demo = await userManager.FindByEmailAsync(demoEmail);
        if (demo == null)
        {
            await userManager.CreateAsync(
                new ApplicationUser { UserName = demoEmail, Email = demoEmail },
                "Demo12345"
            );
        }
    }
}

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exception = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;
        var problem = new
        {
            title = "Unhandled error",
            status = 500,
            detail = exception?.Message
        };
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(problem);
    });
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/", () => Results.Ok(new
{
    name = "Habitoria API",
    version = "1.0.0",
    endpoints = new[]
    {
        "/api/auth/register",
        "/api/auth/login",
        "/api/auth/logout",
        "/api/habits",
    }
}));

app.UseCors();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();