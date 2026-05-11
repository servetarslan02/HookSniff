namespace HookSniff;

/// <summary>
/// HookSniff API Exception
/// </summary>
public class ApiException : Exception
{
    public int StatusCode { get; }
    public object? Body { get; }
    public Dictionary<string, string> Headers { get; }

    public ApiException(int statusCode, object? body, Dictionary<string, string>? headers = null)
        : base($"HookSniff API Error {statusCode}: {body}")
    {
        StatusCode = statusCode;
        Body = body;
        Headers = headers ?? new Dictionary<string, string>();
    }
}
