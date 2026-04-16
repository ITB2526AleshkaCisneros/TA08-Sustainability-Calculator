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
  water: 800000,      // L / year
  office: 2000,       // € / year (o unidades)
  cleaning: 1500      // € / year (o unidades)
};

// Factores mensuales por categoría
const electricityMonthFactor = {
  1: 1.20, // enero - calefacción
  2: 1.15, // febrero - calefacción
  3: 1.00,
  4: 0.95,
  5: 1.10, // AC
  6: 1.15, // AC
  7: 1.00,
  8: 1.00,
  9: 1.10, // AC
 10: 1.10, // AC
 11: 1.00,
 12: 1.20  // diciembre - calefacción
};

const waterMonthFactor = {
  1: 0.90,
  2: 0.90,
  3: 1.00,
  4: 1.00,
  5: 1.10,
  6: 1.15,
  7: 1.05,
  8: 1.05,
  9: 1.10,
 10: 1.10,
 11: 1.00,
 12: 0.90
};

const holidayFactor = 0.15; // consumo mínimo (solo datacenter)

// Algoritmo de Meeus para calcular el domingo de Pascua
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

function isChristmasHoliday(date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();

  // 21 diciembre → 31 diciembre
  if (m === 12 && d >= 21) return true;

  // 1 enero → 8 enero
  if (m === 1 && d <= 8) return true;

  return false;
}

function isSummerHoliday(date) {
  const month = date.getMonth() + 1;
  return month === 7 || month === 8; // julio o agosto
}


// Semana Santa en Cataluña: 10 días incluyendo Lunes de Pascua
function isHolyWeek(date) {
  const year = date.getFullYear();
  const easter = getEasterDate(year);

  // Domingo de Pascua = easter
  // Lunes de Pascua = easter + 1 día
  const easterMonday = new Date(easter);
  easterMonday.setDate(easterMonday.getDate() + 1);

  // Lunes Santo = domingo de Pascua - 6 días
  const holyMonday = new Date(easter);
  holyMonday.setDate(holyMonday.getDate() - 6);

  // Empezamos 2 días antes del Lunes Santo → sábado anterior
  const start = new Date(holyMonday);
  start.setDate(start.getDate() - 2);

  // Finalizamos el Lunes de Pascua
  const end = easterMonday;

  return date >= start && date <= end;
}

// Helper: random factor between -range and +range (e.g. 0.05 = ±5%)
function randomFactor(range) {
  const r = (Math.random() * 2 - 1) * range;
  return 1 + r;
}

// Aplica tendencias temporales según categoría y fechas
function applyTrends(category, startDate, endDate) {
  let totalFactor = 0;
  let days = 0;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days++;
    const month = d.getMonth() + 1;

    // Vacaciones (Navidad o Semana Santa)
    if (isChristmasHoliday(d) || isHolyWeek(d) || isSummerHoliday(d)) {
      totalFactor += holidayFactor;
      continue;
    }


    if (category === "electricity") {
      totalFactor += electricityMonthFactor[month];
    } else if (category === "water") {
      totalFactor += waterMonthFactor[month];
    } else {
      // categorías sin estacionalidad específica
      totalFactor += 1;
    }
  }

  if (days === 0) return 1;
  return totalFactor / days; // media diaria
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

  if (calcType === "nextYear") {
    // Año completo: de 1 enero a 31 diciembre del año actual
    const now = new Date();
    const year = now.getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    const factor = applyTrends(category, start, end) * randomFactor(0.05);
    value = base * factor;
    note = "Estimated annual consumption based on trends, holidays and variability.";
  } else {
    const startStr = startPeriodInput.value;
    const endStr = endPeriodInput.value;
    const months = monthsBetween(startStr, endStr);

    if (!months || months <= 0) {
      resultValue.textContent = "Please select a valid period.";
      resultNote.textContent = "";
      resultValue.classList.remove("result-animate");
      void resultValue.offsetWidth;
      resultValue.classList.add("result-animate");
      return;
    }

    const start = new Date(startPeriodInput.value + "-01");
    const end = new Date(endPeriodInput.value + "-01");
    end.setMonth(end.getMonth() + 1);
    end.setDate(0); // último día del mes

    const factor = applyTrends(category, start, end) * randomFactor(0.05);
    value = base * (factor * (months / 12));
    note = `Estimated consumption for a period of ${months} month(s), considering trends and holidays.`;
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

// (Opcional) Debug: listar vacaciones de un año en consola
// listHolidaysForYear(2026);
