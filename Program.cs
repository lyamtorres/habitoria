
using Microsoft.EntityFrameworkCore;

// Create a builder for the web application
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.


// Register DbContext with SQLite
// In Azure App Service, use a writable absolute path under /home
var env = builder.Environment.EnvironmentName;
var connString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connString))
{
    // Default to local file for Development; use /home for non-development (App Service Linux)
    connString = builder.Environment.IsDevelopment()
        ? "Data Source=habits.db"
        : "Data Source=/home/site/wwwroot/habits.db";
}

builder.Services.AddDbContext<HabitTracker.Models.HabitContext>(options =>
    options.UseSqlite(connString));


// Register CORS to allow requests from the Vite dev server (http://localhost:5173)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Vite dev server origin
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register controllers so the app can discover and use API controllers (e.g., HabitsController)
builder.Services.AddControllers();

// Register OpenAPI/Swagger services for API documentation and testing UI
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();



// Build the web application
var app = builder.Build();

// Apply EF Core migrations at startup (creates DB/tables if missing)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HabitTracker.Models.HabitContext>();
    db.Database.Migrate();

    // Seed sample data if none exists
    if (!db.Habits.Any())
    {
        db.Habits.AddRange(
            new HabitTracker.Models.Habit {
                Name = "Drink water",
                Category = "Health",
                Frequency = "Daily",
                CompletedDays = 0
            },
            new HabitTracker.Models.Habit {
                Name = "Daily walk",
                Category = "Fitness",
                Frequency = "Daily",
                CompletedDays = 0
            }
        );
        db.SaveChanges();
    }
}

// Global exception handler to surface minimal error details in production
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



// Configure the HTTP request pipeline.
// Enable OpenAPI/Swagger UI only in development environment
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Add a root endpoint so "/" doesn’t 404
app.MapGet("/", () => Results.Ok(new
{
    name = "Habitoria API",
    version = "1.0.0",
    endpoints = new[]
    {
        "/api/habits",
    }
}));

// Enable CORS middleware before other middlewares that use it
// This allows cross-origin requests from the React app
app.UseCors();

// Redirect HTTP requests to HTTPS
app.UseHttpsRedirection();

// Enable authorization middleware (required for [Authorize] attributes, even if not used yet)
app.UseAuthorization();

// Map attribute-routed controllers (e.g., [Route("api/[controller]")]) so their endpoints are available
app.MapControllers();

app.Run();
