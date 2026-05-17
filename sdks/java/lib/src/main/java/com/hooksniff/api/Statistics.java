package com.hooksniff.api;

import com.hooksniff.HookSniffHttpClient;
import com.hooksniff.exceptions.ApiException;

import okhttp3.HttpUrl;

import java.io.IOException;

public class Statistics {
    private final HookSniffHttpClient client;

    public Statistics(HookSniffHttpClient client) {
        this.client = client;
    }
}
