// This file is @generated
package com.hooksniff.kotlin.models

import kotlinx.serialization.Serializable

@Serializable
data class ListResponseMessageOut(
    val data: List<MessageOut>,
    val done: Boolean,
    val iterator: String? = null,
    val prevIterator: String? = null,
)
