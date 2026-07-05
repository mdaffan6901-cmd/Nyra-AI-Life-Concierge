import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Flame, Calendar, Plus, CheckCircle, Circle, Layers } from "lucide-react";
import { Habit } from "../types";

interface HabitTrackerProps {
  habits: Habit[];
  onAddHabit: (name: string, frequency: "daily" | "weekly") => void;
  onLogHabit: (id: string, date: string) => void;
}

export default function HabitTracker({ habits, onAddHabit, onLogHabit }: HabitTrackerProps) {
  const [view, setView] = useState<"today" | "weekly" | "monthly">("today");
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddHabit(name.trim(), frequency);
    setName("");
    setShowAddForm(false);
  };

  // Generate date array for the last N days
  const getLastNDays = (n: number): string[] => {
    const arr: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d.toISOString().split("T")[0]);
    }
    return arr;
  };

  const weeklyDates = getLastNDays(7);
  const monthlyDates = getLastNDays(30);

  const getDayLetter = (dateStr: string) => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    const d = new Date(dateStr);
    return days[d.getDay()];
  };

  const getDayNumber = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getDate();
  };

  return (
    <div id="habit-tracker-panel" className="p-5 rounded-3xl glass-panel flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-white">Habit Tracker</h3>
          <p className="text-xs text-gray-400">Build high-performing routines</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-xs bg-white/5 hover:bg-white/10 text-gray-300 border border-white/8 px-3 py-1.5 rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 p-4 rounded-xl border border-white/8 bg-white/5 space-y-3 overflow-hidden"
          >
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                Habit Routine
              </label>
              <input
                type="text"
                placeholder="e.g. Drink 3L water, Morning Journal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm py-2 px-3 rounded-lg text-white placeholder-gray-500 glass-input"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                Frequency
              </label>
              <div className="flex gap-2">
                {(["daily", "weekly"] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequency(freq)}
                    className={`flex-1 py-1.5 rounded-lg text-xs capitalize border transition-all ${
                      frequency === freq
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                        : "bg-[#12121A] text-gray-400 border-white/5 hover:border-white/10"
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-gray-400 hover:text-white px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-1.5 rounded-lg transition-colors"
              >
                Add Habit
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Switch View Toggles */}
      <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 mb-4 max-w-sm self-start">
        {(["today", "weekly", "monthly"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`text-[11px] font-mono font-medium uppercase tracking-wider px-3.5 py-1.5 rounded-lg capitalize transition-all duration-300 ${
              view === v
                ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-600/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Habits Area */}
      <div className="flex-1 overflow-y-auto max-h-[350px] space-y-3.5 pr-1">
        {habits.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 border border-white/5">
              <Activity className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">
                No active habits yet — tell Nyra what rituals to log
              </p>
              <p className="text-xs text-gray-500 max-w-[240px] mt-1 mx-auto">
                E.g., &quot;Remind me to read 10 pages daily&quot; or tap the &quot;New Habit&quot; button above.
              </p>
            </div>
          </div>
        ) : (
          habits.map((habit) => {
            const isCompletedToday = habit.completedDates.includes(todayStr);

            return (
              <div
                key={habit.id}
                className="p-4 rounded-xl bg-white/5 border border-white/8 space-y-3.5"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-sans font-semibold text-sm text-white leading-tight">
                      {habit.name}
                    </h4>
                    <span className="text-[10px] bg-white/5 border border-white/8 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                      {habit.frequency}
                    </span>
                  </div>

                  {/* Streak Badge with Warm Accent */}
                  <div className="flex items-center gap-1.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2.5 py-1 rounded-full text-xs font-mono font-bold tracking-tight shadow-sm">
                    <Flame className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
                    <span>🔥 {habit.streak} day streak</span>
                  </div>
                </div>

                {/* Switchable visualization views */}
                {view === "today" && (
                  <div className="flex items-center justify-between bg-black/20 p-2.5 rounded-lg border border-white/5">
                    <p className="text-xs text-gray-400">
                      {isCompletedToday ? "All set for today!" : "Pending action today"}
                    </p>

                    <button
                      onClick={() => onLogHabit(habit.id, todayStr)}
                      disabled={isCompletedToday}
                      className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                        isCompletedToday
                          ? "bg-cyan-500/20 text-cyan-400 cursor-not-allowed border border-cyan-500/20"
                          : "bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-md shadow-violet-600/10"
                      }`}
                    >
                      {isCompletedToday ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Logged</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5" />
                          <span>Log Done</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {view === "weekly" && (
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                      Weekly consistency
                    </p>
                    <div className="grid grid-cols-7 gap-1">
                      {weeklyDates.map((date) => {
                        const isDone = habit.completedDates.includes(date);
                        const isToday = date === todayStr;

                        return (
                          <div
                            key={date}
                            className="flex flex-col items-center gap-1"
                          >
                            <span className={`text-[10px] font-mono ${isToday ? "text-cyan-400 font-semibold" : "text-gray-500"}`}>
                              {getDayLetter(date)}
                            </span>

                            <button
                              onClick={() => !isDone && onLogHabit(habit.id, date)}
                              disabled={isDone}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono border transition-all ${
                                isDone
                                  ? "bg-gradient-to-tr from-violet-600/80 to-cyan-500/80 text-white border-cyan-500/40 shadow-sm"
                                  : isToday
                                  ? "border-cyan-500/40 hover:border-cyan-500 bg-cyan-500/5 text-cyan-400"
                                  : "border-white/10 hover:border-white/20 bg-black/20 text-gray-400"
                              }`}
                              title={`Log for ${date}`}
                            >
                              {isDone ? "✓" : getDayNumber(date)}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {view === "monthly" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                        30-day routine map (Heatmap)
                      </p>
                      <span className="text-[9px] text-gray-400">
                        {habit.completedDates.length} logged
                      </span>
                    </div>

                    {/* Heatmap Grid */}
                    <div className="flex flex-wrap gap-1 p-2 bg-black/20 rounded-lg border border-white/5">
                      {monthlyDates.map((date) => {
                        const isDone = habit.completedDates.includes(date);
                        const isToday = date === todayStr;

                        return (
                          <div
                            key={date}
                            className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 transition-all ${
                              isDone
                                ? "bg-gradient-to-br from-violet-500 to-cyan-400 border border-cyan-400/20 shadow-sm shadow-cyan-400/10"
                                : isToday
                                ? "border border-cyan-500/50 bg-cyan-500/10"
                                : "bg-white/5 border border-white/5"
                            }`}
                            title={date + (isDone ? " - Completed!" : " - Empty")}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
