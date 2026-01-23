import './PlayersStatus.css';

function PlayersStatus({ players, submittedWords, excludePlayerIds = [] }) {
  const filteredPlayers = players.filter(p => !excludePlayerIds.includes(p.id));
  
  return (
    <div className="players-status">
      {filteredPlayers.map(player => (
        <div key={player.id} className="status-item">
          <span className={`status-icon ${submittedWords[player.id] ? 'submitted' : 'pending'}`}>
            {submittedWords[player.id] ? '✓' : '○'}
          </span>
          <span className="player-name-status">{player.name}</span>
        </div>
      ))}
    </div>
  );
}

export default PlayersStatus;
