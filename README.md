# EvalaCode

EvalaCode is an interactive Python coding environment that runs entirely in your browser using Pyodide. It features a built-in Leetcode-style problem generator and a seamless coding console with instant execution—no setup required.

---

## Features

- 🧩 **Problem Generator**  
  Get auto-generated Leetcode-style problems tailored by difficulty (`Easy`, `Medium`, `Hard`), complete with function signatures and test cases.

- 🧠 **Built-in Python Execution**  
  Runs Python in-browser using [Pyodide](https://pyodide.org) — no server execution or backend runtimes needed.

- 🖥️ **Monaco Editor Integration**  
  A clean, VS Code-like editing experience right in the browser.

- 💾 **Package Installation**  
  Dynamically install and use Python packages via `micropip`.

- 🧑‍💻 **Resizable Split-Pane UI**  
  Vertically and horizontally resizable panels for full coding focus.

---

## 📦 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org), [TailwindCSS](https://tailwindcss.com), [TypeScript](https://www.typescriptlang.org)
- **Editor**: [Monaco Editor](https://github.com/microsoft/monaco-editor)
- **Python Runtime**: [Pyodide](https://pyodide.org)
- **Markdown Rendering**: `react-markdown` + `react-syntax-highlighter`
