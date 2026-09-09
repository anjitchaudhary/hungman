
let game = null;
let animationLocked = false;
let reviewIndex = 0;
let fallTimer = null;
let splashTimer = null;

function createGame(subject) {
  const pool = window.QUESTION_BANKS[subject];
  const order = shuffledCopy(pool);
  return {
    subject,
    questions: order.slice(0, Math.min(50, order.length)),
    index: 0,
    lives: 10,
    highestLives: 10,
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
    score: 0,
    answered: [],
    finished: false,
    startedAt: Date.now()
  };
}

function resetHangingScene() {
  clearTimeout(fallTimer);
  clearTimeout(splashTimer);
  fallTimer = null;
  splashTimer = null;
  const scene = document.getElementById("hangingScene");
  const panel = scene?.closest(".hanging-panel");
  const hanger = document.getElementById("hanger");
  const rope = document.getElementById("rope");
  const splash = document.getElementById("splash");
  panel?.classList.remove("falling");
  splash?.classList.remove("active");
  if (hanger) {
    hanger.classList.remove("swing");
    hanger.style.animation = "none";
    hanger.style.transform = "none";
    hanger.style.top = "105px";
    void hanger.offsetWidth;
    hanger.style.animation = "";
    hanger.style.transform = "";
  }
  if (rope) {
    rope.style.height = "44px";
    rope.style.transform = "none";
  }
  const badge = document.getElementById("lifeBadge");
  const note = document.getElementById("positionNote");
  if (badge) badge.textContent = "10 / 10";
  if (note) note.textContent = "Top position";
}

function startGame(subject) {
  if (!window.QUESTION_BANKS[subject]) return;
  animationLocked = false;
  resetHangingScene();
  game = createGame(subject);
  store.lastSubject = subject;
  saveStore();
  document.getElementById("gameSubject").textContent = subject;
  document.getElementById("gameTitle").textContent = "Question";
  showView("game");
  renderGameQuestion();
}

function currentQuestion() {
  return game.questions[game.index];
}

function renderGameQuestion() {
  if (!game) return;
  const q = currentQuestion();
  const answer = game.answered[game.index];
  document.getElementById("questionCounter").textContent = `${game.index + 1} / ${game.questions.length}`;
  document.getElementById("correctCounter").textContent = game.correct;
  document.getElementById("wrongCounter").textContent = game.wrong;
  document.getElementById("accuracyCounter").textContent = accuracyOf(game.correct + game.wrong, game.correct);
  document.getElementById("livesCounter").textContent = `${game.lives} / 10`;
  document.getElementById("streakCounter").textContent = game.streak;
  document.getElementById("questionProgress").style.width = `${((game.index + 1) / game.questions.length) * 100}%`;
  document.getElementById("questionTopic").textContent = q.topic;
  document.getElementById("questionText").textContent = q.question;
  document.getElementById("feedback").className = "feedback";
  document.getElementById("feedback").innerHTML = "";
  const options = document.getElementById("options");
  options.innerHTML = "";
  q.options.forEach((option, i) => {
    const button = document.createElement("button");
    button.className = "option";
    button.type = "button";
    button.innerHTML = `<span class="letter">${String.fromCharCode(65 + i)}</span><span>${option}</span>`;
    button.addEventListener("click", () => submitAnswer(i));
    options.appendChild(button);
  });
  document.getElementById("previousButton").disabled = game.index === 0;
  document.getElementById("nextButton").disabled = !answer || animationLocked;
  document.getElementById("nextButton").textContent = game.index === game.questions.length - 1 ? "Finish" : "Next";
  if (answer) renderAnsweredState(answer);
  updateHangingScene(false);
}

function renderAnsweredState(answer) {
  const q = currentQuestion();
  const buttons = [...document.querySelectorAll(".option")];
  buttons.forEach((button, i) => {
    button.classList.add("locked");
    button.disabled = true;
    if (i === q.answer) button.classList.add("correct-reveal");
    if (i === answer.selected) button.classList.add(answer.correct ? "selected-correct" : "selected-wrong");
  });
  const feedback = document.getElementById("feedback");
  feedback.classList.add(answer.correct ? "correct" : "wrong");
  feedback.innerHTML = answer.correct
    ? `<strong>Correct! Excellent work.</strong>${q.explanation}`
    : `<strong>Not quite. Keep learning!</strong>Correct answer: ${q.options[q.answer]}<br>${q.explanation}`;
}

function submitAnswer(selected) {
  if (!game || animationLocked || game.answered[game.index] || game.finished) return;
  const q = currentQuestion();
  const correct = selected === q.answer;
  animationLocked = true;

  if (correct) {
    game.correct++;
    game.streak++;
    game.bestStreak = Math.max(game.bestStreak, game.streak);
    game.score += 10 + Math.min(game.streak, 10);
    game.lives = Math.min(10, game.lives + 1);
  } else {
    game.wrong++;
    game.streak = 0;
    game.score = Math.max(0, game.score - 2);
    game.lives = Math.max(0, game.lives - 1);
  }
  game.highestLives = Math.max(game.highestLives, game.lives);
  game.answered[game.index] = { selected, correct };
  saveSubjectProgress(game.subject, game.index + 1);
  recordAnswer(game.subject, correct, game.score, game.bestStreak);
  renderAnsweredState(game.answered[game.index]);
  updateHangingScene(true, correct);

  const delay = game.lives === 0 ? 1450 : 760;
  setTimeout(() => {
    animationLocked = false;
    if (game.lives === 0) {
      finishGame(false);
      return;
    }
    document.getElementById("nextButton").disabled = false;
  }, delay);
}

function updateHangingScene(animate, correct = false) {
  if (!game) return;
  const scene = document.getElementById("hangingScene");
  const hanger = document.getElementById("hanger");
  const rope = document.getElementById("rope");
  const badge = document.getElementById("lifeBadge");
  const note = document.getElementById("positionNote");
  const maxTop = 105;
  const step = 29;
  const top = maxTop + (10 - game.lives) * step;
  const ropeTop = 70;
  const ropeHeight = Math.max(44, top - ropeTop + 9);
  hanger.style.top = `${top}px`;
  rope.style.height = `${ropeHeight}px`;
  badge.textContent = `${game.lives} / 10`;
  note.textContent = game.lives === 10 ? "Top position" : `${10 - game.lives} step${10 - game.lives === 1 ? "" : "s"} down`;
  if (animate) {
    hanger.classList.remove("swing");
    void hanger.offsetWidth;
    hanger.classList.add("swing");
  }
  if (game.lives === 0) {
    clearTimeout(fallTimer);
    clearTimeout(splashTimer);
    const panel = scene.closest(".hanging-panel");
    panel.classList.add("falling");
    splashTimer = setTimeout(() => {
      document.getElementById("splash").classList.add("active");
      splashTimer = null;
    }, 850);
  }
}

function movePrevious() {
  if (!game || animationLocked || game.index === 0) return;
  game.index--;
  renderGameQuestion();
}

function moveNext() {
  if (!game || animationLocked || !game.answered[game.index]) return;
  if (game.index >= game.questions.length - 1) {
    finishGame(true);
    return;
  }
  game.index++;
  renderGameQuestion();
}

function finishGame(completed) {
  if (!game || game.finished) return;
  game.finished = true;
  recordGame(game.subject, completed, game.score);
  showResult(completed);
}

function showResult(completed) {
  document.getElementById("resultEyebrow").textContent = completed ? "SESSION COMPLETE" : "GAME OVER";
  document.getElementById("resultTitle").textContent = completed ? "SESSION COMPLETE" : "GAME OVER";
  document.getElementById("resultMessage").textContent = completed ? "You completed the 50-question session." : "You reached the river.";
  document.getElementById("resultStats").innerHTML = `
    <div class="result-stat"><span>Correct Answers</span><strong>${game.correct}</strong></div>
    <div class="result-stat"><span>Wrong Answers</span><strong>${game.wrong}</strong></div>
    <div class="result-stat"><span>Accuracy</span><strong>${accuracyOf(game.correct + game.wrong, game.correct)}</strong></div>
    <div class="result-stat"><span>Highest Lives</span><strong>${game.highestLives}</strong></div>
    <div class="result-stat"><span>Best Streak</span><strong>${game.bestStreak}</strong></div>
    <div class="result-stat"><span>Score</span><strong>${game.score}</strong></div>
    <div class="result-stat"><span>Questions Completed</span><strong>${game.answered.length}</strong></div>
    <div class="result-stat"><span>Subject</span><strong>${game.subject}</strong></div>
  `;
  showView("result");
}

function restartCurrentGame() {
  if (!game) return;
  startGame(game.subject);
}

function openReview() {
  if (!game) return;
  reviewIndex = 0;
  renderReview();
  showView("review");
}

function renderReview() {
  const q = game.questions[reviewIndex];
  const a = game.answered[reviewIndex];
  document.getElementById("reviewCounter").textContent = `Question ${reviewIndex + 1} / ${game.answered.length}`;
  document.getElementById("reviewTopic").textContent = q.topic;
  document.getElementById("reviewQuestion").textContent = q.question;
  const box = document.getElementById("reviewOptions");
  box.innerHTML = "";
  q.options.forEach((option, i) => {
    const div = document.createElement("div");
    div.className = "review-option";
    if (i === q.answer) div.classList.add("correct");
    if (i === a.selected && !a.correct) div.classList.add("wrong");
    div.textContent = `${String.fromCharCode(65 + i)}. ${option}${i === q.answer ? " — Correct answer" : i === a.selected ? " — Your answer" : ""}`;
    box.appendChild(div);
  });
  document.getElementById("reviewExplanation").innerHTML = `<strong>${a.correct ? "Correct" : "Wrong"}</strong><br>${q.explanation}`;
  document.getElementById("reviewPreviousButton").disabled = reviewIndex === 0;
  document.getElementById("reviewNextButton").textContent = reviewIndex === game.answered.length - 1 ? "Back to Results" : "Next";
}
