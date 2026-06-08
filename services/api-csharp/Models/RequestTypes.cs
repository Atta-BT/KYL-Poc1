namespace Kyl.Poc.Api.Models;

public static class RequestTypes
{
    public static readonly string[] Values =
    [
        "บริการ Find Fulltext 4U",
        "บริการตรวจการคัดลอกผลงาน (iThenticate)",
        "บริการนำส่งหนังสือ (Book Delivery)"
    ];

    public static bool IsValid(string? value) =>
        !string.IsNullOrWhiteSpace(value) && Values.Contains(value);
}

