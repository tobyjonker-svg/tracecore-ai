export default function TrialExpired() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>⏰</div>
        <h1 style={{ color: '#f5f5f5', fontSize: '1.5rem', fontWeight: 600, marginBottom: '.75rem' }}>
          Your trial has ended
        </h1>
        <p style={{ color: '#a3a3a3', fontSize: '.9rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          Your 7-day free trial of TraceCore AI has expired. Subscribe to continue managing your production and inventory operations.
        </p>
        <div style={{
          background: '#111', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'left'
        }}>
          <p style={{ color: '#a3a3a3', fontSize: '.8rem', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Subscribe — R299/month</p>
          <p style={{ color: '#f5f5f5', fontSize: '.875rem', lineHeight: 1.6 }}>
            Send proof of payment to <strong>saas@saasnode.co.za</strong> and your account will be reactivated within 1 hour.
          </p>
        </div>
        <a href="https://wa.me/27665794855?text=Hi, my TraceCore AI trial has expired. I'd like to subscribe."
          style={{
            display: 'inline-block', background: '#25D366', color: '#fff',
            padding: '.7rem 1.5rem', borderRadius: '5px', textDecoration: 'none',
            fontSize: '.875rem', fontWeight: 500, marginBottom: '1rem'
          }}>
          💬 WhatsApp us to subscribe
        </a>
        <br />
        <a href="/app/login" style={{ color: '#6b6b6b', fontSize: '.8rem' }}>← Back to login</a>
      </div>
    </div>
  );
}
