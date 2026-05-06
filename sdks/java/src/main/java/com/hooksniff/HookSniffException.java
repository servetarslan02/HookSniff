package com.hooksniff;

/**
 * Base exception for HookSniff API errors.
 */
public class HookSniffException extends RuntimeException {
    private final int statusCode;
    private final String errorCode;

    public HookSniffException(String message, int statusCode, String errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public static class AuthenticationException extends HookSniffException {
        public AuthenticationException(String message) {
            super(message, 401, "UNAUTHORIZED");
        }
    }

    public static class NotFoundException extends HookSniffException {
        public NotFoundException(String message) {
            super(message, 404, "NOT_FOUND");
        }
    }

    public static class RateLimitException extends HookSniffException {
        public RateLimitException(String message) {
            super(message, 429, "RATE_LIMIT_EXCEEDED");
        }
    }

    public static class ValidationException extends HookSniffException {
        public ValidationException(String message) {
            super(message, 400, "BAD_REQUEST");
        }
    }

    public static class PayloadTooLargeException extends HookSniffException {
        public PayloadTooLargeException(String message) {
            super(message, 413, "PAYLOAD_TOO_LARGE");
        }
    }
}
