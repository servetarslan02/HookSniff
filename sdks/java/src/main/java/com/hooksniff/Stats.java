package com.hooksniff;

/**
 * Platform statistics.
 */
public class Stats {
    private int totalDeliveries;
    private int delivered;
    private int failed;
    private int pending;
    private double successRate;
    private int endpointsCount;

    public int getTotalDeliveries() { return totalDeliveries; }
    public void setTotalDeliveries(int totalDeliveries) { this.totalDeliveries = totalDeliveries; }
    public int getDelivered() { return delivered; }
    public void setDelivered(int delivered) { this.delivered = delivered; }
    public int getFailed() { return failed; }
    public void setFailed(int failed) { this.failed = failed; }
    public int getPending() { return pending; }
    public void setPending(int pending) { this.pending = pending; }
    public double getSuccessRate() { return successRate; }
    public void setSuccessRate(double successRate) { this.successRate = successRate; }
    public int getEndpointsCount() { return endpointsCount; }
    public void setEndpointsCount(int endpointsCount) { this.endpointsCount = endpointsCount; }
}
