package com.hooksniff.kotlin

class Environment(private val client: HookSniffHttpClient) {
    fun list(): List<EnvironmentModelOut> {
        return client.executeRequest("GET", "/api/v1/environments")
    }

    fun create(body: EnvironmentIn): EnvironmentModelOut {
        return client.executeRequest("POST", "/api/v1/environments", body)
    }

    fun get(environmentId: String): EnvironmentModelOut {
        return client.executeRequest("GET", "/api/v1/environments/$environmentId")
    }

    fun update(environmentId: String, body: EnvironmentPatch): EnvironmentModelOut {
        return client.executeRequest("PUT", "/api/v1/environments/$environmentId", body)
    }

    fun delete(environmentId: String) {
        client.executeRequest<Any>("DELETE", "/api/v1/environments/$environmentId")
    }

    fun listVariables(environmentId: String): List<EnvironmentVariableOut> {
        return client.executeRequest("GET", "/api/v1/environments/$environmentId/variables")
    }

    fun getVariable(environmentId: String, variableId: String): EnvironmentVariableOut {
        return client.executeRequest("GET", "/api/v1/environments/$environmentId/variables/$variableId")
    }

    fun createVariable(environmentId: String, body: EnvironmentVariableIn): EnvironmentVariableOut {
        return client.executeRequest("POST", "/api/v1/environments/$environmentId/variables", body)
    }

    fun updateVariable(environmentId: String, variableId: String, body: EnvironmentVariableIn): EnvironmentVariableOut {
        return client.executeRequest("PUT", "/api/v1/environments/$environmentId/variables/$variableId", body)
    }

    fun deleteVariable(environmentId: String, variableId: String) {
        client.executeRequest<Any>("DELETE", "/api/v1/environments/$environmentId/variables/$variableId")
    }

    fun bulkUpsertVariables(environmentId: String, body: EnvironmentVariableBulkUpsertIn): List<EnvironmentVariableOut> {
        return client.executeRequest("POST", "/api/v1/environments/$environmentId/variables/bulk", body)
    }
}
