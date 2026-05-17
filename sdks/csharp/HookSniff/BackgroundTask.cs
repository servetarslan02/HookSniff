using System.Collections.Generic;
using System.Threading.Tasks;

namespace HookSniff
{
    public class BackgroundTask
    {
        private readonly HookSniffClient _client;

        public BackgroundTask(HookSniffClient client)
        {
            _client = client;
        }

        public Task<List<Dictionary<string, object>>> List()
        {
            return _client.HookSniffHttpClient.GetAsync<List<Dictionary<string, object>>>("/api/v1/background-tasks");
        }

        public Task<Dictionary<string, object>> Get(string taskId)
        {
            return _client.HookSniffHttpClient.GetAsync<Dictionary<string, object>>($"/api/v1/background-tasks/{taskId}");
        }

        public Task<Dictionary<string, object>> Cancel(string taskId)
        {
            return _client.HookSniffHttpClient.PutAsync<Dictionary<string, object>>($"/api/v1/background-tasks/{taskId}", null);
        }
    }
}
