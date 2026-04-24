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

// Desactivar/activar selección de meses según tipo de cálculo
calcTypeSelect.addEventListener("change", () => {
  const isNextYear = calcTypeSelect.value === "nextYear";

  startPeriodInput.disabled = isNextYear;
  endPeriodInput.disabled = isNextYear;

  if (isNextYear) {
    startPeriodInput.classList.add("disabled-input");
    endPeriodInput.classList.add("disabled-input");
  } else {
    startPeriodInput.classList.remove("disabled-input");
    endPeriodInput.classList.remove("disabled-input");
  }

  calculate(); // 🔥 recalcula automáticamente
});


// Base values (aprox)
const baseValues = {
  electricity: 15000,
  water: 800000,
  office: 2000,
  cleaning: 1500
};

// Factores mensuales por categoría
const electricityMonthFactor = {
  1: 1.20, 2: 1.15, 3: 1.00, 4: 0.95,
  5: 1.10, 6: 1.15, 7: 1.00, 8: 1.00,
  9: 1.10, 10: 1.10, 11: 1.00, 12: 1.20
};

const waterMonthFactor = {
  1: 0.90, 2: 0.90, 3: 1.00, 4: 1.00,
  5: 1.10, 6: 1.15, 7: 1.05, 8: 1.05,
  9: 1.10, 10: 1.10, 11: 1.00, 12: 0.90
};

const holidayFactor = 0.15;

// Algoritmo de Meeus para calcular Pascua
function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Navidad
function isChristmasHoliday(date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return (m === 12 && d >= 21) || (m === 1 && d <= 8);
}

// Verano
function isSummerHoliday(date) {
  const m = date.getMonth() + 1;
  return m === 7 || m === 8;
}

// Semana Santa Cataluña (10 días)
function isHolyWeek(date) {
  const year = date.getFullYear();
  const easter = getEasterDate(year);

  const easterMonday = new Date(easter);
  easterMonday.setDate(easterMonday.getDate() + 1);

  const holyMonday = new Date(easter);
  holyMonday.setDate(holyMonday.getDate() - 6);

  const start = new Date(holyMonday);
  start.setDate(start.getDate() - 2);

  const end = easterMonday;

  return date >= start && date <= end;
}

function randomFactor(range) {
  return 1 + ((Math.random() * 2 - 1) * range);
}

// Tendencias por día
function applyTrends(category, startDate, endDate) {
  const startMonth = startDate.getMonth() + 1;
  const endMonth = endDate.getMonth() + 1;

  let totalFactor = 0;
  let months = 0;

  for (let m = startMonth; m <= endMonth; m++) {
    if (category === "electricity") totalFactor += electricityMonthFactor[m];
    else if (category === "water") totalFactor += waterMonthFactor[m];
    else totalFactor += 1;

    months++;
  }

  return totalFactor / months;
}


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

const improvementContent = document.getElementById("improvementContent");

const improvementPlans = {
  electricity: `
    <h3>⚡ Electricity – 30% Reduction Plan</h3>
    <ul>
      <li>Replace all lighting with LED technology.</li>
      <li>Install motion sensors in low‑use areas.</li>
      <li>Optimise heating/AC schedules and reduce standby consumption.</li>
      <li>Replace old appliances with A+++ efficiency models.</li>
      <li>Educate staff/students on switching off unused equipment.</li>
    </ul>
  `,

  water: `
    <h3>💧 Water – 30% Reduction Plan</h3>
    <ul>
      <li>Install low‑flow taps and dual‑flush toilets.</li>
      <li>Repair leaks within 24 hours.</li>
      <li>Use greywater for cleaning when possible.</li>
      <li>Optimise irrigation schedules and avoid watering at midday.</li>
      <li>Raise awareness about responsible water use.</li>
    </ul>
  `,

  office: `
    <h3>📄 Office Supplies – 30% Reduction Plan</h3>
    <ul>
      <li>Digitise documents and reduce printing by default.</li>
      <li>Use recycled paper and double‑sided printing.</li>
      <li>Reuse folders, binders and classroom materials.</li>
      <li>Centralise printing to reduce unnecessary copies.</li>
      <li>Promote paperless workflows among staff and students.</li>
    </ul>
  `,

  cleaning: `
    <h3>🧼 Cleaning Products – 30% Reduction Plan</h3>
    <ul>
      <li>Use concentrated cleaning products to reduce packaging.</li>
      <li>Switch to refillable containers.</li>
      <li>Optimise cleaning schedules based on real needs.</li>
      <li>Train staff on correct product dosage.</li>
      <li>Choose eco‑labelled products with lower environmental impact.</li>
    </ul>
  `
};

const measures = {
  electricity: [
    { text: "Double the number of solar panels (from 50% to 100% self‑sufficiency)", reduction: 0.25 },
    { text: "Install motion sensors in classrooms and offices", reduction: 0.10 },
    { text: "Replace old appliances with A+++ efficiency models", reduction: 0.12 },
    { text: "Optimise heating/AC schedules", reduction: 0.15 },
    { text: "Reduce standby consumption (computers, projectors…)", reduction: 0.08 }
  ],

  water: [
    { text: "Install low‑flow taps and dual‑flush toilets", reduction: 0.18 },
    { text: "Repair leaks within 24 hours", reduction: 0.12 },
    { text: "Reuse greywater for cleaning", reduction: 0.15 },
    { text: "Optimise irrigation schedules", reduction: 0.10 },
    { text: "Awareness campaigns for responsible water use", reduction: 0.05 }
  ],

  office: [
    { text: "Digitise documents and reduce printing", reduction: 0.20 },
    { text: "Use recycled paper and double‑sided printing", reduction: 0.10 },
    { text: "Reuse folders and classroom materials", reduction: 0.08 },
    { text: "Centralise printing to reduce unnecessary copies", reduction: 0.12 },
    { text: "Promote paperless workflows", reduction: 0.15 }
  ],

  cleaning: [
    { text: "Use concentrated cleaning products", reduction: 0.18 },
    { text: "Switch to refillable containers", reduction: 0.12 },
    { text: "Optimise cleaning schedules", reduction: 0.10 },
    { text: "Train staff on correct product dosage", reduction: 0.15 },
    { text: "Choose eco‑labelled low‑impact products", reduction: 0.08 }
  ]
};


function updateImprovementPlan(category) {
  improvementContent.innerHTML = improvementPlans[category];
}

const measuresContainer = document.getElementById("measuresContainer");

function updateMeasures(category) {
  const list = measures[category];

  measuresContainer.innerHTML = `
    <h3>Select reduction measures</h3>
    <p>Choose the actions you want to apply:</p>
    <ul class="measures-list">
      ${list.map((m, i) => `
        <li>
          <label>
            <input type="checkbox" class="measureCheck" data-reduction="${m.reduction}">
            ${m.text} <span style="color:var(--accent)">(${Math.round(m.reduction * 100)}%)</span>
          </label>
        </li>
      `).join("")}
    </ul>
  `;
}

function calculate() {
  const category = categorySelect.value;
  const calcType = calcTypeSelect.value;
  if (!category || !calcType) return;

  const base = baseValues[category];

  let value = 0;
  let note = "";

  if (calcType === "nextYear") {
    const year = new Date().getFullYear();
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year, 11, 31));


    const factor = applyTrends(category, start, end);
    value = base * factor;
    note = "Estimated annual consumption based on trends, holidays and variability.";
  } else {
    const startStr = startPeriodInput.value;
    const endStr = endPeriodInput.value;
    const months = monthsBetween(startStr, endStr);

    if (!months || months <= 0) {
      resultValue.textContent = "Please select a valid period.";
      resultNote.textContent = "";
      return;
    }

    const start = new Date(startStr + "-01");
    const end = new Date(endStr + "-01");
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);

    const factor = applyTrends(category, start, end);
    value = base * (factor * (months / 12));
    note = `Estimated consumption for a period of ${months} month(s), considering trends and holidays.`;
  }

  const unit =
    category === "electricity" ? "kWh" :
    category === "water" ? "L" :
    "units / €";

  resultValue.textContent = `${Math.round(value).toLocaleString("en-GB")} ${unit}`;
  resultNote.textContent = note;

  showTips(category);
  updateImprovementPlan(category);
  updateMeasures(category);
}


// Actualizar plan de reducción cuando cambia la categoría
categorySelect.addEventListener("change", () => {
  calculate();
});


function monthsBetween(start, end) {
  if (!start || !end) return 0;
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  return (ey - sy) * 12 + (em - sm) + 1;
}

calculateBtn.addEventListener("click", calculate);
startPeriodInput.addEventListener("change", calculate);
endPeriodInput.addEventListener("change", calculate);



// Fecha en la esquina superior
function updateDateTop() {
  const dateElement = document.getElementById("currentDate");
  const today = new Date();
  dateElement.textContent = today.toLocaleDateString("en-EN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
}

updateDateTop();

// Aplicar reducción del 30%
const applyReductionBtn = document.getElementById("applyReductionBtn");
const reductionResult = document.getElementById("reductionResult");

applyReductionBtn.addEventListener("click", () => {
  const currentText = resultValue.textContent;
  const number = parseFloat(currentText.replace(/[^0-9.]/g, ""));

  if (isNaN(number)) {
    reductionResult.textContent = "Calculate a consumption first.";
    return;
  }

  const checks = document.querySelectorAll(".measureCheck:checked");

  if (checks.length === 0) {
    reductionResult.textContent = "Select at least one measure.";
    return;
  }

  let totalReduction = 0;
  checks.forEach(c => totalReduction += parseFloat(c.dataset.reduction));

  if (totalReduction > 0.70) totalReduction = 0.70;

  const reduced = number * (1 - totalReduction);

 // Clear old message in the 30% card
reductionResult.textContent = "";

// Update the Result card
const reductionTitle = document.getElementById("reductionTitle");
const reductionResultFinal = document.getElementById("reductionResultFinal");

reductionTitle.textContent = "New consumption:";
reductionResultFinal.textContent =
  `${Math.round(reduced).toLocaleString("en-GB")} (−${Math.round(totalReduction * 100)}%)`;

});

const calculatorPage = document.getElementById("calculatorPage");
const detailsPage = document.getElementById("detailsPage");

document.getElementById("navCalculator").addEventListener("click", () => {
  calculatorPage.style.display = "grid";
  detailsPage.style.display = "none";
  window.scrollTo(0, 0);
});

document.getElementById("navDetails").addEventListener("click", () => {
  calculatorPage.style.display = "none";
  detailsPage.style.display = "block";
  window.scrollTo(0, 0);
  initReductionChart();
});




let reductionChart = null;

function generateMonthlyReduction(maxReduction) {
  const months = 36;
  const data = [];
  for (let i = 0; i < months; i++) {
    const yearProgress = i / (months - 1);
    let value = maxReduction * yearProgress;

    const month = (i % 12) + 1;

    if (month === 12 || month <= 2) value *= 1.05;
    if ([5, 6, 9, 10].includes(month)) value *= 1.03;

    value *= 1 + (Math.random() * 0.04 - 0.02);

    data.push(parseFloat(value.toFixed(2)));
  }
  return data;
}
function generateMonthlyConsumption(maxReduction) {
  const months = 36;
  const data = [];
  let current = 100; // 100% baseline consumption

  for (let i = 0; i < months; i++) {
    const month = (i % 12) + 1;
    const yearProgress = i / (months - 1);

    // Target consumption after reduction
    const target = 100 - (maxReduction * yearProgress);

    // Seasonal effects (positive = more consumption)
    let seasonal = 0;

    // Winter (heating)
    if (month === 12 || month <= 2) seasonal += 5;

    // Warm months (AC or water use)
    if ([5, 6, 9, 10].includes(month)) seasonal += 3;

    // Random noise (±3%)
    const noise = (Math.random() * 6) - 3;

    // Pull towards target (smooth descent)
    const pull = (target - current) * 0.25;

    // Apply changes
    current += pull + seasonal + noise;

    // Clamp values
    if (current < 100 - maxReduction) current = 100 - maxReduction;
    if (current > 100) current = 100;

    data.push(parseFloat(current.toFixed(2)));
  }

  return data;
}


const reductionData = {
  labels: Array.from({ length: 36 }, (_, i) => {
    const month = (i % 12) + 1;
    const year = Math.floor(i / 12) + 1;
    return month === 1 ? `Year ${year}` : `M${month}`;
  }),
  datasets: [
    {
      label: "Electricity",
      data: generateMonthlyConsumption(70),
      borderColor: "#22c55e",
      backgroundColor: "rgba(34, 197, 94, 0.25)",
      tension: 0.4
    },
    {
      label: "Water",
      data: generateMonthlyConsumption(60),
      borderColor: "#38bdf8",
      backgroundColor: "rgba(56, 189, 248, 0.25)",
      tension: 0.4
    },
    {
      label: "Office supplies",
      data: generateMonthlyConsumption(65),
      borderColor: "#f97316",
      backgroundColor: "rgba(249, 115, 22, 0.25)",
      tension: 0.4
    },
    {
      label: "Cleaning products",
      data: generateMonthlyConsumption(63),
      borderColor: "#e11d48",
      backgroundColor: "rgba(225, 29, 72, 0.25)",
      tension: 0.4
    }
  ]
};




function initReductionChart() {
  const ctx = document.getElementById("reductionChart");
  if (!ctx) return;

  if (reductionChart !== null) {
    reductionChart.destroy();
  }

  reductionChart = new Chart(ctx, {
    type: "line",
    data: reductionData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          labels: { color: "#e5e7eb" }
        }
      },
      scales: {
        x: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(148,163,184,0.2)" }
        },
       y: {
  ticks: {
    color: "#9ca3af",
    callback: v => v + "%"
  },
  grid: { color: "rgba(148,163,184,0.2)" },
  suggestedMin: 0,
  suggestedMax: 100
}

      }
    }
  });
}







// Bloquear meses anteriores a 2024
function lockMinimumDate() {
  const min = "2024-01";

  startPeriodInput.min = min;
  endPeriodInput.min = min;
}

lockMinimumDate();








flatpickr(".month-input", {
  locale: "en",
  dateFormat: "Y-m",
  altInput: true,
  altFormat: "F Y",
  plugins: [
    new monthSelectPlugin({
      shorthand: true,
      dateFormat: "Y-m",
      altFormat: "F Y",
      theme: "dark"
    })
  ],
  minDate: "2024-01"
});


