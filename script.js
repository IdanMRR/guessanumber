// מחלקה לניהול סאונדים
class SoundManager {
  constructor() {
    this.sounds = {};
    this.isLoaded = {};
    this.isMuted = false;
    this.volume = parseFloat(localStorage.getItem("volume")) || 1;
  }

  loadSound(name, path) {
    const audio = new Audio(path);
    audio.volume = this.volume;
    this.isLoaded[name] = false;
    audio.onerror = () => {
      console.error(`Failed to load sound: ${name} at ${path}`);
      this.isLoaded[name] = false;
      const message = document.getElementById("message");
      if (message) {
        message.innerHTML = `⚠️ שגיאה: לא ניתן לטעון את קובץ השמע ${name}. ודא שהקובץ קיים בנתיב ${path}.`;
      }
    };
    audio.oncanplaythrough = () => {
      console.log(`Sound ${name} loaded successfully`);
      this.isLoaded[name] = true;
    };
    this.sounds[name] = audio;
  }

  playSound(name) {
    if (this.isMuted || !this.sounds[name]) return;
    if (!this.isLoaded[name]) {
      console.warn(`Sound ${name} is not loaded yet.`);
      return;
    }
    const sound = this.sounds[name];
    sound.currentTime = 0;
    sound.play().catch((error) => {
      console.warn(`Failed to play sound ${name}:`, error);
    });
  }

  setVolume(value) {
    this.volume = value;
    localStorage.setItem("volume", value);
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = value;
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

// מחלקה לניהול ויברציה
class VibrationManager {
  constructor() {
    this.isSupported = !!navigator.vibrate;
    this.isEnabled = true;
  }

  vibrate(pattern) {
    if (!this.isSupported) {
      console.warn("Vibration API is not supported on this device.");
      return false;
    }
    if (!this.isEnabled) return false;

    try {
      navigator.vibrate(pattern);
      return true;
    } catch (error) {
      console.error("Failed to vibrate:", error);
      return false;
    }
  }

  toggleVibration() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let randomNumber;
  let lives = 5;
  let range = 10;
  let startTime;
  let timerInterval;
  let idleTimeout;
  let idleCountdown = 30;
  let idleCountdownInterval;
  let bestScore = parseInt(localStorage.getItem("bestScore")) || 0; // מספר הניצחונות הכולל
  let guessCount = 0;
  let gameTime = 0;
  let totalGames = parseInt(localStorage.getItem("totalGames")) || 0;

  let playerStats = JSON.parse(localStorage.getItem("playerStats")) || [];

  // הגדרת האלמנטים
  const input = document.getElementById("guessInput");
  const guessButton = document.getElementById("guessButton");
  const hintButton = document.getElementById("hintButton");
  const message = document.getElementById("message");
  const timerDisplay = document.getElementById("timer");
  const highscoreDisplay = document.getElementById("highscore");
  const difficulty = document.getElementById("difficulty");
  const startGameButton = document.getElementById("startGameBtn");
  const stopGameButton = document.getElementById("stopGameBtn");
  const settingsButton = document.getElementById("settingsBtn");
  const statsButton = document.getElementById("statsBtn");
  const viewStatsButton = document.getElementById("viewStatsBtn");

  // אלמנטים בתפריט הסטטיסטיקות
  const detailedStatsList = document.getElementById("detailedStatsList");
  const averageTimeDisplay = document.getElementById("averageTime");
  const successRateDisplay = document.getElementById("successRate");

  // בדיקה של האלמנטים (בלי לעצור את הקוד)
  const missingElements = [];
  if (!input) missingElements.push("guessInput");
  if (!guessButton) missingElements.push("guessButton");
  if (!hintButton) missingElements.push("hintButton");
  if (!message) missingElements.push("message");
  if (!timerDisplay) missingElements.push("timer");
  if (!highscoreDisplay) missingElements.push("highscore");
  if (!difficulty) missingElements.push("difficulty");
  if (!startGameButton) missingElements.push("startGameBtn");
  if (!stopGameButton) missingElements.push("stopGameBtn");
  if (!settingsButton) missingElements.push("settingsBtn");
  if (!statsButton) missingElements.push("statsBtn");
  if (!viewStatsButton) missingElements.push("viewStatsBtn");
  if (!detailedStatsList) missingElements.push("detailedStatsList");
  if (!averageTimeDisplay) missingElements.push("averageTime");
  if (!successRateDisplay) missingElements.push("successRate");

  if (missingElements.length > 0) {
    console.warn(`האלמנטים הבאים לא נמצאו ב-DOM: ${missingElements.join(", ")}. חלק מהפונקציונליות עלול לא לעבוד.`);
  }

  if (!navigator.onLine) {
    message.innerHTML = "⚠️ אין חיבור לאינטרנט. אנא התחבר וטען מחדש.";
  }

  input.disabled = true;
  guessButton.disabled = true;
  hintButton.disabled = true;

  let livesDisplay = document.getElementById("livesDisplay");
  if (!livesDisplay) {
    livesDisplay = createLivesDisplay();
  }

  const soundManager = new SoundManager();
  soundManager.loadSound("win", "sounds/win.mp3");
  soundManager.loadSound("lose", "sounds/lose.mp3");
  soundManager.loadSound("click", "sounds/click.mp3");
  soundManager.loadSound("hint", "sounds/hint.mp3");
  soundManager.loadSound("start", "sounds/start.mp3");

  const vibrationManager = new VibrationManager();

  const idleTimerDisplay = document.getElementById("idleTimer");

  highscoreDisplay.textContent = `🏆 שיא אישי: ${bestScore === 0 ? "--" : bestScore}`; // עדכון התצוגה עם מספר הניצחונות

  const gameArea = document.getElementById("gameArea");
  const settingsMenu = document.getElementById("settingsMenu");
  const statsMenu = document.getElementById("statsMenu");
  gameArea.classList.remove("hidden");
  settingsMenu.classList.add("hidden");
  statsMenu.classList.add("hidden");

  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.className = savedTheme;
  const themeSelect = document.getElementById("themeSelect");
  themeSelect.value = savedTheme;

  const savedConfettiType = localStorage.getItem("confettiType") || "default";
  const confettiTypeSelect = document.getElementById("confettiType");
  confettiTypeSelect.value = savedConfettiType;

  const savedConfettiAmount = localStorage.getItem("confettiAmount") || "medium";
  const confettiAmountSelect = document.getElementById("confettiAmount");
  confettiAmountSelect.value = savedConfettiAmount;

  if (typeof Chart === "undefined") {
    console.error("Chart.js לא נטען כראוי. ודא שהסקריפט נטען ב-HTML.");
    statsMenu.innerHTML = "<p>שגיאה: לא ניתן להציג את הסטטיסטיקות. אנא טען את הדף מחדש.</p>";
    return;
  }

  setTimeout(() => {
    displayDetailedStats();
  }, 100);

  // הגדרת מאזיני אירועים לכפתורים
  guessButton.addEventListener("click", () => {
    playClick();
    checkGuess();
  });

  hintButton.addEventListener("click", () => {
    playHintSound();
    giveHint();
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !guessButton.disabled) {
      playClick();
      checkGuess();
    }
  });

  startGameButton.addEventListener("click", startGame);

  stopGameButton.addEventListener("click", () => {
    totalGames++;
    localStorage.setItem("totalGames", totalGames.toString());
    message.innerHTML = "⏹ המשחק נעצר.";
    input.disabled = true;
    guessButton.disabled = true;
    hintButton.disabled = true;
    difficulty.disabled = false;

    clearInterval(timerInterval);
    clearTimeout(idleTimeout);
    clearInterval(idleCountdownInterval);

    timerDisplay.textContent = "";
    idleTimerDisplay.textContent = "";
    
    stopGameButton.style.display = "none";
    startGameButton.style.display = "inline-block";
    document.getElementById("inputContainer").classList.add("hidden");
  });

  settingsButton.addEventListener("click", () => {
    gameArea.classList.add("hidden");
    settingsMenu.classList.remove("hidden");
    statsMenu.classList.add("hidden");
  });

  statsButton.addEventListener("click", () => {
    gameArea.classList.add("hidden");
    settingsMenu.classList.add("hidden");
    statsMenu.classList.remove("hidden");
    displayDetailedStats();
  });

  viewStatsButton.addEventListener("click", () => {
    gameArea.classList.add("hidden");
    settingsMenu.classList.add("hidden");
    statsMenu.classList.remove("hidden");
    displayDetailedStats();
  });

  document.getElementById("resetStatsBtn").addEventListener("click", () => {
    bestScore = 0; // איפוס מספר הניצחונות
    totalGames = 0;
    playerStats = [];
    localStorage.setItem("bestScore", bestScore.toString());
    localStorage.setItem("totalGames", totalGames.toString());
    localStorage.setItem("playerStats", JSON.stringify(playerStats));
    highscoreDisplay.textContent = `🏆 שיא אישי: ${bestScore === 0 ? "--" : bestScore}`;
    displayDetailedStats();
  });

  document.getElementById("muteBtn").addEventListener("click", () => {
    const isMuted = soundManager.toggleMute();
    document.getElementById("muteBtn").textContent = isMuted ? "🔇 בטל השתקה" : "🔊 השתק סאונד";
  });

  document.getElementById("vibrationBtn").addEventListener("click", () => {
    const isEnabled = vibrationManager.toggleVibration();
    document.getElementById("vibrationBtn").textContent = isEnabled ? "📳 כבה ויברציה" : "📳 הפעל ויברציה";
  });

  document.getElementById("volumeControl").addEventListener("input", function (e) {
    const volume = parseFloat(e.target.value);
    soundManager.setVolume(volume);
  });

  document.getElementById("backToGame").addEventListener("click", () => {
    gameArea.classList.remove("hidden");
    settingsMenu.classList.add("hidden");
    statsMenu.classList.add("hidden");
  });

  document.getElementById("backToGameFromStats").addEventListener("click", () => {
    gameArea.classList.remove("hidden");
    settingsMenu.classList.add("hidden");
    statsMenu.classList.add("hidden");
  });

  function createLivesDisplay() {
    const el = document.createElement("div");
    el.id = "livesDisplay";
    el.classList.add("lives-display");
    const highscore = document.getElementById("highscore");
    if (highscore) {
      highscore.insertAdjacentElement("afterend", el);
    } else {
      console.error("Element with id 'highscore' not found.");
      const gameArea = document.getElementById("gameArea");
      if (gameArea) {
        gameArea.appendChild(el);
      }
    }
    return el;
  }

  function updateLivesDisplay() {
    livesDisplay.innerHTML = "";
    for (let i = 0; i < lives; i++) {
      const heart = document.createElement("span");
      heart.textContent = "❤️";
      heart.classList.add("heart");
      livesDisplay.appendChild(heart);
    }
  }

  function animateHeartLoss() {
    const hearts = document.querySelectorAll(".heart");
    if (hearts.length > 0) {
      const lastHeart = hearts[hearts.length - 1];
      lastHeart.classList.add("pulse-out");
      setTimeout(() => lastHeart.remove(), 300);
    }
  }

  function playClick() {
    try {
      soundManager.playSound("click");
      vibrationManager.vibrate(30);
      guessButton.classList.add("shake");
      setTimeout(() => guessButton.classList.remove("shake"), 300);
    } catch (e) {
      console.warn("Click effect failed:", e);
    }
  }

  function playHintSound() {
    try {
      soundManager.playSound("hint");
      vibrationManager.vibrate([50, 50, 50]);
      hintButton.classList.add("shake");
      setTimeout(() => hintButton.classList.remove("shake"), 300);
    } catch (e) {
      console.warn("Hint sound effect failed:", e);
    }
  }

  function startGame() {
    totalGames++;
    localStorage.setItem("totalGames", totalGames.toString());
    highscoreDisplay.textContent = `🏆 שיא אישי: ${bestScore === 0 ? "--" : bestScore}`;

    startGameButton.style.display = "none";
    stopGameButton.style.display = "inline-block";
    document.getElementById("inputContainer").classList.remove("hidden");
    difficulty.disabled = true;
    range = parseInt(difficulty.value);
    randomNumber = Math.floor(Math.random() * range) + 1;
    lives = 5;
    guessCount = 0;
    gameTime = 0;
    input.disabled = false;
    input.value = "";
    guessButton.disabled = false;
    hintButton.disabled = false;
    message.innerHTML = "";
    message.className = "";
    resetIdleTimer();
    startTimer();
    updateLivesDisplay();
    soundManager.playSound("start");
    console.log("(למפתח) המספר הוא:", randomNumber);
  }

  function checkGuess() {
    resetIdleTimer();
    const guess = parseInt(input.value);

    if (isNaN(guess)) {
      message.innerHTML = "❌ זה לא מספר תקני. נסה שוב.";
      return;
    }

    guessCount++;
    console.log(`ניחוש מספר ${guessCount}, זמן: ${gameTime} שניות`);

    if (guess === randomNumber) {
      message.innerHTML = `🎉 הצלחת!`;
      message.classList.add("success");
      soundManager.playSound("win");
      vibrationManager.vibrate([100, 50, 100, 50, 100]);
      showConfetti();
      const gameArea = document.getElementById("gameArea");
      gameArea.style.animation = "";
      setTimeout(() => {
        gameArea.style.animation = "blink 0.5s 3";
      }, 10);
      stopTimer();
      saveBestScore();
      disableGame();
      difficulty.disabled = false;
    } else {
      animateHeartLoss();
      lives--;
      if (lives <= 0) {
        message.innerHTML = `😢 הפסדת! המספר היה ${randomNumber}`;
        message.classList.add("fail");
        soundManager.playSound("lose");
        vibrationManager.vibrate([200, 100, 200]);
        stopTimer();
        playerStats.push({
          win: false,
          time: gameTime,
          guesses: guessCount,
          difficulty: range,
          date: new Date().toLocaleString(),
        });
        localStorage.setItem("playerStats", JSON.stringify(playerStats));
        disableGame();
        difficulty.disabled = false;
      } else {
        let encouragement = "";
        const difference = Math.abs(guess - randomNumber);
        if (difference <= 5) {
          encouragement = "🔥 אתה ממש קרוב! תמשיך ככה!";
          vibrationManager.vibrate(50);
        } else if (difference <= 10) {
          encouragement = "👍 אתה מתקרב! נסה שוב.";
        } else {
          encouragement = "💪 אל תוותר! נסה שוב.";
        }
        if (lives === 1) {
          encouragement += " ⚠️ זה החיים האחרונים שלך, תיזהר!";
          vibrationManager.vibrate([50, 50]);
        }
        message.innerHTML = (guess < randomNumber ? "🔽 קטן מדי. " : "🔼 גדול מדי. ") + encouragement;
      }
    }

    input.value = "";
  }

  function giveHint() {
    resetIdleTimer();
    if (lives <= 1) {
      message.innerHTML = "⚠️ אין מספיק חיים לרמז!";
      return;
    }
    lives--;
    animateHeartLoss();
    const hintRange = Math.floor(range / 10);
    const lowerBound = Math.max(1, randomNumber - hintRange);
    const upperBound = Math.min(range, randomNumber + hintRange);
    message.innerHTML = `💡 הרמז שלך: המספר נמצא בין ${lowerBound} ל-${upperBound}`;
  }

  function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
      gameTime = Math.floor((Date.now() - startTime) / 1000);
      timerDisplay.textContent = `⏱️ זמן: ${gameTime} שניות`;
      console.log(`זמן נוכחי: ${gameTime} שניות`);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    clearTimeout(idleTimeout);
    clearInterval(idleCountdownInterval);
    gameTime = Math.floor((Date.now() - startTime) / 1000);
    console.log(`זמן סופי: ${gameTime} שניות`);
  }

  function resetIdleTimer() {
    clearTimeout(idleTimeout);
    clearInterval(idleCountdownInterval);
    idleCountdown = 30;
    idleTimerDisplay.textContent = `⏳ זמן חוסר פעילות: ${idleCountdown} שניות`;
    idleCountdownInterval = setInterval(() => {
      idleCountdown--;
      idleTimerDisplay.textContent = `⏳ זמן חוסר פעילות: ${idleCountdown} שניות`;
      if (idleCountdown <= 0) {
        clearInterval(idleCountdownInterval);
        message.innerHTML = "⏰ זמן חוסר הפעילות תם! המשחק נעצר.";
        stopTimer();
        disableGame();
        difficulty.disabled = false;
        stopGameButton.style.display = "none";
        startGameButton.style.display = "inline-block";
        document.getElementById("inputContainer").classList.add("hidden");
      }
    }, 1000);
    idleTimeout = setTimeout(() => {
      clearInterval(idleCountdownInterval);
    }, 30000);
  }

  function saveBestScore() {
    bestScore++; // הגדלת מספר הניצחונות ב-1
    console.log(`ניצחון חדש! מספר הניצחונות הכולל: ${bestScore}`);
    localStorage.setItem("bestScore", bestScore.toString());
    highscoreDisplay.textContent = `🏆 שיא אישי: ${bestScore === 0 ? "--" : bestScore}`;
    playerStats.push({
      win: true,
      time: gameTime,
      guesses: guessCount,
      difficulty: range,
      date: new Date().toLocaleString(),
    });
    localStorage.setItem("playerStats", JSON.stringify(playerStats));
  }

  function disableGame() {
    input.disabled = true;
    guessButton.disabled = true;
    const restartBtn = document.createElement("button");
    restartBtn.textContent = "🔁 שחק שוב";
    restartBtn.classList.add("restartBtn");
    restartBtn.addEventListener("click", startGame);
    message.appendChild(document.createElement("br"));
    message.appendChild(restartBtn);
  }

  function showConfetti() {
    const confettiType = confettiTypeSelect.value;
    const confettiAmount = confettiAmountSelect.value;
    if (confettiType === "none") return;

    let particleCount;
    switch (confettiAmount) {
      case "light":
        particleCount = 100;
        break;
      case "medium":
        particleCount = 300;
        break;
      case "heavy":
        particleCount = 500;
        break;
      default:
        particleCount = 300;
    }

    if (confettiType === "stars") {
      confetti({
        particleCount: particleCount,
        spread: 70,
        origin: { y: 0.6 },
        shapes: ["star"],
        colors: ["#FFD700", "#FF4500", "#1E90FF"],
      });
    } else if (confettiType === "hearts") {
      confetti({
        particleCount: particleCount,
        spread: 70,
        origin: { y: 0.6 },
        shapes: ["heart"],
        colors: ["#FF69B4", "#FF1493", "#C71585"],
      });
    } else {
      confetti({
        particleCount: particleCount,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }

  function displayDetailedStats() {
    detailedStatsList.innerHTML = "";
    const sortedStats = [...playerStats].sort((a, b) => {
      const sortBy = document.getElementById("sortStats").value;
      if (sortBy === "time") return a.time - b.time;
      if (sortBy === "guesses") return a.guesses - b.guesses;
      if (sortBy === "difficulty") return a.difficulty - b.difficulty;
      return new Date(b.date) - new Date(a.date);
    });

    sortedStats.forEach((stat, index) => {
      if (stat.win) {
        const li = document.createElement("li");
        li.textContent = `ניצחון ${index + 1}: זמן - ${stat.time} שניות, ניחושים - ${stat.guesses}, רמת קושי - ${stat.difficulty}, תאריך - ${stat.date}`;
        detailedStatsList.appendChild(li);
      }
    });

    const totalWins = playerStats.filter((stat) => stat.win).length;
    const averageTime = totalWins
      ? (playerStats.filter((stat) => stat.win).reduce((sum, stat) => sum + stat.time, 0) / totalWins).toFixed(0)
      : 0;
    const successRate = totalGames ? ((totalWins / totalGames) * 100).toFixed(2) : 0;

    averageTimeDisplay.textContent = `⏱️ זמן ממוצע לניצחון: ${averageTime} שניות`;
    successRateDisplay.textContent = `🏆 אחוזי הצלחה: ${successRate}%`;

    const winsByDifficulty = {
      10: 0,
      50: 0,
      100: 0,
    };

    playerStats.forEach((stat) => {
      if (stat.win) {
        winsByDifficulty[stat.difficulty]++;
      }
    });

    const ctx = document.getElementById("statsChart").getContext("2d");
    if (window.myChart) {
      window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["קל (1-10)", "בינוני (1-50)", "קשה (1-100)"],
        datasets: [
          {
            label: "ניצחונות",
            data: [winsByDifficulty[10], winsByDifficulty[50], winsByDifficulty[100]],
            backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
            borderColor: ["#388E3C", "#FFA000", "#D32F2F"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  }

  document.getElementById("themeSelect").addEventListener("change", (e) => {
    document.body.className = e.target.value;
    localStorage.setItem("theme", e.target.value);
  });

  document.getElementById("confettiType").addEventListener("change", (e) => {
    localStorage.setItem("confettiType", e.target.value);
  });

  document.getElementById("confettiAmount").addEventListener("change", (e) => {
    localStorage.setItem("confettiAmount", e.target.value);
  });

  document.getElementById("sortStats").addEventListener("change", displayDetailedStats);

  document.querySelectorAll(".color-swatch").forEach((swatch) => {
    swatch.addEventListener("click", (e) => {
      const color = e.target.dataset.color || e.target.value;
      document.body.style.backgroundColor = color;
      localStorage.setItem("backgroundColor", color);
    });
  });

  const savedColor = localStorage.getItem("backgroundColor");
  if (savedColor) {
    document.body.style.backgroundColor = savedColor;
    document.getElementById("customColor").value = savedColor;
  }
});