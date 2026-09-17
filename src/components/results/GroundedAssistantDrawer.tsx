"use client";

import React, { useState } from "react";
import { X, Sparkles, Send, Bot, User, ShieldAlert } from "lucide-react";
import { AnalyzedIngredient } from "@/types";
import { generateGroundedAssistantResponse } from "@/lib/assistant/groundedAssistant";

interface GroundedAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  perfumeName: string;
  ingredients: AnalyzedIngredient[];
  initialIngredient?: AnalyzedIngredient;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citations?: string[];
}

export const GroundedAssistantDrawer: React.FC<GroundedAssistantDrawerProps> = ({
  isOpen,
  onClose,
  perfumeName,
  ingredients,
  initialIngredient,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialIngredient) {
      return [
        {
          id: "init-1",
          sender: "assistant",
          text: `I am your OLFEXA Grounded Assistant. I see you are inquiring about ${initialIngredient.matchedInci || initialIngredient.rawInput}. According to our verified regulatory records, this ingredient is classified as a ${initialIngredient.category.replace("_", " ")}${initialIngredient.isEuAllergen ? " and is a declared EU Annex III fragrance allergen subject to labeling thresholds" : ""}. How can I clarify its evidence dossier for you?`,
          citations: initialIngredient.evidence.map((e) => e.organization),
        },
      ];
    }
    return [
      {
        id: "init-default",
        sender: "assistant",
        text: `Welcome to OLFEXA Assistant for "${perfumeName}". I am strictly grounded in the verified regulatory records and ingredient disclosures for this fragrance. You can ask why specific ingredients were flagged, check alcohol types, or understand allergen classifications.`,
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputQuery.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsTyping(true);

    // Grounded synthesis using constrained assistant policy engine
    setTimeout(() => {
      const groundedRes = generateGroundedAssistantResponse({
        question: query,
        context: {
          perfumeName,
          ingredients,
        },
        targetIngredient: initialIngredient
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: "assistant",
          text: groundedRes.answer,
          citations: groundedRes.citedSources.map(s => s.organization),
        },
      ]);
      setIsTyping(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-background h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                OLFEXA Intelligence Assistant
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-500">
                  Grounded
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 truncate max-w-[280px]">
                {perfumeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guardrail Disclaimer Notice */}
        <div className="bg-amber-50/70 dark:bg-amber-950/20 border-b border-amber-200/60 dark:border-amber-900/30 px-4 py-2 flex items-center gap-2 text-[11px] text-amber-900 dark:text-amber-300">
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Responses are strictly derived from verified ingredient dossiers. No medical claims.</span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`rounded-2xl p-3.5 max-w-[85%] text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-emerald-700 text-white rounded-br-xs"
                    : "bg-slate-100/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/60 whitespace-pre-line"
                }`}
              >
                {msg.text}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-1">
                    {msg.citations.map((c, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 uppercase"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <Bot className="w-4 h-4 text-slate-400" />
              <span className="italic">Verifying regulatory records...</span>
            </div>
          )}
        </div>

        {/* Query Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-card-bg">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about an ingredient or allergen..."
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl text-xs font-medium flex items-center justify-center transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Examples: &quot;Why was Limonene highlighted?&quot; or &quot;Does this contain ethanol?&quot;
          </p>
        </form>
      </div>
    </div>
  );
};
