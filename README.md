# Nyra — AI Life Concierge

> Talk to your task manager. Nyra plans your day, tracks your habits, and runs your focus sessions — all through natural conversation.

Nyra is a conversational productivity concierge built with **Google AI Studio (Build)** and the **Gemini API**. Instead of clicking through menus to manage a to-do list, you tell Nyra what you need — by typing or speaking — and she adds tasks, logs habits, builds your daily schedule, and starts your focus timer for you.

Built for the **5-Day AI Agents: Intensive Vibe Coding Course With Google** (Kaggle x Google, June 2026) capstone project.

---

## ✨ Features

### 🗣️ Nyra Chat — the AI assistant
- Talk to Nyra using **typed or voice input** (Web Speech API).
- Powered by **Gemini API function calling** — Nyra doesn't just reply in text, she calls real functions in the app (add a task, log a habit, rebuild the day's plan, start a timer) and confirms what she did in plain language.
- Ask things like *"add a task to review the slides,"* *"what's my plan today?"* or *"start a focus session"* and watch the rest of the app update live.

### 📅 Timeline — the daily plan
- A smart, chronological itinerary that merges today's open tasks and pending habits into one time-ordered plan.
- One tap (or one sentence to Nyra) regenerates the plan as priorities change through the day.

### ✅ To-Do List
- Manual task management alongside the AI: add, complete, and delete tasks directly.
- Each task supports **priority levels** (Low / Medium / High) and **category tags** (e.g. Work, Routine).
- Filter by All / Pending / Completed.

### 🔁 Rituals — the habit tracker
- Track recurring daily habits with **streak counters** (e.g. 🔥 5-day streak).
- Switch between **Today**, **Weekly**, and **Monthly** views to see progress at different zoom levels.
- Log completions with a single tap, or by asking Nyra.

### ⏱️ Focus Timer — Pomodoro clock
- Customizable Work / Break cycle with a circular progress ring.
- Tracks how many focus sessions you've completed today.
- Can be started hands-free by asking Nyra.

### 🔒 Privacy by default
- **Local-Only Mode** — all data lives on your device.
- **No Tracking** — nothing is logged, profiled, or sent anywhere except the prompt sent to the Gemini API to process each request.
- **On-Device Storage** — your tasks and habits never leave your browser.

---

## 🧠 How the agent works

Nyra is built around **Gemini API function/tool calling**, not a plain chat wrapper. When you send a message, Gemini decides — based on your intent — which underlying function to invoke, such as:

| Function | What it does |
|---|---|
| `addTask` | Creates a new to-do item with title, priority, and category |
| `completeTask` / `removeTask` | Marks a task done or deletes it |
| `logHabitCompletion` | Logs today's habit as done and updates the streak |
| `generateDailyPlan` | Rebuilds the Timeline from current tasks + habits |
| `startPomodoro` | Starts a focus session with the configured duration |

After each function call resolves, Nyra reports back conversationally — closing the loop between natural language and real app state changes.

---

## 🛠️ Tech Stack

- **Google AI Studio** — Build feature (no-code/vibe-coded app generation)
- **Gemini API** — function calling / tool use for agentic behavior
- **Web Speech API** — voice-to-text input
- **HTML / CSS / JavaScript** — single-page app, fully client-side, no backend or database required

---

## 🚀 Getting Started

1. Clone this repository:
   ```bash
   git clone https://github.com/mdaffan6901-cmd/Nyra-AI-Life-Concierge.git
   ```
2. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
3. Add your API key where indicated in the app's configuration.
4. Open `index.html` in a browser — or deploy the folder to any static host (Netlify, Vercel, GitHub Pages).

No build step, no server, and no database setup required — everything runs client-side.

---

## 📋 Project Context

This project was built for the **AI Agents: Intensive Vibe Coding Capstone Project** (Kaggle x Google, June 2026), submitted under the **Concierge Agents** track — demonstrating an agentic assistant applied to everyday productivity, designed and shipped entirely using vibe coding on a mobile device via Google AI Studio's Build feature.

---

## 📄 License

MIT
