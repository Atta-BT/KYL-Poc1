using Kyl.Poc.Api.Models;
using Npgsql;

namespace Kyl.Poc.Api.Repositories;

public sealed class PostgresRequestRepository(NpgsqlDataSource dataSource)
    : IRequestRepository
{
    public async Task<(IReadOnlyList<ServiceRequest> Data, int Total)> ListAsync(
        int page,
        int pageSize,
        string? search,
        string? type,
        CancellationToken cancellationToken
    )
    {
        var whereSql = BuildWhereSql(search, type);
        var offset = (page - 1) * pageSize;

        await using var countCommand = dataSource.CreateCommand(
            $"SELECT COUNT(*) FROM service_requests WHERE {whereSql}"
        );
        AddFilterParameters(countCommand, search, type);
        var total = Convert.ToInt32(
            await countCommand.ExecuteScalarAsync(cancellationToken)
        );

        await using var listCommand = dataSource.CreateCommand(
            $"""
            SELECT *
            FROM service_requests
            WHERE {whereSql}
            ORDER BY created_at DESC, request_no DESC
            LIMIT @limit OFFSET @offset
            """
        );
        AddFilterParameters(listCommand, search, type);
        listCommand.Parameters.AddWithValue("limit", pageSize);
        listCommand.Parameters.AddWithValue("offset", offset);

        var rows = new List<ServiceRequest>();
        await using var reader = await listCommand.ExecuteReaderAsync(cancellationToken);
        while (await reader.ReadAsync(cancellationToken))
        {
            rows.Add(Map(reader));
        }

        return (rows, total);
    }

    public async Task<ServiceRequest?> FindByIdAsync(
        Guid id,
        CancellationToken cancellationToken
    )
    {
        await using var command = dataSource.CreateCommand(
            """
            SELECT *
            FROM service_requests
            WHERE id = @id AND deleted_at IS NULL
            """
        );
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? Map(reader) : null;
    }

    public async Task<ServiceRequest> CreateAsync(
        RequestPayload payload,
        CancellationToken cancellationToken
    )
    {
        await using var command = dataSource.CreateCommand(
            """
            INSERT INTO service_requests
              (title, request_type, requester_name, requester_email, detail)
            VALUES
              (@title, @requestType, @requesterName, @requesterEmail, @detail)
            RETURNING *
            """
        );
        AddPayloadParameters(command, payload);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        await reader.ReadAsync(cancellationToken);
        return Map(reader);
    }

    public async Task<ServiceRequest?> UpdateAsync(
        Guid id,
        RequestPayload payload,
        CancellationToken cancellationToken
    )
    {
        await using var command = dataSource.CreateCommand(
            """
            UPDATE service_requests
            SET
              title = @title,
              request_type = @requestType,
              requester_name = @requesterName,
              requester_email = @requesterEmail,
              detail = @detail
            WHERE id = @id AND deleted_at IS NULL
            RETURNING *
            """
        );
        command.Parameters.AddWithValue("id", id);
        AddPayloadParameters(command, payload);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? Map(reader) : null;
    }

    public async Task<ServiceRequest?> SoftDeleteAsync(
        Guid id,
        CancellationToken cancellationToken
    )
    {
        await using var command = dataSource.CreateCommand(
            """
            UPDATE service_requests
            SET deleted_at = now()
            WHERE id = @id AND deleted_at IS NULL
            RETURNING *
            """
        );
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? Map(reader) : null;
    }

    private static string BuildWhereSql(string? search, string? type)
    {
        var clauses = new List<string> { "deleted_at IS NULL" };

        if (!string.IsNullOrWhiteSpace(search))
        {
            clauses.Add(
                """
                (
                  request_no ILIKE @search
                  OR title ILIKE @search
                  OR requester_name ILIKE @search
                  OR requester_email ILIKE @search
                )
                """
            );
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            clauses.Add("request_type = @type");
        }

        return string.Join(" AND ", clauses);
    }

    private static void AddFilterParameters(
        NpgsqlCommand command,
        string? search,
        string? type
    )
    {
        if (!string.IsNullOrWhiteSpace(search))
        {
            command.Parameters.AddWithValue("search", $"%{search.Trim()}%");
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            command.Parameters.AddWithValue("type", type.Trim());
        }
    }

    private static void AddPayloadParameters(
        NpgsqlCommand command,
        RequestPayload payload
    )
    {
        command.Parameters.AddWithValue("title", payload.Title!);
        command.Parameters.AddWithValue("requestType", payload.RequestType!);
        command.Parameters.AddWithValue("requesterName", payload.RequesterName!);
        command.Parameters.AddWithValue("requesterEmail", payload.RequesterEmail!);
        command.Parameters.AddWithValue("detail", payload.Detail!);
    }

    private static ServiceRequest Map(NpgsqlDataReader reader) =>
        new(
            reader.GetGuid(reader.GetOrdinal("id")),
            reader.GetString(reader.GetOrdinal("request_no")),
            reader.GetString(reader.GetOrdinal("title")),
            reader.GetString(reader.GetOrdinal("request_type")),
            reader.GetString(reader.GetOrdinal("requester_name")),
            reader.GetString(reader.GetOrdinal("requester_email")),
            reader.GetString(reader.GetOrdinal("detail")),
            GetDateTimeOffset(reader, "created_at"),
            GetDateTimeOffset(reader, "updated_at"),
            reader.IsDBNull(reader.GetOrdinal("deleted_at"))
                ? null
                : GetDateTimeOffset(reader, "deleted_at")
        );

    private static DateTimeOffset GetDateTimeOffset(
        NpgsqlDataReader reader,
        string name
    )
    {
        var value = reader.GetFieldValue<DateTime>(reader.GetOrdinal(name));
        var utcValue = value.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(value, DateTimeKind.Utc)
            : value.ToUniversalTime();

        return new DateTimeOffset(utcValue);
    }
}

