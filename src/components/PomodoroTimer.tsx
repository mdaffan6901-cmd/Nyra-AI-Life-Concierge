import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Award, Settings, CheckCircle } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { PomodoroState } from "../types";

interface PomodoroTimerProps {
  state: PomodoroState;
  onSessionComplete: () => void;
  onStateUpdate: (updates: Partial<PomodoroState>) => void;
}

export default function PomodoroTimer({
  state,
  onSessionComplete,
  onStateUpdate,
}: PomodoroTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(state.durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(true);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [customWork, setCustomWork] = useState(state.durationMinutes.toString());
  const [customBreak, setCustomBreak] = useState(state.breakMinutes.toString());
  const [showConfig, setShowConfig] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal countdown when state changes externally (like from Nyra)
  useEffect(() => {
    if (state.isActive) {
      setMode("work");
      setSecondsLeft(state.durationMinutes * 60);
      setIsPaused(false);
      // reset active flag once processed
      onStateUpdate({ isActive: false });
    }
  }, [state.isActive, state.durationMinutes]);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, mode]);

  // Request notification permissions
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const triggerChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      // Futuristic digital chime: two oscillator notes (C5 then G5)
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration);
      };

      playNote(523.25, ctx.currentTime, 0.4); // C5
      playNote(783.99, ctx.currentTime + 0.15, 0.6); // G5
    } catch (e) {
      console.error("Audio Synthesis error", e);
    }
  };

  const handleTimerEnd = () => {
    setIsPaused(true);
    triggerChime();

    const title = mode === "work" ? "Focus Session Complete!" : "Break is over!";
    const body = mode === "work" ? "Great job! Time to take a break." : "Ready to get back to focus?";

    // Desktop notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }

    // Toast
    showToast(`${title} ${body}`);

    if (mode === "work") {
      onSessionComplete(); // Increment completed sessions
      // Switch to break automatically
      setMode("break");
      setSecondsLeft(state.breakMinutes * 60);
    } else {
      // Switch to work automatically
      setMode("work");
      setSecondsLeft(state.durationMinutes * 60);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handlePlayPause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsPaused(true);
    setSecondsLeft((mode === "work" ? state.durationMinutes : state.breakMinutes) * 60);
  };

  const applyCustomSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const workMin = Math.max(1, parseInt(customWork) || 25);
    const breakMin = Math.max(1, parseInt(customBreak) || 5);

    onStateUpdate({
      durationMinutes: workMin,
      breakMinutes: breakMin,
    });

    setSecondsLeft((mode === "work" ? workMin : breakMin) * 60);
    setShowConfig(false);
    showToast(`Timer configured to ${workMin}m focus / ${breakMin}m break`);
  };

  // Circular progress calculations
  const totalDuration = (mode === "work" ? state.durationMinutes : state.breakMinutes) * 60;
  const progressRatio = totalDuration > 0 ? secondsLeft / totalDuration : 0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div id="pomodoro-timer-panel" className="p-5 rounded-3xl glass-panel flex flex-col items-center justify-between h-full text-center relative overflow-hidden">
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <div className="absolute top-3 left-3 right-3 z-50 bg-cyan-500 text-black text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-cyan-400">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <p className="flex-1 text-left">{toastMessage}</p>
          </div>
        )}
      </AnimatePresence>

      <div className="w-full flex items-center justify-between mb-4">
        <div className="text-left">
          <h3 className="font-display font-bold text-lg text-white">Focus Timer</h3>
          <p className="text-xs text-gray-400">Pomodoro clock</p>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className={`p-1.5 rounded-lg border transition-all ${
            showConfig
              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
              : "border-white/10 text-gray-400 hover:text-white"
          }`}
          title="Configure intervals"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Config Panel */}
      <AnimatePresence>
        {showConfig && (
          <div className="absolute inset-x-5 top-16 z-40 p-4 rounded-xl border border-white/8 bg-[#0F0F16] shadow-xl text-left space-y-3">
            <h4 className="text-xs font-mono uppercase text-gray-400">Custom Intervals</h4>
            <form onSubmit={applyCustomSettings} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 font-mono mb-1">Focus (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customWork}
                    onChange={(e) => setCustomWork(e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 rounded bg-black border border-white/10 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-mono mb-1">Break (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customBreak}
                    onChange={(e) => setCustomBreak(e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 rounded bg-black border border-white/10 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg transition-colors"
              >
                Apply Custom Intervals
              </button>
            </form>
          </div>
        )}
      </AnimatePresence>

      {/* Mode selectors */}
      <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5 mb-4">
        <button
          onClick={() => {
            setMode("work");
            setIsPaused(true);
            setSecondsLeft(state.durationMinutes * 60);
          }}
          className={`text-[10px] font-mono font-bold tracking-wider px-3.5 py-1.5 rounded uppercase transition-all duration-300 ${
            mode === "work" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25" : "text-gray-400 hover:text-white"
          }`}
        >
          Work
        </button>
        <button
          onClick={() => {
            setMode("break");
            setIsPaused(true);
            setSecondsLeft(state.breakMinutes * 60);
          }}
          className={`text-[10px] font-mono font-bold tracking-wider px-3.5 py-1.5 rounded uppercase transition-all duration-300 ${
            mode === "break" ? "bg-pink-500/10 text-pink-400 border border-pink-500/25" : "text-gray-400 hover:text-white"
          }`}
        >
          Break
        </button>
      </div>

      {/* Progress Ring */}
      <div className="relative my-4 flex items-center justify-center">
        <svg className="w-48 h-48 transform -rotate-90">
          {/* Base circle background */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Active progress stroke */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke={mode === "work" ? "url(#neon-cyan-purple)" : "url(#neon-pink-violet)"}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
          {/* Define gradients for the stroke colors */}
          <defs>
            <linearGradient id="neon-cyan-purple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
            <linearGradient id="neon-pink-violet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B9D" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>

        {/* Counter values */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-display font-extrabold tracking-tight text-white">
            {formatTime(secondsLeft)}
          </p>
          <p className="text-[10px] uppercase tracking-wider font-mono text-gray-500 mt-1">
            {mode === "work" ? "Focus block" : "Recharge"}
          </p>
        </div>
      </div>

      {/* Action panel triggers */}
      <div className="flex gap-2 w-full max-w-xs mt-4">
        <button
          onClick={handlePlayPause}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold font-sans transition-all duration-300 ${
            isPaused
              ? mode === "work"
                ? "bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white"
                : "bg-gradient-to-r from-pink-600 to-violet-500 hover:from-pink-500 hover:to-violet-400 text-white"
              : "bg-white/5 border border-white/8 hover:bg-white/10 text-white"
          }`}
        >
          {isPaused ? (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Start session</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause clock</span>
            </>
          )
          }
        </button>

        <button
          onClick={handleReset}
          className="p-2 bg-white/5 hover:bg-white/10 border border-white/8 text-gray-400 hover:text-white rounded-xl transition-all"
          title="Reset timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stats footer row */}
      <div className="w-full border-t border-white/5 mt-5 pt-3 flex items-center justify-center gap-2">
        <Award className="w-4 h-4 text-amber-400" />
        <span className="text-[11px] font-mono text-gray-400">
          Completed Today: <b className="text-white">{state.completedSessionsToday} sessions</b>
        </span>
      </div>
    </div>
  );
}
