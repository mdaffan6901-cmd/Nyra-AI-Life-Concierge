import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Calendar, Check, Circle, Bookmark } from "lucide-react";
import { DailyPlanItem } from "../types";

interface DailyPlanProps {
  planItems: DailyPlanItem[];
  onToggleItem: (id: string) => void;
  onAskForPlan: () => void;
}

export default function DailyPlan({
  planItems,
  onToggleItem,
  onAskForPlan,
}: DailyPlanProps) {
  const getTypeBadgeStyle = (type: DailyPlanItem["type"]) => {
    switch (type) {
      case "task":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "habit":
        return "bg-pink-500/10 text-pink-400 border border-pink-500/20";
      case "focus":
        return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
      case "rest":
        return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  return (
    <div id="daily-plan-panel" className="p-5 rounded-3xl glass-panel flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-white">Daily Plan</h3>
          <p className="text-xs text-gray-400">Your smart chronological itinerary</p>
        </div>

        <button
          onClick={onAskForPlan}
          className="flex items-center gap-1 text-xs bg-white/5 hover:bg-white/10 text-gray-300 border border-white/8 px-3 py-1.5 rounded-lg transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
          <span>Regenerate Plan</span>
        </button>
      </div>

      {/* Main Timeline content */}
      <div className="flex-1 overflow-y-auto max-h-[350px] space-y-3.5 pr-1">
        {planItems.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 border border-white/5">
              <Bookmark className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">
                Your day is a blank slate — ask Nyra to build your schedule
              </p>
              <p className="text-xs text-gray-500 max-w-[280px] mt-1.5 mx-auto">
                Type <span className="font-mono text-cyan-400 font-semibold">&quot;Plan my day&quot;</span> in the concierge chat to compile your current tasks and habits into a time-ordered routine!
              </p>
            </div>
            <button
              onClick={onAskForPlan}
              className="text-xs font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-md shadow-violet-600/10"
            >
              Ask Nyra to Plan Today
            </button>
          </div>
        ) : (
          <div className="relative border-l-2 border-white/5 pl-4 ml-2.5 space-y-4">
            <AnimatePresence initial={false}>
              {planItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative flex items-start gap-3 group"
                >
                  {/* Timeline bullet dot */}
                  <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-[#0A0A0F] group-hover:scale-125 transition-transform duration-200" />

                  {/* Item card */}
                  <div className={`flex-1 p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    item.completed
                      ? "bg-black/20 border-white/5 opacity-50"
                      : "bg-white/5 border-white/8 hover:bg-white/8"
                  }`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Custom checklist bullet */}
                      <button
                        onClick={() => onToggleItem(item.id)}
                        className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border transition-all ${
                          item.completed
                            ? "bg-cyan-500 border-cyan-400 text-black"
                            : "border-white/20 hover:border-cyan-400 bg-black/25"
                        }`}
                      >
                        {item.completed ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        {/* Time tag */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold text-cyan-400">
                            {item.time}
                          </span>
                          <span className={`text-[8px] uppercase tracking-wider font-mono font-extrabold px-1.5 py-0.2 rounded-full ${getTypeBadgeStyle(item.type)}`}>
                            {item.type}
                          </span>
                        </div>

                        {/* Title text */}
                        <p className={`text-sm font-sans font-medium leading-snug truncate ${
                          item.completed ? "line-through text-gray-500" : "text-white"
                        }`}>
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
