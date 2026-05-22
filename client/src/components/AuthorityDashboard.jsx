import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, LogOut, Dices } from 'lucide-react';

function AuthorityDashboard({ socket, gameState }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('isAuthority') !== 'true') {
      navigate('/authority/login');
    }
  }, [navigate]);

  const rollConvention = () => {
    socket.emit('rollConvention');
  };

  const approveRequest = (teamId) => {
    socket.emit('approveRequest', teamId);
  };

  const rejectRequest = (teamId) => {
    socket.emit('rejectRequest', teamId);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="title" style={{ margin: 0, fontSize: '2.5rem' }}>Authority Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-danger" onClick={() => { if (window.confirm('Reset all team scores?')) socket.emit('resetScores'); }}>
            Reset Scores
          </button>
          <button className="btn btn-outline" onClick={() => {
            localStorage.removeItem('isAuthority');
            navigate('/');
          }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="grid-cols-2">
        <div className="glass-panel" style={{ border: '1px solid var(--danger)' }}>
          <h2 className="card-title" style={{ color: 'var(--danger)' }}>Current Convention</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Applicants must adhere to this rule when speaking to you.
          </p>
          <div className="highlight-box" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--danger)', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#fff' }}>{gameState.currentConvention || "No active convention. Roll to generate one."}</p>
          </div>
          <button className="btn btn-danger" onClick={rollConvention} style={{ width: '100%', marginTop: '1rem' }}>
            <Dices size={18} /> Roll New Convention
          </button>
        </div>

        <div className="glass-panel">
          <h2 className="card-title">Team Status</h2>
          <div className="team-list">
            {gameState.teams.map(team => (
              <div key={team.id} className="team-item">
                <div style={{ flex: 1 }}>
                  <strong>{team.name}</strong> <span style={{ color: 'var(--text-muted)' }}>(Score: {team.score})</span>
                  {team.currentRequest ? (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--accent)' }}>
                      Need: {team.currentRequest}
                    </div>
                  ) : (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      No active request.
                    </div>
                  )}
                </div>
                {team.currentRequest && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-success" style={{ padding: '0.5rem' }} onClick={() => approveRequest(team.id)}>
                      <Check size={16} />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => rejectRequest(team.id)}>
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Display players assigned to this team */}
                {gameState.players && Object.values(gameState.players).filter(p => p.teamId === team.id).length > 0 && (
                  <div style={{ paddingLeft: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {Object.entries(gameState.players)
                      .filter(([id, p]) => p.teamId === team.id)
                      .map(([id, p]) => (
                        <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>👤 {p.name}</span>
                          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <select
                              style={{ padding: '0.25rem', background: 'var(--bg-card)', color: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.75rem' }}
                              onChange={(e) => {
                                if (e.target.value) {
                                  socket.emit('assignTeam', { playerId: id, teamId: parseInt(e.target.value) });
                                  e.target.value = "";
                                }
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled style={{ color: '#000' }}>Move...</option>
                              {gameState.teams.map(t => (
                                <option key={t.id} value={t.id} style={{ color: '#000' }}>{t.name}</option>
                              ))}
                            </select>
                            <button className="btn btn-danger" style={{ padding: '0.25rem' }} onClick={() => socket.emit('kickPlayer', id)}>
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '2rem' }}>
        <h2 className="card-title">Waiting Room / Lobby</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Assign players to teams below. Once assigned, they will automatically join that team.
        </p>

        {(!gameState.lobby || gameState.lobby.length === 0) ? (
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No players are currently waiting.
          </div>
        ) : (
          <div className="team-list">
            {gameState.lobby.map(player => (
              <div key={player.id} className="team-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 'bold' }}>{player.name}</div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select
                    style={{ padding: '0.5rem', background: 'var(--bg-card)', color: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                    onChange={(e) => {
                      if (e.target.value) {
                        socket.emit('assignTeam', { playerId: player.id, teamId: parseInt(e.target.value) });
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled style={{ color: '#000' }}>Assign to...</option>
                    {gameState.teams.map(t => (
                      <option key={t.id} value={t.id} style={{ color: '#000' }}>{t.name}</option>
                    ))}
                  </select>
                  <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => socket.emit('kickPlayer', player.id)}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthorityDashboard;
