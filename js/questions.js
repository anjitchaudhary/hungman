
function validateQuestionBank(bank, subject) {
  if (!Array.isArray(bank)) throw new Error("Question bank is not an array: " + subject);
  const ids = new Set();
  for (const q of bank) {
    if (!q.id || ids.has(q.id)) throw new Error("Duplicate or missing question ID in " + subject);
    if (q.subject !== subject || !q.topic || !q.question || !Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error("Invalid question structure in " + subject);
    }
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3 || !q.explanation) {
      throw new Error("Invalid answer data in " + subject);
    }
    ids.add(q.id);
  }
  return true;
}

function validateAllBanks() {
  const names = Object.keys(window.QUESTION_BANKS || {});
  if (names.length !== 7) throw new Error("Seven subject banks are required.");
  names.forEach(name => validateQuestionBank(window.QUESTION_BANKS[name], name));
  return names;
}

function shuffledCopy(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getSubjectQuestionCount(subject) {
  return window.QUESTION_BANKS[subject].length;
}
