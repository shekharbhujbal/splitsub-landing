'use client';
import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [msg, setMsg] = useState<string>('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMsg('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || 'Failed');
      setStatus('success');
      setMsg('You’re on the list! We’ll be in touch soon.');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMsg(err?.message || 'Something went wrong. Try again.');
    }
  }

  return (
    <main style={{fontFamily:'system-ui, Arial', padding:'48px', maxWidth:800, margin:'0 auto'}}>
      <h1 style={{fontSize:36, marginBottom:8}}>SplitSub</h1>
      <p style={{fontSize:18, opacity:.8, marginBottom:24}}>
        Split the cost. Share the subscription. Save together.
      </p>

      <form onSubmit={onSubmit}
        style={{
          display:'grid', gridTemplateColumns:'1fr auto', gap:12, marginBottom:16,
          border:'1px solid #e5e7eb', padding:12, borderRadius:12, background:'#fafafa'
        }}>
        <input
          type="email" required placeholder="Enter your email"
          value={email} onChange={(e)=>setEmail(e.target.value)}
          style={{
            padding:12, border:'1px solid #ddd', borderRadius:8, outline:'none',
            fontSize:16
          }}
        />
        <button disabled={status==='loading'} type="submit"
          style={{
            padding:'12px 18px', borderRadius:8, border:'none',
            background: status==='loading' ? '#94a3b8' : '#2563EB',
            color:'#fff', fontWeight:600, cursor: status==='loading' ? 'not-allowed' : 'pointer'
          }}>
          {status==='loading' ? 'Joining…' : 'Join Waitlist'}
        </button>
      </form>

      {status!=='idle' && (
        <p style={{
          fontSize:14,
          color: status==='success' ? '#059669' : '#DC2626',
          marginBottom:24
        }}>
          {msg}
        </p>
      )}

      <ul style={{lineHeight:1.8}}>
        <li>Safe payments (escrow)</li>
        <li>Refunds if access isn’t provided</li>
        <li>Launching in India first</li>
        <li>Join the waitlist to get early access</li>    
        <li>Questions? Email <a href="mailto:support@splitsub.co">  
      </ul>

      <footer style={{marginTop:48, fontSize:14, opacity:.7}}>
        <a href="/terms" style={{marginRight:16}}>Terms</a>
        <a href="/privacy">Privacy</a>
      </footer>
    </main>
  );
}
