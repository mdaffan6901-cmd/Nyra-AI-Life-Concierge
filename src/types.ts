export interface Task {
  id: string;
  title: string;
  dueTime?: string;
  priority: "low" | "medium" | "high";
  category: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  frequency: "daily" | "weekly";
  streak: number;
  completedDates: string[]; // ISO string of dates like "YYYY-MM-DD"
  createdAt: string;
}

export interface DailyPlanItem {
  id: string;
  time: string;
  type: "task" | "habit" | "focus" | "rest" | "custom";
  title: string;
  completed: boolean;
}

export interface PomodoroState {
  isActive: boolean;
  durationMinutes: number;
  breakMinutes: number;
  completedSessionsToday: number;
}

export interface Message {
  role: "user" | "model";
  text: string;
  timestamp: string;
  id: string;
}
