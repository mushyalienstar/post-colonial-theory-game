import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

function TeamView({ socket, gameState, myPlayer }) {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!myPlayer) {
      navigate('/');
    } else if (myPlayer.teamId !== parseInt(teamId)) {
      if (myPlayer.teamId) {
        navigate(`/team/${myPlayer.teamId}`);
      } else {
        navigate('/');
      }
    }
  }, [myPlayer, teamId, navigate]);

  const team = gameState.teams.find(t => t.id === parseInt(teamId));

  if (!team) {
    return <div className="page-container flex-center">Loading team data...</div>;
  }

  const generateRequest = () => {
    setLoading(true);
    setError('');
    socket.emit('generateRequest', team.id, (response) => {
      setLoading(false);
      if (!response.success) {
        setError(response.message);
      }
    });
  };

  const handleLeaveTeam = () => {
    const playerId = localStorage.getItem('playerId');
    socket.emit('leaveTeam', playerId);
  };

  return (
    <div className="page-container">
      <button className="btn btn-outline" onClick={handleLeaveTeam} style={{ marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '600px' }}>
          <h1 className="title" style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '0.5rem', background: 'none', WebkitTextFillColor: 'unset', color: 'white' }}>
            {team.name}
          </h1>
          <div className="team-score" style={{ marginBottom: '2rem' }}>
            Points: {team.score}
          </div>

          <h2 className="card-title">Your Current Need</h2>
          {team.currentRequest ? (
            <div className="highlight-box">
              <p>{team.currentRequest}</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You don't have an active request.</p>
              <button 
                className="btn" 
                onClick={generateRequest} 
                disabled={loading}
                style={{ width: '100%' }}
              >
                <RefreshCw size={18} className={loading ? "spin" : ""} /> 
                Generate Request
              </button>
              {error && <p style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</p>}
            </div>
          )}

          {team.currentRequest && (
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Wait for your turn to approach the Authority. They will tell you the current conventions on the spot!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamView;
