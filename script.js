const DB_NAME = "GuessingGameDB";
const DB_VERSION = 1;
const STORE_NAME = "leaderboard";

let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "username" });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error("Error opening IndexedDB:", event.target.error);
      reject(event.target.error);
    };
  });
}

// DOM Elements
const gameArea = document.getElementById("gameArea");
const settingsMenu = document.getElementById("settingsMenu");
const statsMenu = document.getElementById("statsMenu");
const achievementsMenu = document.getElementById("achievementsMenu");
const leaderboardMenu = document.getElementById("leaderboardMenu");
const usernameSection = document.getElementById("usernameSection");
const usernameInput = document.getElementById("usernameInput");
const submitUsernameBtn = document.getElementById("submitUsernameBtn");
const difficultySelect = document.getElementById("difficulty");
const gameModeSelect = document.getElementById("gameMode");
const highscoreDisplay = document.getElementById("highscore");
const startGameBtn = document.getElementById("startGameBtn");
const stopGameBtn = document.getElementById("stopGameBtn");
const inputContainer = document.getElementById("inputContainer");
const guessInput = document.getElementById("guessInput");
const guessButton = document.getElementById("guessButton");
const hintButton = document.getElementById("hintButton");
const message = document.getElementById("message");
const livesDisplay = document.getElementById("livesDisplay");
const timerDisplay = document.getElementById("timer");
const idleTimerDisplay = document.getElementById("idleTimer");
const settingsBtn = document.getElementById("settingsBtn");
const statsBtn = document.getElementById("statsBtn");
const viewStatsBtn = document.getElementById("viewStatsBtn");
const viewAchievementsBtn = document.getElementById("viewAchievementsBtn");
const viewLeaderboardBtn = document.getElementById("viewLeaderboardBtn");
const muteBtn = document.getElementById("muteBtn");
const vibrationBtn = document.getElementById("vibrationBtn");
const changeUsernameBtn = document.getElementById("changeUsernameBtn");
const volumeControl = document.getElementById("volumeControl");
const themeSelect = document.getElementById("themeSelect");
const confettiTypeSelect = document.getElementById("confettiType");
const confettiAmountSelect = document.getElementById("confettiAmount");
const rgbBtn = document.getElementById("rgbBtn");
const rgbSpeedSelect = document.getElementById("rgbSpeed");
const gradientColor1 = document.getElementById("gradientColor1");
const gradientColor2 = document.getElementById("gradientColor2");
const applyGradientBtn = document.getElementById("applyGradientBtn");
const vibrationSupportMessage = document.getElementById("vibrationSupportMessage");
const backToGameBtn = document.getElementById("backToGame");
const backToGameFromStatsBtn = document.getElementById("backToGameFromStats");
const backToGameFromAchievementsBtn = document.getElementById("backToGameFromAchievements");
const backToGameFromLeaderboardBtn = document.getElementById("backToGameFromLeaderboard");
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

// Game State
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
let highscore = 0;
let username = "";
let stats = { gamesPlayed: 0, wins: 0, totalGuesses: 0, totalTime: 0, playerStats: [] };
let achievements = [
  { id: 1, name: "ניצחון ראשון", description: "נצח במשחק הראשון שלך", condition: (stats) => stats.wins >= 1, reward: "theme", rewardValue: "space" },
  { id: 2, name: "מהיר כמו ברק", description: "נצח תוך פחות מ-10 שניות", condition: (stats) => stats.playerStats.some(game => game.time < 10 && game.won), reward: "confetti", rewardValue: "butterflies" },
  { id: 3, name: "מומחה ניחושים", description: "נצח 5 משחקים", condition: (stats) => stats.wins >= 5 },
  { id: 4, name: "בלי עזרה", description: "נצח במצב 'בלי רמזים'", condition: (stats) => stats.playerStats.some(game => game.mode === "noHints" && game.won) },
  { id: 5, name: "מאסטר קושי", description: "נצח במצב קשה", condition: (stats) => stats.playerStats.some(game => game.difficulty === 100 && game.won) }
];
let unlockedThemes = ["dark", "light", "neon"];
let unlockedConfetti = ["default", "stars", "hearts", "none"];
let statsChart = null;

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
          message.textContent = "שגיאה בניגון צליל. בדוק את חיבור האינטרנט או הגדרות השמע.";
          message.classList.add("fail");
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
    if (this.enabled && this.supported) {
      navigator.vibrate(pattern);
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

// Load Saved Settings
function loadSettings() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.className = savedTheme;
  themeSelect.value = savedTheme;

  const savedConfettiType = localStorage.getItem("confettiType") || "default";
  confettiTypeSelect.value = savedConfettiType;

  const savedConfettiAmount = localStorage.getItem("confettiAmount") || "medium";
  confettiAmountSelect.value = savedConfettiAmount;

  const savedRgbSpeed = localStorage.getItem("rgbSpeed") || "medium";
  rgbSpeedSelect.value = savedRgbSpeed;

  const rgbEnabled = JSON.parse(localStorage.getItem("rgbEnabled")) || false;
  if (rgbEnabled) {
    document.body.classList.add("rgb", savedRgbSpeed);
    rgbBtn.textContent = "כבה גלי צבעים";
  } else {
    rgbBtn.textContent = "הפעל גלי צבעים";
  }

  const savedGradient = JSON.parse(localStorage.getItem("customGradient"));
  if (savedGradient) {
    gradientColor1.value = savedGradient.color1;
    gradientColor2.value = savedGradient.color2;
    applyCustomGradient(savedGradient.color1, savedGradient.color2);
  }

  volumeControl.value = soundManager.volume;
}

// Apply Custom Gradient
function applyCustomGradient(color1, color2) {
  document.body.style.background = `linear-gradient(45deg, ${color1}, ${color2})`;
  document.body.style.backgroundSize = "600%";
  document.body.style.animation = "gradient 20s ease infinite";
  localStorage.setItem("customGradient", JSON.stringify({ color1, color2 }));
}

// Load Stats
function loadStats() {
  const savedStats = localStorage.getItem("stats");
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
      localStorage.setItem("stats", JSON.stringify(stats));
    }
  }
  const savedHighscore = localStorage.getItem("highscore");
  if (savedHighscore) {
    highscore = parseInt(savedHighscore);
    highscoreDisplay.textContent = `🏆 שיא אישי: ${highscore}`;
  }
  updateStatsDisplay();
}

// Load Achievements
function loadAchievements() {
  const savedUnlockedThemes = JSON.parse(localStorage.getItem("unlockedThemes"));
  if (savedUnlockedThemes) {
    unlockedThemes = savedUnlockedThemes;
  }
  const savedUnlockedConfetti = JSON.parse(localStorage.getItem("unlockedConfetti"));
  if (savedUnlockedConfetti) {
    unlockedConfetti = savedUnlockedConfetti;
  }
  updateThemeOptions();
  updateConfettiOptions();
  displayAchievements();
}

// Update Theme Options
function updateThemeOptions() {
  themeSelect.innerHTML = "";
  const themes = [
    { value: "dark", label: "כהה" },
    { value: "light", label: "בהיר" },
    { value: "neon", label: "ניאון" },
    { value: "space", label: "חלל (נעול 🔒)" }
  ];
  themes.forEach(theme => {
    const option = document.createElement("option");
    option.value = theme.value;
    option.textContent = theme.label;
    if (theme.value === "space" && !unlockedThemes.includes("space")) {
      option.disabled = true;
    } else if (theme.value === "space") {
      option.textContent = "חלל";
    }
    themeSelect.appendChild(option);
  });
  themeSelect.value = document.body.className || "dark";
}

// Update Confetti Options
function updateConfettiOptions() {
  confettiTypeSelect.innerHTML = "";
  const confettiTypes = [
    { value: "default", label: "רגיל" },
    { value: "stars", label: "כוכבים" },
    { value: "hearts", label: "לבבות" },
    { value: "butterflies", label: "פרפרים (נעול 🔒)" },
    { value: "none", label: "ללא קונפטי" }
  ];
  confettiTypes.forEach(type => {
    const option = document.createElement("option");
    option.value = type.value;
    option.textContent = type.label;
    if (type.value === "butterflies" && !unlockedConfetti.includes("butterflies")) {
      option.disabled = true;
    } else if (type.value === "butterflies") {
      option.textContent = "פרפרים";
    }
    confettiTypeSelect.appendChild(option);
  });
  confettiTypeSelect.value = localStorage.getItem("confettiType") || "default";
}

// Initialize Particles
let particlesLoaded = false;
function loadParticles() {
  if (particlesLoaded) return;
  particlesJS("particles-js", {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: document.body.classList.contains("light") ? "#333333" : "#ffffff" },
      shape: { type: "circle" },
      opacity: { value: 0.5, random: false },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: document.body.classList.contains("light") ? "#333333" : "#ffffff", opacity: 0.4, width: 1 },
      move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
      modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
    },
    retina_detect: true
  });
  particlesLoaded = true;
}

// Show Confetti
function showConfetti() {
  const confettiType = confettiTypeSelect.value;
  const confettiAmount = confettiAmountSelect.value;
  if (confettiType === "none") return;

  let count = confettiAmount === "light" ? 50 : confettiAmount === "medium" ? 100 : 200;
  let shapes = confettiType === "stars" ? ["star"] : confettiType === "hearts" ? ["heart"] : confettiType === "butterflies" ? ["butterfly"] : ["circle", "square"];

  confetti({
    particleCount: count,
    spread: 70,
    origin: { y: 0.6 },
    shapes: shapes
  });

  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement("div");
    sparkle.classList.add("sparkle");
    sparkle.style.left = `${Math.random() * 100}vw`;
    sparkle.style.top = `${Math.random() * 100}vh`;
    document.body.appendChild(sparkle);
    sparkle.addEventListener("animationend", () => {
      sparkle.remove();
    });
  }
}

// Start Game
function startGame() {
  const range = parseInt(difficultySelect.value);
  const gameMode = gameModeSelect.value;
  secretNumber = Math.floor(Math.random() * range) + 1;
  lives = maxLives;
  guesses = 0;
  hintsUsed = 0;
  timer = 0;
  gameActive = true;

  startGameBtn.style.display = "none";
  stopGameBtn.style.display = "inline-block";
  inputContainer.classList.remove("hidden");
  message.textContent = "";
  message.classList.remove("success", "fail");
  guessInput.value = "";
  guessInput.focus();

  hintButton.style.display = gameMode === "noHints" ? "none" : "inline-block";

  livesDisplay.innerHTML = "";
  for (let i = 0; i < lives; i++) {
    const heart = document.createElement("span");
    heart.classList.add("heart");
    heart.textContent = "❤️";
    livesDisplay.appendChild(heart);
  }

  timerInterval = setInterval(() => {
    timer++;
    timerDisplay.textContent = `זמן: ${timer} שניות`;
    if (gameMode === "fast" && timer >= 30) {
      endGame(false);
    }
  }, 1000);

  idleTimer = 0;
  idleInterval = setInterval(() => {
    idleTimer++;
    idleTimerDisplay.textContent = `זמן חוסר פעילות: ${idleTimer} שניות`;
    if (idleTimer >= 30) {
      alert("חוסר פעילות ממושך! המשחק נעצר.");
      endGame(false);
    }
  }, 1000);

  stats.gamesPlayed++;
  saveStats();
  soundManager.play("click");
  vibrationManager.vibrate(50);
}

// End Game
function endGame(won) {
  gameActive = false;
  clearInterval(timerInterval);
  clearInterval(idleInterval);
  stopGameBtn.style.display = "none";
  startGameBtn.style.display = "inline-block";
  inputContainer.classList.add("hidden");
  timerDisplay.textContent = "";
  idleTimerDisplay.textContent = "";

  const range = parseInt(difficultySelect.value);
  const gameMode = gameModeSelect.value;
  const score = won ? Math.max(1, range - guesses) : 0;

  if (won) {
    message.textContent = `כל הכבוד! ניחשת את המספר ${secretNumber} ב-${guesses} ניחושים ו-${timer} שניות! צברת ${score} נקודות!`;
    message.classList.add("success");
    stats.wins++;
    stats.totalGuesses += guesses;
    stats.totalTime += timer;
    if (score > highscore) {
      highscore = score;
      highscoreDisplay.textContent = `🏆 שיא אישי: ${highscore}`;
      localStorage.setItem("highscore", highscore);
    }
    showConfetti();
    soundManager.play("success");
    vibrationManager.vibrate([100, 50, 100]);
    updateLeaderboard(score);
  } else {
    message.textContent = `הפסדת! המספר היה ${secretNumber}.`;
    message.classList.add("fail");
    soundManager.play("gameOver");
    vibrationManager.vibrate([200, 100, 200]);
  }

  if (!Array.isArray(stats.playerStats)) {
    console.warn("playerStats is not an array before pushing game data. Resetting to empty array.");
    stats.playerStats = [];
  }

  stats.playerStats.push({
    won,
    guesses,
    time: timer,
    difficulty: range,
    mode: gameMode,
    hintsUsed,
    date: new Date().toLocaleString("he-IL")
  });
  saveStats();
  checkAchievements();
}

// Check Guess
function checkGuess() {
  if (!gameActive) return;

  const guess = parseInt(guessInput.value);
  const range = parseInt(difficultySelect.value);

  if (isNaN(guess) || guess < 1 || guess > range) {
    message.textContent = `אנא הזן מספר בין 1 ל-${range}`;
    message.classList.add("fail");
    return;
  }

  guesses++;
  if (guess === secretNumber) {
    endGame(true);
  } else {
    lives--;
    const heart = livesDisplay.querySelector(".heart:last-child");
    if (heart) {
      heart.classList.add("pulse-out");
      setTimeout(() => heart.remove(), 300);
    }

    if (lives <= 0) {
      endGame(false);
    } else {
      message.textContent = guess > secretNumber ? "גבוה מדי! נסה שוב." : "נמוך מדי! נסה שוב.";
      message.classList.add("fail");
      soundManager.play("fail");
      vibrationManager.vibrate(50);
    }
  }
  guessInput.value = "";
  guessInput.focus();
}

// Provide Hint
function provideHint() {
  if (!gameActive) return;
  hintsUsed++;
  const range = parseInt(difficultySelect.value);
  const hintRange = Math.floor(range / 10);
  const lowerBound = Math.max(1, secretNumber - hintRange);
  const upperBound = Math.min(range, secretNumber + hintRange);
  message.textContent = `רמז: המספר נמצא בין ${lowerBound} ל-${upperBound}`;
  soundManager.play("hint");
  vibrationManager.vibrate(50);
}

// Check Achievements
function checkAchievements() {
  let updated = false;
  achievements.forEach(achievement => {
    if (!achievement.unlocked && achievement.condition(stats)) {
      achievement.unlocked = true;
      updated = true;
      applyReward(achievement);
      alert(`השגת הישג חדש: ${achievement.name}! ${achievement.description}`);
    }
  });
  if (updated) {
    displayAchievements();
  }
}

// Apply Reward
function applyReward(achievement) {
  if (achievement.reward === "theme" && !unlockedThemes.includes(achievement.rewardValue)) {
    unlockedThemes.push(achievement.rewardValue);
    localStorage.setItem("unlockedThemes", JSON.stringify(unlockedThemes));
    updateThemeOptions();
  } else if (achievement.reward === "confetti" && !unlockedConfetti.includes(achievement.rewardValue)) {
    unlockedConfetti.push(achievement.rewardValue);
    localStorage.setItem("unlockedConfetti", JSON.stringify(unlockedConfetti));
    updateConfettiOptions();
  }
}

// Display Achievements
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

// Update Leaderboard
function updateLeaderboard(score) {
  if (!username) {
    console.error("Username is missing");
    message.textContent = "שגיאה: שם משתמש חסר";
    message.classList.add("fail");
    return;
  }

  if (!/^[a-zA-Z0-9א-ת]+$/.test(username)) {
    console.error("Invalid username format:", username);
    message.textContent = "שגיאה: שם המשתמש מכיל תווים לא חוקיים";
    message.classList.add("fail");
    return;
  }

  if (typeof score !== "number" || isNaN(score) || score < 0) {
    console.error("Invalid score:", score);
    message.textContent = "שגיאה: ניקוד לא תקין";
    message.classList.add("fail");
    return;
  }

  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const data = {
    username,
    highscore: score,
    timestamp: new Date().toISOString()
  };

  const request = store.put(data);

  request.onsuccess = () => {
    displayLeaderboard();
  };

  request.onerror = (event) => {
    console.error("Error updating leaderboard:", event.target.error);
    message.textContent = "שגיאה בעדכון הדירוג: " + (event.target.error.message || "תקלה לא ידועה");
    message.classList.add("fail");
  };
}

// Display Leaderboard
function displayLeaderboard() {
  leaderboardList.innerHTML = "";
  const transaction = db.transaction([STORE_NAME], "readonly");
  const store = transaction.objectStore(STORE_NAME);

  const request = store.getAll();

  request.onsuccess = (event) => {
    const leaderboardData = event.target.result;
    if (!leaderboardData || leaderboardData.length === 0) {
      leaderboardList.innerHTML = "<li>אין נתונים זמינים להצגה</li>";
      return;
    }

    leaderboardData.sort((a, b) => b.highscore - a.highscore);
    const top10 = leaderboardData.slice(0, 10);

    let rank = 1;
    top10.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `${rank}. ${entry.username}: ${entry.highscore} נקודות`;
      leaderboardList.appendChild(li);
      rank++;
    });
  };

  request.onerror = (event) => {
    console.error("Error fetching leaderboard:", event.target.error);
    leaderboardList.innerHTML = "<li>שגיאה בטעינת הדירוג: " + (event.target.error.message || "תקלה לא ידועה") + "</li>";
  };
}

// Save Stats
function saveStats() {
  if (!Array.isArray(stats.playerStats)) {
    console.warn("playerStats is not an array before saving. Resetting to empty array.");
    stats.playerStats = [];
  }
  localStorage.setItem("stats", JSON.stringify(stats));
  updateStatsDisplay();
}

// Update Stats Display
function updateStatsDisplay() {
  const successRate = stats.gamesPlayed > 0 ? ((stats.wins / stats.gamesPlayed) * 100).toFixed(2) : 0;
  const averageTime = stats.wins > 0 ? (stats.totalTime / stats.wins).toFixed(2) : 0;
  successRateDisplay.textContent = `שיעור הצלחה: ${successRate}%`;
  averageTimeDisplay.textContent = `זמן ממוצע לניצחון: ${averageTime} שניות`;
  displayDetailedStats();
  updateStatsChart();
}

// Display Detailed Stats
function displayDetailedStats() {
  if (!stats.playerStats || stats.playerStats.length === 0) {
    detailedStatsList.innerHTML = "<li class='no-data-message'>אין נתונים זמינים להצגה</li>";
    return;
  }

  const sortBy = sortStatsSelect.value;
  const sortedStats = [...stats.playerStats].sort((a, b) => {
    if (sortBy === "date") return new Date(b.date) - new Date(a.date);
    if (sortBy === "time") return a.time - b.time;
    if (sortBy === "guesses") return a.guesses - b.guesses;
    if (sortBy === "difficulty") return b.difficulty - a.difficulty;
    return 0;
  });

  detailedStatsList.innerHTML = "";
  sortedStats.forEach(game => {
    if (game.won) {
      const li = document.createElement("li");
      li.textContent = `ניצחון: ${game.guesses} ניחושים, ${game.time} שניות, קושי: ${game.difficulty}, מצב: ${game.mode}, רמזים: ${game.hintsUsed}, תאריך: ${game.date}`;
      detailedStatsList.appendChild(li);
    }
  });
}

// Update Stats Chart
function updateStatsChart() {
  if (!stats.playerStats || !Array.isArray(stats.playerStats)) {
    console.warn("stats.playerStats is undefined or not an array. Initializing as empty array.");
    stats.playerStats = [];
  }

  const labels = stats.playerStats.map((game, index) => `משחק ${index + 1}`);
  const guessData = stats.playerStats.map(game => game.guesses);
  const timeData = stats.playerStats.map(game => game.time);

  const currentTheme = document.body.className;
  const borderColor = currentTheme === "light" ? "rgba(0, 0, 0, 0.8)" : currentTheme === "neon" ? "rgba(0, 255, 255, 1)" : "rgba(75, 192, 192, 1)";
  const backgroundColor = currentTheme === "light" ? "rgba(0, 0, 0, 0.2)" : currentTheme === "neon" ? "rgba(0, 255, 255, 0.2)" : "rgba(75, 192, 192, 0.2)";

  if (statsChart) {
    statsChart.destroy();
  }

  statsChart = new Chart(statsChartCanvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "מספר ניחושים",
          data: guessData,
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

// Show Confirmation Dialog
function showConfirmation(message, onConfirm) {
  confirmationMessage.textContent = message;
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

// Reset Stats
function resetStats() {
  showConfirmation("האם אתה בטוח שברצונך לאפס את הסטטיסטיקות?", () => {
    stats = { gamesPlayed: 0, wins: 0, totalGuesses: 0, totalTime: 0, playerStats: [] };
    highscore = 0;
    localStorage.setItem("stats", JSON.stringify(stats));
    localStorage.setItem("highscore", highscore);
    highscoreDisplay.textContent = `🏆 שיא אישי: ${highscore}`;
    updateStatsDisplay();
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });
}

// Reset Idle Timer
function resetIdleTimer() {
  if (gameActive) {
    idleTimer = 0;
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Ensure the confirmation dialog is hidden on page load
  confirmationDialog.classList.add("hidden");

  openDB().then(() => {
    // Retrieve username from localStorage
    username = localStorage.getItem("username") || "";
    
    // If a username exists, skip the username section and show the game area
    if (username) {
      usernameSection.classList.add("hidden");
      gameArea.classList.remove("hidden");
      loadSettings();
      loadStats();
      loadAchievements();
      loadParticles();
    } else {
      // If no username, show the username section and hide the game area
      usernameSection.classList.remove("hidden");
      gameArea.classList.add("hidden");
    }
  }).catch(err => {
    console.error("Failed to initialize IndexedDB:", err);
    alert("שגיאה בטעינת מסד הנתונים המקומי. אנא נסה שוב.");
  });
});

submitUsernameBtn.addEventListener("click", () => {
  const input = usernameInput.value.trim();
  if (input && /^[א-תa-zA-Z0-9]+$/.test(input)) {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(input);

    request.onsuccess = (event) => {
      if (event.target.result) {
        alert("שם משתמש זה כבר תפוס. אנא בחר שם אחר.");
        return;
      }
      // Save the username to localStorage
      username = input;
      localStorage.setItem("username", username);
      // Hide the username section and show the game area
      usernameSection.classList.add("hidden");
      gameArea.classList.remove("hidden");
      // Initialize the game
      loadSettings();
      loadStats();
      loadAchievements();
      loadParticles();
      soundManager.play("click");
      vibrationManager.vibrate(50);
    };

    request.onerror = (event) => {
      console.error("Error checking username:", event.target.error);
      alert("שגיאה בבדיקת שם המשתמש: " + (event.target.error.message || "תקלה לא ידועה"));
    };
  } else {
    alert("אנא הזן שם משתמש תקין (אותיות בעברית, אנגלית או מספרים בלבד)");
  }
});

changeUsernameBtn.addEventListener("click", () => {
  localStorage.removeItem("username");
  username = "";
  usernameSection.classList.remove("hidden");
  gameArea.classList.add("hidden");
  settingsMenu.classList.add("hidden");
});

startGameBtn.addEventListener("click", startGame);

stopGameBtn.addEventListener("click", () => {
  endGame(false);
});

guessButton.addEventListener("click", checkGuess);

guessInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") checkGuess();
});

hintButton.addEventListener("click", provideHint);

settingsBtn.addEventListener("click", () => {
  if (settingsMenu.classList.contains("hidden")) {
    settingsMenu.classList.remove("hidden");
    gameArea.classList.add("hidden");
    statsMenu.classList.add("hidden");
    achievementsMenu.classList.add("hidden");
    leaderboardMenu.classList.add("hidden");
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
  updateStatsDisplay();
  soundManager.play("click");
  vibrationManager.vibrate(50);
});

viewAchievementsBtn.addEventListener("click", () => {
  achievementsMenu.classList.remove("hidden");
  gameArea.classList.add("hidden");
  displayAchievements();
  soundManager.play("click");
  vibrationManager.vibrate(50);
});

viewLeaderboardBtn.addEventListener("click", () => {
  leaderboardMenu.classList.remove("hidden");
  gameArea.classList.add("hidden");
  displayLeaderboard();
  soundManager.play("click");
  vibrationManager.vibrate(50);
});

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
  document.body.className = themeSelect.value;
  localStorage.setItem("theme", themeSelect.value);
  loadParticles();
  updateStatsChart();
});

confettiTypeSelect.addEventListener("change", () => {
  localStorage.setItem("confettiType", confettiTypeSelect.value);
});

confettiAmountSelect.addEventListener("change", () => {
  localStorage.setItem("confettiAmount", confettiAmountSelect.value);
});

rgbBtn.addEventListener("click", () => {
  const rgbEnabled = !document.body.classList.contains("rgb");
  if (rgbEnabled) {
    document.body.classList.add("rgb", rgbSpeedSelect.value);
    rgbBtn.textContent = "כבה גלי צבעים";
  } else {
    document.body.classList.remove("rgb", "slow", "medium", "fast");
    rgbBtn.textContent = "הפעל גלי צבעים";
  }
  localStorage.setItem("rgbEnabled", rgbEnabled);
});

rgbSpeedSelect.addEventListener("change", () => {
  if (document.body.classList.contains("rgb")) {
    document.body.classList.remove("slow", "medium", "fast");
    document.body.classList.add(rgbSpeedSelect.value);
  }
  localStorage.setItem("rgbSpeed", rgbSpeedSelect.value);
});

applyGradientBtn.addEventListener("click", () => {
  applyCustomGradient(gradientColor1.value, gradientColor2.value);
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

resetStatsBtn.addEventListener("click", resetStats);

sortStatsSelect.addEventListener("change", displayDetailedStats);

document.addEventListener("mousemove", resetIdleTimer);
document.addEventListener("keypress", resetIdleTimer);
document.addEventListener("touchstart", resetIdleTimer);