# 🩺 doton — Digital Health Friend

> AI-powered health guidance, outbreak tracking, medicine reminders, myth-busting & more — built for Punjab, India.

---

## 📁 Project Structure

```
doton2/
├── index.html                  # Main SPA shell — all page sections live here
│
├── assets/
│   ├── css/
│   │   ├── variables.css       # CSS custom properties (design tokens)
│   │   ├── base.css            # Reset, scrollbar, ambient background orbs
│   │   ├── layout.css          # Sidebar, main panel, topbar
│   │   ├── components.css      # Reusable UI — cards, badges, buttons, forms
│   │   ├── pages.css           # Feature-specific styles — hero, chat, quiz…
│   │   └── responsive.css      # Media queries (tablet & mobile)
│   │
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
│
└── README.md
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Health Chat** | MediChat powered by Gemini 2.0 Flash — evidence-based health Q&A |
| 📰 **Health News** | Live Punjab/India health news via Google News RSS |
| ⚠️ **Outbreak Alert** | Broadcast & track district-level disease outbreaks |
| 💉 **Medicine Tracker** | Add reminders for medicines, vaccines & checkups |
| 💡 **Myth Buster** | Fact-check 30+ common health myths + mini quiz |
| 🎮 **Health Quiz** | 10-question scored quiz with explanations |
| 🌤️ **WeatherWise** | Real-time weather → personalised health precautions |
| 🏥 **Hospital Finder** | Google Maps integration for nearby hospitals & pharmacies |
| 👨‍⚕️ **Doctors Directory** | Filterable directory of verified specialists |
| 🚨 **Emergency Guide** | 112 quick-dial, Do/Don't, First Aid reference, helplines |

---

## 🚀 Getting Started

To ensure security and support the **Puter.js AI engine**, this project must be served through a local web server (opening the file directly will cause errors).

### 1. Run the Local Server
A minimalist static server is included. Open your terminal in the project folder and run:
```bash
node server.cjs
```

### 2. View the App
Once started, open your browser and visit:
**[http://localhost:3005](http://localhost:3005)**

### ✨ Key Benefits
- **Zero Configuration**: No API keys are required. Puter.js handles Gemini AI access automatically.
- **Streaming AI**: MediChat now supports real-time streaming responses.
- **AI-Powered Tools**: Myth Buster and Daily Tips are now backed by live AI verification.

---

## 🛠️ Tech Stack

- **HTML5** — Semantic, accessible markup
- **Vanilla CSS** — Glassmorphism design system with CSS custom properties
- **Vanilla JavaScript** — Modular ES5-compatible scripts, no framework
- **Google Gemini API** — AI health chat (`gemini-2.0-flash`)
- **OpenWeatherMap API** — Real-time weather data
- **Google News RSS** — Health headlines via allorigins proxy
- **Font Awesome 6** — Icons
- **Google Fonts** — Outfit typeface

---

## 🎨 Design System

All design tokens live in `assets/css/variables.css`:

```css
--navy, --navy2, --navy3          /* Dark backgrounds */
--indigo, --purple, --emerald     /* Primary accents */
--cyan, --rose, --amber, --blue   /* Secondary accents */
--glass, --glass2                 /* Glassmorphism surfaces */
--border, --border2               /* Subtle borders */
--r, --r2, --r3                   /* Border radius scale */
```

---

## 📌 Notes

- All data is **session-only** (medicine reminders, outbreak logs reset on refresh — no backend yet)
- Weather is fetched for **Ludhiana, Punjab** by default
- News requires an internet connection (proxied RSS feed)
# Digital-Health-Friend
