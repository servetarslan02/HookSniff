using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace HookSniff
{
    public class ConnectorApi
    {
        private readonly HookSniffHttpClient _client;

        public ConnectorApi(HookSniffHttpClient client) { _client = client; }

        public async Task<List<ConnectorOut>> ListAsync(CancellationToken ct = default)
            => await _client.GetAsync<List<ConnectorOut>>("/api/v1/connectors", ct);

        public async Task<ConnectorOut> GetAsync(string id, CancellationToken ct = default)
            => await _client.GetAsync<ConnectorOut>($"/api/v1/connectors/{id}", ct);

        public async Task<List<ConnectorConfigOut>> ListConfigsAsync(CancellationToken ct = default)
            => await _client.GetAsync<List<ConnectorConfigOut>>("/api/v1/connectors/configs", ct);

        public async Task<ConnectorConfigOut> CreateConfigAsync(ConnectorConfigIn body, CancellationToken ct = default)
            => await _client.PostAsync<ConnectorConfigOut>("/api/v1/connectors/configs", body, ct);

        public async Task<ConnectorConfigOut> UpdateConfigAsync(string id, ConnectorConfigIn body, CancellationToken ct = default)
            => await _client.PutAsync<ConnectorConfigOut>($"/api/v1/connectors/configs/{id}", body, ct);

        public async Task DeleteConfigAsync(string id, CancellationToken ct = default)
            => await _client.DeleteAsync($"/api/v1/connectors/configs/{id}", ct);
    }

    public class ConnectorOut
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public List<string> SupportedEvents { get; set; }
        public bool IsActive { get; set; }
        public string CreatedAt { get; set; }
    }

    public class ConnectorConfigOut
    {
        public string Id { get; set; }
        public string ConnectorId { get; set; }
        public string ConnectorName { get; set; }
        public string ConnectorDisplayName { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public string CreatedAt { get; set; }
    }

    public class ConnectorConfigIn
    {
        public string ConnectorId { get; set; }
        public string Name { get; set; }
        public object Config { get; set; }
        public object Credentials { get; set; }
        public bool? IsActive { get; set; }
    }
}
