// This file is @generated
package com.hooksniff.kotlin.models

import kotlinx.serialization.Serializable

@Serializable
data class MessagePrecheckOut(
    /** Whether there are any active endpoint that would get sent such a message. */
    val active: Boolean
)
