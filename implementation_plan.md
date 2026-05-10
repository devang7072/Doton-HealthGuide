# Doton Fullstack Implementation Plan

## Goal
Migrate the existing Doton static SPA into a modern fullstack application using:
- **React + Vite** (Frontend)
- **Express.js** (Backend API)
- **MongoDB Atlas + Mongoose** (Database)
- **JWT** (Authentication)

---

## User Review Required

> [!IMPORTANT]
> **Decision Needed Before Starting:**
> The recommended approach is to do **Phase 0 (React migration) AND Phase 1 (Backend)** together from scratch, because restructuring the project now (before adding a backend) is far cleaner than doing it in two separate steps.
>
> **Option A — Full Rebuild (Recommended):**
> Migrate the entire frontend to React/Vite and set up the Express backend at the same time in a monorepo structure. All your existing features (Chat, Quiz, Weather, etc.) will be ported to React components.
>
> **Option B — Backend Only (Faster, Less Clean):**
> Keep the existing Vanilla JS frontend as-is and just add the Express + MongoDB backend. The frontend will call the new API endpoints. This is quicker but creates technical debt (messy architecture).

> [!WARNING]
> **Option A requires more upfront time** (~3-4 hours of coding), but results in a clean, scalable, industry-standard project. Option B is faster (~1 hour) but will need to be refactored later anyway.

---

## Open Questions

> [!IMPORTANT]
> **Please confirm before I start:**
> 1. **Option A or Option B?** (I recommend A)
> 2. **Do you have a MongoDB Atlas account?** If not, I'll guide you through creating a free one.
> 3. **What is your deployment target?** Local development only for now, or do you want to deploy to the cloud (Render, Vercel)?

---

## Proposed Project Structure (Option A - Full Rebuild)

```
doton1.3/
├── client/                     # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Cards, Charts)
│   │   ├── pages/              # Full pages (Dashboard, Chat, Login...)
│   │   ├── context/            # AuthContext (global login state)
│   │   ├── hooks/              # useAuth, useReminders...
│   │   ├── services/           # api.js (all fetch calls to backend)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express.js Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification
│   ├── models/
│   │   ├── User.js             # Mongoose User schema
│   │   ├── Reminder.js         # Medicine reminders
│   │   └── HealthLog.js        # Vitals/symptoms log
│   ├── routes/
│   │   ├── authRoutes.js       # POST /api/auth/register, /login
│   │   ├── reminderRoutes.js   # GET/POST/DELETE /api/reminders
│   │   ├── healthLogRoutes.js  # GET/POST /api/health-log
│   │   └── outbreakRoutes.js   # GET/POST /api/outbreaks
│   └── index.js                # Main Express server entry point
│
├── .env                        # Secrets (MONGO_URI, JWT_SECRET)
└── package.json                # Root (for running both together)
```

---

## Phase 0: React + Vite Setup

### Step 1 — Scaffold the React App
- Run `npm create vite@latest client -- --template react` inside `doton1.3/`.
- Install dependencies: `react-router-dom`, `axios`, `chart.js`, `react-chartjs-2`.
- Port the existing CSS design system (variables.css, base.css, etc.) to the React app.

### Step 2 — Port Existing Features as React Pages
Each existing page becomes a React component:

| Old Feature | New React Page/Component |
|---|---|
| Dashboard section | `pages/Dashboard.jsx` |
| MediChat (Gemini) | `pages/Chat.jsx` |
| Medicine Tracker | `pages/Reminders.jsx` |
| Outbreak Alert | `pages/Outbreaks.jsx` |
| Health News | `pages/News.jsx` |
| Myth Buster | `pages/MythBuster.jsx` |
| Health Quiz | `pages/Quiz.jsx` |
| Weather Wise | `pages/Weather.jsx` |
| Doctors Directory | `pages/Doctors.jsx` |
| Emergency Guide | `pages/Emergency.jsx` |

### Step 3 — Auth Context
- Create `context/AuthContext.jsx` that provides `user`, `login()`, `logout()` to the whole app.
- Create `pages/Login.jsx` and `pages/Register.jsx`.
- Use `react-router-dom` for protected routes.

---

## Phase 1: Express.js Backend Setup

### Step 1 — Initialize Backend
```bash
mkdir server && cd server
npm init -y
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
```

### Step 2 — MongoDB Schemas

**User Schema (`models/User.js`)**
```js
{
  email: String (unique, required),
  password: String (hashed, required),
  profile: {
    name: String,
    age: Number,
    gender: String,
    bloodGroup: String,
    conditions: [String]   // e.g. ["diabetes", "hypertension"]
  },
  role: { type: String, enum: ['user', 'doctor'], default: 'user' },
  createdAt: Date
}
```

**Reminder Schema (`models/Reminder.js`)**
```js
{
  userId: ObjectId (ref: 'User'),
  medicineName: String,
  dosage: String,
  frequency: String,      // "daily", "twice daily"
  reminderTime: String,   // "08:00"
  startDate: Date,
  active: Boolean
}
```

**HealthLog Schema (`models/HealthLog.js`)**
```js
{
  userId: ObjectId (ref: 'User'),
  metricType: String,     // "bp_systolic", "bp_diastolic", "heart_rate", "blood_sugar"
  value: Number,
  unit: String,           // "mmHg", "bpm", "mg/dL"
  notes: String,
  loggedAt: Date
}
```

**Outbreak Schema (`models/Outbreak.js`)**
```js
{
  reportedBy: ObjectId (ref: 'User'),
  district: String,
  disease: String,
  severity: String,       // "low", "medium", "high"
  description: String,
  verified: Boolean,      // For doctor verification feature
  coordinates: { lat: Number, lng: Number },
  reportedAt: Date
}
```

### Step 3 — API Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Create new user | No |
| POST | `/api/auth/login` | Login, returns JWT | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| GET | `/api/reminders` | Get user's reminders | Yes |
| POST | `/api/reminders` | Add a reminder | Yes |
| DELETE | `/api/reminders/:id` | Delete a reminder | Yes |
| GET | `/api/health-log` | Get user's health history | Yes |
| POST | `/api/health-log` | Log a new vital | Yes |
| GET | `/api/outbreaks` | Get all outbreak reports | No |
| POST | `/api/outbreaks` | Submit an outbreak report | Yes |

### Step 4 — JWT Middleware
- A `authMiddleware.js` will verify the JWT token sent in the `Authorization: Bearer <token>` header.
- Any protected route will use this middleware.

---

## Verification Plan

### Automated Tests
1. Test all API endpoints using **Thunder Client** (VS Code extension) or **Postman**.
2. Verify MongoDB documents are created correctly in **MongoDB Atlas** dashboard.
3. Run `npm run dev` in both `/client` and `/server` and confirm both run without errors.

### Manual Verification
1. Register a new user → Login → See personalized dashboard.
2. Add a medicine reminder → Refresh the page → Confirm it persists.
3. Log a health vital → See it appear in the health history chart.
4. Submit an outbreak report → Confirm it appears for all users.

---

## Recommended Order of Execution
1. Scaffold React app (`/client`)
2. Set up Express server (`/server`)
3. Connect to MongoDB
4. Implement Auth (Register/Login)
5. Port features to React pages (one by one)
6. Connect each feature to the backend API
