import { useEffect, useState } from 'react';
import Header from './Header';
import './Lobby.css';

function Lobby({ playerId, playerName, onStartGame, onLeaveLobby }) {
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');
  
  // Check if isadmin=true in URL
  const isAdmin = new URLSearchParams(window.location.search).get('isadmin') === 'true';

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/lobby/players');
        if (response.ok) {
          const data = await response.json();
          setPlayers(data.players || []);
          setGameStarted(data.gameStarted || false);
          
          // If game has started, redirect to game page
          if (data.gameStarted) {
            onStartGame();
          }
        }
      } catch (err) {
        console.error('Error fetching players:', err);
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 1000);
    return () => clearInterval(interval);
  }, [onStartGame]);

  const handleResetLobby = async () => {
    if (window.confirm('Are you sure you want to reset the lobby? All players will be removed.')) {
      try {
        const response = await fetch('/api/lobby/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          onLeaveLobby();
        }
      } catch (err) {
        setError('Error resetting lobby');
        console.error(err);
      }
    }
  };

  const handleStartGame = async () => {
    try {
      const response = await fetch('/api/lobby/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });

      if (response.ok) {
        setGameStarted(true);
        onStartGame();
      } else {
        setError('Not all players are ready');
      }
    } catch (err) {
      setError('Error starting game');
      console.error(err);
    }
  };

  const allPlayersReady = players.length > 0 && players.every(p => p.isReady);
  const isHost = players.length > 0 && players[0].id === playerId;

  return (
    <>
      <Header showLeaveButton={false} isAdmin={isAdmin} />
      <div className="lobby-container">
      <div className="lobby-card">
        <h1>Game Lobby</h1>
        
        <div className="player-info">
          <p className="your-name">You: <strong>{playerName}</strong></p>
        </div>

        <div className="players-section">
          <h2>Players ({players.length})</h2>
          <div className="players-list">
            {players.map((player) => (
              <div key={player.id} className={`player-item ${player.isReady ? 'ready' : ''}`}>
                <span className="player-name">{player.name}</span>
                <span className="ready-badge">
                  {player.isReady ? '✓ Ready' : 'Waiting...'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="actions">
          {isHost && allPlayersReady && players.length > 1 && (
            <button 
              className="start-button"
              onClick={handleStartGame}
              disabled={gameStarted}
            >
              Start Game
            </button>
          )}

          {isHost && (
            <button 
              className="reset-button"
              onClick={handleResetLobby}
            >
              Reset Lobby
            </button>
          )}
        </div>

        {isHost && !allPlayersReady && (
          <p className="waiting-text">Waiting for all players to be ready...</p>
        )}

        {!isHost && (
          <p className="host-text">Host will start the game when everyone is ready</p>
        )}
      </div>
    </div>
    </>
  );
}

export default Lobby;
