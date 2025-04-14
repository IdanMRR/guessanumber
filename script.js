// Firebase Configuration (Replace with your Firebase config)
const firebaseConfig = {
  apiKey: "AIzaSyBzzTwllahtyNSFkEoWByEWqbVfS8ZeMVw",
  authDomain: "first-ai-game-ca35b.firebaseapp.com",
  databaseURL: "https://first-ai-game-ca35b-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "first-ai-game-ca35b",
  storageBucket: "first-ai-game-ca35b.firebasestorage.app",
  messagingSenderId: "323571879533",
  appId: "1:323571879533:web:36731104b3b87008aaf964",
  measurementId: "G-QTJ9REPVDG"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements
const gameArea = document.getElementById("gameArea");
const settingsMenu = document.getElementById("settingsMenu");
const statsMenu = document.getElementById("statsMenu");
const achievementsMenu = document.getElementById("achievementsMenu");
const leaderboardMenu = document.getElementById("leaderboardMenu");
const adminPanel = document.getElementById("adminPanel");
const usernameSection = document.getElementById("usernameSection");
const usernameInput = document.getElementById("usernameInput");
const adminPasswordSection = document.getElementById("adminPasswordSection");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const submitUsernameBtn = document.getElementById("submitUsernameBtn");
const cancelUsernameBtn = document.getElementById("cancelUsernameBtn");
const gameSelection = document.getElementById("gameSelection");
const selectNumberGuessBtn = document.getElementById("selectNumberGuessBtn");
const selectMemoryMatchBtn = document.getElementById("selectMemoryMatchBtn");
const selectTriviaBtn = document.getElementById("selectTriviaBtn");
const numberGuessGame = document.getElementById("numberGuessGame");
const memoryMatchGame = document.getElementById("memoryMatchGame");
const triviaGame = document.getElementById("triviaGame");
const difficultySelect = document.getElementById("difficulty");
const gameModeSelect = document.getElementById("gameMode");
const highscoreDisplay = document.getElementById("highscore");
const startGameBtn = document.getElementById("startGameBtn");
const stopGameBtn = document.getElementById("stopGameBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const inputContainer = document.getElementById("inputContainer");
const guessInput = document.getElementById("guessInput");
const guessButton = document.getElementById("guessButton");
const hintButton = document.getElementById("hintButton");
const message = document.getElementById("message");
const livesDisplay = document.getElementById("livesDisplay");
const timerDisplay = document.getElementById("timer");
const idleTimerDisplay = document.getElementById("idleTimer");
const memoryDifficultySelect = document.getElementById("memoryDifficulty");
const startMemoryMatchBtn = document.getElementById("startMemoryMatchBtn");
const memoryBoard = document.getElementById("memoryBoard");
const memoryMessage = document.getElementById("memoryMessage");
const memoryTimer = document.getElementById("memoryTimer");
const memoryMoves = document.getElementById("memoryMoves");
const restartMemoryMatchBtn = document.getElementById("restartMemoryMatchBtn");
const triviaCategorySelect = document.getElementById("triviaCategory");
const startTriviaBtn = document.getElementById("startTriviaBtn");
const triviaQuestion = document.getElementById("triviaQuestion");
const triviaQuestionText = document.getElementById("triviaQuestionText");
const triviaOptions = document.getElementById("triviaOptions");
const triviaMessage = document.getElementById("triviaMessage");
const triviaScore = document.getElementById("triviaScore");
const triviaTimer = document.getElementById("triviaTimer");
const restartTriviaBtn = document.getElementById("restartTriviaBtn");
const settingsBtn = document.getElementById("settingsBtn");
const statsBtn = document.getElementById("statsBtn");
const viewStatsBtn = document.getElementById("viewStatsBtn");
const viewAchievementsBtn = document.getElementById("viewAchievementsBtn");
const viewLeaderboardBtn = document.getElementById("viewLeaderboardBtn");
const clearLeaderboardBtn = document.getElementById("clearLeaderboardBtn");
const muteBtn = document.getElementById("muteBtn");
const vibrationBtn = document.getElementById("vibrationBtn");
const changeUsernameBtn = document.getElementById("changeUsernameBtn");
const volumeControl = document.getElementById("volumeControl");
const themeSelect = document.getElementById("themeSelect");
const confettiTypeSelect = document.getElementById("confettiType");
const confettiAmountSelect = document.getElementById("confettiAmount");
const gradientColor1 = document.getElementById("gradientColor1");
const gradientColor2 = document.getElementById("gradientColor2");
const applyGradientBtn = document.getElementById("applyGradientBtn");
const resetGradientBtn = document.getElementById("resetGradientBtn");
const rgbBtn = document.getElementById("rgbBtn");
const performanceModeBtn = document.getElementById("performanceModeBtn");
const vibrationSupportMessage = document.getElementById("vibrationSupportMessage");
const backToGameBtn = document.getElementById("backToGame");
const backToGameFromStatsBtn = document.getElementById("backToGameFromStats");
const backToGameFromAchievementsBtn = document.getElementById("backToGameFromAchievements");
const backToGameFromLeaderboardBtn = document.getElementById("backToGameFromLeaderboard");
const backToGameFromAdminBtn = document.getElementById("backToGameFromAdmin");
const resetStatsBtn = document.getElementById("resetStatsBtn");
const sortStatsSelect = document.getElementById("sortStats");
const averageTimeDisplay = document.getElementById("averageTime");
const successRateDisplay = document.getElementById("successRate");
const detailedStatsList = document.getElementById("detailedStatsList");
const achievementsList = document.getElementById("achievementsList");
const leaderboardList = document.getElementById("leaderboardList");
const statsChartCanvas = document.getElementById("statsChart");
const confirmationDialog = document.getElementById("confirmationDialog");
const confirmationMessage = document.getElementById("confirmationMessage");
const adminUserSelect = document.getElementById("adminUserSelect");
const adminUserPoints = document.getElementById("adminUserPoints");
const adminBanUserSelect = document.getElementById("adminBanUserSelect");
const banUserBtn = document.getElementById("banUserBtn");
const adminBanMessage = document.getElementById("adminBanMessage");
const resetLeaderboardBtn = document.getElementById("resetLeaderboardBtn");

// Sound Manager
class SoundManager {
  constructor() {
    this.sounds = {
      click: new Audio("sounds/click.mp3"),
      success: new Audio("sounds/win.mp3"),
      fail: new Audio("sounds/lose.mp3"),
      hint: new Audio("sounds/hint.mp3"),
      gameOver: new Audio("sounds/overgame.mp3")
    };
    this.muted = JSON.parse(localStorage.getItem("muted")) || false;
    this.volume = parseFloat(localStorage.getItem("volume")) || 1;
    this.updateVolume();
    this.updateMuteButton();
  }

  play(sound) {
    if (!this.muted) {
      const audio = this.sounds[sound];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(err => {
          console.error(`Failed to play ${sound} sound:`, err);
          showMessage("שגיאה בניגון צליל. בדוק את חיבור האינטרנט או הגדרות השמע.");
        });
      }
    }
  }

  updateVolume() {
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
    localStorage.setItem("volume", this.volume);
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem("muted", this.muted);
    this.updateMuteButton();
  }

  updateMuteButton() {
    muteBtn.textContent = this.muted ? "🔇 בטל השתקה" : "🔊 השתק סאונד";
  }
}

const soundManager = new SoundManager();

// Vibration Manager
class VibrationManager {
  constructor() {
    this.enabled = JSON.parse(localStorage.getItem("vibration")) || true;
    this.supported = "vibrate" in navigator;
    this.updateVibrationButton();
    this.updateSupportMessage();
  }

  vibrate(pattern) {
    console.log("Vibration attempt - Enabled:", this.enabled, "Supported:", this.supported, "Pattern:", pattern);
    if (this.enabled && this.supported) {
      navigator.vibrate(pattern);
    } else {
      console.log("Vibration skipped - Enabled:", this.enabled, "Supported:", this.supported);
    }
  }

  toggleVibration() {
    if (!this.supported) return;
    this.enabled = !this.enabled;
    localStorage.setItem("vibration", this.enabled);
    this.updateVibrationButton();
  }

  updateVibrationButton() {
    vibrationBtn.textContent = this.enabled ? "📳 כבה ויברציה" : "📳 הפעל ויברציה";
  }

  updateSupportMessage() {
    vibrationSupportMessage.textContent = this.supported ? "רטט נתמך במכשיר זה" : "רטט אינו נתמך במכשיר זה";
  }
}
const vibrationManager = new VibrationManager();


// Game State
const ADMIN_PASSWORD = "Ghsi1231210";
let currentGame = "numberGuess";
let username = "";
let isAdmin = false;
let performanceMode = JSON.parse(localStorage.getItem("performanceMode")) || false; // New variable
let bannedUsers = JSON.parse(localStorage.getItem("bannedUsers")) || [];
let statsChart = null;
let rgbInterval = null;
let hue = 0;

// Number Guessing Game State
let secretNumber = 0;
let lives = 3;
let maxLives = 3;
let guesses = 0;
let timer = 0;
let timerInterval = null;
let idleTimer = 0;
let idleInterval = null;
let gameActive = false;
let hintsUsed = 0;
let hintUsedThisGame = false;
let highscore = 0;

// Memory Match Game State
let memoryCards = [];
let memoryFlippedCards = [];
let memoryMatchesFound = 0;
let memoryGameActive = false;
let memoryTimerInterval = null;

// Trivia Game State
let triviaQuestions = {
  general: [
    { question: "מי המציא את הנורה?", options: ["תומאס אדיסון", "אלכסנדר גרהם בל", "מייקל פאראדיי", "ניקולה טסלה"], answer: "תומאס אדיסון" },
    { question: "מהי בירת צרפת?", options: ["פריז", "לונדון", "ברלין", "רומא"], answer: "פריז" }
  ],
  history: [
    { question: "מי היה ראש הממשלה הראשון של ישראל?", options: ["דוד בן-גוריון", "מנחם בגין", "יצחק רבין", "שמעון פרס"], answer: "דוד בן-גוריון" },
    { question: "באיזו שנה הסתיימה מלחמת העולם השנייה?", options: ["1945", "1939", "1941", "1950"], answer: "1945" }
  ],
  science: [
    { question: "מהו היסוד הכימי עם הסמל H?", options: ["מימן", "חמצן", "פחמן", "חנקן"], answer: "מימן" },
    { question: "מי גילה את כוח הכבידה?", options: ["אייזק ניוטון", "אלברט איינשטיין", "גלילאו גליליי", "מייקל פאראדיי"], answer: "אייזק ניוטון" }
  ]
};
let triviaCurrentQuestion = 0;
let triviaScoreValue = 0;
let triviaGameActive = false;
let triviaTimerInterval = null;

// Stats and Achievements
let stats = { gamesPlayed: 0, wins: 0, totalGuesses: 0, totalTime: 0, playerStats: [] };
let achievements = [
  { id: 1, name: "ניצחון ראשון", description: "נצח במשחק הראשון שלך", condition: (stats) => stats.wins >= 1, reward: "theme", rewardValue: "space", unlocked: false },
  { id: 2, name: "מהיר כמו ברק", description: "נצח תוך פחות מ-10 שניות", condition: (stats) => stats.playerStats.some(game => game.time < 10 && game.won), reward: "confetti", rewardValue: "butterflies", unlocked: false },
  { id: 3, name: "מומחה ניחושים", description: "נצח 5 משחקים", condition: (stats) => stats.wins >= 5, unlocked: false },
  { id: 4, name: "בלי עזרה", description: "נצח במצב 'בלי רמזים'", condition: (stats) => stats.playerStats.some(game => game.mode === "noHints" && game.won), unlocked: false },
  { id: 5, name: "מאסטר קושי", description: "נצח במצב קשה", condition: (stats) => stats.playerStats.some(game => game.difficulty === 100 && game.won), unlocked: false },
  { id: 6, name: "זיכרון מעולה", description: "נצח במשחק זיכרון ברמת קושי קשה", condition: (stats) => stats.playerStats.some(game => game.gameType === "memoryMatch" && game.difficulty === 12 && game.won), unlocked: false },
  { id: 7, name: "מלך הטריוויה", description: "צבור 5 נקודות בטריוויה", condition: (stats) => stats.playerStats.some(game => game.gameType === "trivia" && game.score >= 5), unlocked: false }
];
let unlockedThemes = ["dark", "light", "neon"];
let unlockedConfetti = ["default", "stars", "hearts", "none"];

// Mode translations for Hebrew display
const modeTranslations = {
  "normal": "רגיל",
  "fast": "מהיר (30 שניות)",
  "noHints": "בלי רמזים",
  "dynamicRange": "טווח משתנה"
};

// Daily Challenges
let dailyChallenges = [
  { id: 1, description: "נצח משחק ניחושים ברמת קושי קשה", condition: (game) => game.gameType === "numberGuess" && game.difficulty === 100 && game.won, rewardPoints: 50 },
  { id: 2, description: "צבור 3 נקודות בטריוויה", condition: (game) => game.gameType === "trivia" && game.score >= 3, rewardPoints: 30 },
  { id: 3, description: "סיים משחק זיכרון בינוני תוך פחות מ-30 שניות", condition: (game) => game.gameType === "memoryMatch" && game.difficulty === 8 && game.time < 30 && game.won, rewardPoints: 40 }
];
let completedChallenges = JSON.parse(localStorage.getItem(`${username}_completedChallenges`)) || { date: "", challenges: [] };

// Load Settings
function loadSettings() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  themeSelect.value = savedTheme;

  const savedConfettiType = localStorage.getItem("confettiType") || "default";
  confettiTypeSelect.value = savedConfettiType;

  const savedConfettiAmount = localStorage.getItem("confettiAmount") || "medium";
  confettiAmountSelect.value = savedConfettiAmount;

  document.body.classList.remove("dark", "light", "neon", "space", "gradient", "rgb");
  document.body.style.background = "";
  document.body.style.backgroundSize = "";
  document.body.style.animation = "";
  document.body.style.backgroundColor = "";

  const savedGradient = JSON.parse(localStorage.getItem("customGradient"));
  if (savedGradient) {
    gradientColor1.value = savedGradient.color1;
    gradientColor2.value = savedGradient.color2;
    applyCustomGradient(savedGradient.color1, savedGradient.color2);
  } else {
    document.body.classList.add(savedTheme);
  }

  const rgbEnabled = localStorage.getItem("rgbEnabled") === "true";
  if (rgbEnabled && !performanceMode) {
    document.body.classList.add("rgb");
    startRGBWaves();
    if (rgbBtn) {
      rgbBtn.textContent = "כבה גלי צבעים";
    }
  }

  // Add safeguard for soundManager
  if (soundManager) {
    volumeControl.value = soundManager.volume;
  } else {
    console.error("soundManager is not initialized yet");
    volumeControl.value = 1; // Fallback value
  }

  // Set initial state of performance mode button
  if (performanceModeBtn) {
    performanceModeBtn.textContent = performanceMode ? "כבה מצב ביצועים" : "הפעל מצב ביצועים";
  }
}
// Apply Custom Gradient
function applyCustomGradient(color1, color2) {
  document.body.classList.remove("dark", "light", "neon", "space", "gradient", "rgb", "slow", "medium", "fast");
  document.body.style.background = `linear-gradient(45deg, ${color1}, ${color2})`;
  document.body.style.backgroundSize = "600%";
  document.body.style.animation = "gradient 15s ease infinite";
  document.body.classList.add("gradient");
  localStorage.setItem("customGradient", JSON.stringify({ color1, color2 }));
}

// RGB Waves
function startRGBWaves() {
  if (performanceMode) return; // Skip if performance mode is enabled
  stopRGBWaves();
  document.body.style.background = "none";
  document.body.style.backgroundImage = "none";
  document.body.style.backgroundSize = "";
  document.body.style.animation = "";
  document.body.style.animationFillMode = "";
  const intervalTime = 50; // Hardcode to "medium" speed (50ms interval)
  rgbInterval = setInterval(() => {
    hue = (hue + 1) % 360;
    const color = `hsl(${hue}, 100%, 50%)`;
    document.body.style.backgroundColor = color;
    document.body.style.background = "none";
    document.body.style.backgroundImage = "none";
  }, intervalTime);
}
function stopRGBWaves() {
  if (rgbInterval) {
    clearInterval(rgbInterval);
    rgbInterval = null;
  }
  document.body.style.backgroundColor = "";
}

// Initialize Particles
function loadParticles() {
  if (performanceMode) {
    // Clear particles if performance mode is enabled
    const particlesElement = document.getElementById("particles-js");
    if (particlesElement) {
      particlesElement.innerHTML = "";
    }
    if (window.pJSDom && window.pJSDom.length) {
      window.pJSDom.forEach(p => p.pJS.fn.vendors.destroypJS());
      window.pJSDom = [];
    }
    return;
  }
  const savedTheme = localStorage.getItem("theme") || "dark";
  if (savedTheme === "space") {
    particlesJS("particles-js", {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "star", stroke: { width: 0, color: "#000000" } },
        opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
        size: { value: 3, random: true, anim: { enable: false, speed: 40, size_min: 0.1, sync: false } },
        line_linked: { enable: false },
        move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
      },
      interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
        modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
      },
      retina_detect: true
    });
  } else {
    const particlesElement = document.getElementById("particles-js");
    if (particlesElement) {
      particlesElement.innerHTML = "";
    }
    if (window.pJSDom && window.pJSDom.length) {
      window.pJSDom.forEach(p => p.pJS.fn.vendors.destroypJS());
      window.pJSDom = [];
    }
  }
}

// Show Confetti
function showConfetti() {function showConfetti() {
  if (performanceMode) return; // Skip if performance mode is enabled
  const savedConfettiType = localStorage.getItem("confettiType") || "default";
  const savedConfettiAmount = localStorage.getItem("confettiAmount") || "medium";
  if (savedConfettiType === "none") return;

  const amountMap = { light: 50, medium: 100, heavy: 200 };
  const count = amountMap[savedConfettiAmount] || 100;

  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  if (savedConfettiType === "stars") {
    confetti(Object.assign({}, defaults, { particleCount: count, shapes: ["star"], colors: ["#FFD700", "#FFA500", "#FFFF00"] }));
  } else if (savedConfettiType === "hearts") {
    confetti(Object.assign({}, defaults, { particleCount: count, shapes: ["heart"], colors: ["#FF0000", "#FF69B4", "#FF1493"] }));
  } else if (savedConfettiType === "butterflies") {
    confetti(Object.assign({}, defaults, { particleCount: count, shapes: ["circle"], colors: ["#FF6347", "#FFD700", "#ADFF2F"], scalar: 1.5, spread: 180 }));
  } else {
    confetti(Object.assign({}, defaults, { particleCount: count }));
  }
}}

// Number Guessing Game Logic
function startNumberGuessGame() {
  const range = parseInt(difficultySelect.value);
  const gameMode = gameModeSelect.value;
  secretNumber = Math.floor(Math.random() * range) + 1;
  lives = maxLives;
  guesses = 0;
  hintsUsed = 0;
  hintUsedThisGame = false;
  timer = 0;
  gameActive = true;

  startGameBtn.style.display = "none";
  stopGameBtn.style.display = "inline-block";
  playAgainBtn.style.display = "none";
  inputContainer.classList.remove("hidden");
  message.textContent = "";
  message.classList.remove("success", "fail");
  guessInput.value = "";
  guessInput.disabled = false;
  guessInput.focus();
  hintButton.disabled = false;

  hintButton.style.display = gameMode === "noHints" ? "none" : "inline-block";

  livesDisplay.innerHTML = "";
  for (let i = 0; i < lives; i++) {
    const heart = document.createElement("span");
    heart.classList.add("heart");
    heart.textContent = "❤️";
    livesDisplay.appendChild(heart);
  }
  livesDisplay.setAttribute("aria-label", `מספר החיים הנותרים: ${lives}`);

  timerInterval = setInterval(() => {
    timer++;
    timerDisplay.textContent = `זמן: ${timer} שניות`;
    if (gameMode === "fast" && timer >= 30) {
      showMessage("הגבלת זמן! המשחק נעצר.", () => {
        endNumberGuessGame(false);
      });
    }
  }, 1000);

  idleTimer = 0;
  idleInterval = setInterval(() => {
    idleTimer++;
    idleTimerDisplay.textContent = `זמן חוסר פעילות: ${idleTimer} שניות`;
    if (idleTimer >= 30) {
      showMessage("חוסר פעילות ממושך! המשחק נעצר.", () => {
        endNumberGuessGame(false);
      });
    }
  }, 1000);

  stats.gamesPlayed++;
  saveStats();
  soundManager.play("click");
  vibrationManager.vibrate(50);
}

function endNumberGuessGame(won) {
  gameActive = false;
  clearInterval(timerInterval);
  clearInterval(idleInterval);
  stopGameBtn.style.display = "none";
  startGameBtn.style.display = "inline-block";
  playAgainBtn.style.display = "inline-block";
  inputContainer.classList.add("hidden");
  timerDisplay.textContent = "";
  idleTimerDisplay.textContent = "";
  guessInput.disabled = true;

  const range = parseInt(difficultySelect.value);
  const gameMode = gameModeSelect.value;
  const score = won ? Math.max(1, range - guesses) : 0;

  if (won) {
    stats.wins++;
    message.textContent = `כל הכבוד! ניחשת את המספר ${secretNumber} ב-${guesses} ניחושים ו-${timer} שניות! צברת ${score} נקודות!`;
    message.classList.remove("fail");
    message.classList.add("success");
    stats.totalGuesses += guesses;
    stats.totalTime += timer;
    showConfetti();
    soundManager.play("success");
    vibrationManager.vibrate([100, 50, 100]);
    updateLeaderboard(score, "numberGuess");
  } else {
    message.textContent = `הפסדת! המספר היה ${secretNumber}.`;
    message.classList.remove("success");
    message.classList.add("fail");
    soundManager.play("gameOver");
    vibrationManager.vibrate([200, 100, 200]);
  }

  highscore = stats.wins;
  highscoreDisplay.textContent = `🏆 שיא אישי: ${highscore}`;

  const gameData = {
    gameType: "numberGuess",
    won,
    guesses,
    time: timer,
    difficulty: range,
    mode: gameMode,
    hintsUsed,
    date: new Date().toLocaleString("he-IL")
  };
  stats.playerStats.push(gameData);
  saveStats();
  checkAchievements();
  checkDailyChallenges(gameData);
}

function checkGuess() {
  if (!gameActive) return;

  const guess = parseInt(guessInput.value);
  const range = parseInt(difficultySelect.value);

  if (isNaN(guess) || guess < 1 || guess > range) {
    message.textContent = `אנא הזן מספר בין 1 ל-${range}`;
    message.classList.remove("success");
    message.classList.add("fail");
    return;
  }

  guesses++;
  if (guess === secretNumber) {
    endNumberGuessGame(true);
  } else {
    lives--;
    const heart = livesDisplay.querySelector(".heart:last-child");
    if (heart) {
      heart.classList.add("pulse-out");
      setTimeout(() => heart.remove(), 300);
    }

    if (lives <= 0) {
      endNumberGuessGame(false);
    } else {
      message.textContent = guess > secretNumber ? "גבוה מדי! נסה שוב." : "נמוך מדי! נסה שוב.";
      message.classList.remove("success");
      message.classList.add("fail");
      soundManager.play("fail");
      vibrationManager.vibrate(50);
      livesDisplay.setAttribute("aria-label", `מספר החיים הנותרים: ${lives}`);
    }
  }
  guessInput.value = "";
  guessInput.focus();
}

function provideHint() {
  if (!gameActive) return;
  if (hintUsedThisGame) {
    message.textContent = "כבר השתמשת ברמז במשחק זה!";
    message.classList.remove("success");
    message.classList.add("fail");
    return;
  }

  hintsUsed++;
  hintUsedThisGame = true;
  hintButton.disabled = true;

  const range = parseInt(difficultySelect.value);
  const hintRange = Math.floor(range / 10);
  const lowerBound = Math.max(1, secretNumber - hintRange);
  const upperBound = Math.min(range, secretNumber + hintRange);
  message.textContent = `רמז: המספר נמצא בין ${lowerBound} ל-${upperBound}`;
  soundManager.play("hint");
  vibrationManager.vibrate(50);

  lives--;
  const heart = livesDisplay.querySelector(".heart:last-child");
  if (heart) {
    heart.classList.add("pulse-out");
    setTimeout(() => heart.remove(), 300);
  }

  if (lives <= 0) {
    endNumberGuessGame(false);
  } else {
    livesDisplay.setAttribute("aria-label", `מספר החיים הנותרים: ${lives}`);
  }
}

// Memory Match Game Logic
function startMemoryMatchGame() {
  memoryGameActive = true;
  memoryMatchesFound = 0;
  memoryFlippedCards = [];
  memoryTimer = 0;
  memoryMoves = 0;
  memoryBoard.innerHTML = "";
  memoryMessage.textContent = "";
  memoryTimer.textContent = "זמן: 0 שניות";
  memoryMoves.textContent = "מהלכים: 0";
  startMemoryMatchBtn.style.display = "none";
  restartMemoryMatchBtn.style.display = "none";

  const numCards = parseInt(memoryDifficultySelect.value);
  const symbols = ["🍎", "🍌", "🍒", "🍇", "🍉", "🍊", "🍍", "🍓"];
  const selectedSymbols = symbols.slice(0, numCards / 2);
  const cardValues = [...selectedSymbols, ...selectedSymbols];
  cardValues.sort(() => Math.random() - 0.5);

  cardValues.forEach((value, index) => {
    const card = document.createElement("div");
    card.classList.add("memory-card");
    card.dataset.value = value;
    card.dataset.index = index;
    card.addEventListener("click", flipCard);
    memoryBoard.appendChild(card);
  });

  memoryTimerInterval = setInterval(() => {
    memoryTimer++;
    memoryTimer.textContent = `זמן: ${memoryTimer} שניות`;
  }, 1000);

  stats.gamesPlayed++;
  saveStats();
  soundManager.play("click");
  vibrationManager.vibrate(50);
}

function flipCard(event) {
  if (!memoryGameActive || memoryFlippedCards.length >= 2) return;
  const card = event.target;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");
  card.textContent = card.dataset.value;
  memoryFlippedCards.push(card);
  memoryMoves++;
  memoryMoves.textContent = `מהלכים: ${memoryMoves}`;
  soundManager.play("click");
  vibrationManager.vibrate(50);

  if (memoryFlippedCards.length === 2) {
    memoryGameActive = false;
    setTimeout(checkMatch, 1000);
  }
}

function checkMatch() {
  const [card1, card2] = memoryFlippedCards;
  if (card1.dataset.value === card2.dataset.value) {
    card1.classList.add("matched");
    card2.classList.add("matched");
    memoryMatchesFound += 2;
    soundManager.play("success");
    vibrationManager.vibrate([100, 50, 100]);
    if (memoryMatchesFound === parseInt(memoryDifficultySelect.value)) {
      endMemoryMatchGame(true);
    }
  } else {
    card1.classList.remove("flipped");
    card2.classList.remove("flipped");
    card1.textContent = "";
    card2.textContent = "";
    soundManager.play("fail");
    vibrationManager.vibrate(50);
  }
  memoryFlippedCards = [];
  memoryGameActive = true;
}

function endMemoryMatchGame(won) {
  memoryGameActive = false;
  clearInterval(memoryTimerInterval);
  startMemoryMatchBtn.style.display = "none";
  restartMemoryMatchBtn.style.display = "inline-block";
  const difficulty = parseInt(memoryDifficultySelect.value);
  const score = won ? Math.max(1, 100 - memoryMoves - memoryTimer) : 0;

  if (won) {
    stats.wins++;
    memoryMessage.textContent = `כל הכבוד! סיימת ב-${memoryMoves} מהלכים ו-${memoryTimer} שניות! צברת ${score} נקודות!`;
    memoryMessage.classList.remove("fail");
    memoryMessage.classList.add("success");
    showConfetti();
    soundManager.play("success");
    vibrationManager.vibrate([100, 50, 100]);
    updateLeaderboard(score, "memoryMatch");
  } else {
    memoryMessage.textContent = "הפסדת! נסה שוב.";
    memoryMessage.classList.remove("success");
    memoryMessage.classList.add("fail");
    soundManager.play("gameOver");
    vibrationManager.vibrate([200, 100, 200]);
  }

  const gameData = {
    gameType: "memoryMatch",
    won,
    moves: memoryMoves,
    time: memoryTimer,
    difficulty,
    date: new Date().toLocaleString("he-IL")
  };
  stats.playerStats.push(gameData);
  saveStats();
  checkAchievements();
  checkDailyChallenges(gameData);
}

// Trivia Game Logic
function startTriviaGame() {
  triviaGameActive = true;
  triviaCurrentQuestion = 0;
  triviaScoreValue = 0;
  triviaTimer = 0; // Remove 'let'
  triviaQuestion.classList.remove("hidden");
  triviaMessage.textContent = "";
  triviaScore.textContent = "ניקוד: 0";
  triviaTimer.textContent = "זמן: 0 שניות";
  startTriviaBtn.style.display = "none";
  restartTriviaBtn.style.display = "none";

  loadTriviaQuestion();

  triviaTimerInterval = setInterval(() => {
    triviaTimer++;
    triviaTimer.textContent = `זמן: ${triviaTimer} שניות`;
  }, 1000);

  stats.gamesPlayed++;
  saveStats();
  soundManager.play("click");
  vibrationManager.vibrate(50);
}

function loadTriviaQuestion() {
  if (triviaCurrentQuestion >= triviaQuestions[triviaCategorySelect.value].length) {
    endTriviaGame(true);
    return;
  }

  const questionData = triviaQuestions[triviaCategorySelect.value][triviaCurrentQuestion];
  triviaQuestionText.textContent = questionData.question;
  triviaOptions.innerHTML = "";

  questionData.options.forEach(option => {
    const button = document.createElement("button");
    button.classList.add("trivia-option");
    button.textContent = option;
    button.addEventListener("click", () => checkTriviaAnswer(option, questionData.answer));
    triviaOptions.appendChild(button);
  });
}

function checkTriviaAnswer(selectedOption, correctAnswer) {
  if (!triviaGameActive) return;

  const buttons = triviaOptions.querySelectorAll(".trivia-option");
  buttons.forEach(button => {
    button.disabled = true;
    if (button.textContent === correctAnswer) {
      button.classList.add("correct");
    }
    if (button.textContent === selectedOption && selectedOption !== correctAnswer) {
      button.classList.add("incorrect");
    }
  });

  if (selectedOption === correctAnswer) {
    triviaScoreValue++;
    triviaScore.textContent = `ניקוד: ${triviaScoreValue}`;
    triviaMessage.textContent = "תשובה נכונה!";
    triviaMessage.classList.remove("fail");
    triviaMessage.classList.add("success");
    soundManager.play("success");
    vibrationManager.vibrate([100, 50, 100]);
  } else {
    triviaMessage.textContent = `תשובה שגויה! התשובה הנכונה היא: ${correctAnswer}`;
    triviaMessage.classList.remove("success");
    triviaMessage.classList.add("fail");
    soundManager.play("fail");
    vibrationManager.vibrate(50);
  }

  setTimeout(() => {
    triviaCurrentQuestion++;
    loadTriviaQuestion();
  }, 2000);
}

function endTriviaGame(won) {
  triviaGameActive = false;
  clearInterval(triviaTimerInterval);
  triviaQuestion.classList.add("hidden");
  startTriviaBtn.style.display = "none";
  restartTriviaBtn.style.display = "inline-block";
  const score = triviaScoreValue;

  if (won) {
    stats.wins++;
    triviaMessage.textContent = `כל הכבוד! סיימת עם ${triviaScoreValue} נקודות ב-${triviaTimer} שניות!`;
    triviaMessage.classList.remove("fail");
    triviaMessage.classList.add("success");
    showConfetti();
    soundManager.play("success");
    vibrationManager.vibrate([100, 50, 100]);
    updateLeaderboard(score, "trivia");
  } else {
    triviaMessage.textContent = "הפסדת! נסה שוב.";
    triviaMessage.classList.remove("success");
    triviaMessage.classList.add("fail");
    soundManager.play("gameOver");
    vibrationManager.vibrate([200, 100, 200]);
  }

  const gameData = {
    gameType: "trivia",
    won,
    score: triviaScoreValue,
    time: triviaTimer,
    category: triviaCategorySelect.value,
    date: new Date().toLocaleString("he-IL")
  };
  stats.playerStats.push(gameData);
  saveStats();
  checkAchievements();
  checkDailyChallenges(gameData);
}

// Leaderboard and Admin Functions
function updateLeaderboard(score, gameType) {
  if (bannedUsers.includes(username)) {
    showMessage("חשבונך נחסם. אין באפשרותך להשתתף בדירוג.");
    return;
  }

  if (!username || typeof score !== "number" || isNaN(score) || score < 0) {
    console.error("Invalid data for leaderboard:", { username, score });
    showMessage("שגיאה בעדכון הדירוג: נתונים לא תקינים.");
    return;
  }

  const leaderboardRef = database.ref(`leaderboard/${username}/${gameType}`);
  leaderboardRef.once("value", snapshot => {
    let userData = snapshot.val();
    if (!userData) {
      userData = { scores: [] };
    }
    userData.scores = userData.scores || [];
    userData.scores.push({ score, timestamp: new Date().toISOString() });
    leaderboardRef.set(userData)
      .then(() => {
        // Update global leaderboard
        const globalRef = database.ref(`leaderboard/${username}/global`);
        globalRef.once("value", globalSnapshot => {
          let globalData = globalSnapshot.val() || { scores: [] };
          globalData.scores.push({ score, timestamp: new Date().toISOString() });
          globalRef.set(globalData)
            .then(() => {
              displayLeaderboard();
            });
        });
      })
      .catch(err => {
        console.error("Error updating leaderboard:", err);
        showMessage("שגיאה בעדכון הדירוג: " + err.message);
      });
  });
}

function displayLeaderboard() {
  leaderboardList.innerHTML = "";
  const leaderboardRef = database.ref("leaderboard");
  leaderboardRef.once("value", snapshot => {
    const leaderboardData = snapshot.val();
    if (!leaderboardData) {
      leaderboardList.innerHTML = "<li>אין נתונים זמינים להצגה</li>";
      return;
    }

    const processedData = [];
    Object.keys(leaderboardData).forEach(user => {
      if (bannedUsers.includes(user)) return;
      const userData = leaderboardData[user];
      const globalScores = userData.global ? userData.global.scores || [] : [];
      const totalScore = globalScores.reduce((sum, entry) => sum + entry.score, 0);
      processedData.push({ username: user, totalScore });

      // Game-specific leaderboards
      const numberGuessScores = userData.numberGuess ? userData.numberGuess.scores || [] : [];
      const memoryMatchScores = userData.memoryMatch ? userData.memoryMatch.scores || [] : [];
      const triviaScores = userData.trivia ? userData.trivia.scores || [] : [];
      const dailyChallengeScores = userData.dailyChallenge ? userData.dailyChallenge.scores || [] : [];

      processedData.push({ username: user, gameType: "numberGuess", totalScore: numberGuessScores.reduce((sum, entry) => sum + entry.score, 0) });
      processedData.push({ username: user, gameType: "memoryMatch", totalScore: memoryMatchScores.reduce((sum, entry) => sum + entry.score, 0) });
      processedData.push({ username: user, gameType: "trivia", totalScore: triviaScores.reduce((sum, entry) => sum + entry.score, 0) });
      processedData.push({ username: user, gameType: "dailyChallenge", totalScore: dailyChallengeScores.reduce((sum, entry) => sum + entry.score, 0) });
    });

    // Global Leaderboard
    const globalData = processedData.filter(entry => !entry.gameType);
    globalData.sort((a, b) => b.totalScore - a.totalScore);
    const top10Global = globalData.slice(0, 10);

    leaderboardList.innerHTML = "<h4>דירוג כללי</h4>";
    if (top10Global.length === 0) {
      leaderboardList.innerHTML += "<li>אין נתונים זמינים להצגה</li>";
    } else {
      let rank = 1;
      top10Global.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${rank}. ${entry.username}: ${entry.totalScore} נקודות`;
        leaderboardList.appendChild(li);
        rank++;
      });
    }

    // Game-Specific Leaderboards
    ["numberGuess", "memoryMatch", "trivia", "dailyChallenge"].forEach(gameType => {
      const gameData = processedData.filter(entry => entry.gameType === gameType);
      gameData.sort((a, b) => b.totalScore - a.totalScore);
      const top10 = gameData.slice(0, 10);

      const gameTitle = document.createElement("h4");
      gameTitle.textContent = gameType === "numberGuess" ? "ניחוש מספרים" : gameType === "memoryMatch" ? "משחק זיכרון" : gameType === "trivia" ? "טריוויה" : "אתגרים יומיים";
      leaderboardList.appendChild(gameTitle);

      if (top10.length === 0) {
        const li = document.createElement("li");
        li.textContent = "אין נתונים זמינים להצגה";
        leaderboardList.appendChild(li);
      } else {
        let rank = 1;
        top10.forEach(entry => {
          const li = document.createElement("li");
          li.textContent = `${rank}. ${entry.username}: ${entry.totalScore} נקודות`;
          leaderboardList.appendChild(li);
          rank++;
        });
      }
    });
  });
}

function clearLeaderboard() {
  const leaderboardRef = database.ref("leaderboard");
  leaderboardRef.remove()
    .then(() => {
      console.log("Leaderboard cleared successfully");
      displayLeaderboard();
      showMessage("הדירוג נוקה בהצלחה!");
    })
    .catch(err => {
      console.error("Error clearing leaderboard:", err);
      showMessage("שגיאה בניקוי הדירוג: " + err.message);
    });
}

function loadAdminUsers() {
  const leaderboardRef = database.ref("leaderboard");
  leaderboardRef.once("value", snapshot => {
    const leaderboardData = snapshot.val();
    if (!leaderboardData) {
      adminUserSelect.innerHTML = "<option value=''>אין משתמשים זמינים</option>";
      adminBanUserSelect.innerHTML = "<option value=''>אין משתמשים זמינים</option>";
      return;
    }

    const users = Object.keys(leaderboardData).filter(user => !bannedUsers.includes(user));
    adminUserSelect.innerHTML = "<option value=''>בחר משתמש</option>";
    adminBanUserSelect.innerHTML = "<option value=''>בחר משתמש</option>";

    users.forEach(user => {
      const option1 = document.createElement("option");
      option1.value = user;
      option1.textContent = user;
      adminUserSelect.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = user;
      option2.textContent = user;
      adminBanUserSelect.appendChild(option2);
    });
  });
}

function viewUserPoints() {
  const selectedUser = adminUserSelect.value;
  if (!selectedUser) {
    adminUserPoints.textContent = "בחר משתמש תחילה.";
    return;
  }

  const userRef = database.ref(`leaderboard/${selectedUser}`);
  userRef.once("value", snapshot => {
    const userData = snapshot.val();
    if (!userData || !userData.global || !userData.global.scores) {
      adminUserPoints.textContent = "אין נתונים זמינים למשתמש זה.";
      return;
    }

    const totalScore = userData.global.scores.reduce((sum, entry) => sum + entry.score, 0);
    adminUserPoints.textContent = `${selectedUser}: ${totalScore} נקודות`;
  });
}

function banUser() {
  const selectedUser = adminBanUserSelect.value;
  if (!selectedUser) {
    adminBanMessage.textContent = "בחר משתמש תחילה.";
    return;
  }

  if (selectedUser === "admin") {
    adminBanMessage.textContent = "לא ניתן לחסום את חשבון המנהל.";
    return;
  }

  bannedUsers.push(selectedUser);
  localStorage.setItem("bannedUsers", JSON.stringify(bannedUsers));
  adminBanMessage.textContent = `המשתמש ${selectedUser} נחסם בהצלחה.`;
  displayLeaderboard();
  loadAdminUsers();
}

// Stats and Achievements Functions
// Stats and Achievements Functions
function checkAchievements() {
  let updated = false;
  achievements.forEach(achievement => {
    if (!achievement.unlocked && achievement.condition(stats)) {
      achievement.unlocked = true;
      updated = true;
      applyReward(achievement);
      showMessage(`השגת הישג חדש: ${achievement.name}! ${achievement.description}`);
    }
  });
  if (updated) {
    localStorage.setItem(`${username}_achievements`, JSON.stringify(achievements));
    displayAchievements();
  }
}

function applyReward(achievement) {
  if (achievement.reward === "theme" && !unlockedThemes.includes(achievement.rewardValue)) {
    unlockedThemes.push(achievement.rewardValue);
    localStorage.setItem(`${username}_unlockedThemes`, JSON.stringify(unlockedThemes));
    updateThemeOptions();
  } else if (achievement.reward === "confetti" && !unlockedConfetti.includes(achievement.rewardValue)) {
    unlockedConfetti.push(achievement.rewardValue);
    localStorage.setItem(`${username}_unlockedConfetti`, JSON.stringify(unlockedConfetti));
    updateConfettiOptions();
  }
}

function displayAchievements() {
  achievementsList.innerHTML = "";
  achievements.forEach(achievement => {
    const li = document.createElement("li");
    li.textContent = `${achievement.name}: ${achievement.description} ${achievement.unlocked ? "✅" : "🔒"}`;
    if (achievement.unlocked) {
      li.classList.add("completed");
    }
    achievementsList.appendChild(li);
  });
}

function checkDailyChallenges(game) {
  const today = new Date().toISOString().split("T")[0];
  if (completedChallenges.date !== today) {
    completedChallenges = { date: today, challenges: [] };
    localStorage.setItem(`${username}_completedChallenges`, JSON.stringify(completedChallenges));
  }

  dailyChallenges.forEach(challenge => {
    if (!completedChallenges.challenges.includes(challenge.id) && challenge.condition(game)) {
      completedChallenges.challenges.push(challenge.id);
      updateLeaderboard(challenge.rewardPoints, "dailyChallenge");
      showMessage(`השלמת אתגר יומי: ${challenge.description}! קיבלת ${challenge.rewardPoints} נקודות!`);
      localStorage.setItem(`${username}_completedChallenges`, JSON.stringify(completedChallenges));
    }
  });
}

function loadStats() {
  const savedStats = localStorage.getItem(`${username}_stats`);
  if (savedStats) {
    try {
      stats = JSON.parse(savedStats);
      if (typeof stats !== "object" || stats === null) {
        throw new Error("stats is not an object");
      }
      stats.gamesPlayed = typeof stats.gamesPlayed === "number" ? stats.gamesPlayed : 0;
      stats.wins = typeof stats.wins === "number" ? stats.wins : 0;
      stats.totalGuesses = typeof stats.totalGuesses === "number" ? stats.totalGuesses : 0;
      stats.totalTime = typeof stats.totalTime === "number" ? stats.totalTime : 0;
      if (!Array.isArray(stats.playerStats)) {
        console.warn("playerStats is not an array in saved stats. Resetting to empty array.");
        stats.playerStats = [];
      }
    } catch (err) {
      console.error("Error parsing saved stats. Resetting to default stats:", err);
      stats = { gamesPlayed: 0, wins: 0, totalGuesses: 0, totalTime: 0, playerStats: [] };
      localStorage.setItem(`${username}_stats`, JSON.stringify(stats));
    }
  }
  highscore = stats.wins;
  highscoreDisplay.textContent = `🏆 שיא אישי: ${highscore}`;
  updateStatsDisplay();
}

function updateThemeOptions() {
  themeSelect.innerHTML = "";
  unlockedThemes.forEach(theme => {
    const option = document.createElement("option");
    option.value = theme;
    option.textContent = theme === "dark" ? "כהה" : theme === "light" ? "בהיר" : theme === "neon" ? "ניאון" : theme === "space" ? "חלל" : theme;
    themeSelect.appendChild(option);
  });
  const savedTheme = localStorage.getItem("theme") || "dark";
  themeSelect.value = savedTheme;
}

function updateConfettiOptions() {
  confettiTypeSelect.innerHTML = "";
  unlockedConfetti.forEach(confetti => {
    const option = document.createElement("option");
    option.value = confetti;
    option.textContent = confetti === "default" ? "רגיל" : confetti === "stars" ? "כוכבים" : confetti === "hearts" ? "לבבות" : confetti === "butterflies" ? "פרפרים" : confetti === "none" ? "ללא" : confetti;
    confettiTypeSelect.appendChild(option);
  });
  const savedConfettiType = localStorage.getItem("confettiType") || "default";
  confettiTypeSelect.value = savedConfettiType;
}

function loadAchievements() {
  const savedUnlockedThemes = JSON.parse(localStorage.getItem(`${username}_unlockedThemes`));
  if (savedUnlockedThemes) {
    unlockedThemes = savedUnlockedThemes;
  }
  const savedUnlockedConfetti = JSON.parse(localStorage.getItem(`${username}_unlockedConfetti`));
  if (savedUnlockedConfetti) {
    unlockedConfetti = savedUnlockedConfetti;
  }
  const savedAchievements = JSON.parse(localStorage.getItem(`${username}_achievements`));
  if (savedAchievements) {
    achievements = savedAchievements;
  }
  updateThemeOptions();
  updateConfettiOptions();
  displayAchievements();
}

function saveStats() {
  if (!Array.isArray(stats.playerStats)) {
    console.warn("playerStats is not an array before saving. Resetting to empty array.");
    stats.playerStats = [];
  }
  localStorage.setItem(`${username}_stats`, JSON.stringify(stats));
  updateStatsDisplay();
}

function updateStatsDisplay() {
  const successRate = stats.gamesPlayed > 0 ? ((stats.wins / stats.gamesPlayed) * 100).toFixed(2) : 0;
  const averageTime = stats.wins > 0 ? (stats.totalTime / stats.wins).toFixed(2) : 0;

  successRateDisplay.textContent = `שיעור הצלחה: ${successRate}%`;
  averageTimeDisplay.textContent = `זמן ממוצע לניצחון: ${averageTime} שניות`;

  let winsDisplay = document.getElementById("winsDisplay");
  if (!winsDisplay) {
    winsDisplay = document.createElement("p");
    winsDisplay.id = "winsDisplay";
    statsMenu.insertBefore(winsDisplay, successRateDisplay);
  }
  winsDisplay.textContent = `ניצחונות: ${stats.wins}`;

  displayDetailedStats();
  updateStatsChart();
}

function getSortedStats() {
  if (!stats.playerStats || stats.playerStats.length === 0) {
    return [];
  }

  const sortBy = sortStatsSelect.value;
  return [...stats.playerStats].sort((a, b) => {
    if (sortBy === "date") return new Date(b.date) - new Date(a.date);
    if (sortBy === "time") return a.time - b.time;
    if (sortBy === "guesses") return a.guesses - b.guesses;
    if (sortBy === "difficulty") return b.difficulty - a.difficulty;
    return 0;
  });
}

function displayDetailedStats() {
  const sortedStats = getSortedStats();
  if (sortedStats.length === 0) {
    detailedStatsList.innerHTML = "<li class='no-data-message'>אין נתונים זמינים להצגה</li>";
    return;
  }

  detailedStatsList.innerHTML = "";
  sortedStats.forEach(game => {
    if (game.won) {
      const li = document.createElement("li");
      let details = "";
      if (game.gameType === "numberGuess") {
        const modeInHebrew = modeTranslations[game.mode] || game.mode;
        details = `ניחוש מספרים - ניצחון: ${game.guesses} ניחושים, ${game.time} שניות, קושי: ${game.difficulty}, מצב: ${modeInHebrew}, רמזים: ${game.hintsUsed}, תאריך: ${game.date}`;
      } else if (game.gameType === "memoryMatch") {
        details = `משחק זיכרון - ניצחון: ${game.moves} מהלכים, ${game.time} שניות, קושי: ${game.difficulty}, תאריך: ${game.date}`;
      } else if (game.gameType === "trivia") {
        details = `טריוויה - ניצחון: ${game.score} נקודות, ${game.time} שניות, קטגוריה: ${game.category}, תאריך: ${game.date}`;
      }
      li.textContent = details;
      detailedStatsList.appendChild(li);
    }
  });
}

function updateStatsChart() {
  try {
    const sortedStats = getSortedStats();
    if (sortedStats.length === 0) {
      statsChartCanvas.style.display = "none";
      let noDataMessage = document.getElementById("chartNoDataMessage");
      if (!noDataMessage) {
        noDataMessage = document.createElement("p");
        noDataMessage.id = "chartNoDataMessage";
        noDataMessage.className = "no-data-message";
        noDataMessage.textContent = "אין נתונים זמינים להצגה";
        statsChartCanvas.parentNode.insertBefore(noDataMessage, statsChartCanvas);
      }
      noDataMessage.style.display = "block";
      if (statsChart) {
        statsChart.destroy();
        statsChart = null;
      }
      return;
    }

    statsChartCanvas.style.display = "block";
    const noDataMessage = document.getElementById("chartNoDataMessage");
    if (noDataMessage) {
      noDataMessage.style.display = "none";
    }

    const labels = sortedStats.map((game, index) => `משחק ${index + 1}`);
    const timeData = sortedStats.map(game => game.time);
    const scoreData = sortedStats.map(game => game.score || game.guesses || game.moves || 0);

    const currentTheme = document.body.className;
    const borderColor = currentTheme === "light" ? "rgba(0, 0, 0, 0.8)" : currentTheme === "neon" ? "rgba(0, 255, 255, 1)" : "rgba(75, 192, 192, 1)";
    const backgroundColor = currentTheme === "light" ? "rgba(0, 0, 0, 0.2)" : currentTheme === "neon" ? "rgba(0, 255, 255, 0.2)" : "rgba(75, 192, 192, 0.2)";

    if (statsChart) {
      statsChart.data.labels = labels;
      statsChart.data.datasets[0].data = scoreData;
      statsChart.data.datasets[1].data = timeData;
      statsChart.data.datasets[0].borderColor = borderColor;
      statsChart.data.datasets[0].backgroundColor = backgroundColor;
      statsChart.data.datasets[1].borderColor = borderColor.replace("1)", "0.5)");
      statsChart.data.datasets[1].backgroundColor = backgroundColor;
      statsChart.update();
    } else {
      statsChart = new Chart(statsChartCanvas, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "ניקוד/מהלכים/ניחושים",
              data: scoreData,
              borderColor: borderColor,
              backgroundColor: backgroundColor,
              fill: true
            },
            {
              label: "זמן (שניות)",
              data: timeData,
              borderColor: borderColor.replace("1)", "0.5)"),
              backgroundColor: backgroundColor,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  } catch (err) {
    console.error("Error updating stats chart:", err);
    showMessage("שגיאה בעדכון גרף הסטטיסטיקות.");
  }
}

// Utility Functions
function showMessage(messageText, onClose = () => {}) {
  confirmationMessage.textContent = messageText;
  confirmationDialog.classList.remove("hidden");

  const confirmBtn = document.getElementById("confirmBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  cancelBtn.style.display = "none";

  const clearListeners = (element) => {
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    return newElement;
  };

  const newConfirmBtn = clearListeners(confirmBtn);

  newConfirmBtn.addEventListener("click", () => {
    confirmationDialog.classList.add("hidden");
    cancelBtn.style.display = "inline-block";
    onClose();
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });
}

function showConfirmation(messageText, onConfirm) {
  confirmationMessage.textContent = messageText;
  confirmationDialog.classList.remove("hidden");

  const confirmBtn = document.getElementById("confirmBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  const clearListeners = (element) => {
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    return newElement;
  };

  const newConfirmBtn = clearListeners(confirmBtn);
  const newCancelBtn = clearListeners(cancelBtn);

  newConfirmBtn.addEventListener("click", () => {
    confirmationDialog.classList.add("hidden");
    onConfirm();
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  newCancelBtn.addEventListener("click", () => {
    confirmationDialog.classList.add("hidden");
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });
}

function resetStats() {
  showConfirmation("האם אתה בטוח שברצונך לאפס את הסטטיסטיקות?", () => {
    stats = { gamesPlayed: 0, wins: 0, totalGuesses: 0, totalTime: 0, playerStats: [] };
    highscore = 0;
    localStorage.setItem(`${username}_stats`, JSON.stringify(stats));
    highscoreDisplay.textContent = `🏆 שיא אישי: ${highscore}`;
    achievements.forEach(a => a.unlocked = false);
    localStorage.setItem(`${username}_achievements`, JSON.stringify(achievements));
    updateStatsDisplay();
    displayAchievements();
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });
}

function resetIdleTimer() {
  if (gameActive) {
    idleTimer = 0;
  }
}

// Function to load async data after initialization
function loadAsyncData() {
  displayLeaderboard();
  loadAdminUsers();
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  confirmationDialog.classList.add("hidden");

  username = localStorage.getItem("username") || "";
  isAdmin = false;

  if (username) {
    if (username.toLowerCase() === "admin") {
      usernameSection.classList.remove("hidden");
      gameArea.classList.add("hidden");
      usernameInput.value = username;
      adminPasswordSection.style.display = "block";
    } else {
      isAdmin = false;
      usernameSection.classList.add("hidden");
      gameArea.classList.remove("hidden");
      loadSettings();
      loadStats();
      loadAchievements();
      loadParticles();
      // Load async data after other initialization
      loadAsyncData();
    }
    clearLeaderboardBtn.style.display = "none";
  } else {
    usernameSection.classList.remove("hidden");
    gameArea.classList.add("hidden");
  }

  // Game Selection
  selectNumberGuessBtn.addEventListener("click", () => {
    currentGame = "numberGuess";
    numberGuessGame.classList.remove("hidden");
    memoryMatchGame.classList.add("hidden");
    triviaGame.classList.add("hidden");
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  selectMemoryMatchBtn.addEventListener("click", () => {
    currentGame = "memoryMatch";
    numberGuessGame.classList.add("hidden");
    memoryMatchGame.classList.remove("hidden");
    triviaGame.classList.add("hidden");
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  selectTriviaBtn.addEventListener("click", () => {
    currentGame = "trivia";
    numberGuessGame.classList.add("hidden");
    memoryMatchGame.classList.add("hidden");
    triviaGame.classList.remove("hidden");
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  // Number Guessing Game Event Listeners
  startGameBtn.addEventListener("click", startNumberGuessGame);
  stopGameBtn.addEventListener("click", () => endNumberGuessGame(false));
  playAgainBtn.addEventListener("click", () => {
    startNumberGuessGame();
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });
  guessButton.addEventListener("click", checkGuess);
  guessInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkGuess();
  });
  hintButton.addEventListener("click", provideHint);

  // Memory Match Game Event Listeners
  startMemoryMatchBtn.addEventListener("click", startMemoryMatchGame);
  restartMemoryMatchBtn.addEventListener("click", () => {
    startMemoryMatchGame();
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  // Trivia Game Event Listeners
  startTriviaBtn.addEventListener("click", startTriviaGame);
  restartTriviaBtn.addEventListener("click", () => {
    startTriviaGame();
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  // General Event Listeners
  settingsBtn.addEventListener("click", () => {
    if (settingsMenu.classList.contains("hidden")) {
      settingsMenu.classList.remove("hidden");
      gameArea.classList.add("hidden");
      statsMenu.classList.add("hidden");
      achievementsMenu.classList.add("hidden");
      leaderboardMenu.classList.add("hidden");
      adminPanel.classList.add("hidden");
      if (isAdmin) {
        changeUsernameBtn.textContent = "פאנל ניהול";
      } else {
        changeUsernameBtn.textContent = "שנה שם משתמש";
      }
    } else {
      settingsMenu.classList.add("hidden");
      gameArea.classList.remove("hidden");
    }
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  statsBtn.addEventListener("click", () => {
    if (statsMenu.classList.contains("hidden")) {
      statsMenu.classList.remove("hidden");
      gameArea.classList.add("hidden");
      settingsMenu.classList.add("hidden");
      achievementsMenu.classList.add("hidden");
      leaderboardMenu.classList.add("hidden");
      adminPanel.classList.add("hidden");
      updateStatsDisplay();
    } else {
      statsMenu.classList.add("hidden");
      gameArea.classList.remove("hidden");
    }
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  viewStatsBtn.addEventListener("click", () => {
    statsMenu.classList.remove("hidden");
    gameArea.classList.add("hidden");
    settingsMenu.classList.add("hidden");
    achievementsMenu.classList.add("hidden");
    leaderboardMenu.classList.add("hidden");
    adminPanel.classList.add("hidden");
    updateStatsDisplay();
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  viewAchievementsBtn.addEventListener("click", () => {
    achievementsMenu.classList.remove("hidden");
    gameArea.classList.add("hidden");
    statsMenu.classList.add("hidden");
    settingsMenu.classList.add("hidden");
    leaderboardMenu.classList.add("hidden");
    adminPanel.classList.add("hidden");
    displayAchievements();
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  viewLeaderboardBtn.addEventListener("click", () => {
    leaderboardMenu.classList.remove("hidden");
    gameArea.classList.add("hidden");
    statsMenu.classList.add("hidden");
    settingsMenu.classList.add("hidden");
    achievementsMenu.classList.add("hidden");
    adminPanel.classList.add("hidden");
    displayLeaderboard();
    clearLeaderboardBtn.style.display = isAdmin ? "inline-block" : "none";
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  if (clearLeaderboardBtn) {
    clearLeaderboardBtn.addEventListener("click", () => {
      showConfirmation("האם אתה בטוח שברצונך לנקות את הדירוג? פעולה זו אינה ניתנת לביטול.", () => {
        clearLeaderboard();
        soundManager.play("click");
        vibrationManager.vibrate(50);
      });
    });
  } else {
    console.warn("clearLeaderboardBtn element not found in the DOM");
  }

  muteBtn.addEventListener("click", () => {
    soundManager.toggleMute();
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  vibrationBtn.addEventListener("click", () => {
    vibrationManager.toggleVibration();
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  volumeControl.addEventListener("input", () => {
    soundManager.volume = parseFloat(volumeControl.value);
    soundManager.updateVolume();
  });

  themeSelect.addEventListener("change", () => {
    document.body.classList.remove("dark", "light", "neon", "space", "gradient", "rgb", "slow", "medium", "fast");
    document.body.classList.add(themeSelect.value);
    localStorage.setItem("theme", themeSelect.value);
    localStorage.removeItem("customGradient");
    stopRGBWaves();
    rgbBtn.textContent = "הפעל גלי צבעים";
    localStorage.setItem("rgbEnabled", false);
    loadParticles();
    updateStatsChart();
  });

  confettiTypeSelect.addEventListener("change", () => {
    localStorage.setItem("confettiType", confettiTypeSelect.value);
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  confettiAmountSelect.addEventListener("change", () => {
    localStorage.setItem("confettiAmount", confettiAmountSelect.value);
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  applyGradientBtn.addEventListener("click", () => {
    applyCustomGradient(gradientColor1.value, gradientColor2.value);
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  resetGradientBtn.addEventListener("click", () => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.classList.remove("dark", "light", "neon", "space", "gradient", "rgb", "slow", "medium", "fast");
    document.body.classList.add(savedTheme);
    document.body.style.background = "";
    document.body.style.backgroundSize = "";
    document.body.style.animation = "";
    document.body.style.backgroundColor = "";
    localStorage.removeItem("customGradient");
    stopRGBWaves();
    rgbBtn.textContent = "הפעל גלי צבעים";
    localStorage.setItem("rgbEnabled", false);
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  if (rgbBtn) {
    rgbBtn.addEventListener("click", () => {
      if (performanceMode) {
        showMessage("מצב ביצועים מופעל - גלי צבעים מושבתים");
        return;
      }
      const rgbEnabled = !document.body.classList.contains("rgb");
      if (rgbEnabled) {
        document.body.style.background = "";
        document.body.style.backgroundImage = "";
        document.body.style.backgroundSize = "";
        document.body.style.animation = "";
        document.body.style.animationFillMode = "";
        document.body.style.backgroundColor = "";
        localStorage.removeItem("customGradient");
        document.body.classList.remove("dark", "light", "neon", "space", "gradient", "rgb");
        document.body.classList.add("rgb");
        startRGBWaves();
        rgbBtn.textContent = "כבה גלי צבעים";
        localStorage.setItem("rgbEnabled", true);
      } else {
        document.body.classList.remove("rgb");
        document.body.style.background = "";
        document.body.style.backgroundImage = "";
        document.body.style.backgroundSize = "";
        document.body.style.animation = "";
        document.body.style.animationFillMode = "";
        document.body.style.backgroundColor = "";
        const savedTheme = localStorage.getItem("theme") || "dark";
        document.body.classList.add(savedTheme);
        stopRGBWaves();
        rgbBtn.textContent = "הפעל גלי צבעים";
        localStorage.setItem("rgbEnabled", false);
      }
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  } 
  
  if (performanceModeBtn) {
    performanceModeBtn.addEventListener("click", () => {
      performanceMode = !performanceMode;
      localStorage.setItem("performanceMode", performanceMode);
      performanceModeBtn.textContent = performanceMode ? "כבה מצב ביצועים" : "הפעל מצב ביצועים";
  
      if (performanceMode) {
        // Disable resource-intensive features
        stopRGBWaves();
        document.body.classList.remove("rgb");
        loadParticles(); // This will clear particles since performanceMode is true
        // Reset to saved theme or gradient
        const savedGradient = JSON.parse(localStorage.getItem("customGradient"));
        if (savedGradient) {
          applyCustomGradient(savedGradient.color1, savedGradient.color2);
        } else {
          const savedTheme = localStorage.getItem("theme") || "dark";
          document.body.classList.add(savedTheme);
        }
        localStorage.setItem("rgbEnabled", false);
        if (rgbBtn) {
          rgbBtn.textContent = "הפעל גלי צבעים";
        }
      } else {
        // Re-enable features based on saved settings
        loadParticles();
        const rgbEnabled = localStorage.getItem("rgbEnabled") === "true";
        if (rgbEnabled) {
          document.body.classList.add("rgb");
          startRGBWaves();
          if (rgbBtn) {
            rgbBtn.textContent = "כבה גלי צבעים";
          }
        }
      }
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  } else {
    console.warn("performanceModeBtn element not found in the DOM");
  }
  
  backToGameBtn.addEventListener("click", () => {
    settingsMenu.classList.add("hidden");
    gameArea.classList.remove("hidden");
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  backToGameBtn.addEventListener("click", () => {
    settingsMenu.classList.add("hidden");
    gameArea.classList.remove("hidden");
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  backToGameFromStatsBtn.addEventListener("click", () => {
    statsMenu.classList.add("hidden");
    gameArea.classList.remove("hidden");
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  backToGameFromAchievementsBtn.addEventListener("click", () => {
    achievementsMenu.classList.add("hidden");
    gameArea.classList.remove("hidden");
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  backToGameFromLeaderboardBtn.addEventListener("click", () => {
    leaderboardMenu.classList.add("hidden");
    gameArea.classList.remove("hidden");
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  backToGameFromAdminBtn.addEventListener("click", () => {
    adminPanel.classList.add("hidden");
    gameArea.classList.remove("hidden");
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  resetStatsBtn.addEventListener("click", resetStats);

  sortStatsSelect.addEventListener("change", () => {
    displayDetailedStats();
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  // Admin Panel Event Listeners
  adminUserSelect.addEventListener("change", viewUserPoints);

  adminBanUserSelect.addEventListener("change", () => {
    adminBanMessage.textContent = "";
  });

  banUserBtn.addEventListener("click", () => {
    banUser();
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  resetLeaderboardBtn.addEventListener("click", () => {
    showConfirmation("האם אתה בטוח שברצונך לנקות את הדירוג? פעולה זו אינה ניתנת לביטול.", () => {
      clearLeaderboard();
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  });

  // Username Section Event Listeners
  usernameInput.addEventListener("input", () => {
    const input = usernameInput.value.trim();
    if (input.toLowerCase() === "admin") {
      adminPasswordSection.style.display = "block";
    } else {
      adminPasswordSection.style.display = "none";
      adminPasswordInput.value = "";
    }
  });

  submitUsernameBtn.addEventListener("click", () => {
    const input = usernameInput.value.trim();
    if (input && /^[א-תa-zA-Z0-9]+$/.test(input)) {
      const leaderboardRef = database.ref(`leaderboard/${input}`);
      leaderboardRef.once("value", snapshot => {
        if (input.toLowerCase() === "admin") {
          const password = adminPasswordInput.value;
          if (password !== ADMIN_PASSWORD) {
            showMessage("סיסמת מנהל שגויה. אנא נסה שם משתמש או סיסמה אחרים.");
            return;
          }
        }

        if (snapshot.exists() && input !== username && input.toLowerCase() !== "admin") {
          showMessage("שם משתמש זה כבר קיים. אנא בחר שם אחר.");
          return;
        }

        username = input;
        localStorage.setItem("username", username);
        isAdmin = input.toLowerCase() === "admin" && adminPasswordInput.value === ADMIN_PASSWORD;
        usernameSection.classList.add("hidden");
        gameArea.classList.remove("hidden");
        cancelUsernameBtn.style.display = "none";
        clearLeaderboardBtn.style.display = isAdmin ? "inline-block" : "none";
        loadSettings();
        loadStats();
        loadAchievements();
        loadParticles();
        loadAsyncData(); // Load async data after initialization
        soundManager.play("click");
        vibrationManager.vibrate(50);
      });
    } else {
      showMessage("אנא הזן שם משתמש תקין (אותיות בעברית, אנגלית או מספרים בלבד)");
    }
  });

  changeUsernameBtn.addEventListener("click", () => {
    if (isAdmin) {
      adminPanel.classList.remove("hidden");
      gameArea.classList.add("hidden");
      settingsMenu.classList.add("hidden");
      statsMenu.classList.add("hidden");
      achievementsMenu.classList.add("hidden");
      leaderboardMenu.classList.add("hidden");
    } else {
      usernameSection.classList.remove("hidden");
      gameArea.classList.add("hidden");
      settingsMenu.classList.add("hidden");
      statsMenu.classList.add("hidden");
      achievementsMenu.classList.add("hidden");
      leaderboardMenu.classList.add("hidden");
      submitUsernameBtn.style.display = "inline-block";
      cancelUsernameBtn.style.display = "inline-block";
      usernameInput.value = username;
      adminPasswordSection.style.display = username.toLowerCase() === "admin" ? "block" : "none";
      adminPasswordInput.value = "";
      isAdmin = false;
      clearLeaderboardBtn.style.display = "none";
    }
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  cancelUsernameBtn.addEventListener("click", () => {
    usernameSection.classList.add("hidden");
    settingsMenu.classList.remove("hidden");
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });

  // General Event Listeners for Interactivity
  document.addEventListener("click", (event) => {
    if (gameActive && event.target !== guessInput && !guessInput.contains(event.target)) {
      guessInput.blur();
    }
  });

  document.addEventListener("touchstart", (event) => {
    resetIdleTimer();
    if (gameActive && event.target !== guessInput && !guessInput.contains(event.target)) {
      guessInput.blur();
    }
  });

  document.querySelectorAll("button").forEach(button => {
    button.addEventListener("touchstart", (event) => {
      event.stopPropagation();
    });
  });

  document.addEventListener("mousemove", resetIdleTimer);
  document.addEventListener("keypress", resetIdleTimer);
});