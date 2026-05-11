using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace HookSniff.Test.Resources;

/// <summary>
/// Lightweight HTTP server for capturing SDK requests and returning mock responses.
/// </summary>
public sealed class MockServer : IDisposable
{
    private readonly HttpListener _listener;
    private readonly CancellationTokenSource _cts = new();
    private readonly Task _listenTask;

    public string BaseUrl { get; }
    public List<CapturedRequest> Requests { get; } = new();

    /// <summary>
    /// Queue of response bodies to return. Each call dequeues one entry.
    /// If empty, returns <c>{"ok":true}</c>.
    /// </summary>
    public Queue<(int StatusCode, string Body)> ResponseQueue { get; } = new();

    public MockServer()
    {
        var port = GetAvailablePort();
        BaseUrl = $"http://127.0.0.1:{port}";
        _listener = new HttpListener();
        _listener.Prefixes.Add($"{BaseUrl}/");
        _listener.Start();
        _listenTask = ListenLoop();
    }

    private async Task ListenLoop()
    {
        while (!_cts.IsCancellationRequested)
        {
            try
            {
                var ctx = await _listener.GetContextAsync();
                _ = HandleRequest(ctx);
            }
            catch (HttpListenerException) when (_cts.IsCancellationRequested)
            {
                break;
            }
            catch (ObjectDisposedException)
            {
                break;
            }
        }
    }

    private async Task HandleRequest(HttpListenerContext ctx)
    {
        var req = ctx.Request;
        var resp = ctx.Response;

        // Capture the request
        string body = "";
        if (req.HasEntityBody)
        {
            using var reader = new StreamReader(req.InputStream, req.ContentEncoding);
            body = await reader.ReadToEndAsync();
        }

        var captured = new CapturedRequest
        {
            Method = req.HttpMethod,
            Path = req.Url!.AbsolutePath,
            Query = req.Url.Query,
            Body = body,
            Headers = new Dictionary<string, string>()
        };
        foreach (string key in req.Headers)
        {
            captured.Headers[key] = req.Headers[key];
        }
        Requests.Add(captured);

        // Send response
        int statusCode = 200;
        string responseBody = """{"ok":true}""";
        if (ResponseQueue.Count > 0)
        {
            (statusCode, responseBody) = ResponseQueue.Dequeue();
        }

        var buffer = Encoding.UTF8.GetBytes(responseBody);
        resp.StatusCode = statusCode;
        resp.ContentType = "application/json";
        resp.ContentLength64 = buffer.Length;
        await resp.OutputStream.WriteAsync(buffer);
        resp.OutputStream.Close();
    }

    public void Dispose()
    {
        _cts.Cancel();
        _listener.Stop();
        _listener.Close();
        try { _listenTask.Wait(TimeSpan.FromSeconds(2)); } catch { }
        _cts.Dispose();
    }

    private static int GetAvailablePort()
    {
        var listener = new System.Net.Sockets.TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var port = ((IPEndPoint)listener.LocalEndpoint).Port;
        listener.Stop();
        return port;
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
