// this file is @generated
#nullable enable
using Microsoft.Extensions.Logging;
using HookSniff.Models;

namespace HookSniff
{
    public class Health(HookSniffClient client)
    {
        readonly HookSniffClient _client = client;

        /// <summary>
        /// Verify the API server is up and running.
        /// </summary>
        public async Task<bool> GetAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _client.HookSniffHttpClient.SendRequestAsync<bool>(
                    method: HttpMethod.Get,
                    path: "/api/v1/health",
                    cancellationToken: cancellationToken
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(GetAsync)} failed");

                throw;
            }
        }

        /// <summary>
        /// Verify the API server is up and running.
        /// </summary>
        public bool Get()
        {
            try
            {
                var response = _client.HookSniffHttpClient.SendRequest<bool>(
                    method: HttpMethod.Get,
                    path: "/api/v1/health"
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(Get)} failed");

                throw;
            }
        }
    }
}
