package com.internlite.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;

/**
 * Sends mail two ways:
 *  1. Brevo HTTPS API (when BREVO_API_KEY is set) — works on Render FREE tier,
 *     which blocks outbound SMTP ports 25/465/587 since Sep 2025.
 *  2. Gmail SMTP (fallback / local dev) — works locally where SMTP is allowed.
 * Either way the user sees From as "InternLite"; Reply-To is no-reply@internlite.com.
 */
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String smtpUsername;

    @Value("${app.mail.from-name:InternLite}")
    private String fromName;

    @Value("${app.mail.reply-to:no-reply@internlite.com}")
    private String replyTo;

    /** Brevo (brevo.com) API key — enables HTTPS sending for Render free tier. */
    @Value("${app.mail.brevo-api-key:}")
    private String brevoApiKey;

    /**
     * Optional verified sender for Brevo. Defaults to spring.mail.username
     * (your Gmail) — verify that address under Brevo → Senders & Attributions.
     */
    @Value("${app.mail.brevo-sender:}")
    private String brevoSender;

    public void sendOtpMail(String toEmail, String firstName, String otp, int expiryMinutes) {
        String subject = "Your InternLite verification code: " + otp;
        String html = buildHtml(firstName, otp, expiryMinutes);
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            sendViaBrevo(toEmail, subject, html);
            return;
        }
        sendViaSmtp(toEmail, subject, html);
    }

    private void sendViaBrevo(String toEmail, String subject, String html) {
        String senderEmail = (brevoSender != null && !brevoSender.isBlank())
            ? brevoSender.trim() : smtpUsername;
        Map<String, Object> payload = Map.of(
            "sender", Map.of("email", senderEmail, "name", fromName),
            "to", List.of(Map.of("email", toEmail)),
            "subject", subject,
            "htmlContent", html,
            "replyTo", Map.of("email", replyTo)
        );
        try {
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(10_000);
            factory.setReadTimeout(20_000);
            RestClient.builder().requestFactory(factory).build()
                .post()
                .uri("https://api.brevo.com/v3/smtp/email")
                .header("api-key", brevoApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toBodilessEntity();
        } catch (RestClientResponseException e) {
            throw new RuntimeException("Brevo API rejected the email (HTTP "
                + e.getStatusCode() + "): " + e.getResponseBodyAsString()
                + " — verify your sender address at https://app.brevo.com/mail/settings/senders", e);
        } catch (RuntimeException e) {
            throw new RuntimeException("Could not reach Brevo API: " + e.getMessage(), e);
        }
    }

    private void sendViaSmtp(String toEmail, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            // From must be the authenticated Gmail account or Gmail SMTP rejects the send
            helper.setFrom(new InternetAddress(smtpUsername, fromName));
            helper.setReplyTo(replyTo);
            helper.setSubject(subject);
            helper.setText(html, true);
            try {
                // Mail-sized logo (33KB) so SMTP upload stays fast
                helper.addInline("logo", new ClassPathResource("logo-mail.png"));
            } catch (Exception ignored) {
                // Logo missing from resources: mail still sends without it
            }
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException(
                "SMTP send failed: " + e.getMessage()
                + ". NOTE: Render FREE tier blocks SMTP ports 25/465/587 — set the BREVO_API_KEY "
                + "environment variable to send email from Render (Brevo HTTPS API), or upgrade the instance.", e);
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
