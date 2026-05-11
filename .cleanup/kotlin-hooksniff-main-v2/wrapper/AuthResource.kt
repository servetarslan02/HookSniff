package hooksniff.sdk.wrapper

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

/**
 * Authentication — register, login, 2FA, password management.
 */
class AuthResource(private val client: HookSniff) {

    private val gson = Gson()
    private val mapType = object : TypeToken<Map<String, Any?>>() {}.type

    /** Register a new user. */
    fun register(input: Map<String, Any?>): Map<String, Any?> {
        val json = client.post("/v1/auth/register", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }

    /** Login. */
    fun login(input: Map<String, Any?>): Map<String, Any?> {
        val json = client.post("/v1/auth/login", gson.toJson(input))
        return gson.fromJson(json, mapType)
    }

    /** Get current user profile. */
    fun me(): Map<String, Any?> {
        val json = client.get("/v1/auth/me")
        return gson.fromJson(json, mapType)
    }

    /** Logout. */
    fun logout() {
        client.post("/v1/auth/logout")
    }

    /** Change password. */
    fun changePassword(input: Map<String, Any?>) {
        client.post("/v1/auth/change-password", gson.toJson(input))
    }

    /** Forgot password. */
    fun forgotPassword(input: Map<String, Any?>) {
        client.post("/v1/auth/forgot-password", gson.toJson(input))
    }

    /** Reset password. */
    fun resetPassword(input: Map<String, Any?>) {
        client.post("/v1/auth/reset-password", gson.toJson(input))
    }
}
