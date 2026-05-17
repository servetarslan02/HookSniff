// This file is @generated
package com.hooksniff.kotlin.models

import kotlinx.serialization.Serializable

@Serializable
data class EndpointHeadersOut(val headers: Map<String, String>, val sensitive: Set<String>)
