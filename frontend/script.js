/* ==========================================================================
   VC Playground - Modern Online IDE Frontend Script
   ========================================================================== */

let editor;
let abortController = null;

// Initial State & Workspace Storage
const state = {
    activeFile: 'main.vc',
    files: {
        'main.vc': `// Welcome to VC Playground!
a = 15
b = 25

func add(x, y) {
    return x + y
}

result = add(a, b)
@"Sum of {a} and {b} = {result}"
`,
        'math.vc': `// Math utilities in VC
func factorial(n) {
    if n <= 1 {
        return 1
    }
    return n * factorial(n - 1)
}

@ "Factorial of 5 = {factorial(5)}"
`,
        'fibonacci.vc': `// Recursive Fibonacci in VC
func fib(n) {
    if n <= 1 {
        return n
    }
    return fib(n - 1) + fib(n - 2)
}

@ "Fibonacci(8) = {fib(8)}"
`
    },
    settings: {
        theme: localStorage.getItem('vc_theme') || 'vs-dark',
        fontSize: parseInt(localStorage.getItem('vc_fontSize')) || 14,
        tabSize: parseInt(localStorage.getItem('vc_tabSize')) || 4,
        wordWrap: localStorage.getItem('vc_wordWrap') || 'on',
        minimap: localStorage.getItem('vc_minimap') !== 'false',
        autoSave: localStorage.getItem('vc_autoSave') !== 'false'
    },
    sidebarCollapsed: false,
    activeSidebarPanel: 'explorer',
    activeOutputTab: 'terminal'
};

// Preset Examples
const presetExamples = {
    hello: {
        title: '1. Hello World',
        desc: 'Basic printing using @ operator',
        code: `@ "Hello, World from VC Language!"`
    },
    variables: {
        title: '2. Variables & Arithmetic',
        desc: 'Variables, math operators (+, -, *, /)',
        code: `x = 10\ny = 20\nsum = x + y\nprod = x * y\n@ "Sum = {sum}"\n@ "Product = {prod}"`
    },
    interpolation: {
        title: '3. String Interpolation',
        desc: 'Format strings dynamically with {expr}',
        code: `name = "Developer"\nage = 24\n@ "Hello {name}, in 5 years you will be {age + 5}!"`
    },
    conditions: {
        title: '4. If / Else Conditions',
        desc: 'Conditional logic and comparisons',
        code: `score = 85\nif score >= 90 {\n    @ "Grade: A"\n} else {\n    if score >= 75 {\n        @ "Grade: B"\n    } else {\n        @ "Grade: C"\n    }\n}`
    },
    while_loop: {
        title: '5. While Loops',
        desc: 'Iterate with while condition',
        code: `count = 1\nwhile count <= 5 {\n    @ "Iteration #{count}"\n    count = count + 1\n}`
    },
    functions: {
        title: '6. User Functions',
        desc: 'Define and call functions with params',
        code: `func multiply(a, b) {\n    return a * b\n}\nres = multiply(6, 7)\n@ "Result = {res}"`
    },
    factorial: {
        title: '7. Recursive Factorial',
        desc: 'Function calling itself recursively',
        code: `func fact(n) {\n    if n <= 1 {\n        return 1\n    }\n    return n * fact(n - 1)\n}\n@ "5! = {fact(5)}"`
    },
    fibonacci: {
        title: '8. Recursive Fibonacci',
        desc: 'Compute nth Fibonacci number',
        code: `func fib(n) {\n    if n <= 1 {\n        return n\n    }\n    return fib(n - 1) + fib(n - 2)\n}\n@"{fib(8)}"`
    }
};

// Command Palette Registry
const paletteCommands = [
    { id: 'run', label: 'Run Program', shortcut: 'Ctrl+Enter', action: () => runCode() },
    { id: 'clear', label: 'Clear Output', shortcut: 'Ctrl+L', action: () => clearOutput() },
    { id: 'save', label: 'Save Active File', shortcut: 'Ctrl+S', action: () => saveCurrentFile() },
    { id: 'newfile', label: 'Create New File', shortcut: '', action: () => createNewFile() },
    { id: 'theme', label: 'Toggle Light/Dark Theme', shortcut: '', action: () => toggleTheme() },
    { id: 'settings', label: 'Open Settings', shortcut: '', action: () => openSettings() },
    { id: 'docs', label: 'Open Documentation', shortcut: '', action: () => switchSidebarPanel('docs') },
    { id: 'fib_example', label: 'Open Fibonacci Example', shortcut: '', action: () => loadExample('fibonacci') }
];

/* ==========================================================================
   Monaco Editor Setup
   ========================================================================== */

require.config({
    paths: {
        vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs"
    }
});

require(["vs/editor/editor.main"], function () {

    // Register VC Language Syntax Provider
    monaco.languages.register({ id: "vc" });

    monaco.languages.setMonarchTokensProvider("vc", {
        tokenizer: {
            root: [
                [/@/, "keyword"],
                [/\b(if|else|while|func|return)\b/, "keyword"],
                [/[0-9]+/, "number"],
                [/".*?"/, "string"],
                [/[+\-*/=><!]+/, "operator"],
                [/[a-zA-Z_][a-zA-Z0-9_]*/, "identifier"]
            ]
        }
    });

    // Auto-completion provider for VC
    monaco.languages.registerCompletionItemProvider("vc", {
        provideCompletionItems: function () {
            return {
                suggestions: [
                    { label: "func", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "func ${1:name}(${2:params}) {\n\t${3}\n}", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: "if", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "if ${1:condition} {\n\t${2}\n}", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: "else", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "else {\n\t${1}\n}", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: "while", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "while ${1:condition} {\n\t${2}\n}", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet },
                    { label: "return", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "return " },
                    { label: "print", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "@ \"${1}\"", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet }
                ]
            };
        }
    });

    // Create Monaco Instance
    editor = monaco.editor.create(document.getElementById("editor"), {
        value: state.files[state.activeFile] || '',
        language: "vc",
        theme: state.settings.theme,
        fontSize: state.settings.fontSize,
        tabSize: state.settings.tabSize,
        wordWrap: state.settings.wordWrap,
        minimap: { enabled: state.settings.minimap },
        padding: { top: 12, bottom: 12 },
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        renderLineHighlight: "all",
        automaticLayout: true,
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace"
    });

    // Track Cursor Movement for Status Bar
    editor.onDidChangeCursorPosition((e) => {
        document.getElementById('cursor-position').innerText = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
    });

    // Track Content Changes
    editor.onDidChangeModelContent(() => {
        const dot = document.getElementById('save-status');
        if (dot) dot.classList.add('modified');
        if (state.settings.autoSave && state.activeFile) {
            state.files[state.activeFile] = editor.getValue();
        }
    });

    // Apply Saved Theme Body Class
    if (state.settings.theme === 'vs') {
        document.body.classList.add('light-mode');
        document.getElementById('theme-icon').className = 'fa-solid fa-sun';
    }

    // Initialize UI Elements
    renderExplorerFiles();
    renderTabs();
    renderExamplesList();
    checkBackendHealth();
});

/* ==========================================================================
   Backend Health & Execution logic
   ========================================================================== */

async function checkBackendHealth() {
    const dot = document.getElementById('backend-status-dot');
    const text = document.getElementById('backend-status-text');
    try {
        const res = await fetch("http://127.0.0.1:8000/", { method: "GET" });
        if (res.ok) {
            if (dot) dot.style.color = '#a6e3a1';
            if (text) text.innerText = 'Backend Connected';
        } else {
            throw new Error();
        }
    } catch {
        if (dot) dot.style.color = '#f38ba8';
        if (text) text.innerText = 'Backend Offline';
    }
}

async function runCode() {
    if (!editor) return;

    // Save active code state
    if (state.activeFile) {
        state.files[state.activeFile] = editor.getValue();
    }

    const code = editor.getValue();
    if (!code.trim()) {
        showToast('Code is empty!', 'warning');
        return;
    }

    const outputElem = document.getElementById("output");
    const runBtn = document.getElementById("btn-run");
    const stopBtn = document.getElementById("btn-stop");
    const execTimeElem = document.getElementById("exec-time");

    // UI Loading State
    runBtn.disabled = true;
    stopBtn.disabled = false;
    runBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Running...</span>`;
    outputElem.innerHTML = `<span class="term-prompt">> Running ${state.activeFile}...</span>\n`;

    const startTime = performance.now();
    abortController = new AbortController();

    try {
        const response = await fetch("http://127.0.0.1:8000/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code }),
            signal: abortController.signal
        });

        const elapsed = (performance.now() - startTime).toFixed(1);
        execTimeElem.innerHTML = `<i class="fa-regular fa-clock"></i> ${elapsed} ms`;

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.output.startsWith("VC Error:")) {
            outputElem.innerHTML += `<span class="term-error">${escapeHtml(data.output)}</span>\n`;
            outputElem.innerHTML += `\n<span class="term-info">--------------------------------------------------</span>\n`;
            outputElem.innerHTML += `<span class="term-error">Execution finished with error.</span>`;
            showToast('Compilation/Execution Error', 'error');
        } else {
            outputElem.innerHTML += `${escapeHtml(data.output)}\n`;
            outputElem.innerHTML += `\n<span class="term-info">--------------------------------------------------</span>\n`;
            outputElem.innerHTML += `<span class="term-success">Execution completed successfully.</span>`;
            showToast('Program executed successfully!', 'success');
        }

        // Generate Tokens & AST Preview for debug tabs
        generateOutputInspector(code);

    } catch (err) {
        if (err.name === 'AbortError') {
            outputElem.innerHTML += `\n<span class="term-warn">Execution stopped by user.</span>`;
            showToast('Execution stopped', 'warning');
        } else {
            outputElem.innerHTML += `\n<span class="term-error">Backend Connection Error: Make sure FastAPI backend is running on http://127.0.0.1:8000</span>`;
            showToast('Backend Error', 'error');
            checkBackendHealth();
        }
    } finally {
        runBtn.disabled = false;
        stopBtn.disabled = true;
        runBtn.innerHTML = `<i class="fa-solid fa-play"></i> <span>Run</span>`;
        abortController = null;
    }
}

function stopExecution() {
    if (abortController) {
        abortController.abort();
    }
}

function clearOutput() {
    document.getElementById("output").innerText = "";
    document.getElementById("exec-time").innerHTML = `<i class="fa-regular fa-clock"></i> 0 ms`;
    showToast('Output cleared', 'info');
}

/* Inspector Tabs (Tokens, AST, Variables) */
function generateOutputInspector(code) {
    // Generate token list preview
    const keywords = ['func', 'return', 'if', 'else', 'while', '@'];
    const tokens = [];
    const lines = code.split('\n');
    lines.forEach((line, idx) => {
        const words = line.match(/[a-zA-Z_][a-zA-Z0-9_]*|@|[0-9]+|".*?"|[+\-*/=><!]+/g) || [];
        words.forEach(w => {
            let type = 'IDENTIFIER';
            if (keywords.includes(w)) type = 'KEYWORD';
            else if (!isNaN(w)) type = 'NUMBER';
            else if (w.startsWith('"')) type = 'STRING';
            else if ('+-*/=><!'.includes(w)) type = 'OPERATOR';
            tokens.push(`[Line ${idx + 1}] ${type}: "${w}"`);
        });
    });

    document.getElementById('output-tokens').innerText = tokens.join('\n') || 'No tokens found.';
    document.getElementById('output-ast').innerText = `ProgramNode(\n  Statements: [\n    ${lines.map(l => `Statement("${l.trim()}")`).filter(l => l.length > 15).join(',\n    ')}\n  ]\n)`;
    document.getElementById('output-variables').innerText = `Global Scope:\n  (Run complete - variables reset per execution)`;
}

/* ==========================================================================
   Multi-File Explorer & Tab Management
   ========================================================================== */

function renderExplorerFiles() {
    const list = document.getElementById('file-list');
    list.innerHTML = '';
    Object.keys(state.files).forEach(filename => {
        const li = document.createElement('li');
        li.className = `file-item ${filename === state.activeFile ? 'active' : ''}`;
        li.innerHTML = `
            <div class="file-item-left" onclick="switchFile('${filename}')">
                <i class="fa-regular fa-file-code"></i>
                <span>${filename}</span>
            </div>
            <div class="file-actions">
                <i class="fa-solid fa-pen" onclick="renameFile('${filename}')" title="Rename"></i>
                <i class="fa-solid fa-trash" onclick="deleteFile('${filename}')" title="Delete"></i>
            </div>
        `;
        list.appendChild(li);
    });
}

function renderTabs() {
    const tabList = document.getElementById('tab-list');
    tabList.innerHTML = '';
    Object.keys(state.files).forEach(filename => {
        const tab = document.createElement('div');
        tab.className = `tab ${filename === state.activeFile ? 'active' : ''}`;
        tab.onclick = () => switchFile(filename);
        tab.innerHTML = `
            <i class="fa-regular fa-file-code"></i>
            <span>${filename}</span>
            <span class="tab-close" onclick="event.stopPropagation(); closeTab('${filename}')">&times;</span>
        `;
        tabList.appendChild(tab);
    });

    const welcome = document.getElementById('welcome-screen');
    if (Object.keys(state.files).length === 0) {
        welcome.style.display = 'flex';
        document.getElementById('active-filename').innerText = 'No file open';
    } else {
        welcome.style.display = 'none';
        document.getElementById('active-filename').innerText = state.activeFile;
    }
}

function switchFile(filename) {
    if (!state.files[filename]) return;
    if (state.activeFile && editor) {
        state.files[state.activeFile] = editor.getValue();
    }
    state.activeFile = filename;
    if (editor) {
        editor.setValue(state.files[filename]);
    }
    const dot = document.getElementById('save-status');
    if (dot) dot.classList.remove('modified');
    renderExplorerFiles();
    renderTabs();
}

function saveCurrentFile() {
    if (state.activeFile && editor) {
        state.files[state.activeFile] = editor.getValue();
        const dot = document.getElementById('save-status');
        if (dot) dot.classList.remove('modified');
        showToast(`Saved ${state.activeFile}`, 'success');
    }
}

function createNewFile() {
    const name = prompt("Enter new filename:", "untitled.vc");
    if (!name) return;
    let cleanName = name.trim();
    if (!cleanName.endsWith('.vc')) cleanName += '.vc';

    if (state.files[cleanName]) {
        showToast('File already exists!', 'warning');
        return;
    }
    state.files[cleanName] = `// ${cleanName}\n@ "Hello from ${cleanName}"\n`;
    switchFile(cleanName);
    showToast(`Created file ${cleanName}`, 'success');
}

function renameFile(oldName) {
    const newName = prompt(`Rename ${oldName} to:`, oldName);
    if (!newName || newName === oldName) return;
    let cleanName = newName.trim();
    if (!cleanName.endsWith('.vc')) cleanName += '.vc';

    state.files[cleanName] = state.files[oldName];
    delete state.files[oldName];

    if (state.activeFile === oldName) {
        state.activeFile = cleanName;
    }
    switchFile(state.activeFile);
    showToast(`Renamed to ${cleanName}`, 'info');
}

function deleteFile(filename) {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;
    delete state.files[filename];
    const keys = Object.keys(state.files);
    if (keys.length > 0) {
        switchFile(keys[0]);
    } else {
        state.activeFile = '';
        if (editor) editor.setValue('');
        renderExplorerFiles();
        renderTabs();
    }
    showToast(`Deleted ${filename}`, 'info');
}

function closeTab(filename) {
    deleteFile(filename);
}

/* ==========================================================================
   Sidebar View Switching & Collapsing
   ========================================================================== */

function switchSidebarPanel(panelName) {
    state.activeSidebarPanel = panelName;
    
    // Update activity items
    document.querySelectorAll('.activity-item').forEach(item => {
        item.classList.toggle('active', item.dataset.panel === panelName);
    });

    // Update panel views
    document.querySelectorAll('.panel-view').forEach(view => {
        view.classList.toggle('active', view.id === `view-${panelName}`);
    });

    // Open sidebar if collapsed
    const sidebar = document.getElementById('sidebar-panel');
    if (sidebar.classList.contains('collapsed')) {
        toggleSidebar();
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar-panel');
    const icon = document.getElementById('sidebar-toggle-icon');
    state.sidebarCollapsed = !state.sidebarCollapsed;

    if (state.sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        if (icon) icon.className = 'fa-solid fa-angles-right';
    } else {
        sidebar.classList.remove('collapsed');
        if (icon) icon.className = 'fa-solid fa-angles-left';
    }
    setTimeout(() => { if (editor) editor.layout(); }, 200);
}

/* ==========================================================================
   Examples Gallery
   ========================================================================== */

function renderExamplesList() {
    const container = document.getElementById('examples-list');
    container.innerHTML = '';
    Object.keys(presetExamples).forEach(key => {
        const ex = presetExamples[key];
        const card = document.createElement('div');
        card.className = 'example-card';
        card.onclick = () => loadExample(key);
        card.innerHTML = `
            <h4>${ex.title}</h4>
            <p>${ex.desc}</p>
        `;
        container.appendChild(card);
    });
}

function loadExample(key) {
    const ex = presetExamples[key];
    if (!ex) return;
    const filename = `${key}_example.vc`;
    state.files[filename] = ex.code;
    switchFile(filename);
    showToast(`Loaded ${ex.title}`, 'info');
}

/* ==========================================================================
   Output Panel View Tabs
   ========================================================================== */

function switchOutputTab(tabName) {
    state.activeOutputTab = tabName;
    document.querySelectorAll('.output-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    document.querySelectorAll('.output-view').forEach(view => {
        view.classList.toggle('active', view.id === `out-view-${tabName}`);
    });
}

/* ==========================================================================
   Theme & Settings Modal
   ========================================================================== */

function toggleTheme() {
    const isLight = document.body.classList.toggle('light-mode');
    const newTheme = isLight ? 'vs' : 'vs-dark';
    state.settings.theme = newTheme;
    localStorage.setItem('vc_theme', newTheme);

    if (editor) {
        monaco.editor.setTheme(newTheme);
    }
    document.getElementById('theme-icon').className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    showToast(`Switched to ${isLight ? 'Light' : 'Dark'} Theme`, 'info');
}

function openSettings() {
    document.getElementById('modal-settings').classList.add('active');
}

function closeSettings() {
    document.getElementById('modal-settings').classList.remove('active');
}

function applySetting(key, value) {
    state.settings[key] = value;
    localStorage.setItem(`vc_${key}`, value);

    if (!editor) return;

    if (key === 'theme') {
        if (value === 'vs') document.body.classList.add('light-mode');
        else document.body.classList.remove('light-mode');
        monaco.editor.setTheme(value);
    } else if (key === 'fontSize') {
        editor.updateOptions({ fontSize: value });
    } else if (key === 'tabSize') {
        editor.updateOptions({ tabSize: value });
    } else if (key === 'wordWrap') {
        editor.updateOptions({ wordWrap: value });
    } else if (key === 'minimap') {
        editor.updateOptions({ minimap: { enabled: value } });
    }
    showToast('Settings updated', 'info');
}

/* ==========================================================================
   Command Palette
   ========================================================================== */

let selectedPaletteIndex = 0;

function openCommandPalette() {
    const modal = document.getElementById('modal-palette');
    const input = document.getElementById('palette-input');
    modal.classList.add('active');
    input.value = '';
    selectedPaletteIndex = 0;
    filterPaletteCommands();
    input.focus();
}

function closeCommandPalette() {
    document.getElementById('modal-palette').classList.remove('active');
}

function filterPaletteCommands() {
    const query = document.getElementById('palette-input').value.toLowerCase();
    const list = document.getElementById('palette-list');
    list.innerHTML = '';

    const filtered = paletteCommands.filter(c => c.label.toLowerCase().includes(query));
    filtered.forEach((cmd, idx) => {
        const li = document.createElement('li');
        li.className = `palette-item ${idx === selectedPaletteIndex ? 'selected' : ''}`;
        li.onclick = () => {
            cmd.action();
            closeCommandPalette();
        };
        li.innerHTML = `
            <div class="palette-item-left">
                <i class="fa-solid fa-angle-right"></i>
                <span>${cmd.label}</span>
            </div>
            ${cmd.shortcut ? `<span class="palette-item-shortcut">${cmd.shortcut}</span>` : ''}
        `;
        list.appendChild(li);
    });
}

function handlePaletteKeydown(e) {
    const items = document.querySelectorAll('.palette-item');
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedPaletteIndex = (selectedPaletteIndex + 1) % items.length;
        filterPaletteCommands();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedPaletteIndex = (selectedPaletteIndex - 1 + items.length) % items.length;
        filterPaletteCommands();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedPaletteIndex]) {
            items[selectedPaletteIndex].click();
        }
    } else if (e.key === 'Escape') {
        closeCommandPalette();
    }
}

/* ==========================================================================
   Search Functionality
   ========================================================================== */

function handleSearch() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const container = document.getElementById('search-results');
    if (!query) {
        container.innerHTML = `<span class="empty-msg">Type to search across open file...</span>`;
        return;
    }

    const currentCode = editor ? editor.getValue() : '';
    const lines = currentCode.split('\n');
    const matches = [];

    lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(query)) {
            matches.push({ line: idx + 1, text: line.trim() });
        }
    });

    if (matches.length === 0) {
        container.innerHTML = `<span class="empty-msg">No results found for "${escapeHtml(query)}"</span>`;
    } else {
        container.innerHTML = matches.map(m => `
            <div class="example-card" onclick="jumpToLine(${m.line})">
                <h4>Line ${m.line}</h4>
                <p>${escapeHtml(m.text)}</p>
            </div>
        `).join('');
    }
}

function jumpToLine(lineNum) {
    if (!editor) return;
    editor.revealLineInCenter(lineNum);
    editor.setPosition({ lineNumber: lineNum, column: 1 });
    editor.focus();
}

/* ==========================================================================
   Toast Notifications System
   ========================================================================== */

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    else if (type === 'error') iconClass = 'fa-circle-xmark';
    else if (type === 'warning') iconClass = 'fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 200);
    }, 3000);
}

/* ==========================================================================
   Resizable Panels Dragging
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Horizontal Resizer (Editor - Output)
    const divider = document.getElementById("divider");
    const outputPanel = document.getElementById("output-panel");
    let isDraggingDivider = false;

    divider.addEventListener("mousedown", (e) => {
        isDraggingDivider = true;
        divider.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
    });

    // Sidebar Resizer
    const resizerSidebar = document.getElementById("resizer-sidebar");
    const sidebarPanel = document.getElementById("sidebar-panel");
    let isDraggingSidebar = false;

    resizerSidebar.addEventListener("mousedown", (e) => {
        isDraggingSidebar = true;
        resizerSidebar.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
    });

    document.addEventListener("mouseup", () => {
        if (isDraggingDivider || isDraggingSidebar) {
            isDraggingDivider = false;
            isDraggingSidebar = false;
            divider.classList.remove('dragging');
            resizerSidebar.classList.remove('dragging');
            document.body.style.cursor = 'default';
            if (editor) editor.layout();
        }
    });

    document.addEventListener("mousemove", (e) => {
        if (isDraggingDivider) {
            const split = document.getElementById('workspace-split');
            const rect = split.getBoundingClientRect();
            const offsetRight = rect.right - e.clientX;
            const percentage = (offsetRight / rect.width) * 100;
            if (percentage >= 15 && percentage <= 70) {
                outputPanel.style.width = `${percentage}%`;
                if (editor) editor.layout();
            }
        }

        if (isDraggingSidebar) {
            const rect = document.querySelector('.app-body').getBoundingClientRect();
            const newWidth = e.clientX - rect.left - 48; // subtract activity bar width
            if (newWidth >= 160 && newWidth <= 450) {
                sidebarPanel.style.width = `${newWidth}px`;
                if (editor) editor.layout();
            }
        }
    });

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter or Cmd+Enter -> Run Program
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runCode();
        }
        // Ctrl+S or Cmd+S -> Save Active File
        else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            saveCurrentFile();
        }
        // Ctrl+L or Cmd+L -> Clear Output
        else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
            e.preventDefault();
            clearOutput();
        }
        // Ctrl+Shift+P or Cmd+Shift+P -> Command Palette
        else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            openCommandPalette();
        }
        // Escape -> Close Modals
        else if (e.key === 'Escape') {
            closeSettings();
            closeCommandPalette();
        }
    });
});

// Helper Utilities
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}