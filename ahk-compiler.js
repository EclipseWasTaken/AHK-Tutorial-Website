//  Variables    x := expr          →  let x = expr;
//  Compound     x += / -= / *= … n →  x += n; etc.
//  Increment    x++ / ++x / x--   →  x++; etc.
//  MsgBox(v)    →  __out(value);   (captured into output array)
//  ToolTip(v)   →  __out(value);
//  if / else if / else   (with braces)
//  Loop N { }            →  for (let A_Index = 1; A_Index <= N; A_Index++)
//  While (cond) { }      →  while (cond)
//  For k, v in arr { }   →  for (let [__k, k, v] of arr.entries())
//  break / continue      →  break; / continue;
//  Array literals        →  JS arrays (1-indexed helpers kept)
//  arr.Push(x) / arr.Pop()
//  Built-in funcs: StrLen/StrUpper/StrLower/Trim/SubStr/InStr/StrReplace/
//                  StrSplit/Mod/Abs/Round/Floor/Ceil/Sqrt/Chr/Ord/Format/
//                  Integer/Float/String/Max/Min/IsSet
//  String concat   " . "  →  " + "
//  AHK operators   = (loose eq) → ==,  == (strict) → ===,  and/or → &&/||
//  A_ built-in variables  →  __AHK constant map lookup
//  Comments  ;...  stripped
//  Directives #...  stripped

class AHKCompiler {
  constructor() {
    this._indent = 0;
  }

  // takes raw AHK source and spits out runnable JS
  compile(sourceCode) {
    const lines = this._preprocess(sourceCode);
    const js = this._emitPreamble() + '\n' + this._compileLines(codeLines) + '\n' + this._emitPostamble();
    return js;
  }

  // strip out AHK comments (;), blank lines, and directives (#) before compiling
  _preprocess(sourceCode) {
    return sourceCode
      .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      .split('\n')
      .map(line => {
        let inDoubleQuotes = false, inSingleQuotes = false;
        for (let charIndex = 0; charIndex < line.length; charIndex++) {
          const character = line[charIndex];
          if (character === '"' && !inSingleQuotes) inDoubleQuotes = !inDoubleQuotes;
          if (character === "'" && !inDoubleQuotes) inSingleQuotes = !inSingleQuotes;
          if (!inDoubleQuotes && !inSingleQuotes && character === ';') return line.slice(0, charIndex).trimEnd();
        }
        return line;
      })
      .filter(line => {
        const trimmedLine = line.trim();
        return trimmedLine.length > 0 && !trimmedLine.startsWith('#');
      });
  }

  // this provides all the JS definitions needed to make the compiled AHK work.
  _emitPreamble() {
    return `// ── AHK → JS  (compiled by AHKCompiler) ──
const __output = [];
function __out(value) { __output.push(String(value)); }
const __AHK = {
  A_ScriptDir:  'C:\\\\Scripts',
  A_AppData:    'C:\\\\Users\\\\User\\\\AppData\\\\Roaming',
  A_Desktop:    'C:\\\\Users\\\\User\\\\Desktop',
  A_Now:        new Date().toISOString().replace(/[-:T.Z]/g,'').slice(0,14),
  A_TickCount:  Date.now(),
  A_ScreenWidth: 1920, A_ScreenHeight: 1080,
  A_UserName:   'User', A_WinDir: 'C:\\\\Windows',
  A_Clipboard:  '',
};
function StrLen(string)           { return String(string).length; }
function StrUpper(string)         { return String(string).toUpperCase(); }
function StrLower(string)         { return String(string).toLowerCase(); }
function Trim(string)             { return String(string).trim(); }
function LTrim(string)            { return String(string).trimStart(); }
function RTrim(string)            { return String(string).trimEnd(); }
function SubStr(string, position, length)       { const inputStr = String(string),pos = Number(position),startIdx = pos > 0 ? pos - 1 : Math.max(0, inputStr.length + pos); return length !== undefined ? inputStr.substr(startIdx, Number(length)) : inputStr.substr(startIdx); }
function InStr(string, needle, caseSensitive, fromPosition)  { const inputStr = String(string),searchNeedle = String(needle),startFrom = fromPosition ? Number(fromPosition) - 1 : 0; const foundIdx = caseSensitive ? inputStr.indexOf(searchNeedle, startFrom) : inputStr.toLowerCase().indexOf(searchNeedle.toLowerCase(), startFrom); return foundIdx >= 0 ? foundIdx + 1 : 0; }
function StrReplace(string, searchFor, replaceWith)   { return String(string).split(String(searchFor)).join(replaceWith !== undefined ? String(replaceWith) : ''); }
function StrSplit(string, delimiter)       { return String(string).split(String(delimiter)); }
function Mod(number1, number2)            { return Number(number1) % Number(number2); }
function Abs(number)              { return Math.abs(Number(number)); }
function Round(number, precision)          { return precision ? parseFloat(Number(number).toFixed(Number(precision))) : Math.round(Number(number)); }
function Floor(number)            { return Math.floor(Number(number)); }
function Ceil(number)             { return Math.ceil(Number(number)); }
function Sqrt(number)             { return Math.sqrt(Number(number)); }
function Integer(string)          { return parseInt(string); }
function Float(string)            { return parseFloat(string); }
function String(value)           { return value === undefined ? '' : '' + value; }
function Max(...numbers)           { return Math.max(...numbers.map(Number)); }
function Min(...numbers)           { return Math.min(...numbers.map(Number)); }
function Chr(charCode)              { return String.fromCharCode(Number(charCode)); }
function Ord(string)              { return String(string).charCodeAt(0); }
function IsSet(value)            { return value !== undefined && value !== ''; }
function Format(formatString, ...values) { let resultStr = String(formatString),valueIndex = 0; return resultStr.replace(/\\{[^}]*\\}/g, () => valueIndex < values.length ? values[valueIndex++] : ''); }
function MsgBox(value)           { __out(value); }
function ToolTip(value)          { __out(value); }
// ──────────────────────────────────────────────────────────────`;
  }

  _emitPostamble() {
    return `// end of script`;
  }

  // walks through each AHK line and converts it to the JS equivalent
  _compileLines(codeLines) {
    const outputLines = [];
    let lineIndex = 0;

    while (lineIndex < codeLines.length) {
      const currentLine = codeLines[lineIndex].trim();
      if (!currentLine || currentLine === '{' || currentLine === '}') { lineIndex++; continue; }

      // convert AHK if/else if/else blocks to JS
      if (/^if\s*\(/i.test(currentLine) || /^else\s+if\s*\(/i.test(currentLine)) {
        const result = this._compileIf(codeLines, lineIndex);
        outputLines.push(result.code);
        lineIndex = result.next;
        continue;
      }
      if (/^else\s*\{?$/i.test(currentLine)) {
        const block = this._findBlock(codeLines, lineIndex);
        const body = this._compileBlock(codeLines, block.start, block.end);
        outputLines.push(this._ind() + 'else {');
        outputLines.push(body);
        outputLines.push(this._ind() + '}');
        lineIndex = block.after;
        continue;
      }

      // convert AHK Loop N to JS for-loop with A_Index
      const loopMatch = currentLine.match(/^Loop\s+(.+?)\s*\{?\s*$/i);
      if (loopMatch && !/^Loop\s+(Files|Read|Parse)/i.test(currentLine)) {
        const countExpression = this._translateExpr(loopMatch[1]);
        const block = this._findBlock(codeLines, lineIndex);
        this._indent++;
        const body = this._compileBlock(codeLines, block.start, block.end);
        this._indent--;
        outputLines.push(this._ind() + `for (let A_Index = 1; A_Index <= ${countExpression}; A_Index++) {`);
        outputLines.push(body);
        outputLines.push(this._ind() + '}');
        lineIndex = block.after;
        continue;
      }

      // convert AHK While to JS while
      const whileMatch = currentLine.match(/^While\s*\((.+)\)\s*\{?\s*$/i);
      if (whileMatch) {
        const condition = this._translateExpr(whileMatch[1]);
        const block = this._findBlock(codeLines, lineIndex);
        this._indent++;
        const body = this._compileBlock(codeLines, block.start, block.end);
        this._indent--;
        outputLines.push(this._ind() + `while (${condition}) {`);
        outputLines.push(body);
        outputLines.push(this._ind() + '}');
        lineIndex = block.after;
        continue;
      }

      // convert AHK For k,v in arr to JS for-of with 1-indexed keys
      const forMatch = currentLine.match(/^For\s+(\w+)(?:\s*,\s*(\w+))?\s+in\s+(.+?)\s*\{?\s*$/i);
      if (forMatch) {
        const [, keyVariable, valueVariable, arrayExpression] = forMatch;
        const block = this._findBlock(codeLines, lineIndex);
        this._indent++;
        const body = this._compileBlock(codeLines, block.start, block.end);
        this._indent--;
        const javascriptArray = this._translateExpr(arrayExpression);
        if (valueVariable) {
          outputLines.push(this._ind() + `for (let [__i${keyVariable}, ${valueVariable}] of (${javascriptArray}).entries()) { let ${keyVariable} = __i${keyVariable} + 1;`);
        } else {
          outputLines.push(this._ind() + `for (let [__i${keyVariable}, ${keyVariable}] of (${javascriptArray}).entries()) {`);
        }
        outputLines.push(body);
        outputLines.push(this._ind() + '}');
        lineIndex = block.after;
        continue;
      }

      // convert AHK break/continue to JS (same keywords, just add semicolons)
      if (/^break$/i.test(currentLine)) { outputLines.push(this._ind() + 'break;'); lineIndex++; continue; }
      if (/^continue$/i.test(currentLine)) { outputLines.push(this._ind() + 'continue;'); lineIndex++; continue; }

      // convert AHK MsgBox/ToolTip to __out() so we can capture the scriptOutput
      const messageMatch = currentLine.match(/^(?:MsgBox|ToolTip)\s*\((.+)\)\s*$/i);
      if (messageMatch) {
        const argumentsList = this._splitArgs(messageMatch[1]);
        const value = this._translateExpr(argumentsList[0]);
        outputLines.push(this._ind() + `__out(${value});`);
        lineIndex++; continue;
      }

      // convert AHK arr.Push(x) to JS arr.push(x)
      const pushMatch = currentLine.match(/^(\w+)\s*\.\s*Push\s*\((.+)\)\s*$/i);
      if (pushMatch) {
        const value = this._translateExpr(pushMatch[2]);
        outputLines.push(this._ind() + `${pushMatch[1]}.push(${value});`);
        lineIndex++; continue;
      }

      // convert AHK arr.Pop() to JS arr.pop()
      const popMatch = currentLine.match(/^(\w+)\s*\.\s*Pop\s*\(\)\s*$/i);
      if (popMatch) {
        outputLines.push(this._ind() + `${popMatch[1]}.pop();`);
        lineIndex++; continue;
      }

      // convert AHK compound assignments (+=, .=, //=, **=) to JS equivalents
      const compoundMatch = currentLine.match(/^(\w+)\s*(\+=|-=|\*=|\/=|\.=|\/\/=|\*\*=)\s*(.+)$/);
      if (compoundMatch) {
        const [, variableName, operator, rightHandSide] = compoundMatch;
        const value = this._translateExpr(rightHandSide);
        if (operator === '.=') {
          outputLines.push(this._ind() + `${variableName} += String(${value});`);
        } else if (operator === '//=') {
          outputLines.push(this._ind() + `${variableName} = Math.floor(${variableName} / ${value});`);
        } else if (operator === '**=') {
          outputLines.push(this._ind() + `${variableName} = Math.pow(${variableName}, ${value});`);
        } else {
          outputLines.push(this._ind() + `${variableName} ${operator} ${value};`);
        }
        lineIndex++; continue;
      }

      // convert AHK x++ / ++x / x-- to JS (same syntax, just add semicolons)
      const incrementMatch = currentLine.match(/^(\w+)(\+\+|--)$/);
      if (incrementMatch) { outputLines.push(this._ind() + `${incrementMatch[1]}${incrementMatch[2]};`); lineIndex++; continue; }
      const preIncrementMatch = currentLine.match(/^(\+\+|--)(\w+)$/);
      if (preIncrementMatch) { outputLines.push(this._ind() + `${preIncrementMatch[1]}${preIncrementMatch[2]};`); lineIndex++; continue; }

      // convert AHK arr[n] := val to JS (shift index by -1 since AHK is 1-indexed)
      const arrayAssignmentMatch = currentLine.match(/^(\w+)\s*\[(.+)\]\s*:=\s*(.+)$/);
      if (arrayAssignmentMatch) {
        const arrayIndex = this._translateExpr(arrayAssignmentMatch[2]);
        const value = this._translateExpr(arrayAssignmentMatch[3]);
        outputLines.push(this._ind() + `${arrayAssignmentMatch[1]}[${arrayIndex} - 1] = ${value};`);
        lineIndex++; continue;
      }

      // convert AHK var := expr to JS let var = expr
      const assignmentMatch = currentLine.match(/^(\w+)\s*:=\s*(.+)$/);
      if (assignmentMatch) {
        const value = this._translateExpr(assignmentMatch[2]);
        outputLines.push(this._ind() + `let ${assignmentMatch[1]} = ${value};`);
        lineIndex++; continue;
      }

      // anything we don't recognise gets passed through as a JS comment
      outputLines.push(this._ind() + `// [unrecognised] ${currentLine}`);
      lineIndex++;
    }

    return outputLines.join('\n');
  }

  // handles full if / else-if / else chains and compiles each branch
  _compileIf(codeLines, startIndex) {
    let lineIndex = startIndex;
    const parts = [];

    while (lineIndex < codeLines.length) {
      const currentLine = codeLines[lineIndex].trim();
      const ifMatch = currentLine.match(/^(?:else\s+)?if\s*\((.+)\)\s*\{?\s*$/i);
      const isElseOnly = /^else\s*\{?$/.test(currentLine);

      if (ifMatch) {
        const condition = this._translateExpr(ifMatch[1]);
        const block = this._findBlock(codeLines, lineIndex);
        this._indent++;
        const body = this._compileBlock(codeLines, block.start, block.end);
        this._indent--;
        const keyword = parts.length === 0 ? 'if' : 'else if';
        parts.push({ keyword, condition, body });
        lineIndex = block.after;
        if (lineIndex < codeLines.length && /^(?:else\s+if|else)\b/i.test(codeLines[lineIndex].trim())) continue;
        break;
      } else if (isElseOnly) {
        const block = this._findBlock(codeLines, lineIndex);
        this._indent++;
        const body = this._compileBlock(codeLines, block.start, block.end);
        this._indent--;
        parts.push({ keyword: 'else', body });
        lineIndex = block.after;
        break;
      } else {
        break;
      }
    }

    const code = parts.map(part =>
      part.keyword === 'else'
        ? `${this._ind()}else {\n${part.body}\n${this._ind()}}`
        : `${this._ind()}${part.keyword} (${part.condition}) {\n${part.body}\n${this._ind()}}`
    ).join('\n');

    return { code, next: lineIndex };
  }

  // compiles a block of lines (stuff between { }) with proper indentation
  _compileBlock(codeLines, start, end) {
    this._indent++;
    const saved = this._indent;
    const outputLines = this._compileLines(codeLines.slice(start, end));
    this._indent = saved;
    this._indent--;
    return outputLines;
  }

  // finds the matching { } block starting at a given line
  _findBlock(codeLines, startLineIndex) {
    let lineIndex = startLineIndex;
    const trimmedLine = codeLines[lineIndex] ? codeLines[lineIndex].trim() : '';
    if (!trimmedLine.endsWith('{')) lineIndex++;
    if (codeLines[lineIndex] && (codeLines[lineIndex].trim() === '{' || codeLines[lineIndex].trim().endsWith('{'))) lineIndex++;
    const blockStart = lineIndex;
    let depth = 0;
    while (lineIndex < codeLines.length) {
      const currentLine = codeLines[lineIndex].trim();
      if (currentLine === '{' || currentLine.endsWith('{')) depth++;
      if (currentLine === '}' || currentLine.startsWith('}')) {
        if (depth === 0) return { start: blockStart, end: lineIndex, after: lineIndex + 1 };
        depth--;
      }
      lineIndex++;
    }
    return { start: blockStart, end: lineIndex, after: lineIndex };
  }

  _ind() { return '  '.repeat(Math.max(0, this._indent)); }

  // splits comma-separated args while respecting nested parens and strings
  _splitArgs(argumentString) {
    const argumentsList = [];
    let depth = 0, currentArgument = '', inDoubleQuotes = false, inSingleQuotes = false;
    for (let charIndex = 0; charIndex < argumentString.length; charIndex++) {
      const character = argumentString[charIndex];
      if (character === '"' && !inSingleQuotes) { inDoubleQuotes = !inDoubleQuotes; currentArgument += character; continue; }
      if (character === "'" && !inDoubleQuotes) { inSingleQuotes = !inSingleQuotes; currentArgument += character; continue; }
      if (!inDoubleQuotes && !inSingleQuotes) {
        if (character === '(' || character === '[') { depth++; currentArgument += character; continue; }
        if (character === ')' || character === ']') { depth--; currentArgument += character; continue; }
        if (character === ',' && depth === 0) { argumentsList.push(currentArgument.trim()); currentArgument = ''; continue; }
      }
      currentArgument += character;
    }
    if (currentArgument.trim()) argumentsList.push(currentArgument.trim());
    return argumentsList;
  }

  // converts an AHK expression to valid JS (operators, A_ vars, array indexing, etc.)
  _translateExpr(expression) {
    expression = String(expression).trim();
    if (!expression) return '""';

    // convert A_Xxx built-in vars to __AHK.A_Xxx lookups
    expression = expression.replace(/\bA_(\w+)\b/g, '__AHK.A_$1');

    // convert AHK string concat "." to JS "+"
    expression = expression.replace(/\s+\.\s+/g, ' + ');

    // convert AHK loose = to JS == (careful not to touch :=, !=, >=, <=)
    expression = expression.replace(/([^!<>=:])=([^>=])/g, '$1==$2');

    expression = expression.replace(/(?<![!<>])===?/g, (match) => match);

    // convert AHK logical operators to JS
    expression = expression.replace(/\band\b/gi, '&&');
    expression = expression.replace(/\bor\b/gi, '||');
    expression = expression.replace(/\bnot\b/gi, '!');

    expression = expression.replace(/\btrue\b/gi, 'true');
    expression = expression.replace(/\bfalse\b/gi, 'false');

    // convert AHK 1-indexed array access to JS 0-indexed
    expression = expression.replace(/\b(\w+)\[([^\]]+)\]/g, (_, arrayName, indexString) => {
      const numberIndex = parseInt(indexString, 10);
      if (!isNaN(numberIndex) && String(numberIndex) === indexString.trim()) return `${arrayName}[${numberIndex - 1}]`;
      return `${arrayName}[(${this._translateExpr(indexString)}) - 1]`;
    });

    // convert AHK .Length/.MaxIndex to JS .length
    expression = expression.replace(/\.Length\b/g, '.length');
    expression = expression.replace(/\.MaxIndex\b/g, '.length');

    return expression;
  }
}

// called from the playground UI — compiles AHK code, runs it, and shows the scriptOutput
function compileSim() {
  const sourceCode = document.getElementById('pg-code').value;
  const javascriptOutputElement = document.getElementById('pg-compiled-js');
  const runOutputElement = document.getElementById('pg-compiled-out');

  if (!javascriptOutputElement || !runOutputElement) {
    console.warn('Compiler UI elements not found');
    return;
  }

  javascriptOutputElement.textContent = '// Compiling…';
  runOutputElement.innerHTML = '<span style="color:var(--text3)">Running compiled JS…</span>';

  let compiledJavascript = '';
  try {
    const compiler = new AHKCompiler();
    compiledJavascript = compiler.compile(sourceCode);
    javascriptOutputElement.textContent = compiledJavascript;
  } catch (error) {
    javascriptOutputElement.textContent = `// Compile error: ${error.message}`;
    runOutputElement.innerHTML = `<span class="pg-error">❌ Compile error: ${esc(error.message)}</span>`;
    return;
  }

  try {
    const scriptRunner = new Function(`
      const __AHK_RESULT = (function() {
        ${compiledJavascript}
        return __output;
      })();
      return __AHK_RESULT;
    `);
    const scriptOutput = scriptRunner();

    if (!scriptOutput || scriptOutput.length === 0) {
      runOutputElement.innerHTML = '<span style="color:var(--text3)">Compiled script ran with no output.</span>';
    } else {
      runOutputElement.innerHTML = scriptOutput
        .map(message => `<div class="pg-msg">🔷 ${esc(String(message))}</div>`)
        .join('');
    }
  } catch (error) {
    runOutputElement.innerHTML = `<span class="pg-error">❌ Runtime error in compiled JS: ${esc(error.message)}</span>`;
  }
}
