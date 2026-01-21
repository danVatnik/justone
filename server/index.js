const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory lobby state
let players = [];
let gameStarted = false;
let playerIdCounter = 0;

// In-memory game state
let gameState = {
  round: 1,
  guesser: null,
  wordSelector: null,
  word: '',
  wordOptions: [],
  submittedWords: {}, // playerId -> word
  clues: {},
  scores: {},
  gamePhase: 'waiting' // 'waiting', 'word-selection', 'word-submission', 'display-words', 'clue-entry', 'clue-display', 'guessing', 'round-end'
};

// Word bank
const nouns = [
  'elephant', 'pizza', 'mountain', 'computer', 'butterfly', 'bicycle', 'rainbow', 'telescope',
  'guitar', 'lighthouse', 'dinosaur', 'volcano', 'spaceship', 'crystal', 'penguin', 'tornado',
  'castle', 'dolphin', 'tornado', 'sunset', 'puzzle', 'marble', 'whistle', 'anchor',
  'diamond', 'meteor', 'canyon', 'island', 'forest', 'wizard', 'phoenix', 'thunder',
  'galaxy', 'pyramid', 'mansion', 'fortress', 'temple', 'bridge', 'waterfall', 'desert',
  'ocean', 'jungle', 'meadow', 'garden', 'palace', 'cavern', 'canyon', 'glacier',
  'rocket', 'saxophone', 'umbrella', 'hammer', 'candle', 'mirror', 'camera', 'compass',
  'dragon', 'unicorn', 'treasure', 'pirate', 'robot', 'ninja', 'knight', 'astronaut',
  'violin', 'drums', 'piano', 'trumpet', 'flute', 'accordion', 'harmonica', 'tambourine',
  'helicopter', 'submarine', 'parachute', 'airplane', 'skateboard', 'surfboard', 'snowboard', 'kayak',
  'campfire', 'tent', 'lantern', 'backpack', 'map', 'binoculars', 'telescope', 'microscope',
  'magnet', 'battery', 'flashlight', 'thermometer', 'hourglass', 'clock', 'calendar', 'compass'
];

function getRandomWords(count = 5) {
  const shuffled = [...nouns].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// API Routes

// Join lobby
app.post('/api/lobby/join', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const playerId = ++playerIdCounter;
  const player = {
    id: playerId,
    name: name,
    isReady: false,
    joinedAt: new Date()
  };

  players.push(player);
  res.json({ playerId, success: true });
});

// Get all players in lobby
app.get('/api/lobby/players', (req, res) => {
  res.json({ 
    players: players,
    gameStarted: gameStarted
  });
});

// Mark player as ready
app.post('/api/lobby/ready', (req, res) => {
  const { playerId, isReady } = req.body;
  
  const player = players.find(p => p.id === playerId);
  if (player) {
    player.isReady = isReady;
  }

  res.json({ success: true });
});

// Start game (only if all players ready and at least 2 players)
app.post('/api/lobby/start', (req, res) => {
  const { playerId } = req.body;

  // Check if requester is the first player (host)
  if (players.length === 0 || players[0].id !== playerId) {
    return res.status(403).json({ error: 'Only host can start game' });
  }

  // Check if all players are ready
  if (players.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 players' });
  }

  if (!players.every(p => p.isReady)) {
    return res.status(400).json({ error: 'Not all players are ready' });
  }

  // Randomly shuffle players when game starts
  players = players.sort(() => Math.random() - 0.5);

  // Initialize game state
  gameStarted = true;
  gameState.round = 1;
  gameState.guesser = players[0];
  
  // Word selector is the second player, or first non-guesser
  gameState.wordSelector = players.length > 1 ? players[1] : players[0];
  
  gameState.gamePhase = 'word-selection';
  gameState.clues = {};
  gameState.scores = {};
  gameState.word = '';
  gameState.wordOptions = getRandomWords(5);
  
  // Initialize scores for all players
  players.forEach(player => {
    gameState.scores[player.id] = 0;
  });

  res.json({ success: true, message: 'Game started!' });
});

// Reset lobby
app.post('/api/lobby/reset', (req, res) => {
  players = [];
  gameStarted = false;
  res.json({ success: true });
});

// Get game state
app.get('/api/game/state', (req, res) => {
  // For guesser in guessing phase, only show clues after they're sent
  let cluesForGuesser = gameState.clues;
  const playerId = req.query.playerId ? parseInt(req.query.playerId) : null;
  const isGuesser = playerId && gameState.guesser && gameState.guesser.id === playerId;
  
  if (isGuesser && gameState.gamePhase !== 'guessing') {
    cluesForGuesser = {};
  }

  res.json({
    round: gameState.round,
    guesser: gameState.guesser,
    wordSelector: gameState.wordSelector,
    word: gameState.word,
    wordOptions: gameState.wordOptions,
    submittedWords: gameState.submittedWords,
    clues: cluesForGuesser,
    scores: gameState.scores,
    gameState: gameState.gamePhase,
    players: players
  });
});

// Generate new word options
app.post('/api/game/new-words', (req, res) => {
  gameState.wordOptions = getRandomWords(5);
  res.json({ wordOptions: gameState.wordOptions });
});

// Select word
app.post('/api/game/select-word', (req, res) => {
  const { word } = req.body;
  
  if (!gameState.wordOptions.includes(word)) {
    return res.status(400).json({ error: 'Invalid word selection' });
  }

  gameState.word = word;
  gameState.wordOptions = [];
  gameState.submittedWords = {};
  gameState.gamePhase = 'word-submission';
  
  res.json({ success: true, message: 'Word selected!' });
});

// Submit word
app.post('/api/game/submit-word', (req, res) => {
  const { playerId, word } = req.body;
  
  if (!word || !word.trim()) {
    return res.status(400).json({ error: 'Word is required' });
  }

  gameState.submittedWords[playerId] = word.trim().toLowerCase();
  
  // Check if all non-guesser players have submitted
  const editingPlayers = players.filter(p => p.id !== gameState.guesser.id);
  const allSubmitted = editingPlayers.every(p => gameState.submittedWords[p.id]);
  
  if (allSubmitted) {
    gameState.gamePhase = 'display-words';
  }
  
  res.json({ success: true, allSubmitted });
});

// Remove submitted words
app.post('/api/game/remove-words', (req, res) => {
  const { words } = req.body;
  
  if (!Array.isArray(words)) {
    return res.status(400).json({ error: 'Invalid words array' });
  }

  words.forEach(wordKey => {
    const [playerId] = wordKey.split('-');
    delete gameState.submittedWords[playerId];
  });

  res.json({ success: true });
});

// Confirm words and show to guesser
app.post('/api/game/confirm-words', (req, res) => {
  gameState.gamePhase = 'show-words-to-guesser';
  res.json({ success: true });
});

// Submit clue
app.post('/api/game/clue', (req, res) => {
  const { playerId, clue } = req.body;
  gameState.clues[playerId] = clue;
  
  // Check if all non-guesser players have submitted clues
  const editingPlayers = players.filter(p => p.id !== gameState.guesser.id);
  const allSubmitted = editingPlayers.every(p => gameState.clues[p.id]);
  
  if (allSubmitted) {
    gameState.gamePhase = 'clue-display';
  }
  
  res.json({ success: true, allSubmitted });
});

// Remove clues
app.post('/api/game/remove-clues', (req, res) => {
  const { playerIds } = req.body;
  
  if (!Array.isArray(playerIds)) {
    return res.status(400).json({ error: 'Invalid playerIds' });
  }

  playerIds.forEach(id => {
    delete gameState.clues[id];
  });

  res.json({ success: true });
});

// Start guessing phase
app.post('/api/game/start-guessing', (req, res) => {
  gameState.gamePhase = 'guessing';
  res.json({ success: true });
});

// Submit guess
app.post('/api/game/guess', (req, res) => {
  const { playerId, guess } = req.body;
  // Handle guess logic here
  res.json({ success: true, correct: guess === gameState.word });
});

// Next round
// Guesser done with round - rotate guesser
app.post('/api/game/guesser-done', (req, res) => {
  gameState.round++;
  gameState.submittedWords = {};
  gameState.clues = {};
  gameState.word = '';
  // Rotate guesser to next player
  const currentGuesserIndex = players.findIndex(p => p.id === gameState.guesser?.id);
  const nextGuesserIndex = (currentGuesserIndex + 1) % players.length;
  gameState.guesser = players[nextGuesserIndex];
  
  // Set word selector to the player after the guesser (first editing player)
  const wordSelectorIndex = (nextGuesserIndex + 1) % players.length;
  gameState.wordSelector = players[wordSelectorIndex];
  
  // Generate new word options for the word selector
  gameState.wordOptions = getRandomWords(5);
  
  gameState.gamePhase = 'word-selection';
  res.json({ success: true });
});

app.post('/api/game/next-round', (req, res) => {
  gameState.round++;
  gameState.clues = {};
  // Rotate guesser to next player
  const currentGuesserIndex = players.findIndex(p => p.id === gameState.guesser?.id);
  const nextGuesserIndex = (currentGuesserIndex + 1) % players.length;
  gameState.guesser = players[nextGuesserIndex];
  gameState.gamePhase = 'clue-entry';
  res.json({ success: true });
});

// Old routes (kept for reference)
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

app.get('/api/data', (req, res) => {
  res.json({
    data: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ]
  });
});

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all handler for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
