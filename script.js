const categorySelect = document.getElementById("category");
const calcTypeSelect = document.getElementById("calcType");
const startPeriodInput = document.getElementById("startPeriod");
const endPeriodInput = document.getElementById("endPeriod");
const calculateBtn = document.getElementById("calculateBtn");
const resultValue = document.getElementById("resultValue");
const resultNote = document.getElementById("resultNote");

const tipsElectricity = document.getElementById("tipsElectricity");
const tipsWater = document.getElementById("tipsWater");
const tipsOffice = document.getElementById("tipsOffice");
const tipsCleaning = document.getElementById("tipsCleaning");

// Base values (aprox) – puedes ajustarlos si quieres
const baseValues = {
  electricity: 15000, // kWh / year
  water: 800000, // L / year
  office: 2000, // € / year (o unidades)
  cleaning: 1500 // € / year (o unidades)
};

// Helper: random factor between -range and +range (e.g. 0.05 = ±5%)
function randomFactor(range) {
  const r = (Math.random() * 2 - 1) * range;
  return 1 + r;
}

// Apply temporal trends depending on category and period length (months)
function applyTrends(category, months, isNextYear) {
  let factor = 1;

  if (category === "electricity") {
    // +10% winter, -10% summer, ±5% variability
    factor *= 1.0; // base
    factor *= randomFactor(0.05);
  } else if (category === "water") {
    // +15% summer, -10% winter, ±200L already absorbed in base
    factor *= randomFactor(0.05);
  } else if (category === "office") {
    // +20% school months, -40% holidays
    factor *= isNextYear ? 1.1 : 1.0;
  } else if (category === "cleaning") {
    // +15% high activity
    factor *= isNextYear ? 1.05 : 1.0;
  }

  // Rough scaling by months if period
  if (!isNextYear && months > 0) {
    factor *= months / 12;
  }

  return factor;
}

// Show tips depending on category
function showTips(category) {
  tipsElectricity.classList.add("hidden");
  tipsWater.classList.add("hidden");
  tipsOffice.classList.add("hidden");
  tipsCleaning.classList.add("hidden");

  if (category === "electricity") tipsElectricity.classList.remove("hidden");
  if (category === "water") tipsWater.classList.remove("hidden");
  if (category === "office") tipsOffice.classList.remove("hidden");
  if (category === "cleaning") tipsCleaning.classList.remove("hidden");
}

// Calculate months between two YYYY-MM strings
function monthsBetween(start, end) {
  if (!start || !end) return 0;
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  return (ey - sy) * 12 + (em - sm) + 1;
}

calculateBtn.addEventListener("click", () => {
  const category = categorySelect.value;
  const calcType = calcTypeSelect.value;
  const base = baseValues[category];

  if (!base) return;

  let value = 0;
  let note = "";
  let isNextYear = calcType === "nextYear";

  if (calcType === "nextYear") {
    const factor = applyTrends(category, 12, true);
    value = base * factor;
    note = "Estimated annual consumption based on trends and variability.";
  } else {
    const start = startPeriodInput.value;
    const end = endPeriodInput.value;
    const months = monthsBetween(start, end);

    if (!months || months <= 0) {
      resultValue.textContent = "Please select a valid period.";
      resultNote.textContent = "";
      resultValue.classList.remove("result-animate");
      void resultValue.offsetWidth;
      resultValue.classList.add("result-animate");
      return;
    }

    const factor = applyTrends(category, months, false);
    value = base * factor;
    note = `Estimated consumption for a period of ${months} month(s).`;
  }

  const unit =
    category === "electricity"
      ? "kWh"
      : category === "water"
      ? "L"
      : "units / €";

  const formatted = Math.round(value).toLocaleString("en-GB");

  resultValue.textContent = `${formatted} ${unit}`;
  resultNote.textContent = note;

  resultValue.classList.remove("result-animate");
  void resultValue.offsetWidth;
  resultValue.classList.add("result-animate");

  showTips(category);
});
