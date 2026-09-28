# 🇮🇳 Multilingual Government Scheme Assistant (JanSeva AI)

An intelligent, accessible citizen portal designed to help every Indian discover, evaluate eligibility for, and navigate government welfare schemes in their native language.

---

## 🌟 Key Features

1. **Multilingual Interface & Voice Support**:
   - Available in English, Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు), Bengali (বাংলা), Marathi (मराठी), and more.
   - Speech synthesis (Read Aloud) and voice search input for accessibility.

2. **Comprehensive Scheme Catalog**:
   - Covers Central schemes and State schemes across all 28 states & Union Territories.
   - Filter by Sector (Agriculture, Education, Healthcare, Women, Small Business, Housing, etc.) and Authority.

3. **Smart Eligibility Journey**:
   - Step-by-step interactive questionnaire (Age, Gender, Occupation, Income, State, Category, Landholding).
   - Instant calculation of schemes you qualify for with direct application links and checklist of required documents.

4. **"What Am I Missing?" Benefit Finder**:
   - Discovers hidden benefits and overlapping financial grants that citizens often miss out on.

5. **AI Scheme Assistant**:
   - Natural language scheme search and instant answers to queries like *"Farmer loans in Tamil Nadu with low interest"* or *"Scholarships for girl students"*.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Motion
- **Tooling**: Vite 8, Node.js
- **Server**: Express (Full-stack API layer with local fallback resilience)
- **Deployment**: Vercel & Production Cloud Server

---

## 🚀 How to Run in VS Code (Step-by-Step for Faculty Demo)

### Prerequisites:
- Install **Node.js** (v18 or higher): [nodejs.org](https://nodejs.org/)
- Install **Git**: [git-scm.com](https://git-scm.com/)
- Install **Visual Studio Code**: [code.visualstudio.com](https://code.visualstudio.com/)

---

### Step 1: Clone the Repository
Open your terminal (or Command Prompt) and run:
```bash
git clone https://github.com/abishaa0808-netizen/Multilingual--Government--Scheme--Assistant.git
```

---

### Step 2: Open in VS Code
```bash
cd Multilingual--Government--Scheme--Assistant
code .
```
*(Or open VS Code, click **File > Open Folder**, and select the `Multilingual--Government--Scheme--Assistant` folder).*

---

### Step 3: Install Dependencies
Open the built-in terminal in VS Code (press `` Ctrl + ` `` or go to **Terminal > New Terminal**), then run:
```bash
npm install
```

---

### Step 4: Run the Development Server
In the VS Code terminal, start the app:
```bash
npm run dev
```

You will see:
```text
  ➜  Local:   http://localhost:3000/
```

### Step 5: Open in Your Browser
Hold `Ctrl` and click the link `http://localhost:3000/` (or open Chrome/Edge and go to `http://localhost:3000`).

---

## 🎓 Faculty Presentation Guide (Demo Flow)

When demonstrating this project to your faculty or evaluators:

1. **Language Switching**:
   - Change the language from English to Hindi, Tamil, or Telugu in the top right navbar to show native language support for rural citizens.
2. **Eligibility Checker**:
   - Open **"Eligibility Journey"** tab. Fill in sample citizen profiles (e.g., Farmer with 2 acres of land, or a College student with family income under ₹2.5 Lakhs). Show how matching schemes are instantly calculated.
3. **"What Am I Missing?" Tool**:
   - Click the finder to demonstrate how citizens can discover overlooked financial subsidies and welfare programs.
4. **Scheme Catalog & Filters**:
   - Filter by state (e.g., Tamil Nadu, Maharashtra, Uttar Pradesh) and sector (Agriculture, Women Empowerment) to showcase the comprehensive database.
5. **Interactive AI Assistant**:
   - Type or speak a question in the assistant panel to demonstrate conversational scheme discovery.
