import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'Content-Type must be application/json' }, { status: 415 });
    }

    const { email } = await req.json();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const ua = req.headers.get('user-agent') || '';
    const source = 'splitsub.co';

    // --- Sheets webhook
    const sheetsUrl = process.env.SHEETS_WEBHOOK_URL;
    const sheetsSecret = process.env.SHEETS_SECRET;
    let sheetsStatus: number | null = null;
    let sheetsText: string | null = null;

    if (!sheetsUrl || !sheetsSecret) {
      console.warn('Sheets webhook missing env vars (SHEETS_WEBHOOK_URL / SHEETS_SECRET).');
    } else {
      try {
        const resp = await fetch(sheetsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source, ip, userAgent: ua, secret: sheetsSecret }),
        });
        sheetsStatus = resp.status;
        // Apps Script often returns 200 with a JSON body; capture it for debugging
        sheetsText = await resp.text();
        console.log('Sheets webhook result:', sheetsStatus, sheetsText);
      } catch (e: any) {
        console.error('Sheets webhook fetch failed:', e?.message || e);
      }
    }

    // --- Optional: email notification (only if SMTP vars exist)
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
      }
    }

    // return a small hint to help us debug without exposing secrets
    return NextResponse.json({
      ok: true,
      _sheetHint: typeof sheetsStatus === 'number' ? `sheets:${sheetsStatus}` : 'sheets:skipped',
    });
  } catch (err: any) {
    console.error('subscribe error', err?.message || err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Use POST' }, { status: 405 });
}
