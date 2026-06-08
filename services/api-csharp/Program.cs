using Kyl.Poc.Api.Models;
using Kyl.Poc.Api.Repositories;
using Kyl.Poc.Api.Validation;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);
const string CorsPolicy = "web";

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        CorsPolicy,
        policy =>
        {
            var origin = builder.Configuration["Cors:Origin"] ?? "http://localhost:5173";
            policy.WithOrigins(origin).AllowAnyHeader().AllowAnyMethod();
        }
    );
});

var connectionString = builder.Configuration.GetConnectionString("Postgres")
    ?? throw new InvalidOperationException("Missing PostgreSQL connection string.");

builder.Services.AddSingleton(NpgsqlDataSource.Create(connectionString));
builder.Services.AddScoped<IRequestRepository, PostgresRequestRepository>();

var app = builder.Build();

app.UseCors(CorsPolicy);

app.MapGet(
    "/api/health",
    async (NpgsqlDataSource dataSource, CancellationToken cancellationToken) =>
    {
        await using var command = dataSource.CreateCommand("SELECT 1");
        await command.ExecuteScalarAsync(cancellationToken);
        return Results.Ok(new { status = "ok", database = "connected" });
    }
);

app.MapGet("/api/request-types", () => Results.Ok(RequestTypes.Values));

app.MapGet(
    "/api/requests",
    async (
        int? page,
        int? pageSize,
        string? search,
        string? type,
        IRequestRepository repository,
        CancellationToken cancellationToken
    ) =>
    {
        var currentPage = Math.Max(1, page ?? 1);
        var currentPageSize = Math.Clamp(pageSize ?? 10, 1, 50);

        if (!string.IsNullOrWhiteSpace(type) && !RequestTypes.IsValid(type))
        {
            return Results.BadRequest(new { message = "ประเภท Request ไม่ถูกต้อง" });
        }

        var (data, total) = await repository.ListAsync(
            currentPage,
            currentPageSize,
            search,
            type,
            cancellationToken
        );
        var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)currentPageSize));

        return Results.Ok(
            new PagedResponse<ServiceRequest>(
                data,
                new PaginationMeta(currentPage, currentPageSize, total, totalPages)
            )
        );
    }
);

app.MapGet(
    "/api/requests/{id:guid}",
    async (
        Guid id,
        IRequestRepository repository,
        CancellationToken cancellationToken
    ) =>
    {
        var request = await repository.FindByIdAsync(id, cancellationToken);
        return request is null ? Results.NotFound(new { message = "ไม่พบ Request" }) : Results.Ok(request);
    }
);

app.MapPost(
    "/api/requests",
    async (
        RequestPayload payload,
        IRequestRepository repository,
        CancellationToken cancellationToken
    ) =>
    {
        var normalized = RequestValidator.Normalize(payload);
        var errors = RequestValidator.Validate(normalized);

        if (errors.Count > 0)
        {
            return Results.BadRequest(new { message = "ข้อมูลไม่ถูกต้อง", errors });
        }

        var created = await repository.CreateAsync(normalized, cancellationToken);
        return Results.Created($"/api/requests/{created.Id}", created);
    }
);

app.MapPut(
    "/api/requests/{id:guid}",
    async (
        Guid id,
        RequestPayload payload,
        IRequestRepository repository,
        CancellationToken cancellationToken
    ) =>
    {
        var normalized = RequestValidator.Normalize(payload);
        var errors = RequestValidator.Validate(normalized);

        if (errors.Count > 0)
        {
            return Results.BadRequest(new { message = "ข้อมูลไม่ถูกต้อง", errors });
        }

        var updated = await repository.UpdateAsync(id, normalized, cancellationToken);
        return updated is null
            ? Results.NotFound(new { message = "ไม่พบ Request ที่ต้องการแก้ไข" })
            : Results.Ok(updated);
    }
);

app.MapDelete(
    "/api/requests/{id:guid}",
    async (
        Guid id,
        IRequestRepository repository,
        CancellationToken cancellationToken
    ) =>
    {
        var deleted = await repository.SoftDeleteAsync(id, cancellationToken);
        return deleted is null
            ? Results.NotFound(new { message = "ไม่พบ Request ที่ต้องการลบ" })
            : Results.Ok(deleted);
    }
);

app.Run();

