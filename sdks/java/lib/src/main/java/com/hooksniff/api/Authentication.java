package com.hooksniff.api;

import com.hooksniff.HookSniffHttpClient;
import com.hooksniff.exceptions.ApiException;

import okhttp3.Headers;
import okhttp3.HttpUrl;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class Authentication {
    private final HookSniffHttpClient client;

    public Authentication(HookSniffHttpClient client) {
        this.client = client;
    }

    /** Logout the current auth token. */
    public void logout() throws IOException, ApiException {
        this.logout(new AuthenticationLogoutOptions());
    }

    /** Logout the current auth token. */
    public void logout(final AuthenticationLogoutOptions options) throws IOException, ApiException {
        HttpUrl.Builder url = this.client.newUrlBuilder().encodedPath("/api/v1/auth/logout");
        Map<String, String> headers = new HashMap<>();
        if (options.idempotencyKey != null) {
            headers.put("idempotency-key", options.idempotencyKey);
        }
        this.client.executeRequest("POST", url.build(), Headers.of(headers), null, null);
    }
}
