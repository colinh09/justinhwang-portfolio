import { NextResponse } from "next/server";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const TO_EMAIL = "JKH.Build@gmail.com";

interface Body {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { error: "That email address doesn't look right." },
      { status: 400 }
    );
  }
  if (message.length > 5000) {
    return NextResponse.json(
      { error: "Message is too long (5000 char max)." },
      { status: 400 }
    );
  }

  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const fromEmail = process.env.SES_FROM_EMAIL;

  if (!region || !accessKeyId || !secretAccessKey || !fromEmail) {
    return NextResponse.json(
      {
        error:
          "Email service isn't configured yet. Please email JKH.Build@gmail.com directly.",
      },
      { status: 503 }
    );
  }

  try {
    const ses = new SESv2Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
    const finalSubject = subject
      ? `[Portfolio] ${subject}`
      : `[Portfolio] New message from ${name}`;

    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: fromEmail,
        Destination: { ToAddresses: [TO_EMAIL] },
        ReplyToAddresses: [email],
        Content: {
          Simple: {
            Subject: { Data: finalSubject, Charset: "UTF-8" },
            Body: {
              Text: {
                Data: `From: ${name} <${email}>\n\n${message}`,
                Charset: "UTF-8",
              },
            },
          },
        },
      })
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return NextResponse.json(
      { error: "Couldn't send the message. Please email directly." },
      { status: 500 }
    );
  }
}
