import React, { useState } from "react";
import { PRELOADED_OBJECTIONS } from "../data";
import { ObjectionSolution } from "../types";
import { Shield, Sparkles, MessageSquare, Flame, Check, Copy, RefreshCw, AlertCircle } from "lucide-react";

interface ObjectionCrusherTabProps {
  activeProduct: { productName: string; productValueProps: string };
}

export default function ObjectionCrusherTab({ activeProduct }: ObjectionCrusherTabProps) {
  const [objectionText, setObjectionText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Objection Solution Representation
  const [activeSolution, setActiveSolution] = useState<ObjectionSolution | null>({
    empathyStatement: PRELOADED_OBJECTIONS[0].empathyStatement,
    reframeFormula: PRELOADED_OBJECTIONS[0].reframeFormula,
    suggestedResponse: PRELOADED_OBJECTIONS[0].suggestedResponse,
    objectionType: PRELOADED_OBJECTIONS[0].objectionType,
    confidenceScore: PRELOADED_OBJECTIONS[0].confidenceScore,
  });

  const [copiedResponse, setCopiedResponse] = useState(false);

  const handlePreloadedClick = (id: string) => {
    const found = PRELOADED_OBJECTIONS.find((o) => o.id === id);
    if (found) {
      setObjectionText(found.objectionText);
      setActiveSolution({
        empathyStatement: found.empathyStatement,
        reframeFormula: found.reframeFormula,
        suggestedResponse: found.suggestedResponse,
        objectionType: found.objectionType,
        confidenceScore: found.confidenceScore,
      });
      setError(null);
    }
  };

  const handleCrushObjection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectionText.trim()) return;

    setLoading(true);
    setError(null);
    setActiveSolution(null);

    try {
      const response = await fetch("/api/gemini/objection-handler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectionText,
          productName: activeProduct.productName,
          productValueProps: activeProduct.productValueProps,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed query to Gemini objection server.");
      }

      const data = await response.json();
      setActiveSolution(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while communicating with sales AI objection agents.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (!activeSolution) return;
    navigator.clipboard.writeText(activeSolution.suggestedResponse);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const getConfidenceLevel = (score: number) => {
    if (score >= 8) return { label: "High Playback", color: "text-[#d4af37] border-[#d4af37]/30 bg-[#d4af37]/5" };
    if (score >= 6) return { label: "Stable Playback", color: "text-blue-450 border-blue-500/20 bg-blue-500/[0.01]" };
    return { label: "Moderate Risk", color: "text-rose-400 border-rose-900/40 bg-rose-950/20" };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="objection_crusher_container">
      {/* Col 1 (4-span): Fast Objections Deck */}
      <div className="lg:col-span-4 space-y-4" id="objections_deck_selector">
        <div className="glass p-5 rounded-none">
          <h3 className="serif text-base italic text-white border-b border-white/10 pb-3 mb-4 uppercase">
            Outbound Objection Vault
          </h3>
          <div className="space-y-2.5">
            {PRELOADED_OBJECTIONS.map((obj) => (
              <button
                id={`btn-preloaded-objection-${obj.id}`}
                key={obj.id}
                onClick={() => handlePreloadedClick(obj.id)}
                className={`w-full text-left p-3 rounded-none border text-xs transition duration-200 cursor-pointer ${
                  objectionText === obj.objectionText
                    ? "bg-white/[0.04] border-white/30 text-white"
                    : "bg-transparent border-white/5 text-slate-400 hover:bg-white/[0.02] hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between text-[8px] uppercase tracking-widest font-mono font-semibold mb-1 text-slate-500">
                  <span>{obj.objectionType} objection</span>
                  <span>Rating: {obj.confidenceScore}/10</span>
                </div>
                <p className="line-clamp-2 leading-relaxed font-sans">{obj.objectionText}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Live Call Input area */}
        <div className="glass p-5 rounded-none transition">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-4">
            <div className="p-2 bg-white/5 border border-white/10 text-rose-400">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className="serif text-lg italic text-white leading-none">Live Pushback Capture</h3>
              <p className="text-[9px] tracking-wide text-slate-500 uppercase mt-0.5">Real-time objection reframing</p>
            </div>
          </div>
          <form onSubmit={handleCrushObjection} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-550 mb-1 font-semibold">What did the prospect just say?</label>
              <textarea
                id="live-objection-textarea"
                rows={3}
                required
                value={objectionText}
                onChange={(e) => setObjectionText(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-none p-2.5 text-slate-200 focus:outline-none focus:border-[#d4af37]"
                placeholder="e.g. We are cutting software spend by 30%..."
              />
            </div>
            <button
              id="submit-objection-crush-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 font-semibold tracking-wider uppercase text-[11px] bg-white text-black hover:bg-slate-200 transition-all rounded-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {loading ? "Crushing Objection..." : "Synthesize Reframe Solution"}
            </button>
          </form>
        </div>
      </div>

      {/* Col 2 (8-span): Structured Strategic Solution */}
      <div className="lg:col-span-8 space-y-4" id="objection_playback_deck">
        {loading && (
          <div className="p-12 glass border-dashed text-center min-h-[380px] flex flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 text-[#d4af37] animate-spin mb-4" />
            <h4 className="serif text-xl italic text-white animate-pulse">Running Tactical Reframing Formula...</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-2 font-sans leading-relaxed">
              Applying premium sales psychology frameworks: Empathize with customer parameters, pivot to active core value, and present closing validation checkpoint.
            </p>
          </div>
        )}

        {error && (
          <div className="p-6 glass border-l-2 border-l-rose-500 text-xs text-rose-300 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
              <div>
                <h4 className="serif text-[#d4af37] text-lg italic leading-none">Intelligence Stream Interrupted</h4>
                <p className="mt-1 text-slate-400 font-sans">The API returns an authorization warning. Please check your developer environment configurations.</p>
              </div>
            </div>
            <p className="p-2.5 bg-slate-950 border border-white/5 font-mono text-slate-300 break-all rounded-none">
              Details: {error}
            </p>
            <p className="text-slate-400 leading-relaxed text-xs font-sans">
              Set your valid <code className="text-[#d4af37] font-mono text-xs">GEMINI_API_KEY</code> within the <strong className="text-white">Settings &gt; Secrets</strong> pane to proceed.
            </p>
          </div>
        )}

        {!activeSolution && !loading && !error && (
          <div className="p-12 glass text-center text-slate-500 min-h-[350px] flex flex-col items-center justify-center text-xs">
            <MessageSquare className="h-10 w-10 text-slate-650 mb-3" />
            <p className="serif text-xl italic text-[#d4af37]">Resolution System Standby</p>
            <p className="text-slate-400 max-w-sm mt-2 font-sans leading-relaxed">Click any quick objection on your vault menu or key in a custom live calling objection to render dynamic reframes.</p>
          </div>
        )}

        {activeSolution && !loading && !error && (
          <div className="p-6 glass rounded-none space-y-5 animate-in fade-in duration-300" id="objection_result_card">
            {/* Header / Meta bar */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="text-[9px] text-[#8fa0c2] uppercase font-mono tracking-widest font-semibold">Tactical Solution Playbook</span>
                <h3 className="serif text-lg italic text-white mt-1 leading-none">Counter Objection Playbook Sheet</h3>
              </div>
              <div className="flex items-center gap-2 font-sans">
                <span className="px-2.5 py-1 border border-white/10 rounded-none bg-slate-950/40 text-slate-450 text-[10px] font-semibold uppercase tracking-wider font-mono">
                  {activeSolution.objectionType}
                </span>
                <span className={`px-2.5 py-1 border rounded-none text-[10px] font-semibold uppercase tracking-wider font-mono ${getConfidenceLevel(activeSolution.confidenceScore).color}`}>
                  {getConfidenceLevel(activeSolution.confidenceScore).label}
                </span>
              </div>
            </div>

            {/* Core Blueprint steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1.5 p-4 rounded-none bg-white/[0.01] border border-white/10">
                <span className="text-[9px] text-[#d4af37] font-semibold uppercase tracking-widest block">1. Empathize & Disarm</span>
                <p className="text-slate-200 leading-relaxed font-serif italic text-sm">&ldquo;{activeSolution.empathyStatement}&rdquo;</p>
                <span className="text-[9px] text-slate-500 block mt-2">Lowers prospect defensive thresholds to allow pivot logic.</span>
              </div>

              <div className="space-y-1.5 p-4 rounded-none bg-white/[0.01] border border-white/10">
                <span className="text-[9px] text-blue-450 font-semibold uppercase tracking-widest block">2. Value Pivot Reframe</span>
                <p className="text-slate-200 leading-relaxed text-xs">{activeSolution.reframeFormula}</p>
                <span className="text-[9px] text-slate-500 block mt-2 font-sans">Establishes our core value hooks directly within their business context.</span>
              </div>
            </div>

            {/* The Live Action spoken verbal response script */}
            <div className="space-y-2 pt-2 cursor-pointer" id="spoken_verbal_script_box" onClick={handleCopyResponse}>
              <div className="flex items-center justify-between font-sans">
                <span className="text-[9px] text-[#8fa0c2] font-semibold uppercase tracking-widest">3. Speak Response Cue Card</span>
                <button
                  id="copy-verbal-response-btn"
                  className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-semibold text-slate-400 hover:text-white"
                >
                  {copiedResponse ? <Check className="h-3.5 w-3.5 text-[#d4af37]" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedResponse ? "Copied" : "Copy Cue"}
                </button>
              </div>

              <div className="border border-[#d4af37]/30 bg-[#d4af37]/[0.02] p-5 rounded-none relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-0.5 h-full bg-[#d4af37]"></div>
                <div className="absolute top-2.5 right-2.5 py-0.5 px-2 text-[8px] uppercase font-mono font-bold tracking-widest text-[#d4af37] bg-slate-950 border border-[#d4af37]/20 opacity-50 group-hover:opacity-100 transition">
                  Dial Verbal Script
                </div>
                <p className="text-xs text-white leading-relaxed font-serif pr-16 select-all italic font-medium">
                  &ldquo;{activeSolution.suggestedResponse}&rdquo;
                </p>
              </div>
              <p className="text-[9px] text-slate-500 text-center font-mono uppercase tracking-wider">Tone: Maintain pacing stability, quiet self-assured tone, and pause 1 full second after asking the validation check.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
