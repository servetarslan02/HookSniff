package com.hooksniff.models;

public class IntegrationStatsOut {
    public long totalEvents;
    public long delivered;
    public long failed;
    public long pending;
    public long filtered;
    public Double avgDurationMs;
    public double successRate;
    public long last24hEvents;
    public long last24hFailures;
}
