namespace Kyl.Poc.Api.Models;

public sealed record ServiceRequest(
    Guid Id,
    string RequestNo,
    string Title,
    string RequestType,
    string RequesterName,
    string RequesterEmail,
    string Detail,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    DateTimeOffset? DeletedAt
);

