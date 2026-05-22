import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import Landing from './components/Landing';
import TeamView from './components/TeamView';
import AuthorityLogin from './components/AuthorityLogin';
import AuthorityDashboard from './components/AuthorityDashboard';

const backendUrl = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:3001`;
const socket = io(backendUrl);

function App() {
  const [gameState, setGameState] = useState({
    teams: [],
    currentConvention: null,
    lobby: [],
    players: {}
  });
  
  const [myPlayer, setMyPlayer] = useState(null);

  useEffect(() => {
    // Generate or retrieve persistent playerId
    let storedPlayerId = localStorage.getItem('playerId');
    if (!storedPlayerId) {
      storedPlayerId = 'player_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('playerId', storedPlayerId);
    }

    socket.on('connect', () => {
      socket.emit('reconnectPlayer', storedPlayerId);
    });

    socket.on('gameStateUpdate', (state) => {
      setGameState(state);
    });

    socket.on('myPlayerState', (playerState) => {
      setMyPlayer(playerState);
    });

    // If already connected when effect runs
    if (socket.connected) {
      socket.emit('reconnectPlayer', storedPlayerId);
    }

    return () => {
      socket.off('connect');
      socket.off('gameStateUpdate');
      socket.off('myPlayerState');
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<Landing socket={socket} myPlayer={myPlayer} />} />
          <Route path="/team/:teamId" element={<TeamView socket={socket} gameState={gameState} myPlayer={myPlayer} />} />
          <Route path="/authority/login" element={<AuthorityLogin socket={socket} />} />
          <Route path="/authority/dashboard" element={<AuthorityDashboard socket={socket} gameState={gameState} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
