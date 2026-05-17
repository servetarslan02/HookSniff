// This file is @generated
package com.hooksniff.kotlin.models

import com.hooksniff.kotlin.StringAnyMapSerializer
import kotlinx.serialization.Serializable

@Serializable
data class EventTypeFromOpenApi(
    val deprecated: Boolean,
    val description: String,
    /** Deprecated, use `featureFlags` instead. */
    val featureFlag: String? = null,
    val featureFlags: Set<String>? = null,
    /** The event type group's name */
    val groupName: String? = null,
    /** The event type's name */
    val name: String,
    @Serializable(with = StringAnyMapSerializer::class) val schemas: Map<String, Any>? = null,
)
