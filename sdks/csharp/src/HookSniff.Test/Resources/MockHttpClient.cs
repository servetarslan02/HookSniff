using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace HookSniff.Test.Resources;

/// <summary>
/// Captures HTTP requests made by the SDK and returns configurable mock responses.
/// Implements HttpMessageHandler to intercept requests in-process.
/// </summary>
public sealed class MockHandler : HttpMessageHandler
{
    public List<CapturedRequest> Requests { get; } = new();
    public Queue<(int StatusCode, string Body)> ResponseQueue { get; } = new();

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        string body = "";
        if (request.Content != null)
        {
            body = request.Content.ReadAsStringAsync(cancellationToken).GetAwaiter().GetResult();
        }

        var captured = new CapturedRequest
        {
            Method = request.Method.Method,
            Path = request.RequestUri!.AbsolutePath,
            Query = request.RequestUri.Query ?? "",
            Body = body,
            Headers = new Dictionary<string, string>()
        };
        foreach (var header in request.Headers)
        {
            captured.Headers[header.Key] = string.Join(", ", header.Value);
        }
        Requests.Add(captured);

        int statusCode = 200;
        string responseBody = """{"ok":true}""";
        if (ResponseQueue.Count > 0)
        {
            (statusCode, responseBody) = ResponseQueue.Dequeue();
        }

        var response = new HttpResponseMessage((HttpStatusCode)statusCode)
        {
            Content = new StringContent(responseBody, Encoding.UTF8, "application/json")
        };
        return Task.FromResult(response);
    }
}

/// <summary>
/// Registers a mock HttpClient with the SDK for the lifetime of this object.
/// Uses the SDK's SetTestHttpClient/ResetHttpClient API.
/// </summary>
public sealed class MockHttpClient : IDisposable
{
    public MockHandler Handler { get; }

    public MockHttpClient()
    {
        Handler = new MockHandler();
        var mockClient = new HttpClient(Handler);
        Request.SetTestHttpClient(mockClient);
    }

    public void Dispose()
    {
        Request.ResetHttpClient();
    }
}

public class CapturedRequest
{
    public string Method { get; set; } = "";
    public string Path { get; set; } = "";
    public string Query { get; set; } = "";
    public string Body { get; set; } = "";
    public Dictionary<string, string> Headers { get; set; } = new();
}
