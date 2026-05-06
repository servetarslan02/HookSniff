package com.hooksniff;

/**
 * Retry policy configuration for webhook delivery.
 */
public class RetryPolicy {
    private Integer maxAttempts;
    private String backoff;
    private Integer initialDelaySecs;
    private Integer maxDelaySecs;

    public RetryPolicy() {}

    public RetryPolicy(Integer maxAttempts, String backoff, Integer initialDelaySecs, Integer maxDelaySecs) {
        this.maxAttempts = maxAttempts;
        this.backoff = backoff;
        this.initialDelaySecs = initialDelaySecs;
        this.maxDelaySecs = maxDelaySecs;
    }

    public Integer getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(Integer maxAttempts) { this.maxAttempts = maxAttempts; }
    public String getBackoff() { return backoff; }
    public void setBackoff(String backoff) { this.backoff = backoff; }
    public Integer getInitialDelaySecs() { return initialDelaySecs; }
    public void setInitialDelaySecs(Integer initialDelaySecs) { this.initialDelaySecs = initialDelaySecs; }
    public Integer getMaxDelaySecs() { return maxDelaySecs; }
    public void setMaxDelaySecs(Integer maxDelaySecs) { this.maxDelaySecs = maxDelaySecs; }
}
