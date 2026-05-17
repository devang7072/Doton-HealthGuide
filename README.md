<div align="center">

# 🩺 Doton — Digital Health Friend
**AI-powered health guidance, outbreak tracking, medicine reminders, myth-busting & more — built for Punjab, India.**

[![Deploy Status](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify)](https://doton-health.netlify.app/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Glossary/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

[Live Demo 🚀](https://doton-health.netlify.app/) • [Presentation 📊](./DOTON_Premium_Light_Theme.pptx) • [Report Issues 🐛](../../issues)

</div>

---

## 🌟 About The Project

**Doton** is an innovative, digital health companion specifically tailored for users in Punjab, India. It leverages artificial intelligence to provide evidence-based health answers, real-time outbreak alerts, a comprehensive medicine tracker, and fact-checking features to combat medical misinformation.

The platform is designed to be highly accessible, featuring a clean, responsive glassmorphism user interface built entirely with pure HTML, CSS, and vanilla JavaScript—making it lightweight and incredibly fast.

### 🎥 Project Presentation
To dive deeper into the design, strategy, and business implementation, please view our official project presentation:
👉 **[DOTON Premium Light Theme Presentation](./DOTON_Premium_Light_Theme.pptx)**

---

## 🚀 Live Demo

Experience **Doton** instantly without installing anything:
🔗 **[Play with Doton on Netlify](https://doton-health.netlify.app/)** *(Replace with your actual deployed link if needed)*

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 🤖 **AI Health Chat** | *MediChat* powered by **Gemini 2.0 Flash** providing lightning-fast, evidence-based health Q&A. |
| 📰 **Health News** | Live Punjab & India health news streams curated via Google News RSS. |
| ⚠️ **Outbreak Alert** | Real-time broadcasting & tracking of district-level disease outbreaks. |
| 💉 **Medicine Tracker** | Easy-to-use reminders for daily medicines, upcoming vaccines, & routine checkups. |
| 💡 **Myth Buster** | Fact-checks over 30+ common health myths using live AI verification, plus a fun mini-quiz. |
| 🎮 **Health Quiz** | A 10-question scored health awareness quiz to test your medical knowledge. |
| 🌤️ **WeatherWise** | Pulls real-time weather data to provide personalized health precautions based on current conditions. |
| 🏥 **Hospital Finder** | Integrated Google Maps to help you locate nearby hospitals, clinics, and pharmacies. |
| 👨‍⚕️ **Doctors Directory** | A fully filterable directory to easily find verified specialists in your area. |
| 🚨 **Emergency Guide** | Quick access to 112, essential Do's/Don'ts, First Aid reference, and national helplines. |

---

## 🛠️ Tech Stack & Architecture

Doton is built to be fast, relying on a robust and modern foundation without the overhead of heavy frontend frameworks.

*   **Frontend:** HTML5, Vanilla CSS3 (Custom Properties & Glassmorphism), Vanilla JavaScript (ES5+)
*   **AI Engine:** Google Gemini API (`gemini-2.0-flash`) seamlessly handled via Puter.js
*   **Data APIs:** OpenWeatherMap API (Weather), Google News RSS (via allorigins proxy)
*   **Design Assets:** Font Awesome 6, Google Fonts (Outfit Typeface)

### 📁 Folder Structure

```text
doton1.3/
├── index.html                  # Main SPA shell — all page sections live here
├── DOTON_Premium_Light_Theme.pptx  # Project Presentation Pitch Deck
├── server/                     # Backend components (Node.js/Express)
├── assets/
│   ├── css/
│   │   ├── variables.css       # CSS custom properties (design tokens)
│   │   ├── base.css            # Reset, scrollbar, ambient background orbs
│   │   ├── layout.css          # Sidebar, main panel, topbar
│   │   ├── components.css      # Reusable UI — cards, badges, buttons, forms
│   │   ├── pages.css           # Feature-specific styles — hero, chat, quiz…
│   │   └── responsive.css      # Media queries (tablet & mobile)
│   └── js/
│       ├── app.js              # Page router, daily tip, app bootstrap
│       ├── gemini.js           # Gemini API connection + MediChat UI
│       ├── news.js             # Google News RSS health feed loader
│       ├── outbreak.js         # Outbreak alert broadcast & log
│       ├── medicine.js         # Medicine/vaccine reminder tracker
│       ├── myth.js             # Myth database, checker & mini quiz
│       ├── quiz.js             # 10-question health awareness quiz
│       ├── weather.js          # OpenWeatherMap + seasonal precautions
│       └── doctors.js          # Doctors directory & live search
└── README.md
```

---

## 💻 Getting Started Locally

To ensure security and support the **Puter.js AI engine**, this project must be served through a local web server (opening the file directly via `file://` will cause errors).

### Prerequisites
*   [Node.js](https://nodejs.org/) installed on your machine.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/devang7072/Doton-HealthGuide.git
    cd Doton-HealthGuide
    ```

2.  **Install any backend dependencies** *(If utilizing the `/server` folder)*:
    ```bash
    cd server
    npm install
    cd ..
    ```

3.  **Run the Local Server:**
    A minimalist static server is included. Open your terminal in the root project folder and run:
    ```bash
    node server.cjs
    ```
    *(Alternatively, start the Express backend if configured in the `/server` folder)*.

4.  **View the App:**
    Once the server starts, open your browser and navigate to:
    **[http://localhost:3005](http://localhost:3005)**

### 💎 Key Benefits of this Architecture
- **Zero Configuration:** No complex API keys required for AI functionality! Puter.js dynamically handles Gemini AI access automatically.
- **Streaming AI Response:** MediChat supports real-time streaming, rendering answers exactly like ChatGPT.
- **AI-Powered Fact Checking:** Myth Buster and Daily Tips are now actively backed by live AI verification.

---

## 🎨 Design System

Doton uses a unified, aesthetically pleasing Glassmorphism design system. All design tokens are strictly maintained in `assets/css/variables.css`:

```css
/* Color Palette Example */
--navy, --navy2, --navy3          /* Rich Dark backgrounds */
--indigo, --purple, --emerald     /* Vibrant Primary accents */
--cyan, --rose, --amber, --blue   /* Engaging Secondary accents */
--glass, --glass2                 /* Translucent Glassmorphism surfaces */
--border, --border2               /* Soft subtle borders */
--r, --r2, --r3                   /* Consistent Border radius scaling */
```

---

## 📌 Important Notes

- **Data Persistence:** Currently, user data (medicine reminders, outbreak logs) is **session-only** and will reset on page refresh. Full backend integration is in active development.
- **Localization:** The Weather API currently defaults to fetching data for **Ludhiana, Punjab**.
- **Connectivity:** The News Feed feature requires an active internet connection to proxy the RSS feed successfully.

---
<div align="center">
  <i>Crafted with ❤️ for a healthier tomorrow.</i>
</div>
