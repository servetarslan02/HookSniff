// this file is @generated
package com.hooksniff.internalapi;

import com.hooksniff.HookSniffHttpClient;
import com.hooksniff.exceptions.ApiException;
import com.hooksniff.models.EndpointOut;
import com.hooksniff.models.SubscribeIn;

import okhttp3.HttpUrl;

import java.io.IOException;

public class EndpointAutoConfig {
    private final HookSniffHttpClient client;

    public EndpointAutoConfig(HookSniffHttpClient client) {
        this.client = client;
    }

    /** Update an auto-config endpoint by providing endpoint details. */
    public EndpointOut update(
            final String appId, final String endpointId, final SubscribeIn subscribeIn)
            throws IOException, ApiException {
        HttpUrl.Builder url =
                this.client
                        .newUrlBuilder()
                        .encodedPath(
                                String.format(
                                        "/api/v1/app/%s/endpoint/%s/auto-config",
                                        appId, endpointId));
        return this.client.executeRequest("PUT", url.build(), null, subscribeIn, EndpointOut.class);
    }
}
