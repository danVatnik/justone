import { useState } from 'react';
import './JoinLobby.css';

function JoinLobby({ onJoinLobby }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/lobby/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to join lobby');
      }

      const data = await response.json();
      onJoinLobby(data.playerId, name.trim());
    } catch (err) {
      setError('Error joining lobby. Please try again.');
      console.error(err);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset the lobby? All players will be removed.')) {
      try {
        const response = await fetch('http://localhost:3001/api/lobby/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          setName('');
          setError('Lobby reset successfully');
          setTimeout(() => setError(''), 2000);
        }
      } catch (err) {
        setError('Error resetting lobby');
        console.error(err);
      }
    }
  };

  return (
    <div className="join-lobby-container">
      <div className="join-lobby-card">
        <h1>Join Game</h1>
        <form onSubmit={handleJoin}>
          <div className="form-group">
            <label htmlFor="name">Enter Your Name:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your name"
              maxLength="20"
              autoFocus
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="join-button">Join Lobby</button>
        </form>
        <button onClick={handleReset} className="reset-lobby-button">Reset Lobby</button>
      </div>
    </div>
  );
}

export default JoinLobby;
