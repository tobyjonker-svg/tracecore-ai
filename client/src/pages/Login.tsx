import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const utils = trpc.useUtils();

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'register') setMode('register');
    if (params.get('name')) setForm(f => ({ ...f, name: params.get('name') || '' }));
    if (params.get('email')) setForm(f => ({ ...f, email: params.get('email') || '' }));
  }, []);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate('/app');
    },
    onError: (e) => {
      if ((e.data as any)?.code === 'FORBIDDEN') {
        window.location.href = '/app/trial-expired';
      } else {
        toast.error(e.message);
      }
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success('Welcome to TraceCore AI! Your 7-day trial has started.');
      navigate('/app');
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (mode === 'login') {
      if (!form.email || !form.password) return toast.error('Please fill in all fields');
      loginMutation.mutate({ email: form.email, password: form.password });
    } else {
      if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields');
      if (form.password !== form.confirm) return toast.error('Passwords do not match');
      if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
      registerMutation.mutate({ name: form.name, email: form.email, password: form.password });
    }
  };

  const loading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '40px', height: '40px', background: '#2563eb', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', fontSize: '1.2rem'
          }}>⚡</div>
          <h1 style={{ color: '#f5f5f5', fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>TraceCore AI</h1>
          <p style={{ color: '#6b6b6b', fontSize: '.825rem', marginTop: '.25rem' }}>
            {mode === 'login' ? 'Sign in to your workspace' : 'Start your free 7-day trial'}
          </p>
        </div>

        <div style={{
          background: '#111', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px', padding: '2rem'
        }}>
          <div style={{
            display: 'flex', background: '#1a1a1a', borderRadius: '6px',
            padding: '3px', marginBottom: '1.5rem'
          }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '.5rem', border: 'none', borderRadius: '4px',
                fontSize: '.825rem', fontWeight: 500, cursor: 'pointer', transition: 'all .15s',
                background: mode === m ? '#2563eb' : 'transparent',
                color: mode === m ? '#fff' : '#6b6b6b',
                fontFamily: 'Inter, sans-serif'
              }}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: '.875rem' }}>
              <label style={{ display: 'block', fontSize: '.775rem', color: '#a3a3a3', marginBottom: '.3rem', fontWeight: 500 }}>Full name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name" style={inputStyle} />
            </div>
          )}
          <div style={{ marginBottom: '.875rem' }}>
            <label style={{ display: 'block', fontSize: '.775rem', color: '#a3a3a3', marginBottom: '.3rem', fontWeight: 500 }}>Email address</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@business.co.za" style={inputStyle} />
          </div>
          <div style={{ marginBottom: mode === 'register' ? '.875rem' : '1.5rem', position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '.775rem', color: '#a3a3a3', marginBottom: '.3rem', fontWeight: 500 }}>Password</label>
            <input type={showPass ? 'text' : 'password'} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder={mode === 'register' ? 'Min 6 characters' : '••••••••'}
              style={{ ...inputStyle, paddingRight: '2.5rem' }} />
            <button onClick={() => setShowPass(s => !s)} style={{
              position: 'absolute', right: '.75rem', top: '2rem', background: 'none',
              border: 'none', color: '#6b6b6b', cursor: 'pointer', padding: 0
            }}>
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {mode === 'register' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '.775rem', color: '#a3a3a3', marginBottom: '.3rem', fontWeight: 500 }}>Confirm password</label>
              <input type="password" value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Repeat password" style={inputStyle} />
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', background: '#f5f5f5', color: '#000', border: 'none',
            borderRadius: '5px', padding: '.65rem', fontSize: '.875rem', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
            fontFamily: 'Inter, sans-serif'
          }}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === 'login' ? 'Sign in' : 'Start free trial →'}
          </button>

          {mode === 'register' && (
            <p style={{ fontSize: '.72rem', color: '#6b6b6b', textAlign: 'center', marginTop: '.875rem' }}>
              7 days free · No credit card required · Cancel anytime
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.8rem', color: '#6b6b6b' }}>
          <a href="/" style={{ color: '#6b6b6b' }}>← Back to TraceCore AI</a>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '5px', padding: '.55rem .75rem', color: '#f5f5f5', fontSize: '.85rem',
  fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box'
};
