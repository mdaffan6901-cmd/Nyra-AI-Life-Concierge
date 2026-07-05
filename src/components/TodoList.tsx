import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Trash2, Calendar, Flag, Plus, Tag, Filter } from "lucide-react";
import { Task } from "../types";

interface TodoListProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "completed">) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export default function TodoList({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: TodoListProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [showForm, setShowForm] = useState(false);

  // New task inputs
  const [title, setTitle] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState("Personal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask({
      title: title.trim(),
      dueTime: dueTime || undefined,
      priority,
      category: category.trim() || "General",
    });
    setTitle("");
    setDueTime("");
    setPriority("medium");
    setCategory("Personal");
    setShowForm(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const getPriorityColor = (p: "low" | "medium" | "high") => {
    if (p === "high") return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    if (p === "medium") return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
  };

  return (
    <div id="todo-list-panel" className="p-5 rounded-3xl glass-panel flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-white">To-Do List</h3>
          <p className="text-xs text-gray-400">Manage your active obligations</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-medium px-3 py-1.5 rounded-lg transition-all duration-300 shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Manual Task Creator */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 p-4 rounded-xl border border-white/8 bg-white/5 space-y-3 overflow-hidden"
          >
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                Task Title
              </label>
              <input
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm py-2 px-3 rounded-lg text-white placeholder-gray-500 glass-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                  Due Time
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-lg text-white glass-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-sm py-2 px-3 rounded-lg bg-[#12121A] text-white border border-white/8 focus:border-cyan-500 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Work, Personal"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-lg text-white glass-input"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs text-gray-400 hover:text-white px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-1.5 rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-white/5 mb-4 pb-2">
        <Filter className="w-3.5 h-3.5 text-gray-500 mr-1" />
        {(["all", "pending", "completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`text-xs px-2.5 py-1 rounded-md capitalize transition-all duration-200 font-mono ${
              filter === tab
                ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List container */}
      <div className="flex-1 overflow-y-auto max-h-[350px] space-y-2.5 pr-1">
        <AnimatePresence initial={false}>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-2.5"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 border border-white/5">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {filter === "all"
                    ? "Nothing on your plate — tell Nyra what's next"
                    : filter === "pending"
                    ? "Clear skies! No pending tasks."
                    : "No completed tasks yet."}
                </p>
                <p className="text-xs text-gray-500 max-w-[220px] mt-1 mx-auto">
                  Type a command to Nyra or tap the &quot;New Task&quot; button above.
                </p>
              </div>
            </motion.div>
          ) : (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all duration-300 ${
                  task.completed
                    ? "bg-black/20 border-white/5 opacity-50"
                    : "bg-white/5 hover:bg-white/8 border-white/8 hover:border-white/12"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Micro-animated Checkbox */}
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-300 flex-shrink-0 ${
                      task.completed
                        ? "bg-cyan-500 border-cyan-400 text-black"
                        : "border-white/20 hover:border-cyan-500 bg-black/20"
                    }`}
                  >
                    {task.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </motion.div>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium leading-tight truncate ${
                        task.completed ? "line-through text-gray-500" : "text-white"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {/* Priority Tag */}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono font-bold tracking-wider ${getPriorityColor(task.priority)}`}>
                        <Flag className="w-2.5 h-2.5 inline-block mr-0.5 -mt-0.5" />
                        {task.priority}
                      </span>

                      {/* Category Badge */}
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/10 font-sans">
                        <Tag className="w-2.5 h-2.5 inline-block mr-0.5 -mt-0.5 opacity-80" />
                        {task.category}
                      </span>

                      {/* Due Time */}
                      {task.dueTime && (
                        <span className="text-[9px] text-cyan-400 font-mono">
                          <Calendar className="w-2.5 h-2.5 inline-block mr-0.5 -mt-0.5" />
                          {task.dueTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete trigger */}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                  title="Remove task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
