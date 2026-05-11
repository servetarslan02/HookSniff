package com.hooksniff;

/**
 * Exception thrown when the HookSniff API returns an error response.
 */
public class ApiException extends Exception {
    private final int code;
    private final Object body;

    public ApiException(int code, Object body) {
        super("HookSniff API Error " + code + ": " + body);
        this.code = code;
        this.body = body;
    }

    public int getCode() {
        return code;
    }

    public Object getBody() {
        return body;
    }
}
