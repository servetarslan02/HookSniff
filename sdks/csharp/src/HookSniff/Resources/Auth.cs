using HookSniff.Model;

namespace HookSniff.Resources;

/// <summary>
/// Auth resource — login, register, 2FA, password management.
/// </summary>
public class Auth
{
    private readonly RequestContext _ctx;

    internal Auth(RequestContext ctx) => _ctx = ctx;

    /// <summary>Login with email and password.</summary>
    public async Task<AuthResponse> LoginAsync(LoginRequest body)
    {
        var req = new Request("POST", "/v1/auth/login");
        req.SetBody(body);
        return (await req.SendAsync<AuthResponse>(_ctx))!;
    }

    /// <summary>Register a new account.</summary>
    public async Task<AuthResponse> RegisterAsync(RegisterRequest body)
    {
        var req = new Request("POST", "/v1/auth/register");
        req.SetBody(body);
        return (await req.SendAsync<AuthResponse>(_ctx))!;
    }

    /// <summary>Change the current user's password.</summary>
    public async Task ChangePasswordAsync(ChangePasswordRequest body)
    {
        var req = new Request("POST", "/v1/auth/change-password");
        req.SetBody(body);
        await req.SendVoidAsync(_ctx);
    }
}
