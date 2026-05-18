package com.hooksniff.api;

import com.hooksniff.HookSniffHttpClient;
import com.hooksniff.Utils;
import com.hooksniff.exceptions.ApiException;
import com.hooksniff.models.EnvironmentIn;
import com.hooksniff.models.EnvironmentModelOut;
import com.hooksniff.models.EnvironmentPatch;
import com.hooksniff.models.EnvironmentVariableBulkUpsertIn;
import com.hooksniff.models.EnvironmentVariableIn;
import com.hooksniff.models.EnvironmentVariableOut;

import java.io.IOException;
import java.util.List;

public class Environment {
    private final HookSniffHttpClient client;

    public Environment(HookSniffHttpClient client) {
        this.client = client;
    }

    public List<EnvironmentModelOut> list() throws IOException, ApiException {
        return this.client.executeRequest(
                "GET", this.client.newUrlBuilder().encodedPath("/api/v1/environments").build(),
                null, null, Utils.getListType(EnvironmentModelOut.class));
    }

    public EnvironmentModelOut create(EnvironmentIn body) throws IOException, ApiException {
        return this.client.executeRequest(
                "POST", this.client.newUrlBuilder().encodedPath("/api/v1/environments").build(),
                body, null, EnvironmentModelOut.class);
    }

    public EnvironmentModelOut get(String environmentId) throws IOException, ApiException {
        return this.client.executeRequest(
                "GET", this.client.newUrlBuilder().encodedPath("/api/v1/environments/" + environmentId).build(),
                null, null, EnvironmentModelOut.class);
    }

    public EnvironmentModelOut update(String environmentId, EnvironmentPatch body) throws IOException, ApiException {
        return this.client.executeRequest(
                "PUT", this.client.newUrlBuilder().encodedPath("/api/v1/environments/" + environmentId).build(),
                body, null, EnvironmentModelOut.class);
    }

    public void delete(String environmentId) throws IOException, ApiException {
        this.client.executeRequest(
                "DELETE", this.client.newUrlBuilder().encodedPath("/api/v1/environments/" + environmentId).build(),
                null, null, Void.class);
    }

    public List<EnvironmentVariableOut> listVariables(String environmentId) throws IOException, ApiException {
        return this.client.executeRequest(
                "GET", this.client.newUrlBuilder().encodedPath("/api/v1/environments/" + environmentId + "/variables").build(),
                null, null, Utils.getListType(EnvironmentVariableOut.class));
    }

    public EnvironmentVariableOut getVariable(String environmentId, String variableId) throws IOException, ApiException {
        return this.client.executeRequest(
                "GET", this.client.newUrlBuilder().encodedPath("/api/v1/environments/" + environmentId + "/variables/" + variableId).build(),
                null, null, EnvironmentVariableOut.class);
    }

    public EnvironmentVariableOut createVariable(String environmentId, EnvironmentVariableIn body) throws IOException, ApiException {
        return this.client.executeRequest(
                "POST", this.client.newUrlBuilder().encodedPath("/api/v1/environments/" + environmentId + "/variables").build(),
                body, null, EnvironmentVariableOut.class);
    }

    public EnvironmentVariableOut updateVariable(String environmentId, String variableId, EnvironmentVariableIn body) throws IOException, ApiException {
        return this.client.executeRequest(
                "PUT", this.client.newUrlBuilder().encodedPath("/api/v1/environments/" + environmentId + "/variables/" + variableId).build(),
                body, null, EnvironmentVariableOut.class);
    }

    public void deleteVariable(String environmentId, String variableId) throws IOException, ApiException {
        this.client.executeRequest(
                "DELETE", this.client.newUrlBuilder().encodedPath("/api/v1/environments/" + environmentId + "/variables/" + variableId).build(),
                null, null, Void.class);
    }

    public List<EnvironmentVariableOut> bulkUpsertVariables(String environmentId, EnvironmentVariableBulkUpsertIn body) throws IOException, ApiException {
        return this.client.executeRequest(
                "POST", this.client.newUrlBuilder().encodedPath("/api/v1/environments/" + environmentId + "/variables/bulk").build(),
                body, null, Utils.getListType(EnvironmentVariableOut.class));
    }
}
