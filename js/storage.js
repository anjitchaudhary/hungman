
const STORAGE_KEY = "hungman_class12_v1";

function emptySubjectStats() {
  return {
    attempted: 0,
    correct: 0,
    wrong: 0,
    bestScore: 0,
    bestStreak: 0,
    games: 0,
    completed: 0,
    lost: 0
  };
}

function defaultStore() {
  const subjects = {};
  Object.keys(window.QUESTION_BANKS || {}).forEach(name => subjects[name] = emptySubjectStats());
  return {
    version: 1,
    overall: {
      attempted: 0,
      correct: 0,
      wrong: 0,
      totalGames: 0,
      completedGames: 0,
      lostGames: 0,
      highestScore: 0,
      bestStreak: 0
    },
    subjects,
    progress: {},
    lastSubject: "",
    settings: { sessionSize: 50 }
  };
}

function loadStore() {
  const base = defaultStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    return {
      ...base,
      ...saved,
      overall: { ...base.overall, ...(saved.overall || {}) },
      subjects: { ...base.subjects, ...(saved.subjects || {}) },
      progress: saved.progress || {},
      settings: { ...base.settings, ...(saved.settings || {}) }
    };
  } catch {
    return base;
  }
}

let store = loadStore();

function saveStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function recordAnswer(subject, correct, score, streak) {
  const s = store.subjects[subject] || emptySubjectStats();
  s.attempted += 1;
  s.correct += correct ? 1 : 0;
  s.wrong += correct ? 0 : 1;
  s.bestScore = Math.max(s.bestScore, score);
  s.bestStreak = Math.max(s.bestStreak, streak);
  store.subjects[subject] = s;

  store.overall.attempted += 1;
  store.overall.correct += correct ? 1 : 0;
  store.overall.wrong += correct ? 0 : 1;
  store.overall.highestScore = Math.max(store.overall.highestScore, score);
  store.overall.bestStreak = Math.max(store.overall.bestStreak, streak);
  saveStore();
}

function recordGame(subject, completed, score) {
  const s = store.subjects[subject] || emptySubjectStats();
  s.games += 1;
  completed ? s.completed++ : s.lost++;
  s.bestScore = Math.max(s.bestScore, score);
  store.subjects[subject] = s;
  store.overall.totalGames += 1;
  completed ? store.overall.completedGames++ : store.overall.lostGames++;
  store.overall.highestScore = Math.max(store.overall.highestScore, score);
  saveStore();
}

function saveSubjectProgress(subject, answered) {
  store.progress[subject] = Math.max(store.progress[subject] || 0, answered);
  store.lastSubject = subject;
  saveStore();
}

function resetStore() {
  store = defaultStore();
  saveStore();
}
