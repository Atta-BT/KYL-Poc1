using System.Net.Mail;
using Kyl.Poc.Api.Models;

namespace Kyl.Poc.Api.Validation;

public static class RequestValidator
{
    public static IReadOnlyDictionary<string, string> Validate(RequestPayload payload)
    {
        var errors = new Dictionary<string, string>();

        if (string.IsNullOrWhiteSpace(payload.Title))
        {
            errors["title"] = "กรุณากรอกหัวข้อ Request";
        }

        if (!RequestTypes.IsValid(payload.RequestType))
        {
            errors["requestType"] = "กรุณาเลือกประเภท Request";
        }

        if (string.IsNullOrWhiteSpace(payload.RequesterName))
        {
            errors["requesterName"] = "กรุณากรอกชื่อผู้ส่งคำขอ";
        }

        if (string.IsNullOrWhiteSpace(payload.RequesterEmail))
        {
            errors["requesterEmail"] = "กรุณากรอกอีเมล";
        }
        else if (!IsValidEmail(payload.RequesterEmail))
        {
            errors["requesterEmail"] = "รูปแบบอีเมลไม่ถูกต้อง";
        }

        if (string.IsNullOrWhiteSpace(payload.Detail))
        {
            errors["detail"] = "กรุณากรอกรายละเอียด Request";
        }

        return errors;
    }

    public static RequestPayload Normalize(RequestPayload payload) =>
        payload with
        {
            Title = payload.Title?.Trim(),
            RequestType = payload.RequestType?.Trim(),
            RequesterName = payload.RequesterName?.Trim(),
            RequesterEmail = payload.RequesterEmail?.Trim(),
            Detail = payload.Detail?.Trim()
        };

    private static bool IsValidEmail(string value)
    {
        try
        {
            _ = new MailAddress(value);
            return true;
        }
        catch
        {
            return false;
        }
    }
}

