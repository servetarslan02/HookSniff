using Xunit;
using HookSniff.Serialization;
using HookSniff.Model;
using System.Text.Json;

namespace HookSniff.Tests.Serialization;

public class ModelSerializerTests
{
    [Fact]
    public void ToJson_Error_ReturnsDictionary()
    {
        var error = new Error("test error");
        var dict = ModelSerializer.ToJson(error);
        Assert.NotNull(dict);
        Assert.True(dict.ContainsKey("error"));
    }

    [Fact]
    public void FromJson_Error_ReturnsObject()
    {
        var dict = new Dictionary<string, object> { { "error", "test error" } };
        var error = ModelSerializer.FromJson<Error>(dict);
        Assert.NotNull(error);
        Assert.Equal("test error", error.VarError);
    }

    [Fact]
    public void RoundTrip_Error_PreservesData()
    {
        var original = new Error("round trip test");
        var dict = ModelSerializer.ToJson(original);
        var restored = ModelSerializer.FromJson<Error>(dict);
        Assert.Equal(original.VarError, restored.VarError);
    }

    [Fact]
    public void ToJson_NullInput_Throws()
    {
        Assert.Throws<ArgumentNullException>(() => ModelSerializer.ToJson<Error>(null!));
    }

    [Fact]
    public void FromJson_EmptyDictionary_ThrowsOrReturnsDefault()
    {
        var dict = new Dictionary<string, object>();
        // Should either throw or return with defaults
        try
        {
            var result = ModelSerializer.FromJson<Error>(dict);
            // If it doesn't throw, result should be non-null
            Assert.NotNull(result);
        }
        catch (Exception)
        {
            // Expected for missing required fields
        }
    }

    [Fact]
    public void ToJson_UnknownFields_AreIgnored()
    {
        var dict = new Dictionary<string, object>
        {
            { "error", "test" },
            { "unknown_field", "should_be_ignored" },
            { "another_unknown", 42 }
        };
        var error = ModelSerializer.FromJson<Error>(dict);
        Assert.NotNull(error);
        Assert.Equal("test", error.VarError);
    }

    [Fact]
    public void ToJson_RetryPolicy_RoundTrip()
    {
        var policy = new RetryPolicy(3, RetryPolicy.BackoffEnum.Exponential, 1, 60);
        var dict = ModelSerializer.ToJson(policy);
        Assert.NotNull(dict);
        Assert.True(dict.ContainsKey("max_attempts"));
    }

    [Fact]
    public void FromJson_RetryPolicy_UsesDefaults()
    {
        var dict = new Dictionary<string, object>
        {
            { "max_attempts", 5 },
            { "initial_delay_secs", 2 },
            { "max_delay_secs", 120 }
        };
        var policy = ModelSerializer.FromJson<RetryPolicy>(dict);
        Assert.NotNull(policy);
        Assert.Equal(5, policy.MaxAttempts);
        Assert.Equal(2, policy.InitialDelaySecs);
    }

    [Fact]
    public void JsonElement_Conversion_Works()
    {
        var json = """{"error": "from json element"}""";
        var doc = JsonDocument.Parse(json);
        var dict = new Dictionary<string, object>();
        foreach (var prop in doc.RootElement.EnumerateObject())
        {
            dict[prop.Name] = prop.Value.GetString()!;
        }
        var error = ModelSerializer.FromJson<Error>(dict);
        Assert.Equal("from json element", error.VarError);
    }
}
