package com.hooksniff;

/**
 * Exception thrown when webhook signature verification fails.
 */
public class WebhookVerificationError extends Exception {
    public WebhookVerificationError(String message) {
        super(message);
    }
}
