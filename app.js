/*
 * Banana Brain Challenge - Gameplay Prototype
 * Version: 1.0.0
 * API: https://marcconrad.com/uob/banana/api.php
 *
 * Note: This prototype uses guest mode. Account registration, database-backed
 * profiles, persistent leaderboard, and a timer are not included in this version.
 */

const API_URL = "https://marcconrad.com/uob/banana/api.php";
const TOTAL_ROUNDS = 5;
const POINTS_PER_CORRECT_ANSWER = 10;

const elements = {
  roundNumber: document.getElementById("round-number"),
  progressFill: document.getElementById("progress-fill"),
  puzzleHeading: document.getElementById("puzzle-heading"),
  loadingState: document.getElementById("loading-state"),
  puzzleImage: document.getElementById("puzzle-image"),
  imageFallback: document.getElementById("image-fallback"),
  answerForm: document.getElementById("answer-form"),
  answerInput: document.getElementById("answer-input"),
  submitButton: document.getElementById("submit-button"),
  feedback: document.getElementById("feedback"),
  scoreValue: document.getElementById("score-value"),
  correctValue: document.getElementById("correct-value"),
  nextButton: document.getElementById("next-button"),
  gameCard: document.querySelector(".game-card"),
  gameLayout: document.querySelector(".game-layout"),
  resultsPanel: document.getElementById("results-panel"),
  finalScore: document.getElementById("final-score"),
  finalCorrect: document.getElementById("final-correct"),
  restartButton: document.getElementById("restart-button")
};

let currentRound = 0;
let score = 0;
let correctAnswers = 0;
let currentSolution = null;
let answerSubmitted = false;

function setFeedback(message, type = "") {
  elements.feedback.textContent = message;
  elements.feedback.className = `feedback ${type}`.trim();
}

function updateStats() {
  elements.scoreValue.innerHTML = `${score} <small>pts</small>`;
  elements.correctValue.innerHTML = `${correctAnswers} <small>/ ${TOTAL_ROUNDS}</small>`;
}

function setLoading(isLoading) {
  elements.loadingState.hidden = !isLoading;
  elements.puzzleImage.hidden = true;
  elements.imageFallback.hidden = true;
  elements.submitButton.disabled = isLoading;
  elements.submitButton.textContent = isLoading ? "Loading…" : "Submit answer ↗";
}

async function loadPuzzle() {
  answerSubmitted = false;
  currentSolution = null;
  elements.answerInput.value = "";
  elements.answerInput.disabled = true;
  elements.nextButton.hidden = true;
  elements.puzzleHeading.textContent = "A fresh puzzle is waiting";
  elements.roundNumber.textContent = String(currentRound + 1).padStart(2, "0");
  elements.progressFill.style.width = `${(currentRound / TOTAL_ROUNDS) * 100}%`;
  setFeedback("");
  setLoading(true);

  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`API request failed (${response.status})`);

    const puzzleData = await response.json();
    if (!puzzleData.question || puzzleData.solution === undefined) {
      throw new Error("The API response did not contain the expected puzzle data.");
    }

    currentSolution = Number(puzzleData.solution);
    if (!Number.isFinite(currentSolution)) throw new Error("The puzzle solution was invalid.");

    elements.puzzleImage.onload = () => {
      elements.loadingState.hidden = true;
      elements.puzzleImage.hidden = false;
    };
    elements.puzzleImage.onerror = () => {
      elements.loadingState.hidden = true;
      elements.imageFallback.hidden = false;
    };
    elements.puzzleImage.src = puzzleData.question;
    elements.answerInput.disabled = false;
    elements.answerInput.focus();
    elements.puzzleHeading.textContent = "Study the picture carefully";
  } catch (error) {
    console.error("Unable to load puzzle:", error);
    elements.loadingState.hidden = true;
    elements.imageFallback.hidden = false;
    elements.imageFallback.querySelector("p").textContent =
      "Could not load a puzzle. Check your internet connection and try again.";
    setFeedback("Puzzle loading failed. Please try again.", "error");
    elements.nextButton.textContent = "Retry puzzle ↻";
    elements.nextButton.hidden = false;
    elements.nextButton.dataset.retry = "true";
  } finally {
    elements.submitButton.disabled = false;
    elements.submitButton.textContent = "Submit answer ↗";
  }
}

function submitAnswer(event) {
  event.preventDefault();
  if (answerSubmitted || currentSolution === null) return;

  const enteredValue = elements.answerInput.value.trim();
  if (enteredValue === "") {
    setFeedback("Please enter a number before submitting.", "error");
    elements.answerInput.focus();
    return;
  }

  answerSubmitted = true;
  const isCorrect = Number(enteredValue) === currentSolution;

  if (isCorrect) {
    score += POINTS_PER_CORRECT_ANSWER;
    correctAnswers += 1;
    setFeedback(`Correct! Great thinking. +${POINTS_PER_CORRECT_ANSWER} points.`, "success");
  } else {
    setFeedback("Not quite! Keep learning and try the next one.", "error");
  }

  updateStats();
  elements.answerInput.disabled = true;
  elements.submitButton.disabled = true;
  elements.nextButton.textContent = currentRound === TOTAL_ROUNDS - 1
    ? "See my results →"
    : "Next puzzle →";
  elements.nextButton.hidden = false;
}

function goToNextPuzzle() {
  if (elements.nextButton.dataset.retry === "true") {
    delete elements.nextButton.dataset.retry;
    loadPuzzle();
    return;
  }

  currentRound += 1;
  if (currentRound >= TOTAL_ROUNDS) {
    showResults();
  } else {
    loadPuzzle();
  }
}

function showResults() {
  elements.gameLayout.hidden = true;
  elements.resultsPanel.hidden = false;
  elements.finalScore.textContent = score;
  elements.finalCorrect.textContent = `${correctAnswers}/${TOTAL_ROUNDS}`;
  elements.progressFill.style.width = "100%";
}

function restartGame() {
  currentRound = 0;
  score = 0;
  correctAnswers = 0;
  updateStats();
  elements.resultsPanel.hidden = true;
  elements.gameLayout.hidden = false;
  elements.nextButton.dataset.retry = "";
  delete elements.nextButton.dataset.retry;
  loadPuzzle();
}

elements.answerForm.addEventListener("submit", submitAnswer);
elements.nextButton.addEventListener("click", goToNextPuzzle);
elements.restartButton.addEventListener("click", restartGame);

// Start the first round when the page loads.
updateStats();
loadPuzzle();
