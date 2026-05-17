package com.hooksniff.kotlin

import com.hooksniff.kotlin.HookSniffOptions
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull

class HookSniff(token: String, options: HookSniffOptions = HookSniffOptions()) {
    val authentication: Authentication
    val endpoint: Endpoint
    val eventType: EventType
    val health: Health
    val message: Message
    val messageAttempt: MessageAttempt
    val statistics: Statistics
    val environment: Environment
    val backgroundTask: BackgroundTask
    val operationalWebhook: OperationalWebhook

    init {
        if (options.baseUrl == null) {
            options.baseUrl = "https://hooksniff-api-1046140057667.europe-west1.run.app"
        }
        val parsedUrl = options.baseUrl?.toHttpUrlOrNull() ?: throw Exception("Invalid base url")
        val defaultHeaders =
            mapOf("User-Agent" to "hooksniff-libs/${Version}/kotlin", "Authorization" to "Bearer $token")
        val httpClient = HookSniffHttpClient(parsedUrl, defaultHeaders, options.retrySchedule)
        authentication = Authentication(httpClient)
        endpoint = Endpoint(httpClient)
        eventType = EventType(httpClient)
        health = Health(httpClient)
        message = Message(httpClient)
        messageAttempt = MessageAttempt(httpClient)
        statistics = Statistics(httpClient)
        environment = Environment(httpClient)
        backgroundTask = BackgroundTask(httpClient)
        operationalWebhook = OperationalWebhook(httpClient)
    }
}
