//! Email templates for HookSniff notifications.
//!
//! All templates support Turkish (Tr) and English (En) languages.

/// Language for email templates. Defaults to Turkish (primary market).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Default)]
pub enum Language {
    #[default]
    Tr,
    En,
}

impl Language {
    pub fn parse_lang(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "en" | "english" => Self::En,
            _ => Self::Tr,
        }
    }

    /// Detect language from Accept-Language header value.
    /// Checks the primary language tag (e.g. "en-US" → En, "tr" → Tr).
    /// Defaults to English for non-Turkish languages (international users).
    pub fn from_accept_language(header: &str) -> Self {
        let primary = header.split(',').next().unwrap_or("").trim();
        let lang_tag = primary.split(';').next().unwrap_or("").trim().to_lowercase();
        if lang_tag.starts_with("tr") {
            Self::Tr
        } else {
            Self::En
        }
    }
}

/// Wrap content in the standard HookSniff email HTML template.
fn email_html(content: &str) -> String {
    format!(
        r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
{}
  <p style="margin-top: 24px; color: #6b7280;">— {}</p>
</body>
</html>"#,
        content,
        "HookSniff"
    )
}

pub fn tpl_welcome(display_name: &str, lang: Language) -> (&'static str, String) {
    match lang {
        Language::Tr => (
            "HookSniff'e Hoş Geldiniz!",
            email_html(&format!(
                r#"  <h1 style="color: #6d28d9;">HookSniff'e Hoş Geldiniz, {display_name}! 🎉</h1>
  <p>Hesabınız başarıyla oluşturuldu.</p>
  <p>Artık uç noktalar oluşturabilir, webhook'lar kurabilir ve teslimatlarınızı izlemeye başlayabilirsiniz.</p>"#
            )),
        ),
        Language::En => (
            "Welcome to HookSniff!",
            email_html(&format!(
                r#"  <h1 style="color: #6d28d9;">Welcome to HookSniff, {display_name}! 🎉</h1>
  <p>Your account has been created successfully.</p>
  <p>You can now create endpoints, set up webhooks, and start monitoring your deliveries.</p>"#
            )),
        ),
    }
}

pub fn tpl_verification(verification_url: &str, lang: Language) -> (&'static str, String) {
    match lang {
        Language::Tr => (
            "HookSniff hesabınızı doğrulayın",
            email_html(&format!(
                r#"  <h1 style="color: #6d28d9;">E-posta adresinizi doğrulayın</h1>
  <p>E-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
  <p><a href="{verification_url}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">E-postayı Doğrula</a></p>
  <p style="color:#6b7280;font-size:14px;">Bu bağlantı 24 saat içinde geçerliliğini yitirir. Bir hesap oluşturmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>"#
            )),
        ),
        Language::En => (
            "Verify your HookSniff account",
            email_html(&format!(
                r#"  <h1 style="color: #6d28d9;">Verify your email</h1>
  <p>Click the link below to verify your email address:</p>
  <p><a href="{verification_url}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Verify Email</a></p>
  <p style="color:#6b7280;font-size:14px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>"#
            )),
        ),
    }
}

pub fn tpl_password_reset(reset_url: &str, lang: Language) -> (&'static str, String) {
    match lang {
        Language::Tr => (
            "HookSniff şifrenizi sıfırlayın",
            format!(
                r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #6d28d9;">Şifre Sıfırlama Talebi</h1>
  <p>Şifrenizi sıfırlamak istediniz. Aşağıdaki bağlantıya tıklayın:</p>
  <p>
    <a href="{reset_url}"
       style="display:inline-block;background:#6d28d9;color:#fff;
              padding:12px 24px;border-radius:6px;text-decoration:none;
              font-weight:bold;">
      Şifreyi Sıfırla
    </a>
  </p>
  <p style="color:#6b7280;font-size:14px;">
    Bu bağlantı 1 saat içinde geçerliliğini yitirir. Bu talebi siz yapmadıysanız bu e-postayı güvenle görmezden gelebilirsiniz.
  </p>
  <p style="margin-top: 24px; color: #6b7280;">— HookSniff Ekibi</p>
</body>
</html>"#
            ),
        ),
        Language::En => (
            "Reset your HookSniff password",
            format!(
                r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #6d28d9;">Password Reset Request</h1>
  <p>You requested to reset your password. Click the link below:</p>
  <p>
    <a href="{reset_url}"
       style="display:inline-block;background:#6d28d9;color:#fff;
              padding:12px 24px;border-radius:6px;text-decoration:none;
              font-weight:bold;">
      Reset Password
    </a>
  </p>
  <p style="color:#6b7280;font-size:14px;">
    This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
  </p>
  <p style="margin-top: 24px; color: #6b7280;">— The HookSniff Team</p>
</body>
</html>"#
            ),
        ),
    }
}

pub fn tpl_delivery_failed(
    endpoint_name: &str,
    error_details: &str,
    lang: Language,
) -> (String, String) {
    match lang {
        Language::Tr => (
            format!("⚠️ Teslimat başarısız: {}", endpoint_name),
            format!(
                r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #dc2626;">Webhook Teslimatı Başarısız ⚠️</h1>
  <p><strong>{endpoint_name}</strong> adresine yapılan webhook teslimatı başarısız oldu.</p>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;
              padding:16px;margin:16px 0;">
    <pre style="margin:0;white-space:pre-wrap;font-size:13px;color:#991b1b;">{error_details}</pre>
  </div>
  <p>HookSniff kontrol panelinizden teslimat günlüklerinizi kontrol edin.</p>
  <p style="margin-top: 24px; color: #6b7280;">— HookSniff Ekibi</p>
</body>
</html>"#
            ),
        ),
        Language::En => (
            format!("⚠️ Delivery failed: {}", endpoint_name),
            format!(
                r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #dc2626;">Webhook Delivery Failed ⚠️</h1>
  <p>A webhook delivery to <strong>{endpoint_name}</strong> has failed.</p>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;
              padding:16px;margin:16px 0;">
    <pre style="margin:0;white-space:pre-wrap;font-size:13px;color:#991b1b;">{error_details}</pre>
  </div>
  <p>Check your delivery logs in the HookSniff dashboard for more details.</p>
  <p style="margin-top: 24px; color: #6b7280;">— The HookSniff Team</p>
</body>
</html>"#
            ),
        ),
    }
}

pub fn tpl_invoice(
    invoice_number: &str,
    amount: &str,
    plan_name: &str,
    period_start: &str,
    period_end: &str,
    payment_url: Option<&str>,
    lang: Language,
) -> (&'static str, String) {
    let payment_section = match (payment_url, lang) {
        (Some(url), Language::Tr) => format!(
            r#"<p>
    <a href="{url}"
       style="display:inline-block;background:#6d28d9;color:#fff;
              padding:12px 24px;border-radius:6px;text-decoration:none;
              font-weight:bold;">
      Ödemeyi Tamamla
    </a>
  </p>"#
        ),
        (Some(url), Language::En) => format!(
            r#"<p>
    <a href="{url}"
       style="display:inline-block;background:#6d28d9;color:#fff;
              padding:12px 24px;border-radius:6px;text-decoration:none;
              font-weight:bold;">
      Complete Payment
    </a>
  </p>"#
        ),
        (None, _) => String::new(),
    };

    match lang {
        Language::Tr => (
            "HookSniff Fatura / Makbuz",
            format!(
                r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #6d28d9;">Fatura / Makbuz 🧾</h1>
  <p>HookSniff aboneliğiniz için faturanız hazır.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Fatura No</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;">{invoice_number}</td>
    </tr>
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Plan</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;">{plan_name}</td>
    </tr>
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Dönem</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;">{period_start} — {period_end}</td>
    </tr>
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Tutar</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;font-size:18px;color:#059669;">{amount}</td>
    </tr>
  </table>
  {payment_section}
  <p style="margin-top: 24px; color: #6b7280;">— HookSniff Ekibi</p>
</body>
</html>"#
            ),
        ),
        Language::En => (
            "HookSniff Invoice / Receipt",
            format!(
                r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #6d28d9;">Invoice / Receipt 🧾</h1>
  <p>Your invoice for the HookSniff subscription is ready.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Invoice #</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;">{invoice_number}</td>
    </tr>
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Plan</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;">{plan_name}</td>
    </tr>
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Period</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;">{period_start} — {period_end}</td>
    </tr>
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Amount</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;font-size:18px;color:#059669;">{amount}</td>
    </tr>
  </table>
  {payment_section}
  <p style="margin-top: 24px; color: #6b7280;">— The HookSniff Team</p>
</body>
</html>"#
            ),
        ),
    }
}

pub fn tpl_webhook_success(endpoint_name: &str, lang: Language) -> (&'static str, String) {
    match lang {
        Language::Tr => (
            "✅ Webhook başarıyla teslim edildi",
            format!(
                r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #059669;">Webhook Başarıyla Teslim Edildi ✅</h1>
  <p><strong>{endpoint_name}</strong> adresine yapılan webhook teslimatı başarıyla tamamlandı.</p>
  <p>HookSniff kontrol panelinizden teslimat ayrıntılarını görüntüleyebilirsiniz.</p>
  <p style="margin-top: 24px; color: #6b7280;">— HookSniff Ekibi</p>
</body>
</html>"#
            ),
        ),
        Language::En => (
            "✅ Webhook delivered successfully",
            format!(
                r#"<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #059669;">Webhook Delivered Successfully ✅</h1>
  <p>The webhook delivery to <strong>{endpoint_name}</strong> completed successfully.</p>
  <p>You can view the delivery details in your HookSniff dashboard.</p>
  <p style="margin-top: 24px; color: #6b7280;">— The HookSniff Team</p>
</body>
</html>"#
            ),
        ),
    }
}
