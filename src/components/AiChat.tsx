import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Mic, MicOff, Sparkles, AlertCircle, RefreshCw, EyeOff } from "lucide-react";
import Markdown from "react-markdown";
import { Message, Task, Habit, DailyPlanItem, PomodoroState } from "../types";

interface AiChatProps {
  tasks: Task[];
  habits: Habit[];
  dailyPlan: DailyPlanItem[];
  pomodoro: PomodoroState;
  onStateUpdate: (updates: {
    tasks?: Task[];
    habits?: Habit[];
    dailyPlan?: DailyPlanItem[];
    pomodoro?: PomodoroState;
  }) => void;
  onStartTimer: (duration: number, isBreak: boolean) => void;
}

export default function AiChat({
  tasks,
  habits,
  dailyPlan,
  pomodoro,
  onStateUpdate,
  onStartTimer,
}: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hello! I am Nyra, your AI Life Concierge. How can I assist you with your routine today? You can ask me to plan your day, add some tasks, track a habit, or start a Pomodoro session.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to latest messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Set up Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        sendMessage(transcript);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== "no-speech") {
          setError(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    sendMessage(input.trim());
    setInput("");
  };

  const sendMessage = async (textToSend: string) => {
    const userMsg: Message = {
      id: "msg-" + Date.now(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);
    setError(null);

    // Prepare conversational history (keep last 10 messages for token efficiency)
    const formattedHistory = messages
      .slice(-10)
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: formattedHistory,
          state: { tasks, habits, dailyPlan, pomodoro },
          clientTime: new Date().toString(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to contact Nyra's intelligence server.");
      }

      const data = await response.json();

      const modelMsg: Message = {
        id: "msg-" + Date.now() + "-reply",
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, modelMsg]);

      // Apply state updates returned from the server tool execution
      if (data.updatedState) {
        onStateUpdate({
          tasks: data.updatedState.tasks,
          habits: data.updatedState.habits,
          dailyPlan: data.updatedState.dailyPlan,
          pomodoro: data.updatedState.pomodoro,
        });

        // Special handling if Pomodoro timer was updated / started by AI
        if (
          data.actions &&
          data.actions.some((act: any) => act.name === "startPomodoro")
        ) {
          const pomResult = data.updatedState.pomodoro;
          onStartTimer(pomResult.durationMinutes, false);
        }
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.message || "An unexpected error occurred. Please check your API key.");
    } finally {
      setIsThinking(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const suggestions = [
    "Plan my day",
    "Add a high-priority task 'Finish slides'",
    "Add daily habit 'Drink water'",
    "Start 25 min focus timer",
  ];

  return (
    <div id="ai-chat-panel" className="flex flex-col h-full rounded-3xl glass-panel relative overflow-hidden flex-1 min-h-[500px] max-h-[750px] lg:max-h-none lg:h-[750px]">
      {/* Header with avatar orb and title */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          {/* Animated Signature Orb */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Ambient glows */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-cyan-400 blur-md opacity-70"
              animate={{
                scale: isThinking ? [1, 1.4, 1] : isListening ? [1, 1.6, 1] : [1, 1.15, 1],
                opacity: isThinking ? [0.6, 0.9, 0.6] : isListening ? [0.6, 1.0, 0.6] : [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: isThinking ? 1.2 : isListening ? 0.8 : 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-pink-500 to-violet-500 blur-lg opacity-40"
              animate={{
                scale: isThinking ? [1.1, 1.3, 1.1] : [1, 1.1, 1],
                opacity: isThinking ? [0.3, 0.7, 0.3] : [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Core Orb Sphere */}
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 via-purple-700 to-cyan-400 border border-white/20 shadow-inner flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-display font-semibold text-lg text-white tracking-tight">
                Nyra
              </h2>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold font-mono">
                AI Concierge
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {isListening ? "Listening..." : isThinking ? "Formulating action..." : "Always on duty"}
            </p>
          </div>
        </div>

        {/* No Tracking privacy label */}
        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md text-[10px] font-mono">
          <EyeOff className="w-3.5 h-3.5" />
          <span>Local Storage</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.role === "user" ? "self-end items-end" : "self-start items-start"
            }`}
          >
            <div
              className={`rounded-2xl p-3 px-4 text-sm shadow-lg ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none"
                  : "bg-white/5 border border-white/8 text-gray-200 rounded-tl-none"
              }`}
            >
              {msg.role === "user" ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="markdown-body">
                  <Markdown>{msg.text}</Markdown>
                </div>
              )}
            </div>
            <span className="text-[10px] text-gray-500 mt-1 px-1 font-mono">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isThinking && (
          <div className="self-start flex items-center gap-2 text-gray-400 text-xs bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Nyra is syncing & planning...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 flex items-start gap-2 max-w-[90%]">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Sync interruption</p>
              <p className="opacity-90">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 pb-1 pt-2 flex gap-2 overflow-x-auto no-scrollbar mask-gradient">
        {suggestions.map((sug, i) => (
          <button
            key={i}
            id={`ai-suggestion-${i}`}
            onClick={() => handleSuggestionClick(sug)}
            className="flex-shrink-0 text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-full border border-white/5 transition-all duration-200"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input zone */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/10 flex items-center gap-2">
        <button
          type="button"
          id="ai-mic-btn"
          onClick={toggleListening}
          className={`p-3 rounded-xl transition-all duration-300 relative ${
            isListening
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 ring-4 ring-rose-500/30 animate-pulse"
              : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/8"
          }`}
          title={isListening ? "Stop listening" : "Speak to Nyra"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          id="ai-text-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening... Speak now." : "Command Nyra..."}
          className="flex-1 py-3 px-4 rounded-xl text-sm font-sans text-white placeholder-gray-500 glass-input"
          disabled={isThinking || isListening}
        />

        <button
          type="submit"
          id="ai-send-btn"
          disabled={!input.trim() || isThinking || isListening}
          className="p-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-md shadow-violet-600/10"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
