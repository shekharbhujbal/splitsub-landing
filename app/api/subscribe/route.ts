import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Require JSON
    const ct = req.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'Content-Type must be application/json' }, { status: 415 });
    }

    const { email } = await req.json();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
    }

    // Context (nice to store in Sheet)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const ua = req.headers.get('user-agent') || '';
    const source = 'splitsub.co';

    // Post to Google Apps Script Web App
    const sheetsUrl = process.env.SHEETS_WEBHOOK_URL;
    const sheetsSecret = process.env.SHEETS_SECRET;

    if (!sheetsUrl || !sheetsSecret) {
      console.warn('Missing SHEETS_WEBHOOK_URL or SHEETS_SECRET');
      return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });
    }

    const resp = await fetch(sheetsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source, ip, userAgent: ua, secret: sheetsSecret }),
    });

    // Apps Script usually responds 200 with JSON; we tolerate any 2xx
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      console.error('Sheets webhook error', resp.status, txt);
      return NextResponse.json({ ok: false, error: 'Sheet write failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('subscribe error', err?.message || err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Use POST' }, { status: 405 });
}
