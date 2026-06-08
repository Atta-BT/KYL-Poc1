using Kyl.Poc.Api.Models;

namespace Kyl.Poc.Api.Repositories;

public interface IRequestRepository
{
    Task<(IReadOnlyList<ServiceRequest> Data, int Total)> ListAsync(
        int page,
        int pageSize,
        string? search,
        string? type,
        CancellationToken cancellationToken
    );

    Task<ServiceRequest?> FindByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<ServiceRequest> CreateAsync(
        RequestPayload payload,
        CancellationToken cancellationToken
    );

    Task<ServiceRequest?> UpdateAsync(
        Guid id,
        RequestPayload payload,
        CancellationToken cancellationToken
    );

    Task<ServiceRequest?> SoftDeleteAsync(Guid id, CancellationToken cancellationToken);
}

