const nodemailer = require("nodemailer");
const logger = require("../config/logger");

// ─── Create reusable transporter ─────────────────────────────────────────────
const createTransporter = () =>
    nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === "true", // true → port 465, false → STARTTLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        // Gracefully handle slow SMTP servers (e.g. shared hosting)
        connectionTimeout: 10000, // 10s
        greetingTimeout: 5000,
        socketTimeout: 10000,
    });

/**
 * sendEmail — sends a single transactional email
 *
 * @param {object} options
 * @param {string|string[]} options.to       - Recipient(s)
 * @param {string}          options.subject  - Email subject
 * @param {string}          options.html     - HTML body
 * @param {string}          [options.text]   - Plain-text fallback (auto-stripped if omitted)
 * @param {string}          [options.replyTo]- Reply-to address
 * @returns {Promise<object>} Nodemailer info object
 */
const sendEmail = async ({ to, subject, html, text, replyTo }) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || "Panzer IT"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        html,
        // Strip HTML tags for plain-text fallback if not explicitly provided
        text: text || html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(),
        ...(replyTo && { replyTo }),
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent to ${mailOptions.to} — MessageId: ${info.messageId}`);
        return info;
    } catch (err) {
        logger.error(`Failed to send email to ${mailOptions.to}: ${err.message}`);
        throw err; // let the caller decide whether to surface this to the user
    }
};

// ─── Pre-built templates ───────────────────────────────────────────────────────

/**
 * sendLeadNotification — notifies admin when a new lead is submitted
 *
 * @param {object} lead - Lead document from MongoDB
 */
const sendLeadNotification = async (lead) => {
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">New Lead — Panzer IT</h2>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Name</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${lead.name}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Email</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${lead.email}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Phone</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${lead.phone || "—"}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Company</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${lead.company || "—"}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Message</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${lead.message}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Source</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${lead.source || "Website"}</td></tr>
        <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Submitted</strong></td>
            <td style="padding:8px; border:1px solid #ddd;">${new Date(lead.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td></tr>
      </table>
      <p style="color:#888; font-size:12px; margin-top:16px;">
        This is an automated notification from panzerit.com
      </p>
    </div>
  `;

    return sendEmail({
        to: process.env.LEAD_NOTIFY_EMAIL,
        subject: `New Lead: ${lead.name} — ${lead.company || lead.email}`,
        html,
        replyTo: lead.email,
    });
};

/**
 * sendLeadAutoReply — sends a confirmation email to the person who submitted
 *
 * @param {object} lead - Lead document from MongoDB
 */
const sendLeadAutoReply = async (lead) => {
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Thank you for reaching out, ${lead.name}!</h2>
      <p>We've received your message and our team will get back to you within <strong>1–2 business days</strong>.</p>
      <p>In the meantime, feel free to explore our solutions at
        <a href="${process.env.FRONTEND_URL}" style="color:#0066cc;">panzerit.com</a>.
      </p>
      <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />
      <p style="color:#888; font-size:12px;">
        © ${new Date().getFullYear()} Panzer IT — Make IT Secure
      </p>
    </div>
  `;

    return sendEmail({
        to: lead.email,
        subject: "We received your message — Panzer IT",
        html,
    });
};

module.exports = { sendEmail, sendLeadNotification, sendLeadAutoReply };