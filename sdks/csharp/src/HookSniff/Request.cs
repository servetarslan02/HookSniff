using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace HookSniff;

/// <summary>
/// HookSniff HTTP Request Helper
///
/// Zero-dependency HTTP client using HttpClient.
/// Handles auth, retries, error mapping, and idempotency keys.
/// </summary>
internal class Request
{
    private const string LibVersion = "0.4.0";
    private static readonly string UserAgent = $"hooksniff-sdk/{LibVersion}/csharp";

    private readonly string _method;
    private string _path;
    private readonly Dictionary<string, string> _queryParams = new();
    private readonly Dictionary<string, string> _headerParams = new();
    private string? _body;

    private static readonly HttpClient SharedHttpClient = new()
    {
        Timeout = TimeSpan.FromSeconds(30)
    };

    /// <summary>Override the shared HttpClient for testing. Call ResetHttpClient() when done.</summary>
    internal static void SetTestHttpClient(HttpClient client)
    {
        _testHttpClient = client;
    }

    /// <summary>Reset to the default shared HttpClient after testing.</summary>
    internal static void ResetHttpClient()
    {
        _testHttpClient = null;
    }

    private static HttpClient? _testHttpClient;

    private static HttpClient GetHttpClient() => _testHttpClient ?? SharedHttpClient;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true,
    };

    public Request(string method, string path)
    {
        _method = method;
        _path = path;
    }

    public void SetPathParam(string name, string value)
    {
        _path = _path.Replace($"{{{name}}}", Uri.EscapeDataString(value));
    }

    public void SetQueryParams(Dictionary<string, object?>? parameters)
    {
        if (parameters == null) return;
        foreach (var (key, value) in parameters)
        {
            if (value == null) continue;
            _queryParams[key] = value.ToString()!;
        }
    }

    public void SetHeaderParam(string name, string? value)
    {
        if (value != null)
        {
            _headerParams[name] = value;
        }
    }

    public void SetBody(object value)
    {
        _body = JsonSerializer.Serialize(value, JsonOptions);
    }

    public async Task<T?> SendAsync<T>(RequestContext ctx)
    {
        var (statusCode, responseBody, _) = await SendWithRetryAsync(ctx);
        if (statusCode == 204) return default;
        return JsonSerializer.Deserialize<T>(responseBody, JsonOptions);
    }

    public async Task SendVoidAsync(RequestContext ctx)
    {
        await SendWithRetryAsync(ctx);
    }

    private async Task<(int status, string body, Dictionary<string, string> headers)> SendWithRetryAsync(RequestContext ctx)
    {
        var url = ctx.BaseUrl + _path;
        if (_queryParams.Count > 0)
        {
            var qs = string.Join("&", _queryParams.Select(kv => $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}"));
            url += "?" + qs;
        }

        // Auto idempotency key for POST
        if (!_headerParams.ContainsKey("idempotency-key") && _method == "POST")
        {
            _headerParams["idempotency-key"] = $"auto_{Guid.NewGuid():N}";
        }

        var maxRetries = ctx.NumRetries;
        ApiException? lastException = null;

        for (var attempt = 0; attempt <= maxRetries; attempt++)
        {
            try
            {
                using var request = new HttpRequestMessage(new HttpMethod(_method), url);

                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", ctx.Token);
                request.Headers.TryAddWithoutValidation("accept", "application/json");
                request.Headers.TryAddWithoutValidation("user-agent", UserAgent);

                foreach (var (key, value) in _headerParams)
                {
                    request.Headers.TryAddWithoutValidation(key, value);
                }

                if (_body != null)
                {
                    request.Content = new StringContent(_body, Encoding.UTF8, "application/json");
                }

                using var cts = new CancellationTokenSource(ctx.Timeout);
                var response = await GetHttpClient().SendAsync(request, cts.Token);
                var responseBody = await response.Content.ReadAsStringAsync(cts.Token);
                var responseHeaders = response.Headers
                    .ToDictionary(h => h.Key, h => string.Join(", ", h.Value));

                var statusCode = (int)response.StatusCode;

                if (statusCode < 500)
                {
                    if (statusCode >= 400)
                    {
                        object? parsed;
                        try { parsed = JsonSerializer.Deserialize<JsonElement>(responseBody); }
                        catch { parsed = responseBody; }
                        throw new ApiException(statusCode, parsed, responseHeaders);
                    }
                    return (statusCode, responseBody, responseHeaders);
                }

                lastException = new ApiException(statusCode, responseBody, responseHeaders);
            }
            catch (ApiException ex) when (ex.StatusCode < 500)
            {
                throw;
            }
            catch (OperationCanceledException)
            {
                lastException = new ApiException(0, "Request timed out");
            }
            catch (Exception ex)
            {
                lastException = new ApiException(0, ex.Message);
            }

            // Exponential backoff
            if (attempt < maxRetries)
            {
                await Task.Delay(50 * (int)Math.Pow(2, attempt));
            }
        }

        throw lastException ?? new ApiException(0, "Request failed after retries");
    }
}

internal record RequestContext(string BaseUrl, string Token, TimeSpan Timeout, int NumRetries);
