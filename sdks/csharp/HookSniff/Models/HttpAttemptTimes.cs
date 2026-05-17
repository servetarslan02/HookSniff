using System.Text.Json.Serialization;

namespace HookSniff.Models;

public class HttpAttemptTimes
{
    [JsonPropertyName("dnsMs")]
    public long? DnsMs { get; set; }

    [JsonPropertyName("connectMs")]
    public long? ConnectMs { get; set; }

    [JsonPropertyName("tlsMs")]
    public long? TlsMs { get; set; }

    [JsonPropertyName("processingMs")]
    public long? ProcessingMs { get; set; }

    [JsonPropertyName("totalMs")]
    public long? TotalMs { get; set; }
}
