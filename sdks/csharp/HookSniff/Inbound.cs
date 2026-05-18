using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace HookSniff
{
    public class Inbound
    {
        private readonly HookSniffHttpClient _client;

        public Inbound(HookSniffHttpClient client)
        {
            _client = client;
        }

        public async Task<List<InboundConfigOut>> ListConfigsAsync(CancellationToken cancellationToken = default)
        {
            return await _client.GetAsync<List<InboundConfigOut>>("/api/v1/inbound/configs", cancellationToken);
        }

        public async Task<InboundConfigOut> CreateConfigAsync(InboundConfigIn body, CancellationToken cancellationToken = default)
        {
            return await _client.PostAsync<InboundConfigOut>("/api/v1/inbound/configs", body, cancellationToken);
        }

        public async Task<InboundConfigOut> UpdateConfigAsync(string id, InboundConfigIn body, CancellationToken cancellationToken = default)
        {
            return await _client.PutAsync<InboundConfigOut>($"/api/v1/inbound/configs/{id}", body, cancellationToken);
        }

        public async Task DeleteConfigAsync(string id, CancellationToken cancellationToken = default)
        {
            await _client.DeleteAsync($"/api/v1/inbound/configs/{id}", cancellationToken);
        }
    }

    public class InboundConfigOut
    {
        public string Id { get; set; }
        public string CustomerId { get; set; }
        public string Provider { get; set; }
        public string Secret { get; set; }
        public string EndpointId { get; set; }
        public bool Enabled { get; set; }
        public string CreatedAt { get; set; }
    }

    public class InboundConfigIn
    {
        public string Provider { get; set; }
        public string Secret { get; set; }
        public string EndpointId { get; set; }
        public bool? Enabled { get; set; }
    }
}
