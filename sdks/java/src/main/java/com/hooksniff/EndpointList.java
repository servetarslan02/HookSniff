package com.hooksniff;

import java.util.List;

/**
 * Paginated list of endpoints.
 */
public class EndpointList {
    private List<Endpoint> endpoints;
    private int total;
    private int page;
    private int perPage;

    public List<Endpoint> getEndpoints() { return endpoints; }
    public void setEndpoints(List<Endpoint> endpoints) { this.endpoints = endpoints; }
    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getPerPage() { return perPage; }
    public void setPerPage(int perPage) { this.perPage = perPage; }
}
