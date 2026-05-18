using System.Text.Json.Serialization;

namespace HookSniff.Models;

public class MessageAttemptFailedData
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("msgId")]
    public required string MsgId { get; set; }

    [JsonPropertyName("endpointId")]
    public required string EndpointId { get; set; }

    [JsonPropertyName("eventType")]
    public string? EventType { get; set; }

    [JsonPropertyName("responseStatusCode")]
    public int ResponseStatusCode { get; set; }

    [JsonPropertyName("timestamp")]
    public required DateTime Timestamp { get; set; }
}
