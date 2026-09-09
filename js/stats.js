
function accuracyOf(attempted, correct) {
  return attempted ? ((correct / attempted) * 100).toFixed(1) + "%" : "0%";
}

function renderStats() {
  const o = store.overall;
  document.getElementById("overallStats").innerHTML = `
    <div class="stat-box"><span>Total attempted</span><strong>${o.attempted.toLocaleString()}</strong></div>
    <div class="stat-box"><span>Total correct</span><strong>${o.correct.toLocaleString()}</strong></div>
    <div class="stat-box"><span>Total wrong</span><strong>${o.wrong.toLocaleString()}</strong></div>
    <div class="stat-box"><span>Overall accuracy</span><strong>${accuracyOf(o.attempted, o.correct)}</strong></div>
    <div class="stat-box"><span>Total games</span><strong>${o.totalGames.toLocaleString()}</strong></div>
    <div class="stat-box"><span>Games completed</span><strong>${o.completedGames.toLocaleString()}</strong></div>
    <div class="stat-box"><span>Games lost</span><strong>${o.lostGames.toLocaleString()}</strong></div>
    <div class="stat-box"><span>Highest score</span><strong>${o.highestScore.toLocaleString()}</strong></div>
  `;

  const grid = document.getElementById("subjectStats");
  grid.innerHTML = "";
  Object.keys(window.QUESTION_BANKS).forEach(subject => {
    const s = store.subjects[subject] || emptySubjectStats();
    const progress = Math.min(100, ((store.progress[subject] || 0) / getSubjectQuestionCount(subject)) * 100);
    const card = document.createElement("article");
    card.className = "subject-stat";
    card.innerHTML = `
      <h3>${subject}</h3>
      <div class="subject-stat-grid">
        <div><span>Attempted</span><strong>${s.attempted}</strong></div>
        <div><span>Correct</span><strong>${s.correct}</strong></div>
        <div><span>Wrong</span><strong>${s.wrong}</strong></div>
        <div><span>Accuracy</span><strong>${accuracyOf(s.attempted, s.correct)}</strong></div>
        <div><span>Best score</span><strong>${s.bestScore}</strong></div>
        <div><span>Best streak</span><strong>${s.bestStreak}</strong></div>
      </div>
      <div class="stat-progress"><span style="width:${progress}%"></span></div>
      <p>${Math.round(progress)}% of this local question bank reached</p>
    `;
    grid.appendChild(card);
  });
}
