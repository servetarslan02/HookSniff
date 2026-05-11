using System.Text.Json;
using System.Text.Json.Serialization;

namespace HookSniff.Serialization;

/// <summary>
/// Generic model serializer — converts between C# model objects and
/// Dictionary&lt;string, object&gt; (JSON-like dictionaries).
///
/// Uses the model's existing System.Text.Json converters internally,
/// so all JsonPropertyName attributes and custom converters are respected.
///
/// Usage:
///   var dict = ModelSerializer.ToJson(endpoint);
///   var ep   = ModelSerializer.FromJson&lt;Endpoint&gt;(dict);
/// </summary>
public static class ModelSerializer
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented = false,
    };

    /// <summary>
    /// Serialize a model object to a Dictionary&lt;string, object&gt;.
    /// Nested objects become nested dictionaries, arrays become lists.
    /// </summary>
    public static Dictionary<string, object> ToJson<T>(T obj) where T : class
    {
        if (obj == null) throw new ArgumentNullException(nameof(obj));

        var json = JsonSerializer.Serialize(obj, Options);
        var doc = JsonDocument.Parse(json);
        return (Dictionary<string, object>)ConvertElement(doc.RootElement);
    }

    /// <summary>
    /// Deserialize a Dictionary&lt;string, object&gt; to a model object.
    /// </summary>
    public static T FromJson<T>(Dictionary<string, object> dict) where T : class
    {
        if (dict == null) throw new ArgumentNullException(nameof(dict));

        var json = JsonSerializer.Serialize(dict, Options);
        return JsonSerializer.Deserialize<T>(json, Options)!;
    }

    /// <summary>
    /// Serialize a model to a JSON string.
    /// </summary>
    public static string ToJsonString<T>(T obj) where T : class
    {
        if (obj == null) throw new ArgumentNullException(nameof(obj));
        return JsonSerializer.Serialize(obj, Options);
    }

    /// <summary>
    /// Deserialize a JSON string to a model object.
    /// </summary>
    public static T FromJsonString<T>(string json) where T : class
    {
        if (string.IsNullOrEmpty(json)) throw new ArgumentException("JSON string cannot be null or empty.", nameof(json));
        return JsonSerializer.Deserialize<T>(json, Options)!;
    }

    /// <summary>
    /// Convert a JsonElement to a CLR object (Dictionary, List, or primitive).
    /// </summary>
    private static object ConvertElement(JsonElement element)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                var dict = new Dictionary<string, object>();
                foreach (var prop in element.EnumerateObject())
                {
                    dict[prop.Name] = ConvertElement(prop.Value);
                }
                return dict;

            case JsonValueKind.Array:
                var list = new List<object>();
                foreach (var item in element.EnumerateArray())
                {
                    list.Add(ConvertElement(item));
                }
                return list;

            case JsonValueKind.String:
                return element.GetString()!;

            case JsonValueKind.Number:
                if (element.TryGetInt64(out var longVal))
                    return longVal;
                return element.GetDouble();

            case JsonValueKind.True:
                return true;

            case JsonValueKind.False:
                return false;

            case JsonValueKind.Null:
            case JsonValueKind.Undefined:
                return null!;

            default:
                return element.GetRawText();
        }
    }
}
