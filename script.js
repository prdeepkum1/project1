const state = {
  current: "0",
  previous: null,
  operator: null,
  justEvaluated: false
};

const currentEl = document.getElementById("current");
const historyEl = document.getElementById("history");

// Format numbers
function format(nStr) {
  if (nStr === "Error") return "Error";
  if (!isFinite(Number(nStr))) return "Error";
  if (nStr === "" || nStr === "-") return nStr || "0";
  const [intPart, decPart] = String(nStr).split(".");
  const intFormatted = Number(intPart).toLocaleString(undefined, { maximumFractionDigits: 0 });
  return decPart != null && decPart !== "" ? `${intFormatted}.${decPart}` : intFormatted;
}

function updateScreen() {
  currentEl.textContent = format(state.current);
  const op = state.operator ? ` ${state.operator} ` : "";
  historyEl.textContent = state.previous != null ? `${format(state.previous)}${op}` : "";
}

function inputDigit(d) {
  if (state.justEvaluated) {
    state.current = d;
    state.justEvaluated = false;
  } else {
    state.current = state.current === "0" ? d : state.current + d;
  }
  updateScreen();
}

function inputDot() {
  if (state.justEvaluated) {
    state.current = "0.";
    state.justEvaluated = false;
  } else if (!state.current.includes(".")) {
    state.current += state.current === "" ? "0." : ".";
  }
  updateScreen();
}

function toggleSign() {
  if (state.current && state.current !== "0")
    state.current = state.current.startsWith("-") ? state.current.slice(1) : "-" + state.current;
  updateScreen();
}

function percent() {
  state.current = String(Number(state.current || "0") / 100);
  updateScreen();
}

function setOperator(op) {
  if (state.operator && state.previous != null && state.current !== "")
    equals(true);
  state.operator = op;
  state.previous = state.current === "" ? state.previous : state.current;
  state.current = "";
  state.justEvaluated = false;
  updateScreen();
}

function clearAll() {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  state.justEvaluated = false;
  updateScreen();
}

function del() {
  state.current = state.current.length > 1 ? state.current.slice(0, -1) : "0";
  updateScreen();
}

function calculate(a, op, b) {
  const x = Number(a), y = Number(b);
  switch (op) {
    case "+": return x + y;
    case "−": return x - y;
    case "×": return x * y;
    case "÷": return y === 0 ? "Error" : x / y;
    default: return y;
  }
}

function equals(isChained = false) {
  if (!state.operator || state.previous == null) return;
  const rhs = state.current === "" ? String(state.previous) : state.current;
  const result = calculate(state.previous, state.operator, rhs);
  state.current = String(result);
  state.previous = !isChained ? null : String(result);
  if (!isChained) state.operator = null;
  state.justEvaluated = true;
  updateScreen();
}

// Button clicks
document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button.key");
  if (!btn) return;
  const digit = btn.dataset.digit;
  const op = btn.dataset.op;
  const action = btn.dataset.action;
  if (digit) return inputDigit(digit);
  if (op) return setOperator(op);
  if (action === "dot") return inputDot();
  if (action === "sign") return toggleSign();
  if (action === "percent") return percent();
  if (action === "equals") return equals();
  if (action === "all-clear") return clearAll();
  if (action === "delete") return del();
});

// Keyboard support
window.addEventListener("keydown", (e) => {
  const key = e.key;
  if (/^\d$/.test(key)) return inputDigit(key);
  if (key === ".") return inputDot();
  if (key === "Enter" || key === "=") { e.preventDefault(); return equals(); }
  if (key === "Backspace") return del();
  if (key === "Escape") return clearAll();
  if (key === "%") return percent();
  const map = { "+": "+", "-": "−", "*": "×", "/": "÷" };
  if (map[key]) return setOperator(map[key]);
});

updateScreen();
