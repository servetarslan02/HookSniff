package com.hooksniff.kotlin

data class EnvironmentModelOut(
    val id: String,
    val customerId: String,
    val name: String,
    val slug: String,
    val description: String? = null,
    val isDefault: Boolean,
    val color: String? = null,
    val createdAt: String,
    val updatedAt: String,
    val variableCount: Long? = null
)

data class EnvironmentIn(
    val name: String,
    val slug: String? = null,
    val description: String? = null,
    val isDefault: Boolean? = null,
    val color: String? = null
)

data class EnvironmentPatch(
    val name: String? = null,
    val description: String? = null,
    val isDefault: Boolean? = null,
    val color: String? = null
)

data class EnvironmentVariableOut(
    val id: String,
    val environmentId: String,
    val key: String,
    val value: String,
    val isSecret: Boolean,
    val createdAt: String,
    val updatedAt: String
)

data class EnvironmentVariableIn(
    val key: String,
    val value: String,
    val isSecret: Boolean? = null
)

data class EnvironmentVariableBulkUpsertIn(
    val variables: List<EnvironmentVariableIn>
)
