import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

function AuthorityLogin({ socket }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('isAuthority') === 'true') {
      navigate('/authority/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    socket.emit('authorityLogin', password, (response) => {
      setLoading(false);
      if (response.success) {
        localStorage.setItem('isAuthority', 'true');
        navigate('/authority/dashboard');
      } else {
        setError(response.message);
      }
    });
  };

  return (
    <div className="page-container flex-center">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <button className="btn btn-outline" onClick={() => navigate('/')} style={{ marginBottom: '2rem', width: '100%' }}>
          <ArrowLeft size={16} /> Back to Start
        </button>
        <Lock size={48} color="var(--danger)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
        <h2 className="card-title" style={{ color: 'var(--danger)' }}>Authority Access</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter the bureaucratic code.</p>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter the Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
          <button type="submit" className="btn btn-danger" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthorityLogin;
