import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const DEFAULT_FROM = 'HookSniff <noreply@hooksniff.vercel.app>';

export async function sendEmail({ to, subject, html, from = DEFAULT_FROM }: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email send failed:', err);
    return { success: false, error: err };
  }
}

// ─── Email Templates ───

export function verificationEmail(code: string) {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">🪝</span>
        <h1 style="color: #111827; font-size: 20px; margin-top: 8px;">Email Doğrulama</h1>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        HookSniff hesabını doğrulamak için aşağıdaki kodu kullan:
      </p>
      <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: monospace;">${code}</span>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        Bu kod 10 dakika geçerlidir. Eğer bu sen değilsen, bu emaili görmezden gel.
      </p>
    </div>
  `;
}

export function passwordResetEmail(resetUrl: string) {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">🪝</span>
        <h1 style="color: #111827; font-size: 20px; margin-top: 8px;">Şifre Sıfırlama</h1>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Şifreni sıfırlamak için aşağıdaki butona tıkla:
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="background: #4c6ef5; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Şifremi Sıfırla
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        Bu link 1 saat geçerlidir. Eğer bu sen değilsen, bu emaili görmezden gel.
      </p>
    </div>
  `;
}

export function deliveryFailedEmail(event: string, endpoint: string, attempts: number) {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">⚠️</span>
        <h1 style="color: #111827; font-size: 20px; margin-top: 8px;">Webhook Teslimatı Başarısız</h1>
      </div>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0;">
        <p style="color: #991b1b; font-size: 14px; margin: 0;">
          <strong>Event:</strong> ${event}<br/>
          <strong>Endpoint:</strong> ${endpoint}<br/>
          <strong>Deneme:</strong> ${attempts} kez denendi
        </p>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Webhook endpoint'inize teslimat yapılamadı. Lütfen endpoint durumunu kontrol edin.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://hooksniff.vercel.app/dashboard/deliveries" style="background: #4c6ef5; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Teslimatları Görüntüle
        </a>
      </div>
    </div>
  `;
}

export function welcomeEmail(name: string) {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">🪝</span>
        <h1 style="color: #111827; font-size: 20px; margin-top: 8px;">HookSniff'e Hoş Geldin!</h1>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Merhaba ${name},<br/><br/>
        HookSniff'e kayıt olduğun için teşekkürler! Webhook teslimatlarını güvenilir bir şekilde yönetmeye hemen başlayabilirsin.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://hooksniff.vercel.app/dashboard" style="background: #4c6ef5; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Dashboard'a Git
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Başlamak için:<br/>
        1. Bir endpoint oluştur<br/>
        2. API key al<br/>
        3. İlk webhook'unu gönder
      </p>
    </div>
  `;
}
