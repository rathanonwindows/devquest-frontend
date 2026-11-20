<div align="center">

# ⚔️ DevQuest

**Level Up Your Developer Journey**

An RPG-inspired learning platform that transforms coding education into an epic adventure.<br/>
Earn XP, conquer quests, unlock regions, and master the art of code.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-13-E84FC5?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion)

</div>

---

## 🌍 What is DevQuest?

DevQuest reimagines how developers learn to code. Instead of static tutorials and checklists, your learning path is presented as an **RPG-style adventure** — a world of regions, quests, boss battles, and rewards.

You tell DevQuest what you want to learn, your skill level, and your goals. It generates a **personalized roadmap** structured as:

```
🌍 World  →  🗺️ Regions  →  📖 Chapters  →  ⚔️ Quests  →  ✅ Tasks
```

Complete tasks to earn **XP**, level up, unlock achievements, and progress through increasingly challenging regions — from "The Cradle of the Web" to "The Apex Summit."

## ✨ Features

### 🎮 RPG Progression System
- **XP & Levels** — Earn experience for completing quests and tasks
- **Achievements** — Unlock trophies for milestones, streaks, and mastery
- **Streaks** — Build daily coding discipline with streak tracking
- **Rank Titles** — Progress from Bronze → Silver → Gold → Platinum → Diamond
- **Region Unlocks** — Advance through themed learning regions

### 🗺️ Personalized Learning Roadmap
- AI-generated learning paths based on your goals and skill level
- Visual skill tree with progress tracking
- Interactive roadmap with expandable chapters and quest status

### ⚔️ Quests & Boss Battles
- Structured learning quests with lore-rich context
- Task checkboxes with animated completion effects
- Boss battles — multi-round coding challenges that test mastery

### 💻 Practice Arena
- In-browser code editor with live preview
- Test-driven challenges with instant feedback
- Victory celebrations on successful completion

### 🤖 AI Mentor
- Context-aware coding guidance
- Hints and explanations tailored to your current quest
- Conversational AI assistant

### 📊 Analytics & Progress
- Weekly activity heatmaps
- XP and level progression charts
- Skill breakdown by category
- Learning velocity tracking

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + TypeScript 5.7 |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS 4 (with `@theme` custom design tokens) |
| **Animations** | Framer Motion 13 |
| **State** | Zustand |
| **Routing** | React Router 7 |
| **Icons** | Lucide React |
| **Linting** | Oxlint |
| **Deployment** | Vercel |

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets & favicon
├── src/
│   ├── components/
│   │   ├── layout/            # AppLayout, Navbar, Sidebar
│   │   └── ui/                # Reusable UI — modals, notifications, buttons
│   ├── data/                  # Demo data — quests, achievements, resources
│   ├── features/
│   │   ├── landing/           # Landing page (hero, features, CTA)
│   │   ├── auth/              # Login, Signup, Forgot Password
│   │   ├── onboarding/        # Multi-step onboarding questionnaire
│   │   ├── dashboard/         # Main dashboard with stats & progress
│   │   ├── roadmap/           # Visual roadmap with region lore
│   │   ├── quests/            # Quest list & quest detail pages
│   │   ├── practice/          # Code practice arena
│   │   ├── boss-battle/       # Boss battle challenge mode
│   │   ├── resources/         # Curated learning resources
│   │   ├── achievements/      # Achievement gallery
│   │   ├── analytics/         # Progress analytics & charts
│   │   ├── profile/           # User profile & skill breakdown
│   │   ├── projects/          # Project suggestions
│   │   ├── mentor/            # AI Mentor drawer
│   │   ├── settings/          # App settings
│   │   └── admin/             # Admin dashboard
│   ├── lib/                   # Utility functions
│   ├── pages/                 # Route-level page wrappers
│   ├── stores/                # Zustand state management
│   ├── types/                 # TypeScript type definitions
│   ├── App.tsx                # Root component with routing
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles & design tokens
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json                # Deployment config
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/srujan-poojary/devquest.git
cd devquest/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

Output is generated in `dist/` — ready for deployment to Vercel, Netlify, or any static host.

### Preview Production Build

```bash
npm run preview
```

## 🎨 Design System

DevQuest uses a custom dark-first design system built with Tailwind CSS 4's `@theme` directive:

- **Ultra-dark backgrounds** — `#06060a` to `#141419` range
- **Glassmorphism cards** — `.glass-card` with backdrop blur and subtle borders
- **Brand gradient** — Emerald-based accent palette (`brand-400` through `brand-700`)
- **Glow effects** — `.glow-brand`, `.glow-green`, `.glow-blue` for emphasis
- **RPG typography** — Font-mono for stats, font-serif italic for lore text
- **Purposeful animation** — Spring physics for interactions, particles for rewards

## 🗺️ Application Flow

```
Landing Page  →  Sign Up  →  Onboarding Questionnaire
       ↓
   Journey Introduction  →  Dashboard
       ↓
   Roadmap / Skill Tree  →  Select Region  →  Select Quest
       ↓
   Quest Detail  →  Learning Resources  →  Practice
       ↓
   Complete Quest  →  XP Reward  →  Level Up!
       ↓
   Achievement Unlock  →  Next Quest Unlocks  →  Boss Battle
```

## 📄 License

This project is part of an academic submission (BCA Program).

---

<div align="center">

**Built with ⚔️ by [Srujan Poojary](https://github.com/srujan-poojary)**

*"Every line of code is a step on the quest."*

</div>
