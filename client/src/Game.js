import { useState, useEffect } from 'react';
import PlayerRoles from './PlayerRoles';
import PlayersStatus from './PlayersStatus';
import Header from './Header';
import AdminPanel from './AdminPanel';
import './Game.css';

function Game({ playerName, playerId, onLeaveLobby }) {
  const [round, setRound] = useState(1);
  const [guesser, setGuesser] = useState(null);
  const [wordSelector, setWordSelector] = useState(null);
  const [word, setWord] = useState('');
  const [wordOptions, setWordOptions] = useState([]);
  const [clues, setClues] = useState({});
  const [gameState, setGameState] = useState('waiting');
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [clueInput, setClueInput] = useState('');
  const [guessInput, setGuessInput] = useState('');
  const [wordInput, setWordInput] = useState('');
  const [clueSubmitted, setClueSubmitted] = useState(false);
  const [submittedWords, setSubmittedWords] = useState({});
  const [selectedClues, setSelectedClues] = useState(new Set());
  const [selectedWords, setSelectedWords] = useState(new Set());
  const [wordRevealed, setWordRevealed] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [roleHistory, setRoleHistory] = useState({ guessers: [], wordSelectors: [] });
  
  // Check if isadmin=true in URL
  const isAdmin = new URLSearchParams(window.location.search).get('isadmin') === 'true';

  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchGameState = async () => {
    try {
      const response = await fetch(`/api/game/state?playerId=${playerId}`);
      if (response.ok) {
        const data = await response.json();
        setGuesser(data.guesser);
        setWordSelector(data.wordSelector);
        setWord(data.word);
        setWordOptions(data.wordOptions || []);
        setRound(data.round);
        setGameState(data.gameState);
        setPlayers(data.players || []);
        setScores(data.scores || {});
        setClues(data.clues || {});
        setSubmittedWords(data.submittedWords || {});
        setRoleHistory(data.roleHistory || { guessers: [], wordSelectors: [] });
        // Check if current player has submitted a clue
        if (data.clues && data.clues[playerId]) {
          setClueSubmitted(true);
        }
      }
    } catch (err) {
      console.error('Error fetching game state:', err);
    }
  };

  const handleGenerateWords = async () => {
    try {
      const response = await fetch('/api/game/new-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setWordOptions(data.wordOptions);
      }
    } catch (err) {
      console.error('Error generating words:', err);
    }
  };

  const handleSelectWord = async (selectedWord) => {
    try {
      const response = await fetch('/api/game/select-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: selectedWord })
      });

      if (response.ok) {
        setWord(selectedWord);
        setWordOptions([]);
        fetchGameState();
      }
    } catch (err) {
      console.error('Error selecting word:', err);
    }
  };

  const handleSubmitWord = async () => {
    if (!wordInput.trim()) {
      alert('Please enter a word');
      return;
    }

    try {
      const response = await fetch('/api/game/submit-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, word: wordInput.trim() })
      });

      if (response.ok) {
        setWordInput('');
        fetchGameState();
      }
    } catch (err) {
      console.error('Error submitting word:', err);
    }
  };

  const handleRemoveSelectedWords = async () => {
    if (selectedWords.size === 0) {
      alert('Please select words to remove');
      return;
    }

    try {
      const wordList = Array.from(selectedWords);
      const response = await fetch('/api/game/remove-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: wordList })
      });

      if (response.ok) {
        setSelectedWords(new Set());
        fetchGameState();
      }
    } catch (err) {
      console.error('Error removing words:', err);
    }
  };

  const handleConfirmWords = async () => {
    try {
      const response = await fetch('/api/game/confirm-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });

      if (response.ok) {
        setSelectedWords(new Set());
        fetchGameState();
      }
    } catch (err) {
      console.error('Error confirming words:', err);
    }
  };

  const handleGuesserDone = async () => {
    try {
      const response = await fetch('/api/game/guesser-done', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });

      if (response.ok) {
        setClueSubmitted(false);
        setSelectedClues(new Set());
        setWordRevealed(false);
        fetchGameState();
      }
    } catch (err) {
      console.error('Error finishing guesser round:', err);
    }
  };

  const handleSubmitClue = async () => {
    if (!clueInput.trim()) {
      alert('Please enter a clue');
      return;
    }

    try {
      const response = await fetch('/api/game/clue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, clue: clueInput.trim() })
      });

      if (response.ok) {
        setClueSubmitted(true);
        setClueInput('');
        fetchGameState();
      }
    } catch (err) {
      console.error('Error submitting clue:', err);
    }
  };

  const handleSubmitGuess = async () => {
    if (!guessInput.trim()) {
      alert('Please enter a guess');
      return;
    }

    try {
      const response = await fetch('/api/game/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, guess: guessInput.trim() })
      });

      if (response.ok) {
        setGuessInput('');
        fetchGameState();
      }
    } catch (err) {
      console.error('Error submitting guess:', err);
    }
  };

  const handleNextRound = async () => {
    try {
      const response = await fetch('/api/game/next-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });

      if (response.ok) {
        setClueSubmitted(false);
        setSelectedClues(new Set());
        setWordRevealed(false);
        fetchGameState();
      }
    } catch (err) {
      console.error('Error starting next round:', err);
    }
  };

  const handleToggleClue = (playerId) => {
    const newSelected = new Set(selectedClues);
    const playerIdStr = String(playerId);
    if (newSelected.has(playerIdStr)) {
      newSelected.delete(playerIdStr);
    } else {
      newSelected.add(playerIdStr);
    }
    setSelectedClues(newSelected);
  };

  const handleRemoveSelectedClues = async () => {
    if (selectedClues.size === 0) {
      alert('Please select clues to remove');
      return;
    }

    try {
      const response = await fetch('/api/game/remove-clues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIds: Array.from(selectedClues).map(id => parseInt(id)) })
      });

      if (response.ok) {
        setSelectedClues(new Set());
        fetchGameState();
      }
    } catch (err) {
      console.error('Error removing clues:', err);
    }
  };

  const handleStartGuessing = async () => {
    try {
      const response = await fetch('/api/game/start-guessing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        fetchGameState();
      }
    } catch (err) {
      console.error('Error starting guessing phase:', err);
    }
  };

  const handleAdminStartRound = async (guesserId, wordSelectorId) => {
    try {
      const response = await fetch('/api/game/admin-start-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guesserId, wordSelectorId })
      });

      if (response.ok) {
        setClueSubmitted(false);
        setSelectedClues(new Set());
        setWordRevealed(false);
        fetchGameState();
        return true;
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to start round');
        return false;
      }
    } catch (err) {
      console.error('Error starting admin round:', err);
      alert('Error starting round');
      return false;
    }
  };


  const isGuesser = guesser && guesser.id === playerId;
  const isWordSelector = wordSelector && wordSelector.id === playerId;

  return (
    <>
      <div className="game-container">
        <Header 
          showLeaveButton={true} 
          onLeaveLobby={onLeaveLobby} 
          isAdmin={isAdmin}
          onAdminClick={() => setShowAdminPanel(!showAdminPanel)}
        />
        {isAdmin && (
          <AdminPanel 
            isOpen={showAdminPanel}
            onClose={() => setShowAdminPanel(false)}
            players={players}
            onStartRound={handleAdminStartRound}
          />
        )}
        <div className="game-flex-layout">
        <PlayerRoles
          players={players}
          playerId={playerId}
          guesser={guesser}
          wordSelector={wordSelector}
          roleHistory={roleHistory}
        />
        <div className="game-content">
        {gameState === 'waiting' && (
          <div className="game-section">
            <h2>Game Starting...</h2>
            <p>Setting up first round</p>
            <div className="spinner"></div>
          </div>
        )}

        {gameState === 'word-selection' && isWordSelector && (
          <div className="game-section">
            <h2>Select the Word</h2>
            <p className="instruction">Choose one word for players to guess:</p>
            <div className="word-options">
              {wordOptions.map((option) => (
                <button 
                  key={option}
                  onClick={() => handleSelectWord(option)}
                  className="word-option"
                >
                  {option}
                </button>
              ))}
            </div>
            <button onClick={handleGenerateWords} className="generate-button">
              Generate New Words
            </button>
          </div>
        )}

        {gameState === 'word-selection' && !isWordSelector && (
          <div className="game-section">
            <h2>Waiting for Word Selection...</h2>
            <p>{wordSelector?.name} is selecting the word</p>
            <div className="spinner"></div>
          </div>
        )}

        {gameState === 'word-submission' && !isGuesser && (
          <div className="game-section">
            <h2>The Word is: <span className="selected-word">{word}</span></h2>
            {submittedWords[playerId] ? (
              <>
                <div className="word-submitted">
                  <p>✓ Your clue: <strong>{submittedWords[playerId]}</strong></p>
                  <p className="waiting-others">Waiting for other players...</p>
                </div>
                <PlayersStatus 
                players={players} 
                submittedWords={submittedWords} 
                excludePlayerIds={[playerId, guesser?.id].filter(Boolean)} 
                />
              </>
            ) : (
              <>
                <p className="instruction">Enter a clue related to it:</p>
                <input 
                  type="text" 
                  value={wordInput}
                  onChange={(e) => setWordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitWord()}
                  placeholder="Enter your clue..." 
                  className="word-submission-input"
                  maxLength="30"
                  autoFocus
                />
                <button onClick={handleSubmitWord} className="submit-button">Submit</button>
              </>
            )}
          </div>
        )}

        {gameState === 'word-submission' && isGuesser && (
          <div className="game-section guesser-waiting">
            <h2>Waiting for Clue Submissions...</h2>
            <br/>
            <div className="spinner"></div>
            <PlayersStatus 
              players={players} 
              submittedWords={submittedWords} 
              excludePlayerIds={[playerId]} 
            />
          </div>
        )}

        {gameState === 'display-words' && !isGuesser && (
          <div className="game-section">
            <h2>Submitted Clues</h2>
            <p className="original-word"><strong>{word}</strong></p>
            <div className="words-list">
              {Object.entries(submittedWords).map(([pid, submittedWord], index) => {
                const player = players.find(p => p.id === parseInt(pid));
                const wordKey = `${pid}-${submittedWord}`;
                return (
                  <label key={wordKey} className="word-selection-item">
                    <input
                      type="checkbox"
                      checked={selectedWords.has(wordKey)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedWords);
                        if (e.target.checked) {
                          newSelected.add(wordKey);
                        } else {
                          newSelected.delete(wordKey);
                        }
                        setSelectedWords(newSelected);
                      }}
                    />
                    <span className="word-number">{index + 1}.</span>
                    <span className="word-text">{submittedWord}</span>
                    <span className="word-player">({player?.name})</span>
                  </label>
                );
              })}
            </div>
            <div className="words-actions">
              <button 
                onClick={handleRemoveSelectedWords} 
                className="delete-button"
                disabled={selectedWords.size === 0}
              >
                Delete Selected Clues ({selectedWords.size})
              </button>
              <button 
                onClick={handleConfirmWords} 
                className="confirm-button"
              >
                Confirm Clues
              </button>
            </div>
          </div>
        )}

        {gameState === 'display-words' && isGuesser && (
          <div className="game-section guesser-waiting">
            <h2>Waiting for Clue Confirmation...</h2>
            <p>Other players are reviewing the submitted clues</p>
            <div className="spinner"></div>
          </div>
        )}

        {gameState === 'show-words-to-guesser' && (
          <div className="game-section">
            <h2>Submitted Clues</h2>
            {(!isGuesser || wordRevealed) && <p className="original-word"><strong>{word}</strong></p>}
            {isGuesser ? (
              <>
                {Object.keys(submittedWords).length === 0 ? (
                  <div className="no-words-message">
                    <p>No clues were submitted after review.</p>
                  </div>
                ) : (
                  <div className="words-list">
                    {Object.entries(submittedWords).map(([pid, submittedWord], index) => (
                      <div key={pid} className="word-display-item">
                        <span className="word-number">{index + 1}.</span>
                        <span className="word-text">{submittedWord}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="words-list">
                {Object.entries(submittedWords).map(([pid, submittedWord], index) => {
                  const player = players.find(p => p.id === parseInt(pid));
                  return (
                    <div key={pid} className="word-display-item">
                      <span className="word-number">{index + 1}.</span>
                      <span className="word-text">{submittedWord}</span>
                      <span className="word-player">({player?.name})</span>
                    </div>
                  );
                })}
              </div>
            )}
            {isGuesser && (
              <div className="button-group">
                {!wordRevealed && (
                  <button onClick={() => setWordRevealed(true)} className="reveal-button">Reveal Word</button>
                )}
                <button onClick={handleGuesserDone} className="continue-button">Done</button>
              </div>
            )}
          </div>
        )}

        {gameState === 'clue-entry' && !isGuesser && (
          <div className="game-section">
            <h2>Enter Your Clue</h2>
            <div className="guesser-info">
              <p><strong>{guesser?.name}</strong> is guessing</p>
              <p className="word-count">{word.length}-letter word: {word.split('').map(() => '_').join(' ')}</p>
            </div>
            {!clueSubmitted ? (
              <>
                <input 
                  type="text" 
                  value={clueInput}
                  onChange={(e) => setClueInput(e.target.value)}
                  placeholder="Enter one-word clue..." 
                  className="clue-input"
                  maxLength="20"
                  autoFocus
                />
                <button onClick={handleSubmitClue} className="submit-button">Submit Clue</button>
              </>
            ) : (
              <div className="clue-submitted">
                <p>✓ Your clue submitted: <strong>{clues[playerId] || 'Submitted'}</strong></p>
                <p className="waiting-others">Waiting for other players...</p>
              </div>
            )}
          </div>
        )}

        {gameState === 'clue-display' && !isGuesser && (
          <div className="game-section">
            <h2>Review Final Clues</h2>
            <div className="clues-display">
              <h3>Clues from all players:</h3>
              <div className="clues-list">
                {Object.entries(clues).map(([playerId, clue], index) => (
                  <label key={playerId} className="clue-checkbox-item">
                    <input 
                      type="checkbox"
                      checked={selectedClues.has(String(playerId))}
                      onChange={() => handleToggleClue(playerId)}
                    />
                    <span className="clue-number">{index + 1}.</span>
                    <span className="clue-text">{clue}</span>
                  </label>
                ))}
              </div>
              {selectedClues.size > 0 && (
                <button onClick={handleRemoveSelectedClues} className="remove-button">
                  Remove Selected ({selectedClues.size})
                </button>
              )}
            </div>
            <button onClick={handleStartGuessing} className="start-guessing-button">Send Clues to Guesser</button>
          </div>
        )}

        {gameState === 'clue-display' && isGuesser && (
          <div className="game-section guesser-waiting">
            <h2>Waiting for Editing Players...</h2>
            <p>Players are reviewing the clues</p>
            <div className="spinner"></div>
          </div>
        )}

        {gameState === 'guessing' && isGuesser && (
          <div className="game-section">
            <h2>Your Turn to Guess</h2>
            <div className="clues-display">
              <h3>Clues from other players:</h3>
              <div className="clues-list">
                {Object.entries(clues).map(([playerId, clue], index) => (
                  <label key={playerId} className="clue-checkbox-item">
                    <input 
                      type="checkbox"
                      checked={selectedClues.has(String(playerId))}
                      onChange={() => handleToggleClue(playerId)}
                    />
                    <span className="clue-number">{index + 1}.</span>
                    <span className="clue-text">{clue}</span>
                  </label>
                ))}
              </div>
              {selectedClues.size > 0 && (
                <button onClick={handleRemoveSelectedClues} className="remove-button">
                  Remove Selected ({selectedClues.size})
                </button>
              )}
            </div>
            <input 
              type="text" 
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder="Enter your guess..." 
              className="guess-input"
              maxLength="50"
            />
            <button onClick={handleSubmitGuess} className="submit-button">Submit Guess</button>
          </div>
        )}

        {gameState === 'guessing' && !isGuesser && (
          <div className="game-section">
            <h2>Waiting for {guesser?.name}'s Guess</h2>
            <p className="hint">The word is: <strong>{word.length} letters</strong></p>
            <div className="spinner"></div>
          </div>
        )}

        {gameState === 'round-end' && (
          <div className="game-section round-end">
            <h2>Round {round} Complete!</h2>
            <div className="scores">
              {players.map(player => (
                <div key={player.id} className="score-item">
                  <span className="score-name">{player.name}</span>
                  <span className="score-value">{scores[player.id] || 0}</span>
                </div>
              ))}
            </div>
            <button onClick={handleNextRound} className="next-button">Next Round</button>
          </div>
        )}
        </div>
      </div>
        {/* Footer removed: Leave Game button is now in header */}
      </div>
    </>
  );
}

export default Game;
