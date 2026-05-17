// This file is @generated
package com.hooksniff.kotlin.models

import com.hooksniff.kotlin.MaybeUnset
import kotlinx.serialization.Serializable

@Serializable
data class EndpointTransformationPatch(
    val code: MaybeUnset<String> = MaybeUnset.Unset,
    val enabled: Boolean? = null,
)
