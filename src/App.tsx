import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, CheckCircle2, ShieldAlert, Award, Clock, Calendar, CheckSquare, RefreshCw, LayoutDashboard, BrainCircuit, Activity } from "lucide-react";
import { Task, Habit, DailyPlanItem, PomodoroState } from "./types";
import AiChat from "./components/AiChat";
import TodoList from "./components/TodoList";
import HabitTracker from "./components/HabitTracker";
import PomodoroTimer from "./components/PomodoroTimer";
import DailyPlan from "./components/DailyPlan";

// Seed default data if localStorage is empty
const defaultTasks: Task[] = [
  {
    id: "task-seed-1",
    title: "Discuss time-blocking goals with Nyra",
    priority: "high",
    category: "Nyra",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-seed-2",
    title: "Plan weekly health rituals",
    priority: "medium",
    category: "Routine",
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-seed-3",
    title: "Review technical presentation slides",
    priority: "low",
    category: "Work",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

const defaultHabits: Habit[] = [
  {
    id: "habit-seed-1",
    name: "Morning sunlight walk",
    frequency: "daily",
    streak: 5,
    completedDates: [
      new Date(Date.now() - 86400000 * 4).toISOString().split("T")[0],
      new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
      new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
      new Date(Date.now() - 86400000).toISOString().split("T")[0],
      new Date().toISOString().split("T")[0],
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "habit-seed-2",
    name: "Drink 3L of water",
    frequency: "daily",
    streak: 3,
    completedDates: [
      new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
      new Date(Date.now() - 86400000).toISOString().split("T")[0],
    ],
    createdAt: new Date().toISOString(),
  },
];

const defaultPlan: DailyPlanItem[] = [
  {
    id: "plan-seed-1",
    time: "08:30 AM",
    type: "habit",
    title: "Morning sunlight walk",
    completed: true,
  },
  {
    id: "plan-seed-2",
    time: "09:30 AM",
    type: "focus",
    title: "Work focus: slide preparation",
    completed: false,
  },
  {
    id: "plan-seed-3",
    time: "11:30 AM",
    type: "task",
    title: "Discuss time-blocking goals with Nyra",
    completed: false,
  },
];

export default function App() {
  // Main State definitions
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("nyra_tasks");
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem("nyra_habits");
    return saved ? JSON.parse(saved) : defaultHabits;
  });

  const [dailyPlan, setDailyPlan] = useState<DailyPlanItem[]>(() => {
    const saved = localStorage.getItem("nyra_daily_plan");
    return saved ? JSON.parse(saved) : defaultPlan;
  });

  const [pomodoro, setPomodoro] = useState<PomodoroState>(() => {
    const saved = localStorage.getItem("nyra_pomodoro");
    return saved
      ? JSON.parse(saved)
      : {
          isActive: false,
          durationMinutes: 25,
          breakMinutes: 5,
          completedSessionsToday: 0,
        };
  });

  // UI state for tabs in mobile / compact screen widths
  const [activeTab, setActiveTab] = useState<"concierge" | "timeline" | "tasks" | "focus">("concierge");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock ticks
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save states to local storage on changes
  useEffect(() => {
    localStorage.setItem("nyra_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("nyra_habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("nyra_daily_plan", JSON.stringify(dailyPlan));
  }, [dailyPlan]);

  useEffect(() => {
    localStorage.setItem("nyra_pomodoro", JSON.stringify(pomodoro));
  }, [pomodoro]);

  // Core Mutation Handlers
  const handleAddTask = (taskData: Omit<Task, "id" | "createdAt" | "completed">) => {
    const newTask: Task = {
      ...taskData,
      id: "task-" + Date.now(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddHabit = (name: string, frequency: "daily" | "weekly") => {
    const newHabit: Habit = {
      id: "habit-" + Date.now(),
      name,
      frequency,
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [newHabit, ...prev]);
  };

  const handleLogHabit = (id: string, date: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          if (!h.completedDates.includes(date)) {
            const completed = [...h.completedDates, date].sort();
            // Calculate streak
            const streak = calculateLocalStreak(completed);
            return { ...h, completedDates: completed, streak };
          }
        }
        return h;
      })
    );
  };

  const calculateLocalStreak = (dates: string[]): number => {
    if (!dates || dates.length === 0) return 0;
    const uniqueDates = Array.from(new Set(dates)).sort();
    let streak = 0;
    const todayStr = new Date().toISOString().split("T")[0];

    const dateObjs = uniqueDates.map((d) => new Date(d));
    const currentIdx = dateObjs.length - 1;

    const today = new Date(todayStr);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (uniqueDates[currentIdx] !== todayStr && uniqueDates[currentIdx] !== yesterdayStr) {
      return 0;
    }

    streak = 1;
    let lastChecked = dateObjs[currentIdx];

    for (let i = currentIdx - 1; i >= 0; i--) {
      const prevDate = dateObjs[i];
      const diffTime = Math.abs(lastChecked.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        lastChecked = prevDate;
      } else if (diffDays > 1) {
        break;
      }
    }

    return streak;
  };

  const handleTogglePlanItem = (id: string) => {
    setDailyPlan((prev) =>
      prev.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p))
    );
  };

  const handlePomodoroComplete = () => {
    setPomodoro((prev) => ({
      ...prev,
      completedSessionsToday: prev.completedSessionsToday + 1,
    }));
  };

  // Directly triggers "Plan my day" by dispatching it as an AI command
  const handleAskForPlan = () => {
    setActiveTab("concierge");
    const aiInput = document.getElementById("ai-text-input") as HTMLInputElement;
    const aiForm = document.querySelector("#ai-chat-panel form") as HTMLFormElement;
    if (aiInput && aiForm) {
      aiInput.value = "Plan my day";
      const submitBtn = document.getElementById("ai-send-btn") as HTMLButtonElement;
      submitBtn?.click();
    }
  };

  const handleStateUpdate = (updates: {
    tasks?: Task[];
    habits?: Habit[];
    dailyPlan?: DailyPlanItem[];
    pomodoro?: PomodoroState;
  }) => {
    if (updates.tasks) setTasks(updates.tasks);
    if (updates.habits) setHabits(updates.habits);
    if (updates.dailyPlan) setDailyPlan(updates.dailyPlan);
    if (updates.pomodoro) setPomodoro(updates.pomodoro);
  };

  const triggerStartTimer = (duration: number, isBreak: boolean) => {
    setPomodoro((prev) => ({
      ...prev,
      durationMinutes: duration,
      isActive: true,
    }));
    setActiveTab("focus");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0F] to-[#13131A] text-gray-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-white">
      {/* Dynamic Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Visual Brand Mark */}
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22D3EE] blur-[2px] animate-pulse"></div>
              <div className="relative w-8 h-8 rounded-full bg-[#0A0A0F] flex items-center justify-center border border-white/10">
                <BrainCircuit className="w-4.5 h-4.5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-[#7C3AED] to-[#22D3EE] bg-clip-text text-transparent uppercase">
                NYRA
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                AI Life Concierge
              </p>
            </div>
          </div>

          {/* Central status / clock widgets */}
          <div className="flex items-center gap-4">
            {/* Live Clock HUD */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs text-gray-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
              <span className="text-gray-400">Local-Only Mode</span>
              <span className="text-gray-600">|</span>
              <Clock className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span className="text-[#22D3EE]">
                {currentTime.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-white font-medium">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>

            {/* Quick dashboard statistics */}
            <div className="flex items-center gap-1 bg-violet-500/10 text-violet-300 border border-violet-500/15 px-2.5 py-1.5 rounded-xl text-xs font-mono">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>
                {tasks.filter((t) => t.completed).length}/{tasks.length} Done
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Responsive Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Mobile Navigation Tabs HUD */}
        <div className="lg:hidden grid grid-cols-4 bg-black/40 p-1.5 rounded-xl border border-white/5 gap-1">
          {[
            { id: "concierge", label: "Nyra Chat", icon: BrainCircuit },
            { id: "timeline", label: "Timeline", icon: Calendar },
            { id: "tasks", label: "Rituals", icon: CheckSquare },
            { id: "focus", label: "Focus", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-wider">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dashboard layouts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
          {/* LEFT COLUMN: ALWAYS AI Chat on Desktop, Tabbed on Mobile */}
          <div
            className={`lg:col-span-5 h-full ${
              activeTab === "concierge" ? "block" : "hidden lg:block"
            }`}
          >
            <AiChat
              tasks={tasks}
              habits={habits}
              dailyPlan={dailyPlan}
              pomodoro={pomodoro}
              onStateUpdate={handleStateUpdate}
              onStartTimer={triggerStartTimer}
            />
          </div>

          {/* RIGHT COLUMN: Interactive Widgets Board */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              activeTab !== "concierge" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Tab layout switcher on mobile, unified full grid on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Plan widget */}
              <div
                className={`md:col-span-2 ${
                  activeTab === "timeline" || activeTab === "concierge" ? "block" : "hidden md:block"
                }`}
              >
                <DailyPlan
                  planItems={dailyPlan}
                  onToggleItem={handleTogglePlanItem}
                  onAskForPlan={handleAskForPlan}
                />
              </div>

              {/* To-Do List widget */}
              <div
                className={`${
                  activeTab === "tasks" || activeTab === "concierge" ? "block" : "hidden md:block"
                }`}
              >
                <TodoList
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                />
              </div>

              {/* Habit Tracker widget */}
              <div
                className={`${
                  activeTab === "tasks" || activeTab === "concierge" ? "block" : "hidden md:block"
                }`}
              >
                <HabitTracker
                  habits={habits}
                  onAddHabit={handleAddHabit}
                  onLogHabit={handleLogHabit}
                />
              </div>

              {/* Focus pomodoro widget */}
              <div
                className={`md:col-span-2 ${
                  activeTab === "focus" || activeTab === "concierge" ? "block" : "hidden md:block"
                }`}
              >
                <PomodoroTimer
                  state={pomodoro}
                  onSessionComplete={handlePomodoroComplete}
                  onStateUpdate={(updates) => setPomodoro((prev) => ({ ...prev, ...updates }))}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer detailing security & local-only storage */}
      <footer className="border-t border-white/5 py-6 bg-black/60 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p className="font-sans">
            &copy; 2026 Nyra AI Life Concierge. Built for full-scale privacy.
          </p>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2.5 py-1 rounded-md font-mono text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>No Tracking</span>
            </span>
            <span className="flex items-center gap-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 px-2.5 py-1 rounded-md font-mono text-[10px]">
              <Activity className="w-3.5 h-3.5" />
              <span>On-Device Storage</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
