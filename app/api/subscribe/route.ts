import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    // 1) basic guards
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'Content-Type must be application/json' }, { status: 415 });
    }

    const { email } = await req.json();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
    }

    // 2) collect some context
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const ua = req.headers.get('user-agent') || '';
    const source = 'splitsub.co';

    // 3) fan-out: write to Google Sheet via Apps Script Web App
    const sheetsUrl = process.env.SHEETS_WEBHOOK_URL;
    const sheetsSecret = process.env.SHEETS_SECRET;
    if (!sheetsUrl || !sheetsSecret) {
      // Still allow flow, but let us know env is missing
      console.warn('Missing SHEETS_WEBHOOK_URL or SHEETS_SECRET');
    } else {
      const resp = await fetch(sheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, ip, userAgent: ua, secret: sheetsSecret }),
      });

      // If Apps Script returns non-2xx, log it (don’t fail the user UX)
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        console.error('Sheets webhook error', resp.status, txt);
      }
    }

    // 4) optional: send you an email notification using Namecheap SMTP
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const to = process.env.TO_EMAIL || user;

    if (host && user && pass && to) {
      try {
        const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
        await transporter.sendMail({
          from: `"SplitSub Waitlist" <${user}>`,
          to,
          subject: `New waitlist signup`,
          text: `Email: ${email}\nIP: ${ip}\nUA: ${ua}`,
          html: `<p><b>Email:</b> ${email}</p><p><b>IP:</b> ${ip}</p><p><b>UA:</b> ${ua}</p>`,
        });
      } catch (mailErr: any) {
        console.error('SMTP sendMail failed:', mailErr?.message || mailErr);
        // don’t block success for user if mail fails
      }
    }

    // 5) success response to client
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('subscribe error', err?.message || err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Use POST' }, { status: 405 });
}
