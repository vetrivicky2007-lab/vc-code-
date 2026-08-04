# VC (Versatile Coding)

<div align="center">

## 🚀 A Modern Programming Language Built Completely from Scratch

**VC (Versatile Coding)** is a custom programming language designed and developed from the ground up. It includes its own **Lexer**, **Parser**, **Abstract Syntax Tree (AST)**, **Interpreter**, and a modern **web-based IDE** powered by **Monaco Editor** and **FastAPI**.

This project was created to explore compiler construction, language design, interpreter development, and IDE engineering while building a real programming language that continues to evolve.

---

### Current Version

**VC v1.0**

</div>

---

# 📖 About the Project

Most programmers learn programming languages like Python, Java, or C++, but very few build one themselves.

VC is an attempt to understand every stage involved in creating a programming language.

Instead of relying on existing compiler frameworks, VC implements every major component manually:

- Lexical Analysis
- Parsing
- AST Generation
- Tree-Walking Interpretation
- Runtime Environment
- Variable Scope
- Function Calls
- Control Flow
- Online IDE

The goal of VC is not only to create another programming language but also to serve as an educational compiler project that demonstrates how modern languages work internally.

---

# ✨ Features

## Language Features

- Variables
- Arithmetic Operators
    - +
    - -
    - *
    - /
- Strings
- String Interpolation
- Print Statements
- Comparison Operators
    - >
    - <
    - >=
    - <=
    - ==
    - !=
- if
- else
- while
- User Defined Functions
- Function Parameters
- Return Statements
- Nested Function Calls
- Recursive Functions
- Variable Scope

---

## Compiler Components

VC includes a complete compiler/interpreter pipeline.

```
Source Code
      │
      ▼
Lexer
      │
      ▼
Parser
      │
      ▼
Abstract Syntax Tree (AST)
      │
      ▼
Interpreter
      │
      ▼
Program Output
```

---

# 🏗 Project Architecture

```
versatile-coding/

│
├── backend/
│   ├── lexer.py
│   ├── parser.py
│   ├── interpreter.py
│   ├── node.py
│   ├── token1.py
│   └── main.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── README.md
```

---

# 🔍 How VC Works

## 1. Lexer

The lexer reads the source code character by character and converts it into meaningful tokens.

Example:

```
a = 10
```

becomes

```
IDENTIFIER(a)
EQUALS
NUMBER(10)
```

---

## 2. Parser

The parser converts the tokens into an Abstract Syntax Tree (AST).

Example

```
a = 5 + 2
```

becomes

```
Assign
│
├── Variable(a)
│
└── Plus
    ├── 5
    └── 2
```

---

## 3. Interpreter

The interpreter walks through the AST and executes every statement.

For example

```
Print
```

becomes

```
print(...)
```

while

```
While
```

becomes

```
while(condition)
```

---

# 💻 Online Playground

VC includes its own browser-based IDE.

Current Features

- Monaco Editor
- Syntax Highlighting
- Dark Theme
- Light Theme
- Resizable Editor
- Resizable Output
- FastAPI Backend
- Instant Execution
- Professional Interface

---

# 🛠 Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript
- Monaco Editor

## Backend

- Python
- FastAPI
- Uvicorn

---

# 📚 Example Programs

## Variables

```vc
a = 10
b = 20

@"{a+b}"
```

Output

```
30
```

---

## If Else

```vc
a = 15

if a > 10
{
    @"Greater"
}
else
{
    @"Smaller"
}
```

---

## While Loop

```vc
i = 1

while i <= 5
{
    @"{i}"
    i = i + 1
}
```

Output

```
1
2
3
4
5
```

---

## Functions

```vc
func add(a, b)
{
    return a + b
}

@"{add(5,7)}"
```

Output

```
12
```

---

## Recursive Function

```vc
func factorial(n)
{
    if n <= 1
    {
        return 1
    }

    return n * factorial(n-1)
}

@"{factorial(5)}"
```

Output

```
120
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/versatile-coding.git
```

---

## 2. Open the Project

```bash
cd versatile-coding
```

---

## 3. Install Python

Download Python 3.11 or later.

https://www.python.org/downloads/

Make sure **Add Python to PATH** is enabled during installation.

---

## 4. Install Required Packages

Navigate to the backend folder.

```bash
cd backend
```

Install dependencies.

```bash
pip install fastapi uvicorn
```

---

## 5. Start the Backend

Inside the backend folder run

```bash
python -m uvicorn main:app --reload
```

You should see

```
Uvicorn running on

http://127.0.0.1:8000
```

---

## 6. Open the Frontend

Open another terminal.

Navigate to the frontend folder.

If you use VS Code install the **Live Server** extension.

Right-click

```
frontend/index.html
```

Choose

```
Open with Live Server
```

or

Use Python

```bash
cd frontend

python -m http.server 5500
```

Open

```
http://127.0.0.1:5500
```

---

# 📦 Requirements

- Python 3.11+
- FastAPI
- Uvicorn
- Modern Web Browser
- VS Code (Recommended)

---

# 📌 Roadmap

Upcoming Features

- Arrays
- Dictionaries
- For Loop
- Classes
- Objects
- Modules
- Standard Library
- File Handling
- Exception Handling
- Package Manager
- Debugger
- Bytecode Compiler
- Virtual Machine
- LLVM Backend
- Native Executables
- Garbage Collector
- Language Server Protocol (LSP)
- VS Code Extension

---

# 🤝 Contributing

Contributions are welcome.

Feel free to:

- Open Issues
- Suggest Features
- Submit Pull Requests
- Improve Documentation

---

# 📄 License

This project is released under the MIT License.

---

# ⭐ Support

If you found this project interesting, please consider giving it a ⭐ on GitHub.

It helps more people discover the project and supports future development.

---

## Made with ❤️ by Vetrivel
