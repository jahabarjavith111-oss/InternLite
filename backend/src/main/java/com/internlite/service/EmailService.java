package com.internlite.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Sends mail via Gmail SMTP (abduljahabar10@gmail.com) but presents
 * From as "InternLite <no-reply@internlite.com>" so the user only sees
 * Internlite.com as a no-reply sender.
 */
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from-address:no-reply@internlite.com}")
    private String fromAddress;

    @Value("${app.mail.from-name:InternLite}")
    private String fromName;

    @Value("${app.mail.reply-to:no-reply@internlite.com}")
    private String replyTo;

    public void sendOtpMail(String toEmail, String firstName, String otp, int expiryMinutes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            // Displayed sender: InternLite <no-reply@internlite.com>
            // Envelope/actual sender remains the authenticated Gmail account.
            helper.setFrom(new InternetAddress(fromAddress, fromName));
            helper.setReplyTo(replyTo);
            helper.setSubject("Your InternLite verification code: " + otp);
            helper.setText(buildHtml(firstName, otp, expiryMinutes), true);
            try {
                helper.addInline("logo", new ClassPathResource("logo.png"));
            } catch (Exception ignored) {
                // Logo missing from resources: mail still sends without it
            }
            mailSender.send(message);
        } catch (Exception e) {
            // Log only — OtpService decides whether to fail or run in dev-log mode
            throw new RuntimeException("Failed to send OTP mail: " + e.getMessage(), e);
        }
    }

    /** Exact user-supplied template: Hi {{firstName}}, ... # {{OTP}} ... Expires in 10 minutes ... */
    private String buildHtml(String firstName, String otp, int expiryMinutes) {
        String safeName = (firstName == null || firstName.isBlank()) ? "there" : escape(firstName.trim().split("\\s+")[0]);
        return """
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
              <div style="background:#ffffff;padding:16px 24px;text-align:center;border-bottom:1px solid #e5e7eb">
                <img src="cid:logo" alt="InternLite - Discover - Apply - Grow" style="max-width:280px;width:100%%;height:auto;display:inline-block" />
              </div>
              <div style="background:linear-gradient(135deg,#D4AF37,#B8860B);color:#241C00;padding:20px 24px">
                <h2 style="margin:0">Verify your email</h2>
                <p style="margin:4px 0 0;opacity:.85">Connect. Apply. Grow.</p>
              </div>
              <div style="padding:24px;color:#111827">
                <p>Hi %s,</p>
                <p>You&apos;re almost there! \uD83D\uDC4B</p>
                <p>Use the verification code below to complete your InternLite account verification:</p>
                <div style="font-size:32px;font-weight:800;letter-spacing:8px;text-align:center;background:#f3f4f6;border-radius:8px;padding:14px;margin:16px 0"># %s</div>
                <p><b>Expires in %d minutes</b></p>
                <p>Please don&apos;t share this code with anyone. InternLite will never ask you to disclose your verification code.</p>
                <p>If you didn&apos;t request this code, no action is required.</p>
                <p>Thanks for choosing <b>InternLite</b>.</p>
                <p style="margin-top:20px"><b>InternLite Team</b><br/><span style="color:#8A6D1B">Connect. Apply. Grow.</span></p>
                <p style="color:#6b7280;font-size:12px;margin-top:16px">This is an automated no-reply message from InternLite (no-reply@internlite.com). Please do not reply.</p>
              </div>
            </div>
            """.formatted(safeName, escape(otp), expiryMinutes);
    }

    private String escape(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
