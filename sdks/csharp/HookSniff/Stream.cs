using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace HookSniff
{
    public class StreamApi
    {
        private readonly HookSniffHttpClient _client;

        public StreamApi(HookSniffHttpClient client) { _client = client; }

        public async Task<List<StreamChannelOut>> ListChannelsAsync(CancellationToken ct = default)
            => await _client.GetAsync<List<StreamChannelOut>>("/api/v1/stream/channels", ct);

        public async Task<StreamChannelDetailOut> GetChannelAsync(string id, CancellationToken ct = default)
            => await _client.GetAsync<StreamChannelDetailOut>($"/api/v1/stream/channels/{id}", ct);

        public async Task<StreamChannelOut> CreateChannelAsync(StreamChannelIn body, CancellationToken ct = default)
            => await _client.PostAsync<StreamChannelOut>("/api/v1/stream/channels", body, ct);

        public async Task<StreamChannelOut> UpdateChannelAsync(string id, StreamChannelUpdate body, CancellationToken ct = default)
            => await _client.PutAsync<StreamChannelOut>($"/api/v1/stream/channels/{id}", body, ct);

        public async Task DeleteChannelAsync(string id, CancellationToken ct = default)
            => await _client.DeleteAsync($"/api/v1/stream/channels/{id}", ct);

        public async Task<List<StreamMessageOut>> ListMessagesAsync(string id, CancellationToken ct = default)
            => await _client.GetAsync<List<StreamMessageOut>>($"/api/v1/stream/channels/{id}/messages", ct);

        public async Task<List<StreamSubscriptionOut>> ListSubscriptionsAsync(CancellationToken ct = default)
            => await _client.GetAsync<List<StreamSubscriptionOut>>("/api/v1/stream/subscriptions", ct);

        public async Task DisconnectSubscriptionAsync(string id, CancellationToken ct = default)
            => await _client.DeleteAsync($"/api/v1/stream/subscriptions/{id}", ct);

        public async Task<PublishEventResponse> PublishAsync(PublishEventIn body, CancellationToken ct = default)
            => await _client.PostAsync<PublishEventResponse>("/api/v1/stream/publish", body, ct);
    }

    public class StreamChannelOut
    {
        public string Id { get; set; }
        public string CustomerId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ChannelType { get; set; }
        public List<string> EventFilter { get; set; }
        public bool Enabled { get; set; }
        public int MaxSubscribers { get; set; }
        public int CurrentSubscribers { get; set; }
        public long TotalMessages { get; set; }
        public string CreatedAt { get; set; }
        public string UpdatedAt { get; set; }
    }

    public class StreamChannelDetailOut : StreamChannelOut
    {
        public List<StreamMessageOut> RecentMessages { get; set; }
    }

    public class StreamMessageOut
    {
        public string Id { get; set; }
        public string ChannelId { get; set; }
        public string EventType { get; set; }
        public Dictionary<string, object> Payload { get; set; }
        public int DeliveredCount { get; set; }
        public string CreatedAt { get; set; }
    }

    public class StreamSubscriptionOut
    {
        public string Id { get; set; }
        public string ChannelId { get; set; }
        public string CustomerId { get; set; }
        public string ConnectionType { get; set; }
        public string ClientId { get; set; }
        public List<string> EventFilter { get; set; }
        public string ConnectedAt { get; set; }
        public string LastHeartbeatAt { get; set; }
        public long MessagesSent { get; set; }
        public Dictionary<string, object> Metadata { get; set; }
    }

    public class StreamChannelIn
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string ChannelType { get; set; }
        public List<string> EventFilter { get; set; }
        public int? MaxSubscribers { get; set; }
        public bool? Enabled { get; set; }
    }

    public class StreamChannelUpdate
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public List<string> EventFilter { get; set; }
        public int? MaxSubscribers { get; set; }
        public bool? Enabled { get; set; }
    }

    public class PublishEventIn
    {
        public string ChannelId { get; set; }
        public string EventType { get; set; }
        public Dictionary<string, object> Payload { get; set; }
    }

    public class PublishEventResponse
    {
        public bool Success { get; set; }
        public string MessageId { get; set; }
        public int DeliveredTo { get; set; }
    }
}
