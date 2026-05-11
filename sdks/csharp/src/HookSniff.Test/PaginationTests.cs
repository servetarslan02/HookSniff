using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace HookSniff.Test;

public class PaginationTests
{
    [Fact]
    public async Task CollectAllAsyncSinglePage()
    {
        var items = new List<string> { "a", "b", "c" };
        var callCount = 0;
        Func<int, int, Task<Page<string>>> fetchPage = (limit, offset) =>
        {
            callCount++;
            return Task.FromResult(new Page<string> { Data = items, HasMore = false });
        };

        var result = await Pagination.CollectAllAsync(fetchPage);
        Assert.Equal(items, result);
    }

    [Fact]
    public async Task CollectAllAsyncMultiplePages()
    {
        var pages = new List<Page<int>>
        {
            new() { Data = new List<int> { 1, 2 }, HasMore = true },
            new() { Data = new List<int> { 3, 4 }, HasMore = true },
            new() { Data = new List<int> { 5 }, HasMore = false },
        };
        var callCount = 0;
        Func<int, int, Task<Page<int>>> fetchPage = (limit, offset) =>
        {
            return Task.FromResult(pages[callCount++]);
        };

        var result = await Pagination.CollectAllAsync(fetchPage, 2);
        Assert.Equal(new List<int> { 1, 2, 3, 4, 5 }, result);
    }

    [Fact]
    public async Task CollectAllAsyncEmptyResult()
    {
        Func<int, int, Task<Page<string>>> fetchPage = (limit, offset) =>
        {
            return Task.FromResult(new Page<string> { Data = new List<string>(), HasMore = false });
        };

        var result = await Pagination.CollectAllAsync(fetchPage);
        Assert.Empty(result);
    }

    [Fact]
    public async Task CollectAllAsyncPassesLimit()
    {
        var receivedLimits = new List<int>();
        Func<int, int, Task<Page<int>>> fetchPage = (limit, offset) =>
        {
            receivedLimits.Add(limit);
            return Task.FromResult(new Page<int> { Data = new List<int> { 1 }, HasMore = false });
        };

        await Pagination.CollectAllAsync(fetchPage, 25);
        Assert.Single(receivedLimits);
        Assert.Equal(25, receivedLimits[0]);
    }

    [Fact]
    public async Task CollectAllAsyncTracksOffset()
    {
        var receivedOffsets = new List<int>();
        var pages = new List<Page<int>>
        {
            new() { Data = new List<int> { 1, 2 }, HasMore = true },
            new() { Data = new List<int> { 3, 4 }, HasMore = true },
            new() { Data = new List<int> { 5 }, HasMore = false },
        };
        var callCount = 0;
        Func<int, int, Task<Page<int>>> fetchPage = (limit, offset) =>
        {
            receivedOffsets.Add(offset);
            return Task.FromResult(pages[callCount++]);
        };

        await Pagination.CollectAllAsync(fetchPage, 2);
        Assert.Equal(new List<int> { 0, 2, 4 }, receivedOffsets);
    }

    [Fact]
    public async Task CollectAllAsyncStopsOnEmptyDataEvenWithHasMore()
    {
        Func<int, int, Task<Page<int>>> fetchPage = (limit, offset) =>
        {
            return Task.FromResult(new Page<int> { Data = new List<int>(), HasMore = true });
        };

        var result = await Pagination.CollectAllAsync(fetchPage);
        Assert.Empty(result);
    }

    [Fact]
    public void DefaultLimitIs50()
    {
        Assert.Equal(50, Pagination.DefaultLimit);
    }

    [Fact]
    public void MaxPagesIs100()
    {
        Assert.Equal(100, Pagination.MaxPages);
    }

    [Fact]
    public async Task CollectAllAsyncStopsAtMaxPages()
    {
        var pageCount = 0;
        Func<int, int, Task<Page<int>>> fetchPage = (limit, offset) =>
        {
            pageCount++;
            return Task.FromResult(new Page<int> { Data = new List<int> { pageCount }, HasMore = true });
        };

        var result = await Pagination.CollectAllAsync(fetchPage, 1);
        Assert.Equal(100, result.Count);
        Assert.Equal(100, pageCount);
    }

    [Fact]
    public async Task CollectAllAsyncWithNullDataStops()
    {
        Func<int, int, Task<Page<string>>> fetchPage = (limit, offset) =>
        {
            return Task.FromResult(new Page<string> { Data = null!, HasMore = true });
        };

        var result = await Pagination.CollectAllAsync(fetchPage);
        Assert.Empty(result);
    }

    [Fact]
    public async Task CollectAllAsyncCustomLimit()
    {
        var receivedLimits = new List<int>();
        var callCount = 0;
        Func<int, int, Task<Page<int>>> fetchPage = (limit, offset) =>
        {
            receivedLimits.Add(limit);
            callCount++;
            return Task.FromResult(new Page<int> { Data = new List<int> { callCount }, HasMore = callCount < 3 });
        };

        var result = await Pagination.CollectAllAsync(fetchPage, 10);
        Assert.Equal(3, result.Count);
        Assert.All(receivedLimits, l => Assert.Equal(10, l));
    }
}
