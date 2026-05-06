using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HookRelay
{
    // ==================== Models ====================

    public class HookRelayConfig
    {
        public string ApiKey { get; set; } = "";
        public string BaseUrl { get; set; } = "https://api.hookrelay.io/v1";
        public int Timeout { get; set; } = 30;
    }

    public class RetryPolicy
    {
        [JsonPropertyName("max_attempts")]
        public int? MaxAttempts { get; set; }
        [JsonPropertyName("backoff")]
        public string? Backoff { get; set; }
        [JsonPropertyName("initial_delay_secs")]
        public int? InitialDelaySecs { get; set; }
        [JsonPropertyName("max_delay_secs")]
        public int? MaxDelaySecs { get; set; }
    }

    public class Endpoint
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = "";
        [JsonPropertyName("url")]
        public string Url { get; set; } = "";
        [JsonPropertyName("description")]
        public string? Description { get; set; }
        [JsonPropertyName("is_active")]
        public bool IsActive { get; set; }
        [JsonPropertyName("retry_policy")]
        public RetryPolicy? RetryPolicy { get; set; }
        [JsonPropertyName("created_at")]
        public string CreatedAt { get; set; } = "";
    }

    public class Delivery
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = "";
        [JsonPropertyName("endpoint_id")]
        public string EndpointId { get; set; } = "";
        [JsonPropertyName("event")]
        public string? Event { get; set; }
        [JsonPropertyName("status")]
        public string Status { get; set; } = "";
        [JsonPropertyName("attempt_count")]
        public int AttemptCount { get; set; }
        [JsonPropertyName("response_status")]
        public int? ResponseStatus { get; set; }
        [JsonPropertyName("replay_count")]
        public int ReplayCount { get; set; }
        [JsonPropertyName("created_at")]
        public string CreatedAt { get; set; } = "";
    }

    public class DeliveryList
    {
        [JsonPropertyName("deliveries")]
        public List<Delivery> Deliveries { get; set; } = new();
        [JsonPropertyName("total")]
        public int Total { get; set; }
        [JsonPropertyName("page")]
        public int Page { get; set; }
        [JsonPropertyName("per_page")]
        public int PerPage { get; set; }
    }

    public class EndpointList
    {
        [JsonPropertyName("endpoints")]
        public List<Endpoint> Endpoints { get; set; } = new();
        [JsonPropertyName("total")]
        public int Total { get; set; }
        [JsonPropertyName("page")]
        public int Page { get; set; }
        [JsonPropertyName("per_page")]
        public int PerPage { get; set; }
    }

    public class DeliveryAttempt
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = "";
        [JsonPropertyName("attempt_number")]
        public int AttemptNumber { get; set; }
        [JsonPropertyName("status_code")]
        public int? StatusCode { get; set; }
        [JsonPropertyName("response_body")]
        public string? ResponseBody { get; set; }
        [JsonPropertyName("duration_ms")]
        public long? DurationMs { get; set; }
        [JsonPropertyName("error_message")]
        public string? ErrorMessage { get; set; }
        [JsonPropertyName("created_at")]
        public string CreatedAt { get; set; } = "";
    }

    public class BatchResult
    {
        [JsonPropertyName("deliveries")]
        public List<Delivery> Deliveries { get; set; } = new();
        [JsonPropertyName("errors")]
        public List<JsonElement> Errors { get; set; } = new();
    }

    public class Stats
    {
        [JsonPropertyName("total_deliveries")]
        public int TotalDeliveries { get; set; }
        [JsonPropertyName("delivered")]
        public int Delivered { get; set; }
        [JsonPropertyName("failed")]
        public int Failed { get; set; }
        [JsonPropertyName("pending")]
        public int Pending { get; set; }
        [JsonPropertyName("success_rate")]
        public double SuccessRate { get; set; }
        [JsonPropertyName("endpoints_count")]
        public int EndpointsCount { get; set; }
    }

    // ==================== Exceptions ====================

    public class HookRelayException : Exception
    {
        public int StatusCode { get; }
        public string ErrorCode { get; }

        public HookRelayException(string message, int statusCode = 0, string errorCode = "UNKNOWN")
            : base(message)
        {
            StatusCode = statusCode;
            ErrorCode = errorCode;
        }
    }

    public class AuthenticationException : HookRelayException
    {
        public AuthenticationException(string message = "Unauthorized: invalid or missing API key")
            : base(message, 401, "UNAUTHORIZED") { }
    }

    public class NotFoundException : HookRelayException
    {
        public NotFoundException(string message = "Resource not found")
            : base(message, 404, "NOT_FOUND") { }
    }

    public class RateLimitException : HookRelayException
    {
        public RateLimitException(string message = "Rate limit exceeded")
            : base(message, 429, "RATE_LIMIT_EXCEEDED") { }
    }

    public class ValidationException : HookRelayException
    {
        public ValidationException(string message = "Bad request")
            : base(message, 400, "BAD_REQUEST") { }
    }

    public class PayloadTooLargeException : HookRelayException
    {
        public PayloadTooLargeException(string message = "Payload too large")
            : base(message, 413, "PAYLOAD_TOO_LARGE") { }
    }

    // ==================== Client ====================

    /// <summary>
    /// Official C# client for the HookRelay webhook delivery service.
    /// </summary>
    public class HookRelayClient : IDisposable
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _baseUrl;
        private readonly JsonSerializerOptions _jsonOptions;

        public EndpointsResource Endpoints { get; }
        public WebhooksResource Webhooks { get; }

        public HookRelayClient(string apiKey)
            : this(new HookRelayConfig { ApiKey = apiKey }) { }

        public HookRelayClient(HookRelayConfig config)
        {
            _apiKey = config.ApiKey ?? throw new ArgumentNullException(nameof(config.ApiKey));
            _baseUrl = (config.BaseUrl ?? "https://api.hookrelay.io/v1").TrimEnd('/');

            _httpClient = new HttpClient
            {
                Timeout = TimeSpan.FromSeconds(config.Timeout > 0 ? config.Timeout : 30)
            };

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };

            Endpoints = new EndpointsResource(this);
            Webhooks = new WebhooksResource(this);
        }

        /// <summary>
        /// Get platform statistics.
        /// </summary>
        public async Task<Stats> GetStatsAsync()
        {
            return await RequestAsync<Stats>("GET", "/stats");
        }

        /// <summary>
        /// Dispose the HTTP client.
        /// </summary>
        public void Dispose()
        {
            _httpClient.Dispose();
        }

        // ==================== Internal HTTP ====================

        internal async Task<T> RequestAsync<T>(string method, string path, object? body = null)
        {
            var response = await SendRequestAsync(method, path, body);
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(content, _jsonOptions)
                   ?? throw new HookRelayException("Failed to deserialize response");
        }

        internal async Task<string> RequestRawAsync(string method, string path, object? body = null)
        {
            var response = await SendRequestAsync(method, path, body);
            return await response.Content.ReadAsStringAsync();
        }

        private async Task<HttpResponseMessage> SendRequestAsync(string method, string path, object? body)
        {
            var url = $"{_baseUrl}{path}";
            var request = new HttpRequestMessage(new HttpMethod(method), url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            request.Headers.Add("User-Agent", "hookrelay-csharp/0.2.0");

            if (body != null && (method == "POST" || method == "PUT" || method == "PATCH"))
            {
                var json = JsonSerializer.Serialize(body, _jsonOptions);
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");
            }

            var response = await _httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                return response;
            }

            var errBody = await response.Content.ReadAsStringAsync();
            var message = $"HTTP {(int)response.StatusCode}";
            try
            {
                var errDoc = JsonDocument.Parse(errBody);
                if (errDoc.RootElement.TryGetProperty("error", out var errObj) &&
                    errObj.TryGetProperty("message", out var msgProp))
                {
                    message = msgProp.GetString() ?? message;
                }
            }
            catch { }

            throw ((int)response.StatusCode) switch
            {
                400 => new ValidationException(message),
                401 => new AuthenticationException(message),
                404 => new NotFoundException(message),
                413 => new PayloadTooLargeException(message),
                429 => new RateLimitException(message),
                _ => new HookRelayException(message, (int)response.StatusCode)
            };
        }
    }

    // ==================== Endpoints Resource ====================

    public class EndpointsResource
    {
        private readonly HookRelayClient _client;

        internal EndpointsResource(HookRelayClient client)
        {
            _client = client;
        }

        /// <summary>
        /// Create a new endpoint.
        /// </summary>
        public async Task<Endpoint> CreateAsync(string url, string? description = null, RetryPolicy? retryPolicy = null)
        {
            var body = new Dictionary<string, object?> { ["url"] = url };
            if (description != null) body["description"] = description;
            if (retryPolicy != null)
            {
                var rp = new Dictionary<string, object?>();
                if (retryPolicy.MaxAttempts.HasValue) rp["max_attempts"] = retryPolicy.MaxAttempts;
                if (retryPolicy.Backoff != null) rp["backoff"] = retryPolicy.Backoff;
                if (retryPolicy.InitialDelaySecs.HasValue) rp["initial_delay_secs"] = retryPolicy.InitialDelaySecs;
                if (retryPolicy.MaxDelaySecs.HasValue) rp["max_delay_secs"] = retryPolicy.MaxDelaySecs;
                body["retry_policy"] = rp;
            }

            return await _client.RequestAsync<Endpoint>("POST", "/endpoints", body);
        }

        /// <summary>
        /// Get an endpoint by ID.
        /// </summary>
        public async Task<Endpoint> GetAsync(string endpointId)
        {
            return await _client.RequestAsync<Endpoint>("GET", $"/endpoints/{endpointId}");
        }

        /// <summary>
        /// List all endpoints with pagination.
        /// </summary>
        public async Task<EndpointList> ListAsync(int page = 1, int perPage = 20)
        {
            return await _client.RequestAsync<EndpointList>("GET", $"/endpoints?page={page}&per_page={perPage}");
        }

        /// <summary>
        /// Delete an endpoint.
        /// </summary>
        public async Task<bool> DeleteAsync(string endpointId)
        {
            var result = await _client.RequestAsync<Dictionary<string, JsonElement>>("DELETE", $"/endpoints/{endpointId}");
            return !result.ContainsKey("deleted") || result["deleted"].GetBoolean();
        }

        /// <summary>
        /// Rotate the signing secret for an endpoint.
        /// </summary>
        public async Task<Dictionary<string, JsonElement>> RotateSecretAsync(string endpointId)
        {
            return await _client.RequestAsync<Dictionary<string, JsonElement>>("POST", $"/endpoints/{endpointId}/rotate-secret");
        }
    }

    // ==================== Webhooks Resource ====================

    public class WebhooksResource
    {
        private readonly HookRelayClient _client;

        internal WebhooksResource(HookRelayClient client)
        {
            _client = client;
        }

        /// <summary>
        /// Send a webhook.
        /// </summary>
        public async Task<Delivery> SendAsync(string endpointId, string? @event = null, Dictionary<string, object>? data = null)
        {
            var body = new Dictionary<string, object?>
            {
                ["endpoint_id"] = endpointId,
                ["data"] = data ?? new Dictionary<string, object>()
            };
            if (@event != null) body["event"] = @event;

            return await _client.RequestAsync<Delivery>("POST", "/webhooks", body);
        }

        /// <summary>
        /// Get a delivery by ID.
        /// </summary>
        public async Task<Delivery> GetAsync(string deliveryId)
        {
            return await _client.RequestAsync<Delivery>("GET", $"/webhooks/{deliveryId}");
        }

        /// <summary>
        /// List deliveries with optional filters.
        /// </summary>
        public async Task<DeliveryList> ListAsync(string? status = null, int page = 1, int perPage = 20)
        {
            var query = $"?page={page}&per_page={perPage}";
            if (status != null) query += $"&status={status}";
            return await _client.RequestAsync<DeliveryList>("GET", $"/webhooks{query}");
        }

        /// <summary>
        /// Replay a delivery.
        /// </summary>
        public async Task<Delivery> ReplayAsync(string deliveryId)
        {
            return await _client.RequestAsync<Delivery>("POST", $"/webhooks/{deliveryId}/replay");
        }

        /// <summary>
        /// Send multiple webhooks in a batch.
        /// </summary>
        public async Task<BatchResult> BatchAsync(List<Dictionary<string, object>> webhooks)
        {
            var body = new Dictionary<string, object> { ["webhooks"] = webhooks };
            return await _client.RequestAsync<BatchResult>("POST", "/webhooks/batch", body);
        }

        /// <summary>
        /// Get delivery attempts.
        /// </summary>
        public async Task<List<DeliveryAttempt>> AttemptsAsync(string deliveryId)
        {
            return await _client.RequestAsync<List<DeliveryAttempt>>("GET", $"/webhooks/{deliveryId}/attempts");
        }

        /// <summary>
        /// Export deliveries.
        /// </summary>
        public async Task<List<Delivery>> ExportAsync(string? format = null, string? status = null,
            string? dateFrom = null, string? dateTo = null)
        {
            var queryParams = new List<string>();
            if (format != null) queryParams.Add($"format={format}");
            if (status != null) queryParams.Add($"status={status}");
            if (dateFrom != null) queryParams.Add($"date_from={dateFrom}");
            if (dateTo != null) queryParams.Add($"date_to={dateTo}");

            var query = queryParams.Count > 0 ? "?" + string.Join("&", queryParams) : "";
            return await _client.RequestAsync<List<Delivery>>("GET", $"/webhooks/export{query}");
        }
    }
}
