package com.hooksniff.api;
import com.hooksniff.HookSniffHttpClient;
import com.hooksniff.Utils;
import com.hooksniff.exceptions.ApiException;
import com.hooksniff.models.*;
import java.io.IOException;
import java.util.List;

public class OperationalWebhook {
    private final HookSniffHttpClient client;
    public OperationalWebhook(HookSniffHttpClient client) { this.client = client; }

    public List<OperationalWebhookEndpointOut> list() throws IOException, ApiException {
        return client.executeRequest("GET", client.newUrlBuilder().encodedPath("/api/v1/operational-webhooks").build(), null, null, Utils.getListType(OperationalWebhookEndpointOut.class));
    }
    public OperationalWebhookEndpointOut create(OperationalWebhookEndpointIn body) throws IOException, ApiException {
        return client.executeRequest("POST", client.newUrlBuilder().encodedPath("/api/v1/operational-webhooks").build(), body, null, OperationalWebhookEndpointOut.class);
    }
    public OperationalWebhookEndpointOut get(String id) throws IOException, ApiException {
        return client.executeRequest("GET", client.newUrlBuilder().encodedPath("/api/v1/operational-webhooks/" + id).build(), null, null, OperationalWebhookEndpointOut.class);
    }
    public OperationalWebhookEndpointOut update(String id, OperationalWebhookEndpointIn body) throws IOException, ApiException {
        return client.executeRequest("PUT", client.newUrlBuilder().encodedPath("/api/v1/operational-webhooks/" + id).build(), body, null, OperationalWebhookEndpointOut.class);
    }
    public void delete(String id) throws IOException, ApiException {
        client.executeRequest("DELETE", client.newUrlBuilder().encodedPath("/api/v1/operational-webhooks/" + id).build(), null, null, Void.class);
    }
    public List<OperationalWebhookDeliveryOut> listDeliveries(String id) throws IOException, ApiException {
        return client.executeRequest("GET", client.newUrlBuilder().encodedPath("/api/v1/operational-webhooks/" + id + "/deliveries").build(), null, null, Utils.getListType(OperationalWebhookDeliveryOut.class));
    }
}
