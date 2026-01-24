import { useState } from 'react';
import './AdminPanel.css';

function AdminPanel({ isOpen, onClose, players, onStartRound }) {
  const [selectedGuesser, setSelectedGuesser] = useState('');
  const [selectedWordSelector, setSelectedWordSelector] = useState('');

  const handleStartRound = async () => {
    if (!selectedGuesser || !selectedWordSelector) {
      alert('Please select both a guesser and a word selector');
      return;
    }
    
    if (selectedGuesser === selectedWordSelector) {
      alert('Guesser and word selector must be different players');
      return;
    }

    const success = await onStartRound(
      parseInt(selectedGuesser), 
      parseInt(selectedWordSelector)
    );
    
    if (success) {
      setSelectedGuesser('');
      setSelectedWordSelector('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h3>Admin Panel</h3>
        <button className="close-panel" onClick={onClose}>✕</button>
      </div>
      <div className="admin-panel-content">
        <h4>Start Custom Round</h4>
        <div className="admin-control-group">
          <label htmlFor="admin-guesser">Select Guesser:</label>
          <select 
            id="admin-guesser"
            value={selectedGuesser}
            onChange={(e) => setSelectedGuesser(e.target.value)}
            className="admin-select"
          >
            <option value="">-- Choose Player --</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="admin-control-group">
          <label htmlFor="admin-word-selector">Select Word Selector:</label>
          <select 
            id="admin-word-selector"
            value={selectedWordSelector}
            onChange={(e) => setSelectedWordSelector(e.target.value)}
            className="admin-select"
          >
            <option value="">-- Choose Player --</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={handleStartRound}
          className="admin-start-button"
          disabled={!selectedGuesser || !selectedWordSelector}
        >
          Start Round
        </button>
      </div>
    </div>
  );
}

export default AdminPanel;
