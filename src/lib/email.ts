import nodemailer from "nodemailer";

const transport = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number(process.env.SMTP_PORT ?? 1025),
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  await transport().sendMail({
    from: process.env.EMAIL_FROM ?? "no-reply@localhost",
    to,
    subject,
    text,
    html,
  });
}
