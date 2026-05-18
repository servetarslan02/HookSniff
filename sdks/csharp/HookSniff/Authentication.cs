#nullable enable
using Microsoft.Extensions.Logging;
using HookSniff.Models;

namespace HookSniff
{
    public class AuthenticationLogoutOptions : HookSniffOptionsBase
    {
        public string? IdempotencyKey { get; set; }

        public new Dictionary<string, string> HeaderParams()
        {
            return SerializeParams(
                new Dictionary<string, object?> { { "idempotency-key", IdempotencyKey } }
            );
        }
    }

    public class Authentication(HookSniffClient client)
    {
        readonly HookSniffClient _client = client;

        /// <summary>
        /// Logout the current auth token.
        /// </summary>
        public async Task LogoutAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                await _client.HookSniffHttpClient.SendRequestAsync<bool>(
                    method: HttpMethod.Post,
                    path: "/api/v1/auth/logout",
                    cancellationToken: cancellationToken
                );
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(LogoutAsync)} failed");
                throw;
            }
        }

        /// <summary>
        /// Logout the current auth token.
        /// </summary>
        public void Logout()
        {
            try
            {
                _client.HookSniffHttpClient.SendRequest<bool>(
                    method: HttpMethod.Post,
                    path: "/api/v1/auth/logout"
                );
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(Logout)} failed");
                throw;
            }
        }
    }
}
