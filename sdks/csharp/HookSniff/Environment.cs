using System.Collections.Generic;
using System.Threading.Tasks;

namespace HookSniff
{
    public class Environment
    {
        private readonly HookSniffClient _client;

        public Environment(HookSniffClient client)
        {
            _client = client;
        }

        public Task<List<Dictionary<string, object>>> List()
        {
            return _client.HookSniffHttpClient.GetAsync<List<Dictionary<string, object>>>("/api/v1/environments");
        }

        public Task<Dictionary<string, object>> Create(Dictionary<string, object> environmentIn)
        {
            return _client.HookSniffHttpClient.PostAsync<Dictionary<string, object>>("/api/v1/environments", environmentIn);
        }

        public Task<Dictionary<string, object>> Get(string environmentId)
        {
            return _client.HookSniffHttpClient.GetAsync<Dictionary<string, object>>($"/api/v1/environments/{environmentId}");
        }

        public Task<Dictionary<string, object>> Update(string environmentId, Dictionary<string, object> environmentPatch)
        {
            return _client.HookSniffHttpClient.PutAsync<Dictionary<string, object>>($"/api/v1/environments/{environmentId}", environmentPatch);
        }

        public Task Delete(string environmentId)
        {
            return _client.HookSniffHttpClient.DeleteAsync($"/api/v1/environments/{environmentId}");
        }

        public Task<List<Dictionary<string, object>>> ListVariables(string environmentId)
        {
            return _client.HookSniffHttpClient.GetAsync<List<Dictionary<string, object>>>($"/api/v1/environments/{environmentId}/variables");
        }

        public Task<Dictionary<string, object>> GetVariable(string environmentId, string variableId)
        {
            return _client.HookSniffHttpClient.GetAsync<Dictionary<string, object>>($"/api/v1/environments/{environmentId}/variables/{variableId}");
        }

        public Task<Dictionary<string, object>> CreateVariable(string environmentId, Dictionary<string, object> variableIn)
        {
            return _client.HookSniffHttpClient.PostAsync<Dictionary<string, object>>($"/api/v1/environments/{environmentId}/variables", variableIn);
        }

        public Task<Dictionary<string, object>> UpdateVariable(string environmentId, string variableId, Dictionary<string, object> variableIn)
        {
            return _client.HookSniffHttpClient.PutAsync<Dictionary<string, object>>($"/api/v1/environments/{environmentId}/variables/{variableId}", variableIn);
        }

        public Task DeleteVariable(string environmentId, string variableId)
        {
            return _client.HookSniffHttpClient.DeleteAsync($"/api/v1/environments/{environmentId}/variables/{variableId}");
        }

        public Task<List<Dictionary<string, object>>> BulkUpsertVariables(string environmentId, Dictionary<string, object> bulkIn)
        {
            return _client.HookSniffHttpClient.PostAsync<List<Dictionary<string, object>>>($"/api/v1/environments/{environmentId}/variables/bulk", bulkIn);
        }
    }
}
