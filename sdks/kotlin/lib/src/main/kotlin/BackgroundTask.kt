package com.hooksniff.kotlin

class BackgroundTask(private val client: HookSniffHttpClient) {
    fun list(): List<BackgroundTaskOut> {
        return client.executeRequest("GET", "/api/v1/background-tasks")
    }

    fun get(taskId: String): BackgroundTaskOut {
        return client.executeRequest("GET", "/api/v1/background-tasks/$taskId")
    }

    fun cancel(taskId: String): BackgroundTaskOut {
        return client.executeRequest("PUT", "/api/v1/background-tasks/$taskId")
    }
}
