// This file is @generated
package com.hooksniff.kotlin.models

import kotlinx.serialization.Serializable

@Serializable
data class MessagePrecheckIn(
    val channels: Set<String>? = null,
    /** The event type's name */
    val eventType: String,
)
