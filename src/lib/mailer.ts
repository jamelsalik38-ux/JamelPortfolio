import nodemailer from "nodemailer";

/**
 * Sends the contact form straight to your Gmail inbox using Gmail's own
 * SMTP server. Requires two environment variables — see README →
 * "Wiring up real email delivery" for how to generate an App Password.
 *
 *   GMAIL_USER=youraddress@gmail.com
 *   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
 *
 * If these aren't set, this function is skipped — the message still gets
 * saved to data/messages.json so nothing is lost, you'd just need to check
 * that file instead of your inbox.
 */
export function isMailerConfigured() {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

export async function sendContactEmail(entry: {
  name: string;
  email: string;
  message: string;
}) {
  if (!isMailerConfigured()) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Portfolio Contact Form" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: entry.email,
    subject: `New portfolio message from ${entry.name}`,
    text: `From: ${entry.name} <${entry.email}>\n\n${entry.message}`,
    html: `
      <p><strong>From:</strong> ${entry.name} (${entry.email})</p>
      <p>${entry.message.replace(/\n/g, "<br/>")}</p>
    `,
  });
}
