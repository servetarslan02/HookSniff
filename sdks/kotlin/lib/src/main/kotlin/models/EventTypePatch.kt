// This file is @generated
package com.hooksniff.kotlin.models

import com.hooksniff.kotlin.MaybeUnset
import com.hooksniff.kotlin.MaybeUnsetStringAnyMapSerializer
import kotlinx.serialization.Serializable

@Serializable
data class EventTypePatch(
    val archived: Boolean? = null,
    val deprecated: Boolean? = null,
    val description: String? = null,
    /** Deprecated, use `featureFlags` instead. */
    val featureFlag: MaybeUnset<String> = MaybeUnset.Unset,
    val featureFlags: MaybeUnset<Set<String>> = MaybeUnset.Unset,
    /** The event type group's name */
    val groupName: MaybeUnset<String> = MaybeUnset.Unset,
    @Serializable(with = MaybeUnsetStringAnyMapSerializer::class)
    val schemas: MaybeUnset<Map<String, Any>> = MaybeUnset.Unset,
)
