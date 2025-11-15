
using Microsoft.EntityFrameworkCore;

// Create a builder for the web application
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.


// Register DbContext with SQLite
builder.Services.AddDbContext<HabitTracker.Models.HabitContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=habits.db"));


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



// Configure the HTTP request pipeline.
// Enable OpenAPI/Swagger UI only in development environment
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}



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
