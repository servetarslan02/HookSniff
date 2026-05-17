// This file is @generated
package com.hooksniff.kotlin.models

import kotlinx.serialization.Serializable

@Serializable
data class ListResponseEventTypeOut(
    val data: List<EventTypeOut>,
    val done: Boolean,
    val iterator: String? = null,
    val prevIterator: String? = null,
)
