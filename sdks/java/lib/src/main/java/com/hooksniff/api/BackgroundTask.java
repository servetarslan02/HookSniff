package com.hooksniff.api;

import com.hooksniff.HookSniffHttpClient;
import com.hooksniff.Utils;
import com.hooksniff.exceptions.ApiException;
import com.hooksniff.models.BackgroundTaskOut;

import java.io.IOException;
import java.util.List;

public class BackgroundTask {
    private final HookSniffHttpClient client;

    public BackgroundTask(HookSniffHttpClient client) {
        this.client = client;
    }

    public List<BackgroundTaskOut> list() throws IOException, ApiException {
        return this.client.executeRequest(
                "GET", this.client.newUrlBuilder().encodedPath("/api/v1/background-tasks").build(),
                null, null, Utils.getListType(BackgroundTaskOut.class));
    }

    public BackgroundTaskOut get(String taskId) throws IOException, ApiException {
        return this.client.executeRequest(
                "GET", this.client.newUrlBuilder().encodedPath("/api/v1/background-tasks/" + taskId).build(),
                null, null, BackgroundTaskOut.class);
    }

    public BackgroundTaskOut cancel(String taskId) throws IOException, ApiException {
        return this.client.executeRequest(
                "PUT", this.client.newUrlBuilder().encodedPath("/api/v1/background-tasks/" + taskId).build(),
                null, null, BackgroundTaskOut.class);
    }
}
