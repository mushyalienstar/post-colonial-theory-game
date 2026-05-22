import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShieldAlert, Clock, UserX } from 'lucide-react';

function Landing({ socket, myPlayer }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (myPlayer?.teamId) {
      navigate(`/team/${myPlayer.teamId}`);
    }
  }, [myPlayer, navigate]);

  const joinLobby = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const playerId = localStorage.getItem('playerId');
    socket.emit('joinLobby', { playerId, name: name.trim() }, (response) => {
      setLoading(false);
    });
  };

  return (
    <div className="page-container flex-center">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px' }}>
        <h1 className="title">The Bureaucracy Game</h1>
        <p className="subtitle">Choose your role to begin</p>
        
        <div className="grid-cols-2">
          <div className="glass-panel" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
            
            {myPlayer?.isKicked ? (
              <>
                <UserX size={48} color="var(--danger)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
                <h2 className="card-title" style={{ color: 'var(--danger)' }}>Removed</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You have been removed from the game by the Authority.</p>
              </>
            ) : myPlayer ? (
              <>
                <Clock size={48} color="var(--accent)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
                <h2 className="card-title">Waiting Room</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Please wait. The Authority will assign you to a team shortly.</p>
              </>
            ) : (
              <>
                <Users size={48} color="var(--accent)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
                <h2 className="card-title">Join as a Player</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Enter your name to join the waiting room.</p>
                <form onSubmit={joinLobby} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-outline" disabled={loading || !name.trim()}>
                    Join Lobby
                  </button>
                </form>
              </>
            )}
          </div>
          
          <div className="glass-panel" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <ShieldAlert size={48} color="var(--danger)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
            <h2 className="card-title">The Authority</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Control the conventions and approve requests.</p>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (localStorage.getItem('isAuthority') === 'true') {
                  navigate('/authority/dashboard');
                } else {
                  navigate('/authority/login');
                }
              }}
            >
              Enter Authority Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
