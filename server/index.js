const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allow all for prototyping
    methods: ["GET", "POST"]
  }
});

// Initial game state
const teams = [
  { id: 1, name: "Team 1", score: 0, currentRequest: null },
  { id: 2, name: "Team 2", score: 0, currentRequest: null },
  { id: 3, name: "Team 3", score: 0, currentRequest: null },
  { id: 4, name: "Team 4", score: 0, currentRequest: null },
  { id: 5, name: "Team 5", score: 0, currentRequest: null },
];

let currentConvention = null;
let lobby = [];
let players = {};

const needsList = [
  "We would like to borrow the sacred mask from your museum for our community’s winter ceremony.",
  "Please let us use the old forest trail to visit our relatives without needing a special permit.",
  "Could we put our traditional village names on the highway signs next to the English ones?",
  "We’d like to invite an elder to speak in history class so we can hear both sides of the story.",
  "Can we use the empty lot to grow local medicine instead of planting more decorative grass?",
  "We are asking the school to allow traditional headwear as part of the official graduation uniform.",
  "We would like to see the payroll to make sure local workers are getting the same hourly rate.",
  "Could the town move the construction site away from the stream where we go to pray?",
  "Would you mind printing the new community rules in our language so everyone can follow them?",
  "Could we hold the town hall in our community center so our elders feel comfortable attending?",
  "We are asking for a plaque in the park to honor our local soldiers who fought in your wars.",
  "Could you help us promote local artists so they don't lose business to the big mall imports?",
  "Could we add books by our local authors to the library instead of just the ones from the capital?",
  "We’d like to take the day off for our Harvest Festival without it counting as an unexcused absence.",
  "Please stop tourists from climbing the rock hill; it is a place of prayer, not a photo spot.",
  "Could the local station play one hour of our traditional music every day to keep the language alive?",
  "Can we put a community fire pit in the park so we can continue our storytelling traditions at night?",
  "We ask that the doctors respect our traditional herbal medicine when they treat our elders.",
  "Please let us keep our small backyard chickens; they are a tradition, not just 'livestock' to us.",
  "Could the community center stay open late for our youth so they don't lose touch with their peers?",
  "We need the government to bring Wi-Fi to our village so our kids can study as well as the city kids.",
  "May we gather fallen wood from the state park for our winter fires as our grandfathers always did?",
  "Would you consider flying our community flag alongside the national flag at the post office?",
  "When you count us, please let us check the box for our actual tribe instead of just 'Other'.",
  "Could the judge sit in a circle with us during the hearing so it feels like a fair conversation?",
  "Could the city bus route stop at our community garden so the elders don't have to walk so far?",
  "We’d like to paint a mural of our history on the side of the school to replace the blank grey wall.",
  "Please include rice and lentils in the food hampers instead of just canned pasta and bread.",
  "Could you put a fence around the old cemetery so people don't walk their dogs over our ancestors?",
  "We’d like the school to give credit for learning our traditional weaving, not just for shop class",
  "Please excuse the drums during our wedding celebrations; they are part of the ceremony, not just noise.",
  "We ask that the new tourist maps show the locations of our historical sites, not just the new malls.",
];

const conventionsList = [
  "You cannot use any words containing the letter 'E'",
  "You must perform a deep, respectful bow after every 3 words you speak.",
  "You cannot use 'I' or 'we' You must refer to yourself and your group by a title (e.g., 'This humble village asks...')",
  "You must speak in a 'sing-song' voice or a rhythmic chant",
  "You must keep your tongue pressed against the roof of your mouth while speaking.",
  "You cannot use the specific names of the objects in your request. You must describe them instead (e.g., instead of 'books,' say 'paper with ink').",
  "Every single sentence you say must end with the phrase: '...if that is okay with you?'",
  "You must take a massive, audible breath between every single word.",
  "You cannot use any words that have more than one syllable (e.g., 'request' becomes 'ask').",
  "You must keep your arms pinned to your sides and your eyes fixed on the floor; you cannot look at the Authority.",
  "You cannot use any words that start with the letter 'S' (no 'school,' 'signs,' or 'soldiers').",
  "You must repeat the first word of every sentence three times before continuing (e.g., 'Please, please, please let us...').",
  "You must speak with your teeth touching at all times.",
  "Every sentence must contain at least two words that start with the same letter.",
  "You cannot use the words 'No,' 'Not,' or 'Don't.' You must phrase everything positively.",
  "The last word of your request must rhyme with your own name.",
  "You must start every sentence with a long, overly formal greeting (e.g., 'O Great and Powerful Leader of the Modern World...').",
  "You must clap once after every five words.",
  "You must memorize your request and say it in one go. (will be nice)"
];

const AUTHORITY_PASSWORD = "Hippo12$";

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send initial state to the connected client
  socket.emit('gameStateUpdate', { teams, currentConvention, lobby, players });

  socket.on('reconnectPlayer', (playerId) => {
    socket.join(playerId);
    if (players[playerId]) {
      socket.emit('myPlayerState', { name: players[playerId].name, teamId: players[playerId].teamId, isKicked: false });
    }
  });

  socket.on('joinLobby', ({ playerId, name }, callback) => {
    if (!players[playerId]) {
      lobby.push({ id: playerId, name });
      players[playerId] = { name, teamId: null };
      socket.join(playerId);
      io.emit('gameStateUpdate', { teams, currentConvention, lobby, players });
      socket.emit('myPlayerState', { name, teamId: null, isKicked: false });
      if (callback) callback({ success: true });
    }
  });

  socket.on('leaveTeam', (playerId) => {
    if (players[playerId] && players[playerId].teamId !== null) {
      players[playerId].teamId = null;
      if (!lobby.find(p => p.id === playerId)) {
        lobby.push({ id: playerId, name: players[playerId].name });
      }
      io.to(playerId).emit('myPlayerState', { name: players[playerId].name, teamId: null, isKicked: false });
      io.emit('gameStateUpdate', { teams, currentConvention, lobby, players });
    }
  });

  socket.on('assignTeam', ({ playerId, teamId }) => {
    lobby = lobby.filter(p => p.id !== playerId);
    if (players[playerId]) {
      players[playerId].teamId = teamId;
      io.to(playerId).emit('myPlayerState', { name: players[playerId].name, teamId, isKicked: false });
    }
    io.emit('gameStateUpdate', { teams, currentConvention, lobby, players });
  });

  socket.on('kickPlayer', (playerId) => {
    lobby = lobby.filter(p => p.id !== playerId);
    if (players[playerId]) {
      io.to(playerId).emit('myPlayerState', { name: players[playerId].name, teamId: null, isKicked: true });
      delete players[playerId];
    }
    io.emit('gameStateUpdate', { teams, currentConvention, lobby, players });
  });

  // Authority login
  socket.on('authorityLogin', (password, callback) => {
    if (password === AUTHORITY_PASSWORD) {
      callback({ success: true });
    } else {
      callback({ success: false, message: "Invalid password" });
    }
  });

  // Team generating a request
  socket.on('generateRequest', (teamId, callback) => {
    const teamIndex = teams.findIndex(t => t.id === teamId);
    if (teamIndex === -1) return;

    if (teams[teamIndex].currentRequest) {
      if (callback) callback({ success: false, message: "You already have an active request!" });
      return;
    }

    const randomRequest = needsList[Math.floor(Math.random() * needsList.length)];
    teams[teamIndex].currentRequest = randomRequest;

    io.emit('gameStateUpdate', { teams, currentConvention, lobby, players });
    if (callback) callback({ success: true });
  });

  // Authority rolling a new convention
  socket.on('rollConvention', () => {
    const randomConvention = conventionsList[Math.floor(Math.random() * conventionsList.length)];
    currentConvention = randomConvention;
    io.emit('gameStateUpdate', { teams, currentConvention, lobby, players });
  });

  // Authority approves request
  socket.on('approveRequest', (teamId) => {
    const teamIndex = teams.findIndex(t => t.id === teamId);
    if (teamIndex !== -1) {
      teams[teamIndex].score += 1;
      teams[teamIndex].currentRequest = null;
      io.emit('gameStateUpdate', { teams, currentConvention, lobby, players });
    }
  });

  // Authority rejects request
  socket.on('rejectRequest', (teamId) => {
    const teamIndex = teams.findIndex(t => t.id === teamId);
    if (teamIndex !== -1) {
      teams[teamIndex].score -= 1;
      teams[teamIndex].currentRequest = null;
      io.emit('gameStateUpdate', { teams, currentConvention, lobby, players });
    }
  });

  socket.on('resetScores', () => {
    teams.forEach(t => {
      t.score = 0;
      t.currentRequest = null;
    });
    io.emit('gameStateUpdate', { teams, currentConvention, lobby, players });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
