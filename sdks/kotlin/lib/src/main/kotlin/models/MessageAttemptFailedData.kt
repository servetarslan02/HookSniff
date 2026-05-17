// This file is @generated
package com.hooksniff.kotlin.models

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
data class MessageAttemptFailedData(
    /** The MessageAttempt's ID. */
    val id: String,
    val responseStatusCode: Short,
    val timestamp: Instant,
)
