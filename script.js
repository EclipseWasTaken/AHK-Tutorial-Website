// ── NAVIGATION ──────────────────────────────────────────────

const sectionFiles = {
  reference: 'menu/reference.html',
  playground: 'menu/playground.html',
  quiz: 'menu/quiz.html',
  snippets: 'menu/snippets.html',
  progress: 'menu/progress.html'
};

const sectionCache = {};

function initSection(id) {
  const el = document.getElementById('section-' + id);
  if (el) el.classList.add('active');

  if (id === 'learn') {
    if (!document.querySelector('.lesson.active')) {
      const firstBtn = document.querySelector('#learn-nav .sidebar-item');
      if (firstBtn) firstBtn.click();
      else showLesson('intro');
    }
  }

  if (id === 'quiz' && !quizStarted) startQuiz();
  if (id === 'progress') updateOverall();

  if (id === 'playground') {
    const ta = document.getElementById('pg-code');
    if (ta && !ta.dataset.tabBound) {
      ta.dataset.tabBound = "true";
      ta.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const s = ta.selectionStart;
          const e2 = ta.selectionEnd;
          ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(e2);
          ta.selectionStart = ta.selectionEnd = s + 4;
        }
      });
    }
  }
}

function showSection(id, btn) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const navBtns = document.querySelectorAll('.nav-links .nav-link');
    for (let i = 0; i < navBtns.length; i++) {
      if (navBtns[i].textContent.toLowerCase().replace('my ', '').trim() === id) {
        navBtns[i].classList.add('active');
        break;
      }
    }
  }

  ['learn-nav', 'ref-nav', 'snip-nav'].forEach(n => {
    const el = document.getElementById(n);
    if (el) el.style.display = 'none';
  });

  const map = { learn: 'learn-nav', reference: 'ref-nav', snippets: 'snip-nav' };
  if (map[id]) {
    const el = document.getElementById(map[id]);
    if (el) el.style.display = '';
  }

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  const existing = document.getElementById('section-' + id);
  if (existing) {
    initSection(id);
    return;
  }

  const file = sectionFiles[id];
  if (!file) return;

  if (sectionCache[id]) {
    mainContent.insertAdjacentHTML('beforeend', sectionCache[id]);
    initSection(id);
    return;
  }

  mainContent.insertAdjacentHTML('beforeend', `<div class="section active loader" id="loader-${id}" style="padding:2rem;color:var(--text3)">Loading...</div>`);

  fetch(file)
    .then(r => r.text())
    .then(html => {
      sectionCache[id] = html;
      const loader = document.getElementById(`loader-${id}`);
      if (loader) loader.remove();

      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      mainContent.insertAdjacentHTML('beforeend', html);
      initSection(id);
    })
    .catch(() => {
      const loader = document.getElementById(`loader-${id}`);
      if (loader) loader.innerHTML = '<span style="color:#f87171">Failed to load section.</span>';
    });
}

// ── Lesson file map ──────────────────────────────────────────
const lessonFiles = {
  intro: 'fundamentals/intro.html',
  syntax: 'fundamentals/syntax.html',
  hotkeys: 'fundamentals/hotkeys.html',
  variables: 'fundamentals/variables.html',
  math: 'fundamentals/math.html',
  controlflow: 'fundamentals/controlflow.html',
  sending: 'fundamentals/sending.html',
  dialogs: 'fundamentals/dialogs.html',
  arrays: 'fundamentals/arrays.html',
  functions: 'intermediate/functions.html',
  objects: 'intermediate/objects.html',
  strings: 'intermediate/strings.html',
  clipboard: 'intermediate/clipboard.html',
  timers: 'intermediate/timers.html',
  run: 'intermediate/run.html',
  inifiles: 'intermediate/inifiles.html',
  sound: 'intermediate/sound.html',
  keystate: 'intermediate/keystate.html',
  tray: 'intermediate/tray.html',
  filegui: 'intermediate/gui.html',
  window: 'intermediate/window.html',
  filesystem: 'intermediate/filesystem.html',
  pixel: 'advanced/pixel.html',
  advmethods: 'advanced/advmethods.html',
  classes: 'advanced/classes.html',
  regex: 'advanced/regex.html',
  comobj: 'advanced/comobj.html',
  include: 'advanced/include.html',
  onmessage: 'advanced/onmessage.html',
  errorhandling: 'advanced/errorhandling.html',
  debugging: 'advanced/debugging.html',
};

const lessonCache = {};

function showLesson(id, btn) {
  document.querySelectorAll('#learn-nav .sidebar-item').forEach(i => i.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const container = document.getElementById('lesson-container');
  if (!container) return;

  // Hide all currently loaded lessons
  container.querySelectorAll('.lesson').forEach(l => l.classList.remove('active'));

  // If already cached in DOM, just show it
  const existing = document.getElementById('lesson-' + id);
  if (existing) {
    existing.classList.add('active');
    return;
  }

  // Fetch from file
  const file = lessonFiles[id];
  if (!file) return;

  if (lessonCache[id]) {
    container.insertAdjacentHTML('beforeend', lessonCache[id]);
    const el = document.getElementById('lesson-' + id);
    if (el) el.classList.add('active');
    return;
  }

  container.innerHTML = '<div class="lesson active" style="padding:2rem;color:var(--text3)">Loading...</div>';

  fetch(file)
    .then(r => r.text())
    .then(html => {
      lessonCache[id] = html;
      // Remove the loading indicator
      const loader = container.querySelector('.lesson[style]');
      if (loader) loader.remove();
      // Hide all existing lessons
      container.querySelectorAll('.lesson').forEach(l => l.classList.remove('active'));
      // Add the new lesson
      container.insertAdjacentHTML('beforeend', html);
      const el = document.getElementById('lesson-' + id);
      if (el) el.classList.add('active');
    })
    .catch(() => {
      container.innerHTML = '<div class="lesson active" style="padding:2rem;color:#f87171">Failed to load lesson.</div>';
    });
}

function showRef(id, btn) {
  document.querySelectorAll('.ref-content').forEach(r => {
    r.classList.remove('active');
    r.style.display = 'none';
  });
  const el = document.getElementById('ref-' + id);
  if (el) { el.classList.add('active'); el.style.display = ''; }
  document.querySelectorAll('#ref-nav .sidebar-item').forEach(i => i.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function showSnippets(id, btn) {
  ['productivity', 'text', 'mouse', 'windows'].forEach(s => {
    const el = document.getElementById('snip-' + s);
    if (el) el.style.display = (s === id) ? '' : 'none';
  });
  document.querySelectorAll('#snip-nav .sidebar-item').forEach(i => i.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// ── COPY BUTTON ─────────────────────────────────────────────

function copyCode(btn) {
  const pre = btn.parentElement.querySelector('pre');
  if (!pre) return;
  navigator.clipboard.writeText(pre.innerText).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('ok');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('ok'); }, 1800);
  });
}

// ── QUIZ ─────────────────────────────────────────────────────

const questions = [
  {
    q: "Which symbol is used for assignment in AHK v2?",
    opts: [":=", "=", "->", "=="], ans: 0,
    exp: ":= is the assignment operator. The legacy = from v1 is gone in v2."
  },
  {
    q: "How do you define a Ctrl+J hotkey in AHK v2?",
    opts: ["Ctrl+j::", "^j::", "!j::", "#j::"], ans: 1,
    exp: "^ is Ctrl. ! is Alt, + is Shift, # is the Win key."
  },
  {
    q: "What does #SingleInstance Force do?",
    opts: ["Disables the script", "Allows multiple instances", "Kills the previous instance on reload", "Requires admin rights"],
    ans: 2,
    exp: "Force automatically terminates the previous instance when a new one runs."
  },
  {
    q: "Arrays in AHK v2 are indexed starting at:",
    opts: ["0", "1", "-1", "Depends on declaration"], ans: 1,
    exp: "AHK v2 arrays are 1-indexed, unlike most programming languages!"
  },
  {
    q: "Which is valid fat-arrow syntax in AHK v2?",
    opts: ["fn = (x) -> x*2", "fn := (x) => x*2", "fn(x) { return x*2 }", "lambda fn(x) x*2"],
    ans: 1,
    exp: "Fat-arrow functions use => and are assigned with :="
  },
  {
    q: "What does the ~ modifier do on a hotkey?",
    opts: ["Makes it admin-only", "Fires on key release", "Passes the native function through too", "Makes it case-sensitive"],
    ans: 2,
    exp: "~ (tilde) means the key's native action also fires. ~^c still copies AND runs your code."
  },
  {
    q: "How do you get the active window's title in AHK v2?",
    opts: ["WinGetTitle()", "WinGetTitle('A')", "ActiveWindow.Title", "GetWindow('active')"],
    ans: 1,
    exp: "'A' is the special identifier for the active (foreground) window."
  },
  {
    q: "Which directive restricts hotkeys to a specific window?",
    opts: ["#If", "#HotIf", "#Window", "#Context"], ans: 1,
    exp: "#HotIf followed by an expression like WinActive() creates context-sensitive hotkeys."
  },
  {
    q: "What does StrSplit('a,b,c', ',') return?",
    opts: ['String "a b c"', 'Array ["a","b","c"]', 'Object {a:1,b:2,c:3}', 'Number 3'],
    ans: 1,
    exp: "StrSplit returns an Array object with the parts as elements."
  },
  {
    q: "When using while !PixelSearch(...), what does the loop do?",
    opts: [
      "Keeps clicking while the pixel exists",
      "Stops as soon as any pixel is found",
      "Waits until the pixel appears, then exits the loop",
      "Runs once regardless of pixel state"
    ],
    ans: 2,
    exp: "while !PixelSearch means 'keep looping while the pixel is NOT found'. Once it appears, !false = false, so the loop exits."
  },
  {
    q: "What does SendText() do differently from Send()?",
    opts: [
      "SendText is faster than Send",
      "SendText sends keys literally with no special key parsing",
      "SendText only works in Notepad",
      "SendText requires admin rights"
    ],
    ans: 1,
    exp: "SendText() sends every character literally. Send() interprets special sequences like {Enter}, ^c (Ctrl+C), etc. Use SendText when typing strings containing symbols like ! or ^."
  },
  {
    q: "Which function checks if a window is currently open?",
    opts: ["WinActivate()", "WinWait()", "WinExist()", "WinCheck()"],
    ans: 2,
    exp: "WinExist() returns a non-zero handle if the window is found, or 0 if not. It's the standard way to check before acting on a window."
  },
  {
    q: "Which function creates a new folder (including parent folders) in AHK v2?",
    opts: ["FolderCreate()", "MakeDir()", "DirCreate()", "FileCreateDir()"],
    ans: 2,
    exp: "DirCreate() is the AHK v2 function for creating directories. It creates all missing parent folders automatically."
  },
  {
    q: "In try/catch/else/finally, which block runs ONLY when no error was thrown?",
    opts: ["catch", "finally", "else", "try"],
    ans: 2,
    exp: "The 'else' block runs only when the try block completes without throwing. 'finally' always runs. 'catch' runs only when an error IS thrown."
  },
];

let qIdx = 0, score = 0, quizStarted = false, answered = false;

function startQuiz() {
  qIdx = 0; score = 0; quizStarted = true; answered = false;
  document.getElementById('quiz-area').style.display = '';
  document.getElementById('quiz-done').style.display = 'none';
  renderQuestion();
}

function renderQuestion() {
  answered = false;
  const q = questions[qIdx];
  document.getElementById('qq').textContent = q.q;
  document.getElementById('qnum').textContent = 'Question ' + (qIdx + 1) + ' of ' + questions.length;
  document.getElementById('qfill').style.width = ((qIdx + 1) / questions.length * 100) + '%';
  document.getElementById('qscore').textContent = score;

  const opts = document.getElementById('qopts');
  opts.innerHTML = '';
  q.opts.forEach((o, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = o;
    btn.onclick = () => checkAnswer(i, q);
    opts.appendChild(btn);
  });

  document.getElementById('qres').className = 'quiz-result';
  document.getElementById('qnext').className = 'quiz-next';
}

function checkAnswer(i, q) {
  if (answered) return;
  answered = true;
  const opts = document.querySelectorAll('.quiz-opt');
  opts.forEach((o, idx) => {
    o.onclick = null;
    if (idx === q.ans) o.classList.add('correct');
    else if (idx === i && i !== q.ans) o.classList.add('wrong');
  });
  if (i === q.ans) score++;
  const res = document.getElementById('qres');
  res.className = 'quiz-result show ' + (i === q.ans ? 'ok' : 'fail');
  res.textContent = (i === q.ans ? '✓ Correct! ' : '✗ Not quite. ') + q.exp;
  const nxt = document.getElementById('qnext');
  nxt.className = 'quiz-next show';
  nxt.textContent = (qIdx < questions.length - 1) ? 'Next question →' : 'See results →';
}

function nextQuestion() {
  qIdx++;
  if (qIdx >= questions.length) {
    document.getElementById('quiz-area').style.display = 'none';
    document.getElementById('quiz-done').style.display = '';
    document.getElementById('final-score').textContent = score;
    const msgs = [
      'Keep at it — review the fundamentals and try again!',
      'Getting there! Focus on the intermediate topics.',
      'Good work! Tackle the advanced sections next.',
      'Excellent! You really know your AHK v2.',
      "Perfect score! You're an AHK v2 expert."
    ];
    const msgIdx = score <= 2 ? 0 : score <= 5 ? 1 : score <= 7 ? 2 : score <= 9 ? 3 : 4;
    document.getElementById('final-msg').textContent = msgs[msgIdx];
  } else {
    renderQuestion();
  }
}

// ── PLAYGROUND TEMPLATES ──────────────────────────────────────

const templates = {
  hello: `; Hello World
name := "World"
MsgBox("Hello, " . name . "!")`,

  vars: `; Variables & Math
x := 10
y := 3
MsgBox("Sum: " . (x + y))
MsgBox("Product: " . (x * y))
MsgBox("Power: " . (x ** y))
MsgBox("Mod: " . Mod(x, y))`,

  string: `; String Operations
text := "AutoHotkey v2"
MsgBox("Length: " . StrLen(text))
MsgBox("Upper: " . StrUpper(text))
MsgBox("First 10 chars: " . SubStr(text, 1, 10))
found := InStr(text, "v2")
MsgBox("Contains v2: " . (found ? "Yes (pos " . found . ")" : "No"))`,

  loop: `; Loop example
total := 0
Loop 5 {
    total += A_Index
    MsgBox("A_Index = " . A_Index . "  running total = " . total)
}
MsgBox("Final total: " . total)`,

  ternary: `; Conditionals
age := 20
status := (age >= 18) ? "adult" : "minor"
MsgBox("Status: " . status)

x := 42
if (x > 100) {
    MsgBox("Big")
} else if (x > 10) {
    MsgBox("Medium: " . x)
} else {
    MsgBox("Small")
}`,

  array: `; Arrays (1-indexed)
fruits := ["Apple", "Banana", "Cherry"]
MsgBox("First: " . fruits[1])
MsgBox("Count: " . fruits.Length)
fruits.Push("Date")
MsgBox("After push, count: " . fruits.Length)
For i, fruit in fruits {
    MsgBox(i . ": " . fruit)
}`,

  pixel: `; Pixel condition simulation
; In real AHK this would be PixelSearch()
; Here we simulate with a counter

found := false
attempts := 0

Loop 5 {
    attempts++
    ; Simulate: pixel found on 3rd attempt
    if (A_Index >= 3) {
        found := true
        break
    }
    MsgBox("Attempt " . attempts . ": pixel not found yet, retrying...")
}

if found {
    MsgBox("Pixel found after " . attempts . " attempts! Clicking now.")
} else {
    MsgBox("Pixel never appeared after " . attempts . " attempts.")
}`
};

function loadTemplate(key) {
  if (!key) return;
  document.getElementById('pg-code').value = templates[key];
  document.getElementById('pg-template').value = '';
}

function clearPg() {
  document.getElementById('pg-code').value = '';
  const out = document.getElementById('pg-out');
  out.innerHTML = '<span style="color:var(--text3)">Press Run to see output…</span>';
}

// ── SIMULATOR ────────────────────────────────────────────────
/*
  Fully rewritten interpreter. Handles:
  - Variable assignment (:=) and compound (+=, -=, *=, /=, .=, ++, --)
  - MsgBox(), ToolTip() → output panel
  - String concatenation with .
  - Arithmetic (+, -, *, /, //, **, Mod)
  - Comparison (=, ==, !=, !==, <, >, <=, >=)
  - Logical (&& / and, || / or, !)
  - Ternary (cond ? a : b)
  - if / else if / else
  - Loop N { }
  - While (cond) { }
  - For k, v in array { }
  - Array literals [a, b, c], indexing arr[n], arr.Length, arr.Push(), arr.Pop()
  - Built-in functions: StrLen, StrUpper, StrLower, Trim, SubStr, InStr,
    StrReplace, StrSplit, Mod, Abs, Round, Floor, Ceil, Sqrt,
    Integer, Float, String, Max, Min, Format, IsSet
  - A_Index inside loops
*/

function runSim() {
  const code = document.getElementById('pg-code').value;
  const outEl = document.getElementById('pg-out');
  const output = [];

  try {
    const interp = new AHKInterpreter();
    interp.run(code, output);
    if (output.length === 0) {
      outEl.innerHTML = '<span style="color:var(--text3)">Script ran with no MsgBox output.</span>';
    } else {
      outEl.innerHTML = output
        .map(m => `<div class="pg-msg">${esc(String(m))}</div>`)
        .join('');
    }
  } catch (e) {
    outEl.innerHTML = `<span class="pg-error">❌ ${esc(e.message)}</span>`;
  }
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── AHK Interpreter Class ────────────────────────────────────

class AHKInterpreter {
  constructor() {
    this.vars = {};
    this.output = [];
    this.stepCount = 0;
    this.MAX_STEPS = 5000;
    this.MAX_OUTPUT = 30;
  }

  run(code, outputArr) {
    this.output = outputArr;
    const lines = this.tokenize(code);
    this.execLines(lines, 0, lines.length);
  }

  // Strip comments, handle line continuations, return clean line array
  tokenize(code) {
    const raw = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = [];
    for (const line of raw.split('\n')) {
      const stripped = line.replace(/\s*;.*$/, '').trim();
      if (stripped && !stripped.startsWith('#')) lines.push(stripped);
    }
    return lines;
  }

  step() {
    this.stepCount++;
    if (this.stepCount > this.MAX_STEPS) throw new Error('Step limit reached (infinite loop?)');
  }

  // Execute a slice of lines (from index s to e exclusive)
  execLines(lines, s, e) {
    let i = s;
    while (i < e) {
      this.step();
      const line = lines[i];
      if (!line || line === '{' || line === '}') { i++; continue; }

      // ── if / else if / else ──
      if (/^if\s*\(/i.test(line)) {
        const result = this.handleIf(lines, i, e);
        i = result.next;
        continue;
      }

      // ── Loop N ──
      const loopM = line.match(/^Loop\s+(.+?)\s*\{?\s*$/i);
      if (loopM && !/^Loop\s+(Files|Read|Parse)/i.test(line)) {
        const count = Math.min(Math.max(0, Math.floor(Number(this.evalExpr(loopM[1])))), 200);
        const block = this.findBlock(lines, i);
        const saved = this.vars.A_Index;
        for (let n = 1; n <= count && this.output.length < this.MAX_OUTPUT; n++) {
          this.vars.A_Index = n;
          this.execLines(lines, block.start, block.end);
        }
        this.vars.A_Index = saved;
        i = block.after;
        continue;
      }

      // ── While ──
      const whileM = line.match(/^While\s*\((.+)\)\s*\{?\s*$/i);
      if (whileM) {
        const block = this.findBlock(lines, i);
        let safety = 0;
        while (this.isTruthy(this.evalExpr(whileM[1])) && safety++ < 500 && this.output.length < this.MAX_OUTPUT) {
          this.execLines(lines, block.start, block.end);
        }
        i = block.after;
        continue;
      }

      // ── For k, v in arr ──
      const forM = line.match(/^For\s+(\w+)(?:\s*,\s*(\w+))?\s+in\s+(.+?)\s*\{?\s*$/i);
      if (forM) {
        const [, kVar, vVar, arrExpr] = forM;
        const block = this.findBlock(lines, i);
        const arr = this.evalExpr(arrExpr);
        if (Array.isArray(arr)) {
          arr.forEach((item, idx) => {
            this.vars[kVar] = idx + 1;
            if (vVar) this.vars[vVar] = item;
            this.execLines(lines, block.start, block.end);
          });
        } else if (arr && typeof arr === 'object') {
          let idx = 1;
          for (const [k, v] of Object.entries(arr)) {
            this.vars[kVar] = k;
            if (vVar) this.vars[vVar] = v;
            idx++;
            this.execLines(lines, block.start, block.end);
          }
        }
        i = block.after;
        continue;
      }

      // ── break / continue ──
      if (line === 'break') throw new BreakSignal();
      if (line === 'continue') throw new ContinueSignal();

      // ── MsgBox / ToolTip ──
      const msgM = line.match(/^(?:MsgBox|ToolTip)\s*\((.+)\)\s*$/i);
      if (msgM) {
        if (this.output.length < this.MAX_OUTPUT) {
          const args = this.splitArgs(msgM[1]);
          const val = this.evalExpr(args[0]);
          this.output.push('📢 ' + val);
        }
        i++; continue;
      }

      // ── Array method calls: arr.Push(x) ──
      const pushM = line.match(/^(\w+)\s*\.\s*Push\s*\((.+)\)\s*$/i);
      if (pushM) {
        const arr = this.vars[pushM[1]];
        if (Array.isArray(arr)) arr.push(this.evalExpr(pushM[2]));
        i++; continue;
      }
      const popM = line.match(/^(\w+)\s*\.\s*Pop\s*\(\)\s*$/i);
      if (popM) {
        const arr = this.vars[popM[1]];
        if (Array.isArray(arr)) arr.pop();
        i++; continue;
      }

      // ── Compound assignment ──
      const compM = line.match(/^(\w+)\s*(\+=|-=|\*=|\/=|\.=|\/\/=|\*\*=)\s*(.+)$/);
      if (compM) {
        const [, name, op, rhs] = compM;
        const r = this.evalExpr(rhs);
        const cur = this.vars[name] !== undefined ? this.vars[name] : 0;
        switch (op) {
          case '+=': this.vars[name] = Number(cur) + Number(r); break;
          case '-=': this.vars[name] = Number(cur) - Number(r); break;
          case '*=': this.vars[name] = Number(cur) * Number(r); break;
          case '/=': this.vars[name] = Number(cur) / Number(r); break;
          case '.=': this.vars[name] = String(cur) + String(r); break;
          case '//=': this.vars[name] = Math.floor(Number(cur) / Number(r)); break;
          case '**=': this.vars[name] = Math.pow(Number(cur), Number(r)); break;
        }
        i++; continue;
      }

      // ── Increment / Decrement ──
      const incM = line.match(/^(\w+)(\+\+|--)$/);
      if (incM) {
        const v = Number(this.vars[incM[1]] || 0);
        this.vars[incM[1]] = incM[2] === '++' ? v + 1 : v - 1;
        i++; continue;
      }
      const preIncM = line.match(/^(\+\+|--)(\w+)$/);
      if (preIncM) {
        const v = Number(this.vars[preIncM[2]] || 0);
        this.vars[preIncM[2]] = preIncM[1] === '++' ? v + 1 : v - 1;
        i++; continue;
      }

      // ── Assignment: var := expr ──
      const assignM = line.match(/^(\w+)\s*:=\s*(.+)$/);
      if (assignM) {
        this.vars[assignM[1]] = this.evalExpr(assignM[2]);
        i++; continue;
      }

      // ── Array element assignment: arr[n] := expr ──
      const arrAssignM = line.match(/^(\w+)\s*\[(.+)\]\s*:=\s*(.+)$/);
      if (arrAssignM) {
        const arr = this.vars[arrAssignM[1]];
        if (Array.isArray(arr)) {
          const idx = Number(this.evalExpr(arrAssignM[2])) - 1;
          arr[idx] = this.evalExpr(arrAssignM[3]);
        }
        i++; continue;
      }

      // Unknown line — skip
      i++;
    }
  }

  // ── if/else if/else handler ────────────────────────────────
  handleIf(lines, start, end) {
    let i = start;
    let executed = false;

    while (i < end) {
      const line = lines[i];
      const ifM = line.match(/^(?:else\s+)?if\s*\((.+)\)\s*\{?\s*$/i);
      const elseOnlyM = /^else\s*\{?\s*$/.test(line);

      if (ifM) {
        const block = this.findBlock(lines, i);
        if (!executed && this.isTruthy(this.evalExpr(ifM[1]))) {
          this.execLines(lines, block.start, block.end);
          executed = true;
        }
        i = block.after;
        // Peek ahead for else if / else
        if (i < end && /^(?:else\s+if|else)\b/i.test(lines[i])) continue;
        break;
      } else if (elseOnlyM) {
        const block = this.findBlock(lines, i);
        if (!executed) {
          this.execLines(lines, block.start, block.end);
        }
        i = block.after;
        break;
      } else {
        break;
      }
    }
    return { next: i };
  }

  // ── Find the { } block starting at or after line i ──────────
  findBlock(lines, startLine) {
    let i = startLine;
    // The opening { might be on this line or the next
    if (!lines[i].endsWith('{')) {
      i++; // move to next line which should be {
    }
    // Now skip past the {
    if (lines[i] === '{' || lines[i].endsWith('{')) i++;

    const blockStart = i;
    let depth = 0;

    while (i < lines.length) {
      const l = lines[i];
      if (l === '{' || l.endsWith('{')) depth++;
      if (l === '}' || l.startsWith('}')) {
        if (depth === 0) {
          return { start: blockStart, end: i, after: i + 1 };
        }
        depth--;
      }
      i++;
    }
    return { start: blockStart, end: i, after: i };
  }

  // ── Split function arguments respecting nesting ──────────────
  splitArgs(s) {
    const args = [];
    let depth = 0, cur = '', inDQ = false, inSQ = false;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '"' && !inSQ) { inDQ = !inDQ; cur += c; continue; }
      if (c === "'" && !inDQ) { inSQ = !inSQ; cur += c; continue; }
      if (!inDQ && !inSQ) {
        if (c === '(' || c === '[') { depth++; cur += c; continue; }
        if (c === ')' || c === ']') { depth--; cur += c; continue; }
        if (c === ',' && depth === 0) { args.push(cur.trim()); cur = ''; continue; }
      }
      cur += c;
    }
    if (cur.trim()) args.push(cur.trim());
    return args;
  }

  isTruthy(v) {
    if (v === false || v === 0 || v === '' || v === null || v === undefined) return false;
    if (typeof v === 'string' && (v === '0' || v.trim() === '')) return false;
    return true;
  }

  // ── Expression Evaluator ─────────────────────────────────────
  evalExpr(expr) {
    expr = String(expr).trim();
    if (!expr) return '';

    // ── String literals ──
    if ((expr.startsWith('"') && expr.endsWith('"')) ||
      (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.slice(1, -1);
    }

    // ── Boolean ──
    if (expr === 'true') return true;
    if (expr === 'false') return false;

    // ── Hex ──
    if (/^0x[\da-fA-F]+$/i.test(expr)) return parseInt(expr, 16);

    // ── Plain number ──
    if (/^-?\d+(\.\d+)?$/.test(expr)) return parseFloat(expr);

    // ── Parenthesized ──
    if (expr.startsWith('(') && this.matchingParen(expr, 0) === expr.length - 1) {
      return this.evalExpr(expr.slice(1, -1));
    }

    // ── Array literal ──
    if (expr.startsWith('[') && expr.endsWith(']')) {
      const inner = expr.slice(1, -1).trim();
      if (!inner) return [];
      return this.splitArgs(inner).map(a => this.evalExpr(a));
    }

    // ── Ternary (lowest precedence) — find ? not inside parens/strings ──
    const ternary = this.findTernary(expr);
    if (ternary) {
      const cond = this.evalExpr(ternary.cond);
      return this.isTruthy(cond) ? this.evalExpr(ternary.yes) : this.evalExpr(ternary.no);
    }

    // ── Logical OR ──
    const orIdx = this.findBinaryOp(expr, ['||', ' or ', ' Or ', ' OR ']);
    if (orIdx !== -1) {
      const left = this.evalExpr(expr.slice(0, orIdx).trimEnd());
      if (this.isTruthy(left)) return left;
      return this.evalExpr(expr.slice(orIdx + (expr[orIdx] === '|' ? 2 : expr.slice(orIdx).match(/^ or /i)[0].length)).trimStart());
    }

    // ── Logical AND ──
    const andIdx = this.findBinaryOp(expr, ['&&', ' and ', ' And ', ' AND ']);
    if (andIdx !== -1) {
      const left = this.evalExpr(expr.slice(0, andIdx).trimEnd());
      if (!this.isTruthy(left)) return false;
      return this.evalExpr(expr.slice(andIdx + (expr[andIdx] === '&' ? 2 : expr.slice(andIdx).match(/^ and /i)[0].length)).trimStart());
    }

    // ── Logical NOT ──
    if (expr.startsWith('!') && !expr.startsWith('!=')) {
      return !this.isTruthy(this.evalExpr(expr.slice(1)));
    }

    // ── Comparison operators ──
    for (const op of ['===', '!==', '==', '!=', '>=', '<=', '>', '<']) {
      const idx = this.findBinaryOp(expr, [op]);
      if (idx !== -1) {
        const left = this.evalExpr(expr.slice(0, idx).trim());
        const right = this.evalExpr(expr.slice(idx + op.length).trim());
        switch (op) {
          case '==': case '===': return this.ahkEqual(left, right);
          case '!=': case '!==': return !this.ahkEqual(left, right);
          case '>': return Number(left) > Number(right);
          case '<': return Number(left) < Number(right);
          case '>=': return Number(left) >= Number(right);
          case '<=': return Number(left) <= Number(right);
        }
      }
    }

    // ── String concatenation with . ──
    const dotIdx = this.findBinaryOp(expr, [' . ']);
    if (dotIdx !== -1) {
      const left = this.evalExpr(expr.slice(0, dotIdx).trim());
      const right = this.evalExpr(expr.slice(dotIdx + 3).trim());
      return String(left) + String(right);
    }

    // ── Arithmetic: additive (+, -) ──
    const addIdx = this.findAddSub(expr);
    if (addIdx !== null) {
      const op = expr[addIdx];
      const left = this.evalExpr(expr.slice(0, addIdx).trim());
      const right = this.evalExpr(expr.slice(addIdx + 1).trim());
      return op === '+' ? Number(left) + Number(right) : Number(left) - Number(right);
    }

    // ── Arithmetic: multiplicative (*, /, //, **)  ──
    for (const op of ['**', '//', '*', '/']) {
      const idx = this.findBinaryOp(expr, [op]);
      if (idx !== -1) {
        const left = this.evalExpr(expr.slice(0, idx).trim());
        const right = this.evalExpr(expr.slice(idx + op.length).trim());
        switch (op) {
          case '**': return Math.pow(Number(left), Number(right));
          case '//': return Math.floor(Number(left) / Number(right));
          case '*': return Number(left) * Number(right);
          case '/': return Number(left) / Number(right);
        }
      }
    }

    // ── Unary minus ──
    if (expr.startsWith('-') && !expr.startsWith('--')) {
      return -Number(this.evalExpr(expr.slice(1)));
    }

    // ── Function call ──
    const fnM = expr.match(/^([A-Za-z_]\w*)\s*\((.*)\)$/s);
    if (fnM) {
      return this.callBuiltin(fnM[1], fnM[2]);
    }

    // ── Array/map index: arr[expr] ──
    const idxM = expr.match(/^([A-Za-z_]\w*)\s*\[(.+)\]$/);
    if (idxM) {
      const container = this.vars[idxM[1]];
      const key = this.evalExpr(idxM[2]);
      if (Array.isArray(container)) return container[Number(key) - 1];
      if (container && typeof container === 'object') return container[key];
      return '';
    }

    // ── Property access: obj.prop ──
    const propM = expr.match(/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)$/);
    if (propM) {
      const obj = this.vars[propM[1]];
      const prop = propM[2];
      if (Array.isArray(obj)) {
        if (prop === 'Length') return obj.length;
        if (prop === 'MaxIndex') return obj.length;
        return '';
      }
      if (obj && typeof obj === 'object') return obj[prop] !== undefined ? obj[prop] : '';
      return '';
    }

    // ── Built-in A_ variables ──
    const aVars = {
      A_ScriptDir: 'C:\\Scripts',
      A_AppData: 'C:\\Users\\User\\AppData\\Roaming',
      A_Desktop: 'C:\\Users\\User\\Desktop',
      A_Now: new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14),
      A_TickCount: Date.now(),
      A_ScreenWidth: 1920,
      A_ScreenHeight: 1080,
      A_UserName: 'User',
      A_WinDir: 'C:\\Windows',
      A_Clipboard: '',
    };
    if (expr in aVars) return aVars[expr];
    if (expr === 'A_Index') return this.vars.A_Index !== undefined ? this.vars.A_Index : 0;

    // ── Variable lookup ──
    if (/^[A-Za-z_]\w*$/.test(expr)) {
      return this.vars[expr] !== undefined ? this.vars[expr] : '';
    }

    return expr;
  }

  ahkEqual(a, b) {
    // AHK comparisons are case-insensitive for strings
    if (typeof a === 'string' && typeof b === 'string')
      return a.toLowerCase() === b.toLowerCase();
    return a == b; // eslint-disable-line eqeqeq
  }

  // Find matching closing paren starting at position i
  matchingParen(s, i) {
    let depth = 0, inDQ = false, inSQ = false;
    for (let j = i; j < s.length; j++) {
      const c = s[j];
      if (c === '"' && !inSQ) { inDQ = !inDQ; continue; }
      if (c === "'" && !inDQ) { inSQ = !inSQ; continue; }
      if (inDQ || inSQ) continue;
      if (c === '(') depth++;
      if (c === ')') { depth--; if (depth === 0) return j; }
    }
    return -1;
  }

  // Find ternary ? and : at top level
  findTernary(expr) {
    let depth = 0, inDQ = false, inSQ = false, qIdx = -1;
    for (let i = 0; i < expr.length; i++) {
      const c = expr[i];
      if (c === '"' && !inSQ) { inDQ = !inDQ; continue; }
      if (c === "'" && !inDQ) { inSQ = !inSQ; continue; }
      if (inDQ || inSQ) continue;
      if (c === '(' || c === '[') depth++;
      if (c === ')' || c === ']') depth--;
      if (depth === 0 && c === '?' && qIdx === -1) qIdx = i;
    }
    if (qIdx === -1) return null;
    // Find matching : after qIdx
    depth = 0; inDQ = false; inSQ = false;
    for (let i = qIdx + 1; i < expr.length; i++) {
      const c = expr[i];
      if (c === '"' && !inSQ) { inDQ = !inDQ; continue; }
      if (c === "'" && !inDQ) { inSQ = !inSQ; continue; }
      if (inDQ || inSQ) continue;
      if (c === '(' || c === '[') depth++;
      if (c === ')' || c === ']') depth--;
      if (depth === 0 && c === ':') {
        return {
          cond: expr.slice(0, qIdx).trim(),
          yes: expr.slice(qIdx + 1, i).trim(),
          no: expr.slice(i + 1).trim()
        };
      }
    }
    return null;
  }

  // Find a binary operator at the top level (respects nesting & strings)
  findBinaryOp(expr, ops) {
    let depth = 0, inDQ = false, inSQ = false;
    // Scan right-to-left for left-associativity
    for (let i = expr.length - 1; i >= 0; i--) {
      const c = expr[i];
      if (c === '"' && !inSQ) { inDQ = !inDQ; }
      if (c === "'" && !inDQ) { inSQ = !inSQ; }
      if (inDQ || inSQ) continue;
      if (c === ')' || c === ']') depth++;
      if (c === '(' || c === '[') depth--;
      if (depth !== 0) continue;
      for (const op of ops) {
        if (expr.slice(i, i + op.length) === op && i > 0) {
          return i;
        }
      }
    }
    return -1;
  }

  // Find + or - that is not part of **, //, unary
  findAddSub(expr) {
    let depth = 0, inDQ = false, inSQ = false;
    for (let i = expr.length - 1; i > 0; i--) {
      const c = expr[i];
      if (c === '"' && !inSQ) { inDQ = !inDQ; }
      if (c === "'" && !inDQ) { inSQ = !inSQ; }
      if (inDQ || inSQ) continue;
      if (c === ')' || c === ']') depth++;
      if (c === '(' || c === '[') depth--;
      if (depth !== 0) continue;
      if ((c === '+' || c === '-') &&
        expr[i - 1] !== '*' && expr[i - 1] !== '/' &&
        expr[i + 1] !== '+' && expr[i + 1] !== '-' &&
        expr[i - 1] !== '+' && expr[i - 1] !== '-') {
        return i;
      }
    }
    return null;
  }

  // ── Built-in Functions ───────────────────────────────────────
  callBuiltin(name, argsRaw) {
    const args = argsRaw.trim() ? this.splitArgs(argsRaw).map(a => this.evalExpr(a)) : [];

    const builtins = {
      StrLen: ([s]) => String(s).length,
      StrUpper: ([s]) => String(s).toUpperCase(),
      StrLower: ([s]) => String(s).toLowerCase(),
      Trim: ([s]) => String(s).trim(),
      LTrim: ([s]) => String(s).trimStart(),
      RTrim: ([s]) => String(s).trimEnd(),
      SubStr: ([s, p, l]) => {
        const str = String(s);
        const pos = Number(p);
        const start = pos > 0 ? pos - 1 : Math.max(0, str.length + pos);
        return l !== undefined ? str.substr(start, Number(l)) : str.substr(start);
      },
      InStr: ([s, n, cs, start]) => {
        const str = String(s), needle = String(n);
        const from = start ? Number(start) - 1 : 0;
        const idx = cs ? str.indexOf(needle, from) : str.toLowerCase().indexOf(needle.toLowerCase(), from);
        return idx >= 0 ? idx + 1 : 0;
      },
      StrReplace: ([s, a, b]) => String(s).split(String(a)).join(b !== undefined ? String(b) : ''),
      StrSplit: ([s, d]) => String(s).split(String(d)),
      Mod: ([a, b]) => Number(a) % Number(b),
      Abs: ([n]) => Math.abs(Number(n)),
      Round: ([n, p]) => p ? parseFloat(Number(n).toFixed(Number(p))) : Math.round(Number(n)),
      Floor: ([n]) => Math.floor(Number(n)),
      Ceil: ([n]) => Math.ceil(Number(n)),
      Sqrt: ([n]) => Math.sqrt(Number(n)),
      Integer: ([s]) => parseInt(s),
      Float: ([s]) => parseFloat(s),
      String: ([n]) => String(n),
      Max: (a) => Math.max(...a.map(Number)),
      Min: (a) => Math.min(...a.map(Number)),
      IsSet: ([v]) => v !== undefined && v !== '',
      Chr: ([n]) => String.fromCharCode(Number(n)),
      Ord: ([s]) => String(s).charCodeAt(0),
      Format: ([fmt, ...vals]) => {
        let r = String(fmt), vi = 0;
        r = r.replace(/\{[^}]*\}/g, () => vi < vals.length ? vals[vi++] : '');
        return r;
      },
      MsgBox: ([text]) => { if (this.output.length < this.MAX_OUTPUT) this.output.push('📢 ' + String(text)); return 1; },
      ToolTip: ([text]) => { if (this.output.length < this.MAX_OUTPUT) this.output.push('💬 ' + String(text)); return ''; },
      // Simulated pixel search — always returns 0 (not found) in simulator
      PixelSearch: () => 0,
      PixelGetColor: () => 0,
    };

    const fn = builtins[name];
    if (fn) return fn(args);

    // Unknown function — return empty
    return '';
  }
}

class BreakSignal extends Error { constructor() { super('break'); } }
class ContinueSignal extends Error { constructor() { super('continue'); } }

// ── PROGRESS ─────────────────────────────────────────────────

const progState = Array(13).fill(false);

function toggleProg(n) {
  progState[n] = !progState[n];
  const check = document.getElementById('prog-' + n);
  const label = document.getElementById('prog-label-' + n);
  if (!check || !label) return;
  check.classList.toggle('done', progState[n]);
  check.innerHTML = progState[n] ? '✓' : '';
  label.classList.toggle('done', progState[n]);
  const done = progState.filter(Boolean).length;
  const pct = Math.round(done / progState.length * 100);
  document.getElementById('overall-bar').style.width = pct + '%';
  document.getElementById('overall-pct').textContent = pct + '%';
}

// ── INIT ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('learn-nav').style.display = '';
  document.getElementById('ref-nav').style.display = 'none';
  document.getElementById('snip-nav').style.display = 'none';

  // Load intro lesson on startup via the dynamic section loader
  showSection('learn');
});