using System.Collections.Generic;
using System.Threading.Tasks;
namespace HookSniff {
    public class OperationalWebhook {
        private readonly HookSniffClient _client;
        public OperationalWebhook(HookSniffClient client) { _client = client; }
        public Task<List<Dictionary<string, object>>> List() => _client.HookSniffHttpClient.GetAsync<List<Dictionary<string, object>>>("/api/v1/operational-webhooks");
        public Task<Dictionary<string, object>> Create(Dictionary<string, object> body) => _client.HookSniffHttpClient.PostAsync<Dictionary<string, object>>("/api/v1/operational-webhooks", body);
        public Task<Dictionary<string, object>> Get(string id) => _client.HookSniffHttpClient.GetAsync<Dictionary<string, object>>($"/api/v1/operational-webhooks/{id}");
        public Task<Dictionary<string, object>> Update(string id, Dictionary<string, object> body) => _client.HookSniffHttpClient.PutAsync<Dictionary<string, object>>($"/api/v1/operational-webhooks/{id}", body);
        public Task Delete(string id) => _client.HookSniffHttpClient.DeleteAsync($"/api/v1/operational-webhooks/{id}");
        public Task<List<Dictionary<string, object>>> ListDeliveries(string id) => _client.HookSniffHttpClient.GetAsync<List<Dictionary<string, object>>>($"/api/v1/operational-webhooks/{id}/deliveries");
    }
}
