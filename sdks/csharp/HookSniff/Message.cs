#nullable enable
using Microsoft.Extensions.Logging;
using HookSniff.Models;

namespace HookSniff
{
    public class MessageListOptions : HookSniffOptionsBase
    {
        public ulong? Limit { get; set; }
        public string? Iterator { get; set; }
        public string? Channel { get; set; }
        public DateTime? Before { get; set; }
        public DateTime? After { get; set; }
        public bool? WithContent { get; set; }
        public string? Tag { get; set; }
        public List<string>? EventTypes { get; set; }

        public new Dictionary<string, string> QueryParams()
        {
            return SerializeParams(
                new Dictionary<string, object?>
                {
                    { "limit", Limit },
                    { "iterator", Iterator },
                    { "channel", Channel },
                    { "before", Before },
                    { "after", After },
                    { "with_content", WithContent },
                    { "tag", Tag },
                    { "event_types", EventTypes },
                }
            );
        }
    }

    public class MessageCreateOptions : HookSniffOptionsBase
    {
        public bool? WithContent { get; set; }
        public string? IdempotencyKey { get; set; }

        public new Dictionary<string, string> QueryParams()
        {
            return SerializeParams(
                new Dictionary<string, object?> { { "with_content", WithContent } }
            );
        }

        public new Dictionary<string, string> HeaderParams()
        {
            return SerializeParams(
                new Dictionary<string, object?> { { "idempotency-key", IdempotencyKey } }
            );
        }
    }

    public class MessageGetOptions : HookSniffOptionsBase
    {
        public bool? WithContent { get; set; }

        public new Dictionary<string, string> QueryParams()
        {
            return SerializeParams(
                new Dictionary<string, object?> { { "with_content", WithContent } }
            );
        }
    }

    public class Message(HookSniffClient client)
    {
        readonly HookSniffClient _client = client;

        /// <summary>
        /// List all messages.
        /// </summary>
        public async Task<ListResponseMessageOut> ListAsync(
            MessageListOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var response = await _client.HookSniffHttpClient.SendRequestAsync<ListResponseMessageOut>(
                    method: HttpMethod.Get,
                    path: "/api/v1/msg",
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
        /// List all messages.
        /// </summary>
        public ListResponseMessageOut List(MessageListOptions? options = null)
        {
            try
            {
                var response = _client.HookSniffHttpClient.SendRequest<ListResponseMessageOut>(
                    method: HttpMethod.Get,
                    path: "/api/v1/msg",
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
        /// Create a new message and dispatch it to all matching endpoints.
        /// </summary>
        public async Task<MessageOut> CreateAsync(
            MessageIn messageIn,
            MessageCreateOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            messageIn = messageIn ?? throw new ArgumentNullException(nameof(messageIn));
            try
            {
                var response = await _client.HookSniffHttpClient.SendRequestAsync<MessageOut>(
                    method: HttpMethod.Post,
                    path: "/api/v1/msg",
                    queryParams: options?.QueryParams(),
                    headerParams: options?.HeaderParams(),
                    content: messageIn,
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
        /// Create a new message and dispatch it to all matching endpoints.
        /// </summary>
        public MessageOut Create(MessageIn messageIn, MessageCreateOptions? options = null)
        {
            messageIn = messageIn ?? throw new ArgumentNullException(nameof(messageIn));
            try
            {
                var response = _client.HookSniffHttpClient.SendRequest<MessageOut>(
                    method: HttpMethod.Post,
                    path: "/api/v1/msg",
                    queryParams: options?.QueryParams(),
                    headerParams: options?.HeaderParams(),
                    content: messageIn
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
        /// Get a message by its ID or eventID.
        /// </summary>
        public async Task<MessageOut> GetAsync(
            string msgId,
            MessageGetOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var response = await _client.HookSniffHttpClient.SendRequestAsync<MessageOut>(
                    method: HttpMethod.Get,
                    path: $"/api/v1/msg/{msgId}",
                    queryParams: options?.QueryParams(),
                    headerParams: options?.HeaderParams(),
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
        /// Get a message by its ID or eventID.
        /// </summary>
        public MessageOut Get(string msgId, MessageGetOptions? options = null)
        {
            try
            {
                var response = _client.HookSniffHttpClient.SendRequest<MessageOut>(
                    method: HttpMethod.Get,
                    path: $"/api/v1/msg/{msgId}",
                    queryParams: options?.QueryParams(),
                    headerParams: options?.HeaderParams()
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
