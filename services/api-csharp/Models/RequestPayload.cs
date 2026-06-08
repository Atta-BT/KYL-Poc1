namespace Kyl.Poc.Api.Models;

public sealed record RequestPayload(
    string? Title,
    string? RequestType,
    string? RequesterName,
    string? RequesterEmail,
    string? Detail
);

public sealed record PaginationMeta(
    int Page,
    int PageSize,
    int Total,
    int TotalPages
);

public sealed record PagedResponse<T>(
    IReadOnlyList<T> Data,
    PaginationMeta Pagination
);

