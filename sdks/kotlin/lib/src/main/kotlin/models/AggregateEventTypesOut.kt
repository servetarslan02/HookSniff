// This file is @generated
package com.hooksniff.kotlin.models

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
data class AggregateEventTypesOut(
    /** The QueueBackgroundTask's ID. */
    val id: String,
    val status: BackgroundTaskStatus,
    val task: BackgroundTaskType,
    val updatedAt: Instant,
)
