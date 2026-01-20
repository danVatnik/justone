import { useState } from 'react';
import JoinLobby from './JoinLobby';
import Lobby from './Lobby';
import Game from './Game';
import './App.css';

function App() {
  const [page, setPage] = useState('join'); // 'join', 'lobby', 'game'
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState('');

  const handleJoinLobby = (id, name) => {
    setPlayerId(id);
    setPlayerName(name);
    setPage('lobby');
  };

  const handleStartGame = () => {
    setPage('game');
  };

  const handleLeaveLobby = () => {
    setPlayerId(null);
    setPlayerName('');
    setPage('join');
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
