// Element selectors
const inputField = document.querySelector(".user-input");
const resultField = document.querySelector(".result");
const container = document.querySelector(".container");
const lightModeBtn = document.getElementById("light-mode-btn");
const darkModeBtn = document.getElementById("dark-mode-btn");
const clearBtn = document.getElementById("ac");
const delBtn = document.getElementById("del-btn");
const equalsBtn = document.querySelector(".btn.with-bg-btn.shift"); // Update if you use a different selector
const backBtn = document.querySelector(".back-btn");
const scientificBox = document.querySelector(".scientific-btns");

const allBtns = document.querySelectorAll(".btn, .scien-btn");

let input = "";

// --- Helper Functions ---
function factorial(n) {
    if (n < 0) return NaN;
    return n <= 1 ? 1 : n * factorial(n - 1);
}

// --- Expression Parsing ---
function parseExpression(expr) {
    return expr
        // Factorials
        .replace(/(\d+)!/g, (_, n) => `factorial(${n})`)
        // Powers
        .replace(/(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g, (_, a, b) => `Math.pow(${a},${b})`)
        
        // --- Implicit multiplication fixes ---
        // number followed by π or e → multiply
        .replace(/(\d+(?:\.\d+)?)\s*π/g, (_, n) => `${n}*Math.PI`)
        .replace(/(\d+(?:\.\d+)?)\s*e\b/g, (_, n) => `${n}*Math.E`)
        // π or e followed by number → multiply
        .replace(/π\s*(\d+(?:\.\d+)?)/g, (_, n) => `Math.PI*${n}`)
        .replace(/\b[eE]\s*(\d+(?:\.\d+)?)/g, (_, n) => `Math.E*${n}`)

        // π or e followed by ( → multiply
        .replace(/π\s*\(/g, 'Math.PI*(')
        .replace(/\b[eE]\s*\(/g, 'Math.E*(')

        // π and e standalone
        .replace(/π/g, 'Math.PI')
        .replace(/\be\b/g, 'Math.E')

        // Square root
        .replace(/√\(?([0-9.]+)\)?/g, (_, n) => `Math.sqrt(${n})`)
        // log and ln
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        // Trig in degrees
        .replace(/sin\(([^)]+)\)/g, (_, x) => `Math.sin((${x})*Math.PI/180)`)
        .replace(/cos\(([^)]+)\)/g, (_, x) => `Math.cos((${x})*Math.PI/180)`)
        .replace(/tan\(([^)]+)\)/g, (_, x) => `Math.tan((${x})*Math.PI/180)`)
        // Percentage
        .replace(/(\d+)%/g, (_, n) => `(${n}/100)`)
        // Multiplication & Division symbols
        .replace(/×/g, "*")
        .replace(/÷/g, "/");
}


// --- Evaluate Expression ---
function evaluateInput() {
    try {
        let expr = parseExpression(input);
        // eslint-disable-next-line no-new-func
        let answer = Function("factorial", `return ${expr}`)(factorial);
        if (answer === undefined || isNaN(answer)) throw new Error();
        resultField.textContent = answer;
        input = answer.toString();
        updateDisplay();
    } catch {
        resultField.textContent = "Error";
    }
}

// --- Update Display ---
function updateDisplay() {
    inputField.value = input;
    inputField.scrollLeft = inputField.scrollWidth;
}

// --- Input Handling ---
function addToInput(val, type = "num") {
    const lastChar = input.slice(-1);
    const operators = ["+", "-", "*", "/", "%", ".", "^"];

    if (type === "num") {
        if (val === "." && lastChar === ".") return;
        // Prevent multiple decimals in a number
        const tokens = input.split(/[\+\-\*\/\%\^]/);
        if (val === "." && tokens[tokens.length - 1].includes(".")) return;
        input += val;

    } else if (type === "op") {
        if (input === "" && val !== "-") return;
        if (operators.includes(lastChar)) input = input.slice(0, -1);
        input += val;

    } else if (type === "fn") {
        switch (val) {
            case "sin": input += "sin("; break;
            case "cos": input += "cos("; break;
            case "tan": input += "tan("; break;
            case "log": input += "log("; break;
            case "ln": input += "ln("; break;
            case "sqrt": input += "√("; break;
            case "exp": input += "e"; break;
            case "pi": input += "π"; break;
            case "fact": input += "!"; break;
            case "pow": input += "^"; break;
            case "(": case ")": input += val; break;
        }
    }
    updateDisplay();
}

// --- Clear & Delete ---
function clearAll() {
    input = "";
    resultField.textContent = "0";
    updateDisplay();
}
function deleteLast() {
    input = input.slice(0, -1);
    updateDisplay();
}

// --- Event Bindings ---
allBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        // Use data attributes for clean mapping
        if (btn.dataset.num) addToInput(btn.dataset.num, "num");
        else if (btn.dataset.op) addToInput(btn.dataset.op, "op");
        else if (btn.dataset.fn) addToInput(btn.dataset.fn, "fn");
        else if (btn.classList.contains("with-bg-btn") && btn.textContent.trim() === "=") evaluateInput();
        else if (btn.id === "ac") clearAll();
        else if (btn.id === "del-btn") deleteLast();
    });
});

if (equalsBtn) equalsBtn.addEventListener("click", evaluateInput);
clearBtn.addEventListener("click", clearAll);
delBtn.addEventListener("click", deleteLast);

lightModeBtn.addEventListener("click", () => {
    container.classList.add("light");
    lightModeBtn.style.display = "none";
    darkModeBtn.style.display = "block";
});
darkModeBtn.addEventListener("click", () => {
    container.classList.remove("light");
    lightModeBtn.style.display = "block";
    darkModeBtn.style.display = "none";
});

backBtn.addEventListener("click", () => {
    scientificBox.classList.toggle("active");
});

// --- Initialize ---
updateDisplay();
resultField.textContent = "0";
