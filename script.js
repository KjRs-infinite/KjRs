const tasks = [
  {
    title: "找出本章主題",
    body: "閱讀目錄與大標，寫下你覺得這章最重要的自然現象。"
  },
  {
    title: "圈出關鍵詞",
    body: "把課本中反覆出現的名詞整理成 3 到 5 個關鍵詞。"
  },
  {
    title: "比較條件",
    body: "觀察活動中的變因，想一想哪些條件改變會影響結果。"
  },
  {
    title: "完成小測驗",
    body: "回答頁面下方的題目，確認自己能用完整句子說明。"
  }
];

const quiz = [
  {
    prompt: "做自然實驗時，只改變一個條件的主要目的是什麼？",
    answers: ["比較公平，找出影響結果的因素", "讓實驗看起來比較複雜", "讓紀錄表變短"],
    correct: 0
  },
  {
    prompt: "觀察植物或自然現象時，哪一種紀錄最有幫助？",
    answers: ["只寫自己的感覺", "有時間、條件和變化的紀錄", "只畫漂亮的圖"],
    correct: 1
  },
  {
    prompt: "如果實驗結果和預測不同，下一步最適合怎麼做？",
    answers: ["直接改答案", "檢查方法並再次觀察", "停止討論"],
    correct: 1
  },
  {
    prompt: "閱讀課本活動時，最應該先確認的是什麼？",
    answers: ["活動目的和需要觀察的重點", "頁面顏色", "哪一題最短"],
    correct: 0
  }
];

const taskList = document.querySelector("#taskList");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const progressHint = document.querySelector("#progressHint");
const quizCards = document.querySelector("#quizCards");
const scoreText = document.querySelector("#scoreText");
const notesBox = document.querySelector("#notesBox");
const noteStatus = document.querySelector("#noteStatus");

const savedTasks = JSON.parse(localStorage.getItem("scienceCh4Tasks") || "[]");
const savedAnswers = JSON.parse(localStorage.getItem("scienceCh4Answers") || "{}");

function updateProgress() {
  const checked = [...document.querySelectorAll(".task input")].filter((item) => item.checked).length;
  const answered = Object.keys(savedAnswers).length;
  const total = tasks.length + quiz.length;
  const percent = Math.round(((checked + answered) / total) * 100);

  progressText.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
  progressHint.textContent = percent === 100 ? "漂亮，今天的學習任務完成了。" : `已完成 ${checked + answered} / ${total} 個學習步驟。`;

  localStorage.setItem(
    "scienceCh4Tasks",
    JSON.stringify([...document.querySelectorAll(".task input")].map((item) => item.checked))
  );
}

tasks.forEach((task, index) => {
  const label = document.createElement("label");
  label.className = "task";
  label.innerHTML = `
    <input type="checkbox" ${savedTasks[index] ? "checked" : ""}>
    <span><strong>${task.title}</strong>${task.body}</span>
  `;
  label.querySelector("input").addEventListener("change", updateProgress);
  taskList.append(label);
});

function renderQuiz() {
  quizCards.innerHTML = "";

  quiz.forEach((item, questionIndex) => {
    const card = document.createElement("article");
    card.className = "question";
    const selected = savedAnswers[questionIndex];

    card.innerHTML = `
      <strong>${questionIndex + 1}. ${item.prompt}</strong>
      <div class="answers">
        ${item.answers
          .map((answer, answerIndex) => {
            const state = selected === answerIndex ? (answerIndex === item.correct ? "correct" : "wrong") : "";
            return `<button type="button" class="${state}" data-question="${questionIndex}" data-answer="${answerIndex}">${answer}</button>`;
          })
          .join("")}
      </div>
    `;
    quizCards.append(card);
  });

  const score = Object.entries(savedAnswers).filter(([questionIndex, answerIndex]) => quiz[questionIndex].correct === answerIndex).length;
  scoreText.textContent = `答對 ${score} / ${quiz.length} 題`;
  updateProgress();
}

quizCards.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-question]");
  if (!button) return;

  savedAnswers[button.dataset.question] = Number(button.dataset.answer);
  localStorage.setItem("scienceCh4Answers", JSON.stringify(savedAnswers));
  renderQuiz();
});

document.querySelector("#resetQuiz").addEventListener("click", () => {
  Object.keys(savedAnswers).forEach((key) => delete savedAnswers[key]);
  localStorage.removeItem("scienceCh4Answers");
  renderQuiz();
});

const light = document.querySelector("#light");
const water = document.querySelector("#water");
const air = document.querySelector("#air");
const plant = document.querySelector("#plant");
const sun = document.querySelector("#sun");
const simResult = document.querySelector("#simResult");

function updateSimulation() {
  const lightValue = Number(light.value);
  const waterValue = Number(water.value);
  const airValue = Number(air.value);
  const average = (lightValue + waterValue + airValue) / 300;
  const scale = 0.55 + average * 0.62;
  const stress = [lightValue, waterValue, airValue].some((value) => value < 25);

  plant.style.transform = `translateX(-50%) scale(${scale.toFixed(2)})`;
  plant.style.filter = stress ? "saturate(0.45) brightness(0.9)" : "saturate(1) brightness(1)";
  sun.style.opacity = String(0.25 + lightValue / 135);

  if (stress) {
    simResult.textContent = "有一個條件太低了，觀察結果可能會受到明顯影響。試著一次只調整一個滑桿，比較變化。";
  } else if (average > 0.76) {
    simResult.textContent = "三個條件都充足，模擬中的植物長得比較高。請想一想：真實實驗還需要控制哪些因素？";
  } else {
    simResult.textContent = "條件大致穩定，適合觀察成長差異。可以記錄目前數值，再和下一次調整比較。";
  }
}

[light, water, air].forEach((slider) => slider.addEventListener("input", updateSimulation));

notesBox.value = localStorage.getItem("scienceCh4Notes") || "";
document.querySelector("#saveNotes").addEventListener("click", () => {
  localStorage.setItem("scienceCh4Notes", notesBox.value);
  noteStatus.textContent = "已儲存";
  window.setTimeout(() => {
    noteStatus.textContent = "";
  }, 1800);
});

document.querySelector("#clearNotes").addEventListener("click", () => {
  notesBox.value = "";
  localStorage.removeItem("scienceCh4Notes");
  noteStatus.textContent = "已清空";
});

renderQuiz();
updateSimulation();
