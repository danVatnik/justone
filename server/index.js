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
  roleHistory: { // Track which players have had which roles
    guessers: [], // Array of player IDs who have been guesser
    wordSelectors: [] // Array of player IDs who have been word selector
  },
  gamePhase: 'waiting' // 'waiting', 'word-selection', 'word-submission', 'display-words', 'clue-entry', 'clue-display', 'guessing', 'round-end'
};

// Word bank - Just One official word list
const nouns = [
  'BRANCH', 'CINDERELLA', 'CREPE', 'ISLAND', 'TAXI', 'SAIL', 'CHEDDAR', 'SHREK', 'POLE', 'WESTERN',
  'VIKING', 'ALARM', 'DANCE', 'HULK', 'DESERT', 'GOAL', 'BREAD', 'DEVIL', 'PRIMARY', 'TARZAN',
  'SCREW', 'RAKE', 'COMPUTER', 'STARBUCKS', 'BALL', 'SERIES', 'NEST', 'SPICE', 'ELEPHANT', 'CARNIVAL',
  'VENGEANCE', 'BOSS', 'EMERGENCY', 'CROSS', 'WALTZ', 'MAFIA', 'LARGE', 'MISSILE', 'MICROSOFT', 'SKI',
  'GENIUS', 'DRACULA', 'LION', 'SOCK', 'FRIDAY', 'COCKTAIL', 'MARIO', 'CORK', 'VIOLIN', 'PEACH',
  'RAT', 'PLIER', 'AMAZON', 'TOBACCO', 'RULER', 'HANUKKAH', 'ELASTIC', 'PAN', 'FLASH', 'TUNNEL',
  'FOX', 'POLICE', 'SIMPSON', 'LIGHTNING', 'NEWSPAPER', 'MOUNTAIN', 'PEANUT', 'LIGHTBULB', 'JEDI', 'PIMENTO',
  'SOMBRERO', 'CLOVER', 'BUTTON', 'CHEESE', 'CHEWBACCA', 'WIDOWMAKER', 'DOCTOR', 'STRAWBERRY', 'NUCLEAR', 'LOTTERY',
  'CEMETERY', 'CUPID', 'UMBRELLA', 'LEAP', 'ROOT', 'TREASURE', 'PILOT', 'MICKEY', 'SEWER', 'GALAXY',
  'MYTH', 'FACEBOOK', 'ACORN', 'BONE', 'BRIDGE', 'CRANE', 'OPERATION', 'RAP', 'MUSE', 'DEFENSE',
  'LIGHT', 'SOFA', 'MOZART', 'RING', 'PIZZA', 'KNIGHT', 'PEACE', 'FLOWER', 'SWITZERLAND', 'CALENDAR',
  'SYRUP', 'FOREST', 'SCALE', 'ZEUS', 'COCKROACH', 'PIRATE', 'VACATION', 'ELF', 'MAGNET', 'FORK',
  'BUFFY', 'VOLCANO', 'PASSION', 'ROOSTER', 'ELECTRICITY', 'BAKER', 'PERFUME', 'FLAME', 'ZOMBIE', 'JOKER',
  'POISON', 'STAR', 'WOLF', 'JONES', 'ANNIVERSARY', 'HAMMER', 'CHILE', 'GUMBO', 'EMPEROR', 'POPE',
  'HOLLYWOOD', 'MOSQUITO', 'SPEAR', 'PURSE', 'END', 'BOARD', 'FIREMAN', 'GLASS', 'BURRITO', 'GREECE',
  'SLIPPER', 'LEAF', 'COUGAR', 'REVOLUTION', 'SAHARA', 'GROTTO', 'FORD', 'CASINO', 'CANDY', 'FOUNTAIN',
  'FLINTSTONE', 'ROBOT', 'COMEDY', 'LANGUAGE', 'HAIRDRESSER', 'DINOSAUR', 'YELLOW', 'MUSHROOM', 'PIGEON', 'PIKACHU',
  'THUNDER', 'GARDEN', 'PAINTING', 'SHACK', 'TRUCE', 'MUMMY', 'BATTERY', 'FAIR', 'KARATE', 'PARROT',
  'OLYMPICS', 'CLIMB', 'LAWYER', 'TOLKIEN', 'RIVER', 'CARPET', 'PONY', 'CROWN', 'NEW', 'TARANTINO',
  'BARBIE', 'CHOCOLATE', 'SNOW', 'TIE', 'WIND', 'THOUGHT', 'FRANKENSTEIN', 'SHELF', 'ACCENT', 'SHOWER',
  'STEW', 'CANADA', 'ZOO', 'PIPE', 'BOOK', 'TOWEL', 'VENUS', 'OCTOPUS', 'CYCLE', 'OPERA',
  'LADYBUG', 'MUSTARD', 'SHERLOCK', 'BOTTLE', 'VIRUS', 'MUSIC', 'THROAT', 'AMERICA', 'COFFEE', 'FEVER',
  'GOOGLE', 'BOW', 'MARS', 'GOLF', 'TICKET', 'REGISTER', 'PLAYSTATION', 'BLOND', 'IRIS', 'LIMB',
  'OPRAH', 'NINJA', 'COMFORTER', 'HUNTER', 'VEGETABLE', 'OVEN', 'SOCKET', 'EASTER', 'HOSE', 'RAIL',
  'BUTTERFLY', 'POWDER', 'PORCELAIN', 'MARKET', 'COCOON', 'BARBECUE', 'PANDA', 'DREAM', 'MARRIAGE', 'BELLYBUTTON',
  'CAVITY', 'SLEEVE', 'GREMLINS', 'POKER', 'PIE', 'SUGAR', 'THEATER', 'SHOVEL', 'DUNE', 'PREGNANT',
  'CAT', 'PALACE', 'ELECTION', 'HONEY', 'RAMBO', 'REGGAE', 'MANURE', 'LAKE', 'MONKEY', 'LIGHTHOUSE',
  'NEIGHBORHOOD', 'ROCK', 'TIGER', 'NEEDLE', 'SOAP', 'PRISON', 'HOLE', 'PUNK', 'EVENING', 'MAP',
  'NUMBER', 'DECATHLON', 'RUM', 'METAL', 'TUNA', 'KING', 'BALLET', 'BAND', 'ALCOHOL', 'LAVA',
  'CANVAS', 'VAMPIRE', 'MONOPOLY', 'CARTOON', 'HOTEL', 'DARWIN', 'TOMATO', 'PARACHUTE', 'CANNON', 'BINOCULARS',
  'MIRAGE', 'RAMSES', 'BONFIRE', 'CROSSROADS', 'PRINCESS', 'GUILLOTINE', 'MAGICIAN', 'HOCKEY', 'BANANA', 'FITZGERALD',
  'CAESAR', 'NOODLE', 'HAT', 'DENTIST', 'WHEAT', 'SHELL', 'SHAKESPEARE', 'GIANT', 'FOAM', 'CAVE',
  'KNIFE', 'PILLOW', 'ARMSTRONG', 'SWORD', 'FLIGHT', 'EXPLOSION', 'PENGUIN', 'CELL', 'GANDHI', 'OASIS',
  'CROCODILE', 'JEWELRY', 'SUBWAY', 'GLASSES', 'STING', 'JACKSON', 'CIGARETTE', 'BRACELET', 'WEATHER', 'TOWER',
  'TATTOO', 'SPIELBERG', 'APPLE', 'SIREN', 'BOXING', 'HEART', 'MOSCOW', 'POOL', 'UNICORN', 'ORANGE',
  'MELON', 'ANCHOR', 'ISRAEL', 'CACTUS', 'TENNIS', 'PEPPER', 'TRIANGLE', 'DOLL', 'ITALY', 'SCENE',
  'POLAR', 'MOUSE', 'NECKLACE', 'FARM', 'BELGIUM', 'FRANCE', 'MOON', 'CAFETERIA', 'HANDLE', 'TOOL',
  'STRING', 'AUSTRALIA', 'CASTLE', 'GUARD', 'SHEEP', 'PUPPET', 'GAME', 'VEGAS', 'SAFE', 'PLANE',
  'BRAIN', 'MASK', 'CONCERT', 'TROY', 'SHARK', 'LONELY', 'POTATO', 'WAVE', 'SCHOOL', 'LEGO',
  'TOKYO', 'HEEL', 'CHICKEN', 'HELICOPTER', 'COLONEL', 'TRADITION', 'SNAKE', 'CUP', 'PICASSO', 'WATCH',
  'CAKE', 'STALLION', 'MEXICO', 'WHITE', 'BALD', 'CATERPILLAR', 'HUMOR', 'CORNER', 'ANTARCTICA', 'SAUSAGE',
  'PLASTIC', 'RAY', 'CARTON', 'PEBBLE', 'EVEREST', 'TERMINATOR', 'LETTER', 'DRAG', 'PARADISE', 'EGG',
  'NINTENDO', 'BET', 'SALT', 'MANUAL', 'FROST', 'HOUSE', 'GODFATHER', 'WAR', 'ROPE', 'WINE',
  'CLUB', 'CHRISTMAS', 'FASHION', 'STATION', 'LAMP', 'RADIO', 'PEAR', 'GLADIATOR', 'SUN', 'CEREAL',
  'BERRY', 'STUDY', 'GOTHIC', 'TITANIC', 'MACHINE', 'DWARF', 'CIRCUS', 'ELVIS', 'MOWER', 'STONE',
  'TRAIN', 'SHRIMP', 'ROOM', 'CLEOPATRA', 'WINDOW', 'TANGO', 'RIPE', 'TEMPLE', 'SAND', 'FRIES',
  'GRENADE', 'STUFFING', 'BRUSH', 'PIG', 'HUMAN', 'ALCATRAZ', 'SMOKE', 'HAZELNUT', 'DIAMOND', 'ROSE',
  'GODZILLA', 'UNIFORM', 'RAIN', 'FIRE', 'HELMET', 'SHIP', 'BOWLING', 'CHURCHILL', 'RAM', 'SPY',
  'HALLOWEEN', 'CHIP', 'BABY', 'CANTEEN', 'PAIR', 'FAILURE', 'HISTORY', 'BEER', 'DISCO', 'PRESIDENT',
  'MIRROR', 'PROM', 'BATH', 'PIT', 'FAIRY', 'LADDER', 'ANGEL', 'MAD', 'HAIR', 'MATRIX',
  'MUSTACHE', 'BUBBLE', 'CHAIN', 'STARK', 'COOKIE', 'AVATAR', 'MILL', 'JUNGLE', 'NUN', 'FIRECRACKER',
  'IRON', 'BATMAN', 'SONG', 'NILE', 'CINEMA', 'PUMP', 'ALADDIN', 'TUBE', 'BELT', 'BAR',
  'MOUTH', 'CAROUSEL', 'PSYCHO', 'GRASS', 'FALL', 'DOPING', 'GARLIC', 'CUBE', 'ROCKY', 'MILK',
  'ICE', 'FLUTE', 'CHAMPAGNE', 'SAFARI', 'ALIEN', 'CANE', 'MUSKETEER', 'THREAD', 'TULIP', 'IKEA',
  'CROISSANT', 'GHOST', 'STRAW', 'NAIL', 'POTTER', 'SPARTACUS', 'FUR', 'TORNADO', 'PYRAMID', 'ALLIANCE'
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
    isReady: true,
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
  
  // Initialize role history
  gameState.roleHistory = {
    guessers: [players[0].id],
    wordSelectors: [gameState.wordSelector.id]
  };
  
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
    players: players,
    roleHistory: gameState.roleHistory
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
  
  // Update role history
  if (!gameState.roleHistory.guessers.includes(gameState.guesser.id)) {
    gameState.roleHistory.guessers.push(gameState.guesser.id);
  }
  if (!gameState.roleHistory.wordSelectors.includes(gameState.wordSelector.id)) {
    gameState.roleHistory.wordSelectors.push(gameState.wordSelector.id);
  }
  
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
  
  // Update role history
  if (!gameState.roleHistory.guessers.includes(gameState.guesser.id)) {
    gameState.roleHistory.guessers.push(gameState.guesser.id);
  }
  
  gameState.gamePhase = 'clue-entry';
  res.json({ success: true });
});

// Admin: Start custom round with selected guesser and word selector
app.post('/api/game/admin-start-round', (req, res) => {
  const { guesserId, wordSelectorId } = req.body;
  
  const guesserPlayer = players.find(p => p.id === guesserId);
  const wordSelectorPlayer = players.find(p => p.id === wordSelectorId);
  
  if (!guesserPlayer || !wordSelectorPlayer) {
    return res.status(400).json({ error: 'Invalid player IDs' });
  }
  
  if (guesserId === wordSelectorId) {
    return res.status(400).json({ error: 'Guesser and word selector must be different players' });
  }
  
  // Reset round state
  gameState.submittedWords = {};
  gameState.clues = {};
  gameState.word = '';
  gameState.guesser = guesserPlayer;
  gameState.wordSelector = wordSelectorPlayer;
  
  // Update role history
  if (!gameState.roleHistory.guessers.includes(guesserPlayer.id)) {
    gameState.roleHistory.guessers.push(guesserPlayer.id);
  }
  if (!gameState.roleHistory.wordSelectors.includes(wordSelectorPlayer.id)) {
    gameState.roleHistory.wordSelectors.push(wordSelectorPlayer.id);
  }
  
  gameState.wordOptions = getRandomWords(5);
  gameState.gamePhase = 'word-selection';
  
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
