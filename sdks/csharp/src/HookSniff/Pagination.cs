namespace HookSniff;

using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// Pagination utilities for HookSniff SDK.
/// Iterates through offset-based paginated endpoints.
/// </summary>
public static class Pagination
{
    public const int DefaultLimit = 50;
    public const int MaxPages = 100;

    /// <summary>
    /// Collect all items from a paginated endpoint.
    /// </summary>
    /// <param name="fetchPage">Function that takes (limit, offset) and returns a page with data and has_more</param>
    /// <param name="limit">Items per page</param>
    /// <returns>List of all items</returns>
    public static async Task<List<T>> CollectAllAsync<T>(
        Func<int, int, Task<Page<T>>> fetchPage,
        int limit = DefaultLimit)
    {
        var all = new List<T>();
        var offset = 0;
        var pages = 0;

        while (pages < MaxPages)
        {
            var page = await fetchPage(limit, offset);
            if (page.Data == null || page.Data.Count == 0) break;
            all.AddRange(page.Data);
            if (!page.HasMore) break;
            offset += page.Data.Count;
            pages++;
        }

        return all;
    }

    /// <summary>
    /// Collect all items using a fetch function that returns JsonElement.
    /// </summary>
    public static async Task<List<JsonElement>> CollectAllAsync(
        Func<int, int, Task<JsonElement>> fetchPage,
        int limit = DefaultLimit)
    {
        var all = new List<JsonElement>();
        var offset = 0;
        var pages = 0;

        while (pages < MaxPages)
        {
            var page = await fetchPage(limit, offset);
            var data = page.GetProperty("data");
            var hasMore = page.TryGetProperty("has_more", out var hm) && hm.GetBoolean();

            if (data.GetArrayLength() == 0) break;
            foreach (var item in data.EnumerateArray())
            {
                all.Add(item);
            }
            if (!hasMore) break;
            offset += data.GetArrayLength();
            pages++;
        }

        return all;
    }
}

/// <summary>
/// Represents a single page of paginated results.
/// </summary>
public class Page<T>
{
    public List<T> Data { get; set; } = new();
    public bool HasMore { get; set; }
}
