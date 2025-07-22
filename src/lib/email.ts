import { Resend } from "resend";
import { env } from "~/env";

const resend = new Resend(env.RESEND_API_KEY);

interface SendPasswordResetEmailParams {
  email: string;
  resetUrl: string;
  userName?: string;
}

export async function sendPasswordResetEmail({
  email,
  resetUrl,
  userName,
}: SendPasswordResetEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: email,
      subject: "Восстановление пароля - SafeSurf VPN",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Восстановление пароля</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
              }
              .header {
                text-align: center;
                padding: 20px 0;
                border-bottom: 1px solid #e4e4e4;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                color: #0066cc;
              }
              .content {
                padding: 30px 0;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #0066cc;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                padding: 20px 0;
                border-top: 1px solid #e4e4e4;
                color: #666;
                font-size: 14px;
              }
              .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 4px;
                padding: 12px;
                margin: 20px 0;
                color: #856404;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🛡️ SafeSurf VPN</div>
              </div>
              
              <div class="content">
                <h2>Восстановление пароля</h2>
                
                <p>Здравствуйте${userName ? `, ${userName}` : ''}!</p>
                
                <p>Мы получили запрос на восстановление пароля для вашего аккаунта SafeSurf VPN.</p>
                
                <p>Чтобы установить новый пароль, нажмите на кнопку ниже:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Восстановить пароль</a>
                </div>
                
                <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
                <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
                  ${resetUrl}
                </p>
                
                <div class="warning">
                  <strong>Важно:</strong> Эта ссылка действительна в течение 1 часа. 
                  Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.
                </div>
                
                <p>Если у вас возникли проблемы, свяжитесь с нашей службой поддержки.</p>
              </div>
              
              <div class="footer">
                <p>С уважением,<br>Команда SafeSurf VPN</p>
                <p style="color: #999; font-size: 12px;">
                  Это автоматическое сообщение. Пожалуйста, не отвечайте на него.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send password reset email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
}