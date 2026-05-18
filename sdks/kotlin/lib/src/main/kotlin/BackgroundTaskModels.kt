package com.hooksniff.kotlin

data class BackgroundTaskOut(
    val id: String,
    val customerId: String,
    val taskType: String,
    val status: String,
    val data: Map<String, Any>? = null,
    val result: Map<String, Any>? = null,
    val error: String? = null,
    val progress: Int = 0,
    val createdAt: String,
    val startedAt: String? = null,
    val finishedAt: String? = null
)
