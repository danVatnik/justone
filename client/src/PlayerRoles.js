import React from 'react';
import './Lobby.css';

function PlayerRoles({ players, playerId, guesser, wordSelector }) {
  return (
    <div className="player-roles">
      <div className="roles-title">Player Roles</div>
      <div className="roles-list">
        {players.map(player => {
          let role = 'Editor';
          if (guesser && guesser.id === player.id) {
            role = 'Guesser';
          } else if (wordSelector && wordSelector.id === player.id) {
            role = 'Word Selector';
          }
          const isCurrentPlayer = player.id === playerId;
          return (
            <div key={player.id} className={`role-item ${isCurrentPlayer ? 'current-player' : ''}`}>
              <span className="role-player-name">{player.name}</span>
              <span className={`role-badge role-${role.toLowerCase().replace(' ', '-')}`}>{role}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PlayerRoles;
