'use client';

import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState<string>('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const ct = res.headers.get('content-type') || '';
      const isJson = ct.includes('application/json');
      const data = isJson ? await res.json() : { ok: false, error: 'Non-JSON response' };

      if (!res.ok || !data?.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setStatus('success');
      setMsg('You’re on the list! We’ll be in touch soon.');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMsg(err?.message || 'Something went wrong. Try again.');
    }
  }

  // simple anti-bot honeypot (ignored by humans, caught by bots)
  const [hp, setHp] = useState('');
  const isBot = hp.trim().length > 0;

  return (
    <main>
      {/* --- Global Styles (minimal, premium) --- */}
      <style jsx global>{`
        :root {
          --bg: #0b0c10;
          --card: #101217;
          --muted: #a7b0c0;
          --text: #e9eef7;
          --brand: #5aa0ff; /* primary accent */
          --brand-2: #7e6bff; /* gradient stop */
          --ok: #10b981;
          --err: #ef4444;
          --border: #1b2230;
        }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }
        a { color: inherit; text-decoration: none; }
        .container { max-width: 1120px; margin: 0 auto; padding: 24px; }
        .nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 0;
        }
        .brand {
          display: flex; align-items: center; gap: 10px; font-weight: 700; letter-spacing: 0.2px;
        }
        .brand-mark {
          width: 28px; height: 28px; border-radius: 8px;
          background: radial-gradient(120% 120% at 0% 0%, var(--brand) 0%, var(--brand-2) 60%, #3b82f6 100%);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 8px 28px rgba(90,160,255,0.25);
        }
        .pill {
          font-size: 12px; color: var(--muted); border: 1px solid var(--border); padding: 6px 10px; border-radius: 999px;
          background: rgba(255,255,255,0.02);
        }
        .hero {
          padding: 48px 0 24px;
          display: grid; gap: 24px;
        }
        .headline {
          font-weight: 800; font-size: clamp(28px, 6vw, 48px); line-height: 1.05;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #fff, #bcd6ff);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .sub {
          color: var(--muted); font-size: clamp(16px, 2.4vw, 18px); line-height: 1.6; max-width: 740px;
        }
        .card {
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border: 1px solid var(--border);
          border-radius: 16px; padding: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        }
        .form {
          display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center;
          background: rgba(12,14,20,0.6);
          border: 1px solid var(--border); border-radius: 12px; padding: 10px;
        }
        .input {
          width: 100%; padding: 14px 14px;
          background: #0b0e15; border: 1px solid #1f2836;
          border-radius: 10px; outline: none; color: var(--text); font-size: 16px;
          transition: border 120ms ease, box-shadow 120ms ease;
        }
        .input:focus { border-color: #2f4b7f; box-shadow: 0 0 0 4px rgba(90,160,255,0.15); }
        .btn {
          padding: 14px 18px; border-radius: 10px; border: none; cursor: pointer; font-weight: 700;
          color: white;
          background: linear-gradient(90deg, var(--brand), var(--brand-2));
          box-shadow: 0 10px 24px rgba(90,160,255,0.35);
          transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
        }
        .btn:disabled { opacity: 0.7; cursor: not-allowed; box-shadow: none; }
        .btn:hover:enabled { transform: translateY(-1px); box-shadow: 0 14px 30px rgba(90,160,255,0.4); }
        .note { font-size: 12px; color: var(--muted); margin-top: 8px; }
        .badges {
          display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px;
        }
        .badge {
          font-size: 12px; color: #cfe2ff; background: rgba(90,160,255,0.12);
          border: 1px solid rgba(90,160,255,0.25);
          padding: 6px 10px; border-radius: 999px;
        }
        .logos {
          display: grid; grid-template-columns: repeat(6, minmax(0,1fr));
          gap: 12px; margin-top: 18px;
        }
        .logo {
          height: 34px; border-radius: 10px; border: 1px dashed var(--border);
          color: var(--muted); display: grid; place-items: center;
          background: rgba(255,255,255,0.02);
        }
        .section { margin-top: 48px; }
        .grid3 {
          display: grid; gap: 16px; grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .feature {
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border: 1px solid var(--border); border-radius: 14px; padding: 18px;
        }
        .ficon {
          width: 36px; height: 36px; border-radius: 10px;
          display: grid; place-items: center; margin-bottom: 10px;
          background: rgba(90,160,255,0.15); color: #cfe2ff; font-weight: 900;
          border: 1px solid rgba(90,160,255,0.35);
        }
        .ftitle { font-weight: 700; margin-bottom: 6px; }
        .ftext { color: var(--muted); line-height: 1.6; }
        .footer {
          display: flex; gap: 16px; flex-wrap: wrap; align-items: center; justify-content: space-between;
          border-top: 1px solid var(--border); margin-top: 56px; padding: 18px 0; color: var(--muted);
          font-size: 14px;
        }
        .links { display: flex; gap: 14px; }
        @media (max-width: 860px) {
          .grid3 { grid-template-columns: 1fr; }
          .logos { grid-template-columns: repeat(3, minmax(0,1fr)); }
          .form { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="container">
        {/* Top nav */}
        <nav className="nav">
          <div className="brand">
            <div className="brand-mark" />
            <div style={{ fontSize: 18 }}>SplitSub</div>
            <span className="pill">Early Access</span>
          </div>
          <a href="#waitlist" className="pill">Join waitlist</a>
        </nav>

        {/* Hero */}
        <section className="hero">
          <h1 className="headline">
            Share Subscriptions. <br /> Split Costs. Save Together.
          </h1>
          <p className="sub">
            SplitSub makes premium streaming, software, and services affordable by letting you securely share with trusted people.
            Simple, safe, and global from day one.
          </p>

          {/* Logos (illustrative) */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
              Popular services our users love (illustrative)
            </div>
            <div className="logos" aria-hidden>
              <div className="logo">Netflix</div>
              <div className="logo">Spotify</div>
              <div className="logo">Disney+</div>
              <div className="logo">YouTube</div>
              <div className="logo">Canva</div>
              <div className="logo">Prime</div>
            </div>
          </div>

          {/* Waitlist card */}
          <div id="waitlist" className="card" role="region" aria-label="Join the waitlist">
            <form className="form" onSubmit={onSubmit} autoComplete="off">
              {/* honeypot */}
              <input
                tabIndex={-1}
                autoComplete="off"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                style={{ display: 'none' }}
                aria-hidden
                name="website"
              />
              <input
                className="input"
                placeholder="Enter your email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <button className="btn" type="submit" disabled={status === 'loading' || isBot}>
                {status === 'loading' ? 'Joining…' : 'Join Waitlist'}
              </button>
            </form>
            <div className="note">
              🔒 Secure & private — we’ll only email you about the launch.
            </div>
            {status !== 'idle' && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  color: status === 'success' ? 'var(--ok)' : 'var(--err)',
                  minHeight: 20,
                }}
                role="status"
              >
                {msg}
              </div>
            )}
            <div className="badges" aria-hidden>
              <span className="badge">SSL Protected</span>
              <span className="badge">No spam, ever</span>
              <span className="badge">Launching globally</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section">
          <div className="grid3">
            <div className="feature">
              <div className="ficon">₹</div>
              <div className="ftitle">Save more</div>
              <div className="ftext">
                Share plans and cut your subscription costs by up to 75% while staying within platform limits.
              </div>
            </div>
            <div className="feature">
              <div className="ficon">🔒</div>
              <div className="ftitle">Safe by design</div>
              <div className="ftext">
                We prioritise privacy and trust. Fair rules, simple refunds, and clear controls for group owners.
              </div>
            </div>
            <div className="feature">
              <div className="ficon">🌍</div>
              <div className="ftitle">Global from day one</div>
              <div className="ftext">
                Launching in India first, expanding worldwide. Built for friends, families, and communities.
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div>© {new Date().getFullYear()} SplitSub • Made with ❤️</div>
          <div className="links">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
