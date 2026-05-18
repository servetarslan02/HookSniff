#nullable enable
using Microsoft.Extensions.Logging;
using HookSniff.Models;

namespace HookSniff
{
    public class EndpointListOptions : HookSniffOptionsBase
    {
        public ulong? Limit { get; set; }
        public string? Iterator { get; set; }
        public string? Order { get; set; }

        public new Dictionary<string, string> QueryParams()
        {
            return SerializeParams(
                new Dictionary<string, object?>
                {
                    { "limit", Limit },
                    { "iterator", Iterator },
                    { "order", Order },
                }
            );
        }
    }

    public class EndpointCreateOptions : HookSniffOptionsBase
    {
        public string? IdempotencyKey { get; set; }

        public new Dictionary<string, string> HeaderParams()
        {
            return SerializeParams(
                new Dictionary<string, object?> { { "idempotency-key", IdempotencyKey } }
            );
        }
    }

    public class EndpointRotateSecretOptions : HookSniffOptionsBase
    {
        public string? IdempotencyKey { get; set; }

        public new Dictionary<string, string> HeaderParams()
        {
            return SerializeParams(
                new Dictionary<string, object?> { { "idempotency-key", IdempotencyKey } }
            );
        }
    }

    public class Endpoint(HookSniffClient client)
    {
        readonly HookSniffClient _client = client;

        /// <summary>
        /// List endpoints.
        /// </summary>
        public async Task<ListResponseEndpointOut> ListAsync(
            EndpointListOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var response = await _client.HookSniffHttpClient.SendRequestAsync<ListResponseEndpointOut>(
                    method: HttpMethod.Get,
                    path: "/api/v1/endpoint",
                    queryParams: options?.QueryParams(),
                    headerParams: options?.HeaderParams(),
                    cancellationToken: cancellationToken
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(ListAsync)} failed");
                throw;
            }
        }

        /// <summary>
        /// List endpoints.
        /// </summary>
        public ListResponseEndpointOut List(EndpointListOptions? options = null)
        {
            try
            {
                var response = _client.HookSniffHttpClient.SendRequest<ListResponseEndpointOut>(
                    method: HttpMethod.Get,
                    path: "/api/v1/endpoint",
                    queryParams: options?.QueryParams(),
                    headerParams: options?.HeaderParams()
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(List)} failed");
                throw;
            }
        }

        /// <summary>
        /// Create a new endpoint.
        /// </summary>
        public async Task<EndpointOut> CreateAsync(
            EndpointIn endpointIn,
            EndpointCreateOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            endpointIn = endpointIn ?? throw new ArgumentNullException(nameof(endpointIn));
            try
            {
                var response = await _client.HookSniffHttpClient.SendRequestAsync<EndpointOut>(
                    method: HttpMethod.Post,
                    path: "/api/v1/endpoint",
                    queryParams: options?.QueryParams(),
                    headerParams: options?.HeaderParams(),
                    content: endpointIn,
                    cancellationToken: cancellationToken
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(CreateAsync)} failed");
                throw;
            }
        }

        /// <summary>
        /// Create a new endpoint.
        /// </summary>
        public EndpointOut Create(EndpointIn endpointIn, EndpointCreateOptions? options = null)
        {
            endpointIn = endpointIn ?? throw new ArgumentNullException(nameof(endpointIn));
            try
            {
                var response = _client.HookSniffHttpClient.SendRequest<EndpointOut>(
                    method: HttpMethod.Post,
                    path: "/api/v1/endpoint",
                    queryParams: options?.QueryParams(),
                    headerParams: options?.HeaderParams(),
                    content: endpointIn
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(Create)} failed");
                throw;
            }
        }

        /// <summary>
        /// Get an endpoint.
        /// </summary>
        public async Task<EndpointOut> GetAsync(string endpointId, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _client.HookSniffHttpClient.SendRequestAsync<EndpointOut>(
                    method: HttpMethod.Get,
                    path: $"/api/v1/endpoint/{endpointId}",
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
        /// Get an endpoint.
        /// </summary>
        public EndpointOut Get(string endpointId)
        {
            try
            {
                var response = _client.HookSniffHttpClient.SendRequest<EndpointOut>(
                    method: HttpMethod.Get,
                    path: $"/api/v1/endpoint/{endpointId}"
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(Get)} failed");
                throw;
            }
        }

        /// <summary>
        /// Update an endpoint.
        /// </summary>
        public async Task<EndpointOut> UpdateAsync(
            string endpointId,
            EndpointUpdate endpointUpdate,
            CancellationToken cancellationToken = default
        )
        {
            endpointUpdate = endpointUpdate ?? throw new ArgumentNullException(nameof(endpointUpdate));
            try
            {
                var response = await _client.HookSniffHttpClient.SendRequestAsync<EndpointOut>(
                    method: HttpMethod.Put,
                    path: $"/api/v1/endpoint/{endpointId}",
                    content: endpointUpdate,
                    cancellationToken: cancellationToken
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(UpdateAsync)} failed");
                throw;
            }
        }

        /// <summary>
        /// Update an endpoint.
        /// </summary>
        public EndpointOut Update(string endpointId, EndpointUpdate endpointUpdate)
        {
            endpointUpdate = endpointUpdate ?? throw new ArgumentNullException(nameof(endpointUpdate));
            try
            {
                var response = _client.HookSniffHttpClient.SendRequest<EndpointOut>(
                    method: HttpMethod.Put,
                    path: $"/api/v1/endpoint/{endpointId}",
                    content: endpointUpdate
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(Update)} failed");
                throw;
            }
        }

        /// <summary>
        /// Delete an endpoint.
        /// </summary>
        public async Task DeleteAsync(string endpointId, CancellationToken cancellationToken = default)
        {
            try
            {
                await _client.HookSniffHttpClient.SendRequestAsync<bool>(
                    method: HttpMethod.Delete,
                    path: $"/api/v1/endpoint/{endpointId}",
                    cancellationToken: cancellationToken
                );
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(DeleteAsync)} failed");
                throw;
            }
        }

        /// <summary>
        /// Delete an endpoint.
        /// </summary>
        public void Delete(string endpointId)
        {
            try
            {
                _client.HookSniffHttpClient.SendRequest<bool>(
                    method: HttpMethod.Delete,
                    path: $"/api/v1/endpoint/{endpointId}"
                );
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(Delete)} failed");
                throw;
            }
        }

        /// <summary>
        /// Get the endpoint's signing secret.
        /// </summary>
        public async Task<EndpointSecretOut> GetSecretAsync(string endpointId, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _client.HookSniffHttpClient.SendRequestAsync<EndpointSecretOut>(
                    method: HttpMethod.Get,
                    path: $"/api/v1/endpoint/{endpointId}/secret",
                    cancellationToken: cancellationToken
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(GetSecretAsync)} failed");
                throw;
            }
        }

        /// <summary>
        /// Get the endpoint's signing secret.
        /// </summary>
        public EndpointSecretOut GetSecret(string endpointId)
        {
            try
            {
                var response = _client.HookSniffHttpClient.SendRequest<EndpointSecretOut>(
                    method: HttpMethod.Get,
                    path: $"/api/v1/endpoint/{endpointId}/secret"
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(GetSecret)} failed");
                throw;
            }
        }

        /// <summary>
        /// Rotate the endpoint's signing secret.
        /// </summary>
        public async Task RotateSecretAsync(
            string endpointId,
            EndpointSecretRotateIn endpointSecretRotateIn,
            EndpointRotateSecretOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            endpointSecretRotateIn = endpointSecretRotateIn ?? throw new ArgumentNullException(nameof(endpointSecretRotateIn));
            try
            {
                await _client.HookSniffHttpClient.SendRequestAsync<bool>(
                    method: HttpMethod.Post,
                    path: $"/api/v1/endpoint/{endpointId}/secret/rotate",
                    headerParams: options?.HeaderParams(),
                    content: endpointSecretRotateIn,
                    cancellationToken: cancellationToken
                );
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(RotateSecretAsync)} failed");
                throw;
            }
        }

        /// <summary>
        /// Rotate the endpoint's signing secret.
        /// </summary>
        public void RotateSecret(
            string endpointId,
            EndpointSecretRotateIn endpointSecretRotateIn,
            EndpointRotateSecretOptions? options = null
        )
        {
            endpointSecretRotateIn = endpointSecretRotateIn ?? throw new ArgumentNullException(nameof(endpointSecretRotateIn));
            try
            {
                _client.HookSniffHttpClient.SendRequest<bool>(
                    method: HttpMethod.Post,
                    path: $"/api/v1/endpoint/{endpointId}/secret/rotate",
                    headerParams: options?.HeaderParams(),
                    content: endpointSecretRotateIn
                );
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(RotateSecret)} failed");
                throw;
            }
        }
    }
}
