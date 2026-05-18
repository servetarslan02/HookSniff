// This file is @generated
package com.hooksniff.kotlin.models

import com.hooksniff.kotlin.StringAnyMapSerializer
import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

@Serializable
data class EventTypeOut(
    val archived: Boolean? = null,
    val createdAt: Instant,
    val deprecated: Boolean,
    val description: String,
    val featureFlag: String? = null,
    val featureFlags: Set<String>? = null,
    /** The event type group's name */
    val groupName: String? = null,
    /** The event type's name */
    val name: String,
    @Serializable(with = StringAnyMapSerializer::class)
    /** The schema for the event type for a specific version as a JSON schema. */
    val schemas: Map<String, Any>? = null,
    val updatedAt: Instant,
)
