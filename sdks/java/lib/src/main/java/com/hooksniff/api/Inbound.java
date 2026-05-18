package com.hooksniff.api;

import com.hooksniff.HookSniffHttpClient;
import com.hooksniff.Utils;
import com.hooksniff.exceptions.ApiException;
import com.hooksniff.models.*;

import java.io.IOException;
import java.util.List;

public class Inbound {
    private final HookSniffHttpClient client;

    public Inbound(HookSniffHttpClient client) {
        this.client = client;
    }

    public List<InboundConfigOut> listConfigs() throws IOException, ApiException {
        return client.executeRequest("GET", client.newUrlBuilder().encodedPath("/api/v1/inbound/configs").build(), null, null, Utils.getListType(InboundConfigOut.class));
    }

    public InboundConfigOut createConfig(InboundConfigIn body) throws IOException, ApiException {
        return client.executeRequest("POST", client.newUrlBuilder().encodedPath("/api/v1/inbound/configs").build(), body, null, InboundConfigOut.class);
    }

    public InboundConfigOut updateConfig(String id, InboundConfigIn body) throws IOException, ApiException {
        return client.executeRequest("PUT", client.newUrlBuilder().encodedPath("/api/v1/inbound/configs/" + id).build(), body, null, InboundConfigOut.class);
    }

    public void deleteConfig(String id) throws IOException, ApiException {
        client.executeRequest("DELETE", client.newUrlBuilder().encodedPath("/api/v1/inbound/configs/" + id).build(), null, null, Void.class);
    }
}
