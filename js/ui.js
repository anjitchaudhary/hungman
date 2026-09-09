
const views = {
  home: document.getElementById("homeView"),
  game: document.getElementById("gameView"),
  result: document.getElementById("resultView"),
  review: document.getElementById("reviewView"),
  stats: document.getElementById("statsView"),
  info: document.getElementById("infoView")
};

function showView(name) {
  Object.values(views).forEach(view => view.classList.remove("active"));
  views[name].classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderSubjectCards() {
  const grid = document.getElementById("subjectGrid");
  grid.innerHTML = "";
  Object.keys(window.QUESTION_BANKS).forEach(subject => {
    const progress = store.progress[subject] || 0;
    const total = getSubjectQuestionCount(subject);
    const percent = Math.min(100, (progress / total) * 100);
    const card = document.createElement("article");
    card.className = "subject-card";
    card.innerHTML = `
      <h3>${subject}</h3>
      <p>${total.toLocaleString()} offline practice questions</p>
      <p>${progress.toLocaleString()} questions reached in progress</p>
      <div class="subject-progress" aria-label="${Math.round(percent)} percent progress"><span style="width:${percent}%"></span></div>
      <button class="primary-button">Start 50 Questions</button>
    `;
    card.querySelector("button").addEventListener("click", () => startGame(subject));
    grid.appendChild(card);
  });
}

function showInfo(type) {
  const title = document.getElementById("infoTitle");
  const eyebrow = document.getElementById("infoEyebrow");
  const content = document.getElementById("infoContent");
  if (type === "how") {
    eyebrow.textContent = "GUIDE";
    title.textContent = "How to Play";
    content.innerHTML = `
      <h3>1. Start at 10 lives</h3>
      <p>The player begins at the top. The hanging position represents the current survival life.</p>
      <h3>2. Answer one question</h3>
      <p>There are four choices. Once an answer is submitted, it cannot be changed.</p>
      <h3>3. Correct answers move up</h3>
      <p>A correct answer adds one life, up to a maximum of 10, and the player smoothly moves one step upward.</p>
      <h3>4. Wrong answers move down</h3>
      <p>A wrong answer removes one life and the player smoothly moves one step downward. The correct answer and explanation are shown.</p>
      <h3>5. Reach zero and fall</h3>
      <p>At zero lives, the player reaches the final position, the rope releases, and a short falling and splash sequence ends the game.</p>
      <h3>6. Review without changing the score</h3>
      <p>Use Review Questions after a session. Review mode never changes lives, score, streaks, or statistics.</p>
    `;
  } else {
    eyebrow.textContent = "ABOUT";
    title.textContent = "About HUNGMAN";
    content.innerHTML = `
      <h3>Class 12 NEB MCQ Learning Game</h3>
      <p>HUNGMAN is a student-friendly offline practice game for seven Class 12 subject areas.</p>
      <h3>Offline by design</h3>
      <p>Question banks, interface code, animation, and progress storage are local. No login, server, CDN, remote font, or online API is required.</p>
      <h3>Question source</h3>
      <p>The included bank is generated board-style practice material based on common Class 12 learning concepts. It is not presented as official NEB past-question material.</p>
      <h3>Developer</h3>
      <p>Developed by <strong>Alisha Chaudhary</strong>.</p>
      <h3>Data</h3>
      <p>Progress and statistics are stored in the browser on the device. Reset Progress permanently clears those local statistics and progress.</p>
    `;
  }
  showView("info");
}
