package com.hooksniff.api;

import com.hooksniff.HookSniffHttpClient;
import com.hooksniff.Utils;
import com.hooksniff.exceptions.ApiException;
import com.hooksniff.models.*;

import java.io.IOException;
import java.util.List;

public class Connector {
    private final HookSniffHttpClient client;

    public Connector(HookSniffHttpClient client) { this.client = client; }

    public List<ConnectorOut> list() throws IOException, ApiException {
        return client.executeRequest("GET", client.newUrlBuilder().encodedPath("/api/v1/connectors").build(), null, null, Utils.getListType(ConnectorOut.class));
    }

    public ConnectorOut get(String id) throws IOException, ApiException {
        return client.executeRequest("GET", client.newUrlBuilder().encodedPath("/api/v1/connectors/" + id).build(), null, null, ConnectorOut.class);
    }

    public List<ConnectorConfigOut> listConfigs() throws IOException, ApiException {
        return client.executeRequest("GET", client.newUrlBuilder().encodedPath("/api/v1/connectors/configs").build(), null, null, Utils.getListType(ConnectorConfigOut.class));
    }

    public ConnectorConfigOut createConfig(ConnectorConfigIn body) throws IOException, ApiException {
        return client.executeRequest("POST", client.newUrlBuilder().encodedPath("/api/v1/connectors/configs").build(), body, null, ConnectorConfigOut.class);
    }

    public ConnectorConfigOut updateConfig(String id, ConnectorConfigIn body) throws IOException, ApiException {
        return client.executeRequest("PUT", client.newUrlBuilder().encodedPath("/api/v1/connectors/configs/" + id).build(), body, null, ConnectorConfigOut.class);
    }

    public void deleteConfig(String id) throws IOException, ApiException {
        client.executeRequest("DELETE", client.newUrlBuilder().encodedPath("/api/v1/connectors/configs/" + id).build(), null, null, Void.class);
    }
}
