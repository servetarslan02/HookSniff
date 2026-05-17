#nullable enable
using Microsoft.Extensions.Logging;
using HookSniff.Models;

namespace HookSniff
{
    public class MessageAttemptListByEndpointOptions : HookSniffOptionsBase
    {
        public ulong? Limit { get; set; }
        public string? Iterator { get; set; }
        public MessageStatus? Status { get; set; }
        public string? Channel { get; set; }
        public string? Tag { get; set; }
        public DateTime? Before { get; set; }
        public DateTime? After { get; set; }
        public bool? WithContent { get; set; }
        public bool? WithMsg { get; set; }
        public bool? ExpandedStatuses { get; set; }
        public List<string>? EventTypes { get; set; }

        public new Dictionary<string, string> QueryParams()
        {
            return SerializeParams(
                new Dictionary<string, object?>
                {
                    { "limit", Limit },
                    { "iterator", Iterator },
                    { "status", Status },
                    { "channel", Channel },
                    { "tag", Tag },
                    { "before", Before },
                    { "after", After },
                    { "with_content", WithContent },
                    { "with_msg", WithMsg },
                    { "expanded_statuses", ExpandedStatuses },
                    { "event_types", EventTypes },
                }
            );
        }
    }

    public class MessageAttemptListByMsgOptions : HookSniffOptionsBase
    {
        public ulong? Limit { get; set; }
        public string? Iterator { get; set; }
        public MessageStatus? Status { get; set; }
        public string? Channel { get; set; }
        public string? Tag { get; set; }
        public string? EndpointId { get; set; }
        public DateTime? Before { get; set; }
        public DateTime? After { get; set; }
        public bool? WithContent { get; set; }
        public bool? ExpandedStatuses { get; set; }
        public List<string>? EventTypes { get; set; }

        public new Dictionary<string, string> QueryParams()
        {
            return SerializeParams(
                new Dictionary<string, object?>
                {
                    { "limit", Limit },
                    { "iterator", Iterator },
                    { "status", Status },
                    { "channel", Channel },
                    { "tag", Tag },
                    { "endpoint_id", EndpointId },
                    { "before", Before },
                    { "after", After },
                    { "with_content", WithContent },
                    { "expanded_statuses", ExpandedStatuses },
                    { "event_types", EventTypes },
                }
            );
        }
    }

    public class MessageAttempt(HookSniffClient client)
    {
        readonly HookSniffClient _client = client;

        /// <summary>
        /// List attempts by endpoint id.
        /// </summary>
        public async Task<ListResponseMessageAttemptOut> ListByEndpointAsync(
            string endpointId,
            MessageAttemptListByEndpointOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var response = await _client.HookSniffHttpClient.SendRequestAsync<ListResponseMessageAttemptOut>(
                    method: HttpMethod.Get,
                    path: $"/api/v1/attempt/endpoint/{endpointId}",
                    queryParams: options?.QueryParams(),
                    headerParams: options?.HeaderParams(),
                    cancellationToken: cancellationToken
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(ListByEndpointAsync)} failed");
                throw;
            }
        }

        /// <summary>
        /// List attempts by endpoint id.
        /// </summary>
        public ListResponseMessageAttemptOut ListByEndpoint(
            string endpointId,
            MessageAttemptListByEndpointOptions? options = null
        )
        {
            try
            {
                var response = _client.HookSniffHttpClient.SendRequest<ListResponseMessageAttemptOut>(
                    method: HttpMethod.Get,
                    path: $"/api/v1/attempt/endpoint/{endpointId}",
                    queryParams: options?.QueryParams(),
                    headerParams: options?.HeaderParams()
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(ListByEndpoint)} failed");
                throw;
            }
        }

        /// <summary>
        /// List attempts by message ID.
        /// </summary>
        public async Task<ListResponseMessageAttemptOut> ListByMsgAsync(
            string msgId,
            MessageAttemptListByMsgOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var response = await _client.HookSniffHttpClient.SendRequestAsync<ListResponseMessageAttemptOut>(
                    method: HttpMethod.Get,
                    path: $"/api/v1/attempt/msg/{msgId}",
                    queryParams: options?.QueryParams(),
                    headerParams: options?.HeaderParams(),
                    cancellationToken: cancellationToken
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(ListByMsgAsync)} failed");
                throw;
            }
        }

        /// <summary>
        /// List attempts by message ID.
        /// </summary>
        public ListResponseMessageAttemptOut ListByMsg(
            string msgId,
            MessageAttemptListByMsgOptions? options = null
        )
        {
            try
            {
                var response = _client.HookSniffHttpClient.SendRequest<ListResponseMessageAttemptOut>(
                    method: HttpMethod.Get,
                    path: $"/api/v1/attempt/msg/{msgId}",
                    queryParams: options?.QueryParams(),
                    headerParams: options?.HeaderParams()
                );
                return response.Data;
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(ListByMsg)} failed");
                throw;
            }
        }

        /// <summary>
        /// Get a message attempt by ID.
        /// </summary>
        public async Task<MessageAttemptOut> GetAsync(
            string msgId,
            string attemptId,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var response = await _client.HookSniffHttpClient.SendRequestAsync<MessageAttemptOut>(
                    method: HttpMethod.Get,
                    path: $"/api/v1/msg/{msgId}/attempt/{attemptId}",
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
        /// Get a message attempt by ID.
        /// </summary>
        public MessageAttemptOut Get(string msgId, string attemptId)
        {
            try
            {
                var response = _client.HookSniffHttpClient.SendRequest<MessageAttemptOut>(
                    method: HttpMethod.Get,
                    path: $"/api/v1/msg/{msgId}/attempt/{attemptId}"
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
        /// Resend a message to the specified endpoint.
        /// </summary>
        public async Task ResendAsync(
            string msgId,
            string endpointId,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                await _client.HookSniffHttpClient.SendRequestAsync<bool>(
                    method: HttpMethod.Post,
                    path: $"/api/v1/msg/{msgId}/endpoint/{endpointId}/resend",
                    cancellationToken: cancellationToken
                );
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(ResendAsync)} failed");
                throw;
            }
        }

        /// <summary>
        /// Resend a message to the specified endpoint.
        /// </summary>
        public void Resend(string msgId, string endpointId)
        {
            try
            {
                _client.HookSniffHttpClient.SendRequest<bool>(
                    method: HttpMethod.Post,
                    path: $"/api/v1/msg/{msgId}/endpoint/{endpointId}/resend"
                );
            }
            catch (ApiException e)
            {
                _client.Logger?.LogError(e, $"{nameof(Resend)} failed");
                throw;
            }
        }
    }
}
