
document.addEventListener("DOMContentLoaded", () => {
  try {
    validateAllBanks();
  } catch (error) {
    document.body.innerHTML = `<main><section class="result-card"><h2>Questions could not be loaded.</h2><p>${error.message}</p><button class="primary-button" onclick="location.reload()">Try Again</button></section></main>`;
    return;
  }

  renderSubjectCards();

  const goHome = () => {
    animationLocked = false;
    renderSubjectCards();
    showView("home");
  };
  document.getElementById("homeButton").addEventListener("click", goHome);
  document.getElementById("globalHomeButton").addEventListener("click", goHome);
  document.getElementById("statsButton").addEventListener("click", () => { renderStats(); showView("stats"); });
  document.getElementById("resultStatsButton").addEventListener("click", () => { renderStats(); showView("stats"); });
  document.getElementById("howButton").addEventListener("click", () => showInfo("how"));
  document.getElementById("aboutButton").addEventListener("click", () => showInfo("about"));
  document.getElementById("infoHomeButton").addEventListener("click", () => showView("home"));
  document.getElementById("statsHomeButton").addEventListener("click", () => showView("home"));
  document.getElementById("quitGameButton").addEventListener("click", goHome);
  document.getElementById("previousButton").addEventListener("click", movePrevious);
  document.getElementById("nextButton").addEventListener("click", moveNext);
  document.getElementById("reviewButton").addEventListener("click", openReview);
  document.getElementById("playAgainButton").addEventListener("click", restartCurrentGame);
  document.getElementById("chooseSubjectButton").addEventListener("click", () => { renderSubjectCards(); showView("home"); });
  document.getElementById("resultHomeButton").addEventListener("click", () => showView("home"));
  document.getElementById("backResultsButton").addEventListener("click", () => showView("result"));
  document.getElementById("reviewPreviousButton").addEventListener("click", () => { if (reviewIndex > 0) { reviewIndex--; renderReview(); } });
  document.getElementById("reviewNextButton").addEventListener("click", () => {
    if (reviewIndex < game.answered.length - 1) { reviewIndex++; renderReview(); }
    else showView("result");
  });

  const reset = () => {
    if (confirm("Are you sure you want to reset all progress?")) {
      resetStore();
      renderSubjectCards();
      renderStats();
      showToast("All local progress was reset.");
    }
  };
  document.getElementById("resetButton").addEventListener("click", reset);
  document.getElementById("statsResetButton").addEventListener("click", reset);

  window.addEventListener("keydown", event => {
    if (!views.game.classList.contains("active") || animationLocked) return;
    if (event.key === "ArrowLeft") movePrevious();
    if (event.key === "ArrowRight" || event.key === "Enter") moveNext();
  });
});
