import { useState } from 'react';
import JoinLobby from './JoinLobby';
import Lobby from './Lobby';
import Game from './Game';
import './App.css';

function App() {
  const isTestMode = new URLSearchParams(window.location.search).get('istest') === 'true';
  const isDebugMode = new URLSearchParams(window.location.search).get('debug') === 'true';
  const [page, setPage] = useState(() => {
    if (isTestMode) return 'join';
    return localStorage.getItem('page') || 'join';
  });
  const [playerId, setPlayerId] = useState(() => {
    if (isTestMode) return null;
    return localStorage.getItem('playerId');
  });
  const [playerName, setPlayerName] = useState(() => {
    if (isTestMode) return '';
    return localStorage.getItem('playerName') || '';
  });
  const [playerRole, setPlayerRole] = useState(() => {
    if (isTestMode) return '';
    return localStorage.getItem('playerRole') || '';
  });

  // Sync localStorage on state changes
  const syncLocalStorage = (id, name, pageVal, role) => {
    if (isTestMode) return;
    if (id) localStorage.setItem('playerId', id);
    else localStorage.removeItem('playerId');
    if (name) localStorage.setItem('playerName', name);
    else localStorage.removeItem('playerName');
    if (pageVal) localStorage.setItem('page', pageVal);
    else localStorage.removeItem('page');
    if (role) localStorage.setItem('playerRole', role);
    else localStorage.removeItem('playerRole');
 };
  const handleJoinLobby = (id, name) => {
    setPlayerId(id);
    setPlayerName(name);
    setPage('lobby');
    syncLocalStorage(id, name, 'lobby', null);
  };

  const handleStartGame = () => {
    setPage('game');
    syncLocalStorage(playerId, playerName, 'game', playerRole);
  };

  const handleLeaveLobby = () => {
    setPlayerId(null);
    setPlayerName('');
    setPlayerRole('');
    setPage('join');
    syncLocalStorage(null, '', 'join', null);
  };

  const handleRoleChange = (role) => {
    setPlayerRole(role);
    syncLocalStorage(playerId, playerName, page, role);
  };

  return (
    <>
      {page === 'join' && <JoinLobby onJoinLobby={handleJoinLobby} />}
      {page === 'lobby' && (
        <Lobby 
          playerId={parseInt(playerId)}
          playerName={playerName}
          onStartGame={handleStartGame}
          onLeaveLobby={handleLeaveLobby}
        />
      )}
      {page === 'game' && (
        <Game 
          playerId={parseInt(playerId)}
          playerName={playerName}
          onLeaveLobby={handleLeaveLobby}
          onRoleChange={handleRoleChange}
        />
      )}
      
      {/* Debug Panel */}
      {isDebugMode && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          color: '#00ff00',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 9999,
          minWidth: '220px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(0, 255, 0, 0.3)'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#00ff00', borderBottom: '1px solid rgba(0, 255, 0, 0.3)', paddingBottom: '6px' }}>
            localStorage Debug
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div><span style={{ color: '#888' }}>playerId:</span> <span style={{ color: '#fff' }}>{playerId || 'null'}</span></div>
            <div><span style={{ color: '#888' }}>playerName:</span> <span style={{ color: '#fff' }}>{playerName || 'null'}</span></div>
            <div><span style={{ color: '#888' }}>page:</span> <span style={{ color: '#fff' }}>{page || 'null'}</span></div>
            <div><span style={{ color: '#888' }}>playerRole:</span> <span style={{ color: '#fff' }}>{playerRole || 'null'}</span></div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
