package com.hooksniff;

import java.util.List;

/**
 * Paginated list of deliveries.
 */
public class DeliveryList {
    private List<Delivery> deliveries;
    private int total;
    private int page;
    private int perPage;

    public List<Delivery> getDeliveries() { return deliveries; }
    public void setDeliveries(List<Delivery> deliveries) { this.deliveries = deliveries; }
    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getPerPage() { return perPage; }
    public void setPerPage(int perPage) { this.perPage = perPage; }
}
