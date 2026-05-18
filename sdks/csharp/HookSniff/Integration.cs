using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace HookSniff
{
    public class IntegrationApi
    {
        private readonly HookSniffHttpClient _client;

        public IntegrationApi(HookSniffHttpClient client) { _client = client; }

        public async Task<List<IntegrationOut>> ListAsync(CancellationToken ct = default)
            => await _client.GetAsync<List<IntegrationOut>>("/api/v1/integrations", ct);

        public async Task<IntegrationOut> GetAsync(string id, CancellationToken ct = default)
            => await _client.GetAsync<IntegrationOut>($"/api/v1/integrations/{id}", ct);

        public async Task<IntegrationOut> CreateAsync(IntegrationIn body, CancellationToken ct = default)
            => await _client.PostAsync<IntegrationOut>("/api/v1/integrations", body, ct);

        public async Task<IntegrationOut> UpdateAsync(string id, IntegrationUpdate body, CancellationToken ct = default)
            => await _client.PutAsync<IntegrationOut>($"/api/v1/integrations/{id}", body, ct);

        public async Task DeleteAsync(string id, CancellationToken ct = default)
            => await _client.DeleteAsync($"/api/v1/integrations/{id}", ct);

        public async Task<IntegrationTestResponse> TestAsync(string id, CancellationToken ct = default)
            => await _client.PostAsync<IntegrationTestResponse>($"/api/v1/integrations/{id}/test", null, ct);

        public async Task<List<IntegrationEventOut>> ListEventsAsync(string id, CancellationToken ct = default)
            => await _client.GetAsync<List<IntegrationEventOut>>($"/api/v1/integrations/{id}/events", ct);

        public async Task<IntegrationStatsOut> GetStatsAsync(string id, CancellationToken ct = default)
            => await _client.GetAsync<IntegrationStatsOut>($"/api/v1/integrations/{id}/stats", ct);
    }

    public class IntegrationOut
    {
        public string Id { get; set; }
        public string CustomerId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ConnectorConfigId { get; set; }
        public string ConnectorName { get; set; }
        public string ConnectorDisplayName { get; set; }
        public string EndpointId { get; set; }
        public string EndpointUrl { get; set; }
        public bool Enabled { get; set; }
        public List<string> EventFilter { get; set; }
        public string TransformId { get; set; }
        public Dictionary<string, object> RetryPolicy { get; set; }
        public Dictionary<string, object> Metadata { get; set; }
        public string LastTriggeredAt { get; set; }
        public string LastSuccessAt { get; set; }
        public string LastFailureAt { get; set; }
        public int FailureCount { get; set; }
        public long TotalDeliveries { get; set; }
        public long TotalFailures { get; set; }
        public string HealthStatus { get; set; }
        public string CreatedAt { get; set; }
        public string UpdatedAt { get; set; }
    }

    public class IntegrationIn
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string ConnectorConfigId { get; set; }
        public string EndpointId { get; set; }
        public List<string> EventFilter { get; set; }
        public string TransformId { get; set; }
        public Dictionary<string, object> RetryPolicy { get; set; }
        public Dictionary<string, object> Metadata { get; set; }
        public bool? Enabled { get; set; }
    }

    public class IntegrationUpdate
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string EndpointId { get; set; }
        public List<string> EventFilter { get; set; }
        public string TransformId { get; set; }
        public Dictionary<string, object> RetryPolicy { get; set; }
        public Dictionary<string, object> Metadata { get; set; }
        public bool? Enabled { get; set; }
    }

    public class IntegrationTestResponse
    {
        public bool Success { get; set; }
        public string EventId { get; set; }
        public string Message { get; set; }
    }

    public class IntegrationEventOut
    {
        public string Id { get; set; }
        public string IntegrationId { get; set; }
        public string EventType { get; set; }
        public string SourceEventId { get; set; }
        public Dictionary<string, object> Payload { get; set; }
        public string Status { get; set; }
        public string DeliveryId { get; set; }
        public string ErrorMessage { get; set; }
        public int Attempts { get; set; }
        public int? DurationMs { get; set; }
        public string CreatedAt { get; set; }
        public string ProcessedAt { get; set; }
    }

    public class IntegrationStatsOut
    {
        public long TotalEvents { get; set; }
        public long Delivered { get; set; }
        public long Failed { get; set; }
        public long Pending { get; set; }
        public long Filtered { get; set; }
        public double? AvgDurationMs { get; set; }
        public double SuccessRate { get; set; }
        public long Last24hEvents { get; set; }
        public long Last24hFailures { get; set; }
    }
}
