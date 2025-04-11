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
const adminPasswordSection = document.getElementById("adminPasswordSection");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const submitUsernameBtn = document.getElementById("submitUsernameBtn");
const cancelUsernameBtn = document.getElementById("cancelUsernameBtn");
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

const ADMIN_PASSWORD = "Ghsi1231210";

// Mode translations for Hebrew display
const modeTranslations = {
  "normal": "רגיל",
  "fast": "מהיר (30 שניות)",
  "noHints": "בלי רמזים",
  "dynamicRange": "טווח משתנה"
};

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
let hintUsedThisGame = false; // Track if hint has been used in the current game
let highscore = 0;
let username = "";
let isAdmin = false;
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

// Clear Leaderboard (Admin Only)
function clearLeaderboard() {
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  
  const clearRequest = store.clear();

  clearRequest.onsuccess = () => {
    console.log("Leaderboard cleared successfully");
    displayLeaderboard();
    showMessage("הדירוג נוקה בהצלחה!", () => {});
  };

  clearRequest.onerror = (event) => {
    console.error("Error clearing leaderboard:", event.target.error);
    showMessage("שגיאה בניקוי הדירוג: " + (event.target.error.message || "תקלה לא ידועה"), () => {});
  };
}

// Load Saved Settings
function loadSettings() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  themeSelect.value = savedTheme;

  const savedConfettiType = localStorage.getItem("confettiType") || "default";
  confettiTypeSelect.value = savedConfettiType;

  const savedConfettiAmount = localStorage.getItem("confettiAmount") || "medium";
  confettiAmountSelect.value = savedConfettiAmount;

  console.log("Loading settings:", { savedTheme });

  document.body.classList.remove("dark", "light", "neon", "space", "gradient");
  document.body.style.background = "";
  document.body.style.backgroundSize = "";
  document.body.style.animation = "";
  document.body.style.backgroundColor = "";

  const savedGradient = JSON.parse(localStorage.getItem("customGradient"));
  if (savedGradient) {
    console.log("Applying saved gradient:", savedGradient);
    gradientColor1.value = savedGradient.color1;
    gradientColor2.value = savedGradient.color2;
    applyCustomGradient(savedGradient.color1, savedGradient.color2);
  } else {
    console.log("Applying theme:", savedTheme);
    document.body.classList.add(savedTheme);
    setTimeout(() => {
      document.body.classList.remove(savedTheme);
      document.body.classList.add(savedTheme);
      console.log("Forced theme reapplication:", savedTheme);
    }, 0);
  }

  volumeControl.value = soundManager.volume;
}

// Apply Custom Gradient
function applyCustomGradient(color1, color2) {
  console.log("Applying custom gradient:", { color1, color2 });
  document.body.classList.remove("dark", "light", "neon", "space", "gradient");
  document.body.style.background = `linear-gradient(45deg, ${color1}, ${color2})`;
  document.body.style.backgroundSize = "600%";
  document.body.style.animation = "";
  document.body.style.backgroundColor = "";
  localStorage.setItem("customGradient", JSON.stringify({ color1, color2 }));
  console.log("Gradient applied, body styles:", {
    background: document.body.style.background,
    backgroundColor: document.body.style.backgroundColor,
    classList: document.body.classList.toString()
  });
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
  console.log("Loaded stats:", stats);
  highscore = stats.wins;
  highscoreDisplay.textContent = `🏆 שיא אישי: ${highscore}`;
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
  themeSelect.value = localStorage.getItem("theme") || "dark";
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
      number: { value: 50, density: { enable: true, value_area: 800 } },
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
  console.log("showConfetti called with type:", confettiType, "amount:", confettiAmount);
  if (confettiType === "none") return;

  let count = confettiAmount === "light" ? 30 : confettiAmount === "medium" ? 60 : 120;
  let shapes = confettiType === "stars" ? ["star"] : confettiType === "hearts" ? ["circle"] : confettiType === "butterflies" ? ["circle"] : ["circle", "square"];
  console.log("Confetti shapes:", shapes);

  try {
    confetti({
      particleCount: count,
      spread: 70,
      origin: { y: 0.6 },
      shapes: shapes,
      colors: confettiType === "hearts" ? ["#ff0000", "#ff69b4"] : undefined
    });
  } catch (err) {
    console.error("Confetti error:", err);
    message.textContent = "שגיאה בהפעלת קונפטי. בדוק את חיבור האינטרנט או נסה שוב.";
    message.classList.add("fail");
  }

  for (let i = 0; i < 20; i++) {
    const sparkle = document.createElement("div");
    sparkle.classList.add("sparkle");
    if (confettiType === "butterflies") {
      sparkle.textContent = "🦋";
      sparkle.style.fontSize = "20px";
    } else if (confettiType === "stars") {
      sparkle.textContent = "⭐";
      sparkle.style.fontSize = "20px";
    } else if (confettiType === "hearts") {
      sparkle.textContent = "❤️";
      sparkle.style.fontSize = "20px";
    }
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
  hintUsedThisGame = false; // Reset hint usage for the new game
  timer = 0;
  gameActive = true;

  startGameBtn.style.display = "none";
  stopGameBtn.style.display = "inline-block";
  playAgainBtn.style.display = "none"; // Hide play again button during game
  inputContainer.classList.remove("hidden");
  message.textContent = "";
  message.classList.remove("success", "fail");
  guessInput.value = "";
  guessInput.disabled = false;
  guessInput.focus();
  hintButton.disabled = false; // Enable hint button at the start of the game

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
        endGame(false);
      });
    }
  }, 1000);

  idleTimer = 0;
  idleInterval = setInterval(() => {
    idleTimer++;
    idleTimerDisplay.textContent = `זמן חוסר פעילות: ${idleTimer} שניות`;
    if (idleTimer >= 30) {
      showMessage("חוסר פעילות ממושך! המשחק נעצר.", () => {
        endGame(false);
      });
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
  playAgainBtn.style.display = "inline-block"; // Show play again button
  inputContainer.classList.add("hidden");
  timerDisplay.textContent = "";
  idleTimerDisplay.textContent = "";
  guessInput.disabled = true;

  const range = parseInt(difficultySelect.value);
  const gameMode = gameModeSelect.value;
  const score = won ? Math.max(1, range - guesses) : 0;

  console.log("endGame called with won:", won, "Current stats.wins:", stats.wins);

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
    updateLeaderboard(score);
  } else {
    message.textContent = `הפסדת! המספר היה ${secretNumber}.`;
    message.classList.remove("success");
    message.classList.add("fail");
    soundManager.play("gameOver");
    vibrationManager.vibrate([200, 100, 200]);
  }

  highscore = stats.wins;
  highscoreDisplay.textContent = `🏆 שיא אישי: ${highscore}`;

  console.log("After endGame, stats.wins:", stats.wins);

  if (!Array.isArray(stats.playerStats)) {
    console.warn("playerStats is not an array before pushing game data. Resetting to empty array.");
    stats.playerStats = [];
  }

  stats.playerStats.push({
    won,
    guesses,
    time: timer,
    difficulty: range,
    mode: gameModeSelect.value,
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
    message.classList.remove("success");
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

// Provide Hint (Limited to 1 per game)
function provideHint() {
  if (!gameActive) return;
  if (hintUsedThisGame) {
    message.textContent = "כבר השתמשת ברמז במשחק זה!";
    message.classList.remove("success");
    message.classList.add("fail");
    return;
  }

  hintsUsed++;
  hintUsedThisGame = true; // Mark hint as used for this game
  hintButton.disabled = true; // Disable the hint button for the rest of the game

  const range = parseInt(difficultySelect.value);
  const hintRange = Math.floor(range / 10);
  const lowerBound = Math.max(1, secretNumber - hintRange);
  const upperBound = Math.min(range, secretNumber + hintRange);
  message.textContent = `רמז: המספר נמצא בין ${lowerBound} ל-${upperBound}`;
  soundManager.play("hint");
  vibrationManager.vibrate(50);

  // Deduct a life for using a hint
  lives--;
  const heart = livesDisplay.querySelector(".heart:last-child");
  if (heart) {
    heart.classList.add("pulse-out");
    setTimeout(() => heart.remove(), 300);
  }

  if (lives <= 0) {
    endGame(false);
  } else {
    livesDisplay.setAttribute("aria-label", `מספר החיים הנותרים: ${lives}`);
  }
}

// Check Achievements
function checkAchievements() {
  let updated = false;
  achievements.forEach(achievement => {
    if (!achievement.unlocked && achievement.condition(stats)) {
      achievement.unlocked = true;
      updated = true;
      applyReward(achievement);
      showMessage(`השגת הישג חדש: ${achievement.name}! ${achievement.description}`, () => {});
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

  const getRequest = store.get(username);

  getRequest.onsuccess = (event) => {
    let userData = event.target.result;
    if (!userData) {
      userData = {
        username,
        scores: [{ score, timestamp: new Date().toISOString() }]
      };
    } else {
      userData.scores.push({ score, timestamp: new Date().toISOString() });
    }

    const putRequest = store.put(userData);

    putRequest.onsuccess = () => {
      displayLeaderboard();
    };

    putRequest.onerror = (event) => {
      console.error("Error updating leaderboard:", event.target.error);
      message.textContent = "שגיאה בעדכון הדירוג: " + (event.target.error.message || "תקלה לא ידועה");
      message.classList.add("fail");
    };
  };

  getRequest.onerror = (event) => {
    console.error("Error fetching user data:", event.target.error);
    message.textContent = "שגיאה בטעינת נתוני משתמש: " + (event.target.error.message || "תקלה לא ידועה");
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
    console.log("Leaderboard data:", leaderboardData);
    if (!leaderboardData || leaderboardData.length === 0) {
      leaderboardList.innerHTML = "<li>אין נתונים זמינים להצגה</li>";
      return;
    }

    const processedData = leaderboardData.map(user => {
      const totalScore = user.scores.reduce((sum, entry) => sum + entry.score, 0);
      return { username: user.username, totalScore: totalScore };
    });

    processedData.sort((a, b) => b.totalScore - a.totalScore);
    const top10 = processedData.slice(0, 10);

    let rank = 1;
    top10.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `${rank}. ${entry.username}: ${entry.totalScore} נקודות`;
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
  console.log("Saving stats:", stats);
  localStorage.setItem("stats", JSON.stringify(stats));
  updateStatsDisplay();
}

// Update Stats Display
function updateStatsDisplay() {
  const successRate = stats.gamesPlayed > 0 ? ((stats.wins / stats.gamesPlayed) * 100).toFixed(2) : 0;
  console.log("Calculating success rate:", { wins: stats.wins, gamesPlayed: stats.gamesPlayed, successRate: successRate });
  const averageTime = stats.wins > 0 ? (stats.totalTime / stats.wins).toFixed(2) : 0;

  if (successRateDisplay) {
    successRateDisplay.textContent = `שיעור הצלחה: ${successRate}%`;
  } else {
    console.warn("successRateDisplay element not found");
  }

  if (averageTimeDisplay) {
    averageTimeDisplay.textContent = `זמן ממוצע לניצחון: ${averageTime} שניות`;
  } else {
    console.warn("averageTimeDisplay element not found");
  }

  let winsDisplay = document.getElementById("winsDisplay");
  if (!winsDisplay) {
    winsDisplay = document.createElement("p");
    winsDisplay.id = "winsDisplay";
    if (statsMenu) {
      if (successRateDisplay && statsMenu.contains(successRateDisplay)) {
        statsMenu.insertBefore(winsDisplay, successRateDisplay);
      } else {
        statsMenu.appendChild(winsDisplay);
      }
    } else {
      console.error("statsMenu element not found");
    }
  }
  if (winsDisplay) {
    winsDisplay.textContent = `ניצחונות: ${stats.wins}`;
  }

  displayDetailedStats();
  updateStatsChart();
}

// Returns the stats sorted based on the selected sort option
function getSortedStats() {
  if (!stats.playerStats || stats.playerStats.length === 0) {
    return [];
  }

  const sortBy = sortStatsSelect ? sortStatsSelect.value : "date";
  console.log("Sorting by:", sortBy);

  return [...stats.playerStats].sort((a, b) => {
    if (sortBy === "date") return new Date(b.date) - new Date(a.date);
    if (sortBy === "time") return a.time - b.time;
    if (sortBy === "guesses") return a.guesses - b.guesses;
    if (sortBy === "difficulty") return b.difficulty - a.difficulty;
    return 0;
  });
}

// Display Detailed Stats
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
      const modeInHebrew = modeTranslations[game.mode] || game.mode;
      li.textContent = `ניצחון: ${game.guesses} ניחושים, ${game.time} שניות, קושי: ${game.difficulty}, מצב: ${modeInHebrew}, רמזים: ${game.hintsUsed}, תאריך: ${game.date}`;
      detailedStatsList.appendChild(li);
    }
  });
}

// Updates the stats chart with sorted data
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
    const guessData = sortedStats.map(game => game.guesses);
    const timeData = sortedStats.map(game => game.time);

    const currentTheme = document.body.className;
    const borderColor = currentTheme === "light" ? "rgba(0, 0, 0, 0.8)" : currentTheme === "neon" ? "rgba(0, 255, 255, 1)" : "rgba(75, 192, 192, 1)";
    const backgroundColor = currentTheme === "light" ? "rgba(0, 0, 0, 0.2)" : currentTheme === "neon" ? "rgba(0, 255, 255, 0.2)" : "rgba(75, 192, 192, 0.2)";

    if (statsChart) {
      statsChart.data.labels = labels;
      statsChart.data.datasets[0].data = guessData;
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
  } catch (err) {
    console.error("Error updating stats chart:", err);
    message.textContent = "שגיאה בעדכון גרף הסטטיסטיקות.";
    message.classList.add("fail");
  }
}

// Show Message
function showMessage(messageText, onClose) {
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
    if (onClose) onClose();
    soundManager.play("click");
    vibrationManager.vibrate(50);
  });
}

// Show Confirmation Dialog
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

// Reset Stats
function resetStats() {
  showConfirmation("האם אתה בטוח שברצונך לאפס את הסטטיסטיקות?", () => {
    stats = { gamesPlayed: 0, wins: 0, totalGuesses: 0, totalTime: 0, playerStats: [] };
    highscore = 0;
    localStorage.setItem("stats", JSON.stringify(stats));
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
  console.log("DOM loaded, checking elements:");
  console.log("statsBtn:", !!statsBtn);
  console.log("statsMenu:", !!statsMenu);
  console.log("gameArea:", !!gameArea);
  console.log("settingsMenu:", !!settingsMenu);
  console.log("achievementsMenu:", !!achievementsMenu);
  console.log("leaderboardMenu:", !!leaderboardMenu);

  confirmationDialog.classList.add("hidden");

  if (!statsMenu || !successRateDisplay || !averageTimeDisplay) {
    console.error("Required DOM elements are missing:", {
      statsMenu: !!statsMenu,
      successRateDisplay: !!successRateDisplay,
      averageTimeDisplay: !!averageTimeDisplay
    });
  }

  openDB().then(() => {
    console.log("localStorage before setting username:", localStorage.getItem("username"));
    username = localStorage.getItem("username") || "";
    isAdmin = false;
    console.log("User:", username, "Is Admin:", isAdmin);
    
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
      }

      if (clearLeaderboardBtn) {
        clearLeaderboardBtn.style.display = "none";
        console.log("Clear Leaderboard button initially set to: none");
      } else {
        console.error("clearLeaderboardBtn not found in DOM");
      }
    } else {
      usernameSection.classList.remove("hidden");
      gameArea.classList.add("hidden");
    }
  }).catch(err => {
    console.error("Failed to initialize IndexedDB:", err);
    showMessage("שגיאה בטעינת מסד הנתונים המקומי. אנא נסה שוב.", () => {});
  });

  if (statsBtn) {
    console.log("Stats button found, attaching event listener");
    statsBtn.addEventListener("click", () => {
      try {
        console.log("Stats button clicked");
        if (!statsMenu) {
          console.error("statsMenu element is missing");
          return;
        }
        if (statsMenu.classList.contains("hidden")) {
          console.log("Showing stats menu");
          statsMenu.classList.remove("hidden");
          statsMenu.style.display = "block";
          gameArea.classList.add("hidden");
          settingsMenu.classList.add("hidden");
          settingsMenu.style.display = "none";
          achievementsMenu.classList.add("hidden");
          achievementsMenu.style.display = "none";
          leaderboardMenu.classList.add("hidden");
          leaderboardMenu.style.display = "none";
          updateStatsDisplay();
        } else {
          console.log("Hiding stats menu");
          statsMenu.classList.add("hidden");
          statsMenu.style.display = "none";
          gameArea.classList.remove("hidden");
        }
        soundManager.play("click");
        vibrationManager.vibrate(50);
      } catch (err) {
        console.error("Error in stats button handler:", err);
      }
    });
  } else {
    console.error("Stats button not found in DOM");
  }

  if (usernameInput) {
    usernameInput.addEventListener("input", () => {
      const input = usernameInput.value.trim();
      if (input.toLowerCase() === "admin") {
        adminPasswordSection.style.display = "block";
      } else {
        adminPasswordSection.style.display = "none";
        adminPasswordInput.value = "";
      }
    });
  }

  if (submitUsernameBtn) {
    submitUsernameBtn.addEventListener("click", () => {
      const input = usernameInput.value.trim();
      if (input && /^[א-תa-zA-Z0-9]+$/.test(input)) {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(input);

        request.onsuccess = (event) => {
          if (input.toLowerCase() === "admin") {
            const password = adminPasswordInput.value;
            if (password !== ADMIN_PASSWORD) {
              showMessage("סיסמת מנהל שגויה. אנא נסה שם משתמש או סיסמה אחרים.", () => {});
              return;
            }
          }

          if (event.target.result && input !== username && input.toLowerCase() !== "admin") {
            showMessage("שם משתמש זה כבר קיים. אנא בחר שם אחר.", () => {});
            return;
          }
          username = input;
          localStorage.setItem("username", username);
          console.log("Username set in localStorage:", username);
          isAdmin = input.toLowerCase() === "admin" && adminPasswordInput.value === ADMIN_PASSWORD;
          console.log("User:", username, "Is Admin:", isAdmin);
          usernameSection.classList.add("hidden");
          gameArea.classList.remove("hidden");
          cancelUsernameBtn.style.display = "none";
          if (clearLeaderboardBtn) {
            clearLeaderboardBtn.style.display = isAdmin ? "inline-block" : "none";
            console.log("Clear Leaderboard button visibility set to:", clearLeaderboardBtn.style.display);
          }
          loadSettings();
          loadStats();
          loadAchievements();
          loadParticles();
          soundManager.play("click");
          vibrationManager.vibrate(50);
        };

        request.onerror = (event) => {
          console.error("Error checking username:", event.target.error);
          showMessage("שגיאה בבדיקת שם המשתמש: " + (event.target.error.message || "תקלה לא ידועה"), () => {});
        };
      } else {
        showMessage("אנא הזן שם משתמש תקין (אותיות בעברית, אנגלית או מספרים בלבד)", () => {});
      }
    });
  }

  if (changeUsernameBtn) {
    changeUsernameBtn.addEventListener("click", () => {
      usernameSection.classList.remove("hidden");
      gameArea.classList.add("hidden");
      settingsMenu.classList.add("hidden");
      settingsMenu.style.display = "none";
      statsMenu.classList.add("hidden");
      statsMenu.style.display = "none";
      achievementsMenu.classList.add("hidden");
      achievementsMenu.style.display = "none";
      leaderboardMenu.classList.add("hidden");
      leaderboardMenu.style.display = "none";
      submitUsernameBtn.style.display = "inline-block";
      cancelUsernameBtn.style.display = "inline-block";
      usernameInput.value = username;
      adminPasswordSection.style.display = username.toLowerCase() === "admin" ? "block" : "none";
      adminPasswordInput.value = "";
      isAdmin = false;
      if (clearLeaderboardBtn) {
        clearLeaderboardBtn.style.display = "none";
      }
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  }

  if (cancelUsernameBtn) {
    cancelUsernameBtn.addEventListener("click", () => {
      usernameSection.classList.add("hidden");
      settingsMenu.classList.remove("hidden");
      settingsMenu.style.display = "block";
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  }

  if (startGameBtn) startGameBtn.addEventListener("click", startGame);

  if (stopGameBtn) {
    stopGameBtn.addEventListener("click", () => {
      endGame(false);
    });
  }

  if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => {
      startGame(); // Restart the game
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  }

  if (guessButton) guessButton.addEventListener("click", checkGuess);

  if (guessInput) {
    guessInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") checkGuess();
    });
  }

  if (hintButton) hintButton.addEventListener("click", provideHint);

  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      if (settingsMenu.classList.contains("hidden")) {
        settingsMenu.classList.remove("hidden");
        settingsMenu.style.display = "block";
        gameArea.classList.add("hidden");
        statsMenu.classList.add("hidden");
        statsMenu.style.display = "none";
        achievementsMenu.classList.add("hidden");
        achievementsMenu.style.display = "none";
        leaderboardMenu.classList.add("hidden");
        leaderboardMenu.style.display = "none";
      } else {
        settingsMenu.classList.add("hidden");
        settingsMenu.style.display = "none";
        gameArea.classList.remove("hidden");
      }
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  }

  if (viewStatsBtn) {
    viewStatsBtn.addEventListener("click", () => {
      console.log("View stats button clicked");
      if (!statsMenu) {
        console.error("statsMenu element is missing");
        return;
      }
      statsMenu.classList.remove("hidden");
      statsMenu.style.display = "block";
      gameArea.classList.add("hidden");
      settingsMenu.classList.add("hidden");
      settingsMenu.style.display = "none";
      achievementsMenu.classList.add("hidden");
      achievementsMenu.style.display = "none";
      leaderboardMenu.classList.add("hidden");
      leaderboardMenu.style.display = "none";
      updateStatsDisplay();
      soundManager.play("click");
      vibrationManager.vibrate(50);
      console.log("Stats menu shown, game area hidden");
    });
  }

  if (viewAchievementsBtn) {
    viewAchievementsBtn.addEventListener("click", () => {
      achievementsMenu.classList.remove("hidden");
      achievementsMenu.style.display = "block";
      gameArea.classList.add("hidden");
      statsMenu.classList.add("hidden");
      statsMenu.style.display = "none";
      settingsMenu.classList.add("hidden");
      settingsMenu.style.display = "none";
      leaderboardMenu.classList.add("hidden");
      leaderboardMenu.style.display = "none";
      displayAchievements();
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  }

  if (viewLeaderboardBtn) {
    viewLeaderboardBtn.addEventListener("click", () => {
      leaderboardMenu.classList.remove("hidden");
      leaderboardMenu.style.display = "block";
      gameArea.classList.add("hidden");
      statsMenu.classList.add("hidden");
      statsMenu.style.display = "none";
      settingsMenu.classList.add("hidden");
      settingsMenu.style.display = "none";
      achievementsMenu.classList.add("hidden");
      achievementsMenu.style.display = "none";
      displayLeaderboard();
      if (clearLeaderboardBtn) {
        clearLeaderboardBtn.style.display = isAdmin ? "inline-block" : "none";
        console.log("Clear Leaderboard button visibility set to:", clearLeaderboardBtn.style.display);
      }
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  }

  if (clearLeaderboardBtn) {
    clearLeaderboardBtn.addEventListener("click", () => {
      showConfirmation("האם אתה בטוח שברצונך לנקות את הדירוג? פעולה זו אינה ניתנת לביטול.", () => {
        clearLeaderboard();
        soundManager.play("click");
        vibrationManager.vibrate(50);
      });
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      soundManager.toggleMute();
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  }

  if (vibrationBtn) {
    vibrationBtn.addEventListener("click", () => {
      vibrationManager.toggleVibration();
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  }

  if (volumeControl) {
    volumeControl.addEventListener("input", () => {
      soundManager.volume = parseFloat(volumeControl.value);
      soundManager.updateVolume();
    });
  }

  if (themeSelect) {
    themeSelect.addEventListener("change", () => {
      console.log("Theme changed to:", themeSelect.value);
      document.body.classList.remove("dark", "light", "neon", "space", "gradient");
      document.body.classList.add(themeSelect.value);
      localStorage.setItem("theme", themeSelect.value);
      localStorage.removeItem("customGradient");
      document.body.style.background = "";
      document.body.style.backgroundSize = "";
      document.body.style.animation = "";
      document.body.style.backgroundColor = "";
      loadParticles();
      updateStatsChart();
      console.log("After theme change, body styles:", {
        background: document.body.style.background,
        backgroundColor: document.body.style.backgroundColor,
        classList: document.body.classList.toString()
      });
    });
  }

  if (confettiTypeSelect) {
    confettiTypeSelect.addEventListener("change", () => {
      localStorage.setItem("confettiType", confettiTypeSelect.value);
    });
  }

  if (confettiAmountSelect) {
    confettiAmountSelect.addEventListener("change", () => {
      localStorage.setItem("confettiAmount", confettiAmountSelect.value);
    });
  }

  if (applyGradientBtn) {
    applyGradientBtn.addEventListener("click", () => {
      applyCustomGradient(gradientColor1.value, gradientColor2.value);
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  }

  if (resetGradientBtn) {
    resetGradientBtn.addEventListener("click", () => {
      const savedTheme = localStorage.getItem("theme") || "dark";
      document.body.classList.remove("dark", "light", "neon", "space", "gradient");
      document.body.classList.add(savedTheme);
      document.body.style.background = "";
      document.body.style.backgroundSize = "";
      document.body.style.animation = "";
      document.body.style.backgroundColor = "";
      localStorage.removeItem("customGradient");
      soundManager.play("click");
      vibrationManager.vibrate(50);
      console.log("Gradient reset, theme applied:", savedTheme);
      console.log("Current body styles:", {
        background: document.body.style.background,
        backgroundColor: document.body.style.backgroundColor,
        classList: document.body.classList.toString()
      });
    });
  }

  if (backToGameBtn) {
    backToGameBtn.addEventListener("click", () => {
      settingsMenu.classList.add("hidden");
      settingsMenu.style.display = "none";
      gameArea.classList.remove("hidden");
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  }

  if (backToGameFromStatsBtn) {
    backToGameFromStatsBtn.addEventListener("click", () => {
      console.log("Back to game from stats clicked");
      if (!statsMenu) {
        console.error("statsMenu element is missing");
        return;
      }
      statsMenu.classList.add("hidden");
      statsMenu.style.display = "none";
      gameArea.classList.remove("hidden");
      soundManager.play("click");
      vibrationManager.vibrate(50);
      console.log("Stats menu hidden, game area shown");
    });
  }

  if (backToGameFromAchievementsBtn) {
    backToGameFromAchievementsBtn.addEventListener("click", () => {
      achievementsMenu.classList.add("hidden");
      achievementsMenu.style.display = "none";
      gameArea.classList.remove("hidden");
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  }

  if (backToGameFromLeaderboardBtn) {
    backToGameFromLeaderboardBtn.addEventListener("click", () => {
      leaderboardMenu.classList.add("hidden");
      leaderboardMenu.style.display = "none";
      gameArea.classList.remove("hidden");
      soundManager.play("click");
      vibrationManager.vibrate(50);
    });
  }

  if (resetStatsBtn) resetStatsBtn.addEventListener("click", resetStats);

  if (sortStatsSelect) {
    sortStatsSelect.addEventListener("change", () => {
      console.log("Sort stats changed");
      displayDetailedStats();
    });
  }

  document.addEventListener("click", (event) => {
    if (gameActive && event.target !== guessInput && !guessInput.contains(event.target)) {
      guessInput.blur();
      console.log("Blurred guessInput due to click outside");
    }
  });

  document.addEventListener("touchstart", (event) => {
    resetIdleTimer();
    if (gameActive && event.target !== guessInput && !guessInput.contains(event.target)) {
      guessInput.blur();
      console.log("Blurred guessInput due to touch outside");
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