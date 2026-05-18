#nullable enable
using Microsoft.Extensions.Logging;
using HookSniff.Models;

namespace HookSniff
{
    public class Statistics(HookSniffClient client)
    {
        readonly HookSniffClient _client = client;

        /// <summary>
        /// Get basic statistics for the app.
        /// </summary>
        public async Task<object> AggregateAppStatsAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _client.HookSniffHttpClient.SendRequestAsync<object>(
                    method: HttpMethod.Get,
                    path: "/api/v1/stats/usage/app",
                    cancellationToken: cancellationToken
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(AggregateAppStatsAsync)} failed");
                throw;
            }
        }

        /// <summary>
        /// Get basic statistics for the app.
        /// </summary>
        public object AggregateAppStats()
        {
            try
            {
                var response = _client.HookSniffHttpClient.SendRequest<object>(
                    method: HttpMethod.Get,
                    path: "/api/v1/stats/usage/app"
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(AggregateAppStats)} failed");
                throw;
            }
        }
    }
}
