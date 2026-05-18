import Foundation

/// Auth resource — login, register, password management.
public final class AuthResource {
    private let client: HookSniff

    init(client: HookSniff) {
        self.client = client
    }

    /// Login with email and password.
    public func login(email: String, password: String) async throws -> [String: Any] {
        let body = try await client.requestJSON(method: "POST", path: "/v1/auth/login", body: [
            "email": email,
            "password": password
        ])
        return JSONHelpers.dict(from: body)
    }

    /// Register a new account.
    public func register(email: String, password: String, name: String? = nil) async throws -> [String: Any] {
        var params: [String: Any] = ["email": email, "password": password]
        if let name = name { params["name"] = name }
        let body = try await client.requestJSON(method: "POST", path: "/v1/auth/register", body: params)
        return JSONHelpers.dict(from: body)
    }

    /// Change the current user's password.
    public func changePassword(currentPassword: String, newPassword: String) async throws {
        _ = try await client.request(method: "POST", path: "/v1/auth/change-password", body: [
            "current_password": currentPassword,
            "new_password": newPassword
        ])
    }
}
