import { useState } from 'react';
import JoinLobby from './JoinLobby';
import Lobby from './Lobby';
import Game from './Game';
import './App.css';

function App() {
  const isTestMode = new URLSearchParams(window.location.search).get('istest') === 'true';
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

  // Sync localStorage on state changes
  const syncLocalStorage = (id, name, pageVal) => {
    if (isTestMode) return;
    if (id) localStorage.setItem('playerId', id);
    else localStorage.removeItem('playerId');
    if (name) localStorage.setItem('playerName', name);
    else localStorage.removeItem('playerName');
    if (pageVal) localStorage.setItem('page', pageVal);
    else localStorage.removeItem('page');
  };
  const handleJoinLobby = (id, name) => {
    setPlayerId(id);
    setPlayerName(name);
    setPage('lobby');
    syncLocalStorage(id, name, 'lobby');
  };

  const handleStartGame = () => {
    setPage('game');
    syncLocalStorage(playerId, playerName, 'game');
  };

  const handleLeaveLobby = () => {
    setPlayerId(null);
    setPlayerName('');
    setPage('join');
    syncLocalStorage(null, '', 'join');
  };

  return (
    <>
      {page === 'join' && <JoinLobby onJoinLobby={handleJoinLobby} />}
      {page === 'lobby' && (
        <Lobby 
          playerId={playerId} 
          playerName={playerName}
          onStartGame={handleStartGame}
          onLeaveLobby={handleLeaveLobby}
        />
      )}
      {page === 'game' && (
        <Game 
          playerId={playerId}
          playerName={playerName}
          onLeaveLobby={handleLeaveLobby}
        />
      )}
    </>
  );
}

export default App;
