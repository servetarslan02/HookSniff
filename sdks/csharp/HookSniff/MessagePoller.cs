using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace HookSniff
{
    public class MessagePoller
    {
        private readonly HookSniffHttpClient _client;

        public MessagePoller(HookSniffHttpClient client)
        {
            _client = client;
        }

        /// <summary>
        /// Poll for new messages since the consumer's cursor.
        /// </summary>
        public async Task<MessagePollerPollResponse> PollAsync(
            string consumerId,
            int? limit = null,
            string endpointId = null,
            string eventType = null,
            bool includePayload = true,
            CancellationToken cancellationToken = default)
        {
            var query = $"?consumer_id={consumerId}&include_payload={includePayload}";
            if (limit.HasValue) query += $"&limit={limit.Value}";
            if (endpointId != null) query += $"&endpoint_id={endpointId}";
            if (eventType != null) query += $"&event_type={eventType}";
            return await _client.GetAsync<MessagePollerPollResponse>($"/api/v1/message-poller/poll{query}", cancellationToken);
        }

        /// <summary>
        /// Seek cursor to a specific message.
        /// </summary>
        public async Task<MessagePollerCursorResponse> SeekAsync(
            string consumerId,
            string messageId,
            string endpointId = null,
            CancellationToken cancellationToken = default)
        {
            var body = new Dictionary<string, object>
            {
                ["consumer_id"] = consumerId,
                ["message_id"] = messageId,
            };
            if (endpointId != null) body["endpoint_id"] = endpointId;
            return await _client.PostAsync<MessagePollerCursorResponse>("/api/v1/message-poller/seek", body, cancellationToken);
        }

        /// <summary>
        /// Commit cursor — advance past a processed message.
        /// </summary>
        public async Task<MessagePollerCommitResponse> CommitAsync(
            string consumerId,
            string messageId,
            string endpointId = null,
            CancellationToken cancellationToken = default)
        {
            var body = new Dictionary<string, object>
            {
                ["consumer_id"] = consumerId,
                ["message_id"] = messageId,
            };
            if (endpointId != null) body["endpoint_id"] = endpointId;
            return await _client.PostAsync<MessagePollerCommitResponse>("/api/v1/message-poller/commit", body, cancellationToken);
        }
    }

    public class PolledMessage
    {
        public string Id { get; set; }
        public string EndpointId { get; set; }
        public string EventType { get; set; }
        public string Status { get; set; }
        public int AttemptCount { get; set; }
        public int? ResponseStatus { get; set; }
        public string CreatedAt { get; set; }
        public object Payload { get; set; }
    }

    public class MessagePollerCursor
    {
        public string ConsumerId { get; set; }
        public string LastMessageId { get; set; }
        public long LastSequenceNum { get; set; }
    }

    public class MessagePollerPollResponse
    {
        public List<PolledMessage> Messages { get; set; }
        public MessagePollerCursor Cursor { get; set; }
        public bool Done { get; set; }
    }

    public class MessagePollerCursorResponse
    {
        public MessagePollerCursor Cursor { get; set; }
    }

    public class MessagePollerCommitResponse
    {
        public MessagePollerCursor Cursor { get; set; }
        public bool Committed { get; set; }
    }
}
