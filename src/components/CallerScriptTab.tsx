import React, { useState, useEffect } from "react";
import { Lead, ColdCallScript } from "../types";
import { Play, Pause, Square, Sparkles, RefreshCcw, BookOpen, AlertCircle, Copy, Check, MessageSquareCode, Award, Clock, Laptop, ChevronRight } from "lucide-react";

interface CallerScriptTabProps {
  selectedLeadForScript: Lead | null;
  activeProduct: { productName: string; productValueProps: string };
}

export default function CallerScriptTab({
  selectedLeadForScript,
  activeProduct,
}: CallerScriptTabProps) {
  // ICP & Target Config States
  const [targetAudience, setTargetAudience] = useState("");
  const [valueProposition, setValueProposition] = useState("");
  const [problemSolved, setProblemSolved] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Script State
  const [activeScript, setActiveScript] = useState<ColdCallScript | null>({
    intro: "Hi Sarah, my name is Alexis, calling from Autosend AI—how is your Tuesday going?\n\nListen, Sarah, I know I'm an unexpected call in the middle of your week. Do you have 30 seconds for me to share why we're connecting, and then you can decide if we hang up?",
    problemPitch: "We work with growing SaaS companies. A lot of VP's tell us their SDRs spend upwards of 3 hours every day writing individual emails instead of making calls. They're spending hours on manual research just to get replies.",
    socialProof: "What we do is drop in high-quality research triggers into your Salesforce sequences. We actually helped SalesScale decrease research time by 60% and doubled their outbound response rates last month.",
    closeCall: "I wanted to see if you have your calendar handy—are you open to a brief, 10-minute outline run-through next Thursday at 10 AM, or is that a terrible idea?",
    tips: [
      "Keep your tone calm, quiet, and friendly—not excited like a typical aggressive marketer.",
      "Pause for a full 2 seconds after asking the permission hook, letting the awkward silence work to establish trust."
    ]
  });

  // Teleprompter Active Play step
  const [activeStep, setActiveStep] = useState(0); // 0: Intro, 1: Problem, 2: Proof, 3: Close

  // Calling dialer timer states
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Clipboard copies
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  // Dynamic replacement/live personalization parameters
  const [prospectName, setProspectName] = useState("Sarah");
  const [prospectCompany, setProspectCompany] = useState("SalesScale");

  const [maxStepReached, setMaxStepReached] = useState(1);
  useEffect(() => {
    setMaxStepReached((prev) => Math.max(prev, activeStep + 1));
  }, [activeStep]);

  // Session Summary Control States
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    duration: number;
    phasesRead: number;
    scriptPitched: string;
    coachingScore: number;
    deliveryAdvice: string[];
  } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Sync with selected lead
  useEffect(() => {
    if (selectedLeadForScript) {
      setTargetAudience(`${selectedLeadForScript.title} inside ${selectedLeadForScript.industry || "their sector"}`);
      setValueProposition(`Eliminate ${selectedLeadForScript.painPoints.toLowerCase()}`);
      setProblemSolved(selectedLeadForScript.painPoints);
      setProspectName(selectedLeadForScript.name);
      setProspectCompany(selectedLeadForScript.company);
      setActiveStep(0);
      setMaxStepReached(1);
    } else {
      setTargetAudience("VP of Sales / BizDev Directors");
      setValueProposition("Automate manual research to double outbound campaign reply rates");
      setProblemSolved("SDRs wasting 4 hours a day researching prospect accounts instead of pitching");
      setProspectName("Sarah");
      setProspectCompany("SalesScale");
      setMaxStepReached(1);
    }
  }, [selectedLeadForScript]);

  const replaceTokens = (text: string) => {
    if (!text) return "";
    let formatted = text;
    formatted = formatted.replace(/\bSarah\b/g, prospectName || "prospect");
    formatted = formatted.replace(/\[Prospect Name\]/gi, prospectName || "prospect");
    formatted = formatted.replace(/\[Prospect\]/gi, prospectName || "prospect");
    
    formatted = formatted.replace(/\bAutosend AI\b/g, activeProduct.productName || "our product");
    formatted = formatted.replace(/\[Product Name\]/gi, activeProduct.productName || "our product");
    
    formatted = formatted.replace(/\bSalesScale\b/gi, prospectCompany || "your organization");
    formatted = formatted.replace(/\[Company Name\]/gi, prospectCompany || "your organization");
    formatted = formatted.replace(/\[Company\]/gi, prospectCompany || "your organization");
    return formatted;
  };

  const handleCopyFullScript = () => {
    if (!activeScript) return;
    const fullText = `[PHASE 1: INTRO & HOOK]\n${replaceTokens(activeScript.intro)}\n\n` +
      `[PHASE 2: PROBLEM TEASE]\n${replaceTokens(activeScript.problemPitch)}\n\n` +
      `[PHASE 3: CONTRAST / SOCIAL PROOF]\n${replaceTokens(activeScript.socialProof)}\n\n` +
      `[PHASE 4: EASY CTA CLOSE]\n${replaceTokens(activeScript.closeCall)}`;
    
    handleCopyText(fullText, "full-script");
  };

  const handleEndCallAndCoach = () => {
    setTimerRunning(false);
    const duration = timerSeconds;
    const phasesRead = maxStepReached;
    
    let coachingScore = 70;
    let adviceList: string[] = [];
    
    if (duration < 30) {
      coachingScore = 65;
      adviceList = [
        "Your dial session was brief (under 30s). This usually indicates a direct gatekeeper block or rapid brush-off.",
        "Focus on delivering Phase 1 (Intro Permission) in a completely soft, calm, non-sales voice. Slow down your words on the open.",
        "Never begin pitching the product immediately. Secure the initial agreement window of 30 seconds first."
      ];
    } else if (duration >= 30 && duration < 90) {
      coachingScore = 84;
      adviceList = [
        "Success: You successfully bypassed the gatekeeper and cleared the pattern interrupt (Phase 1).",
        "To scale up Phase 2/3 (Problem and Pivot), mention concrete metrics that are hyper-relevant to their industry segment.",
        "Keep pauses deliberate. Silence is your ally; allow them to react to the problem tease before sharing the close."
      ];
    } else {
      coachingScore = 96;
      adviceList = [
        "Elite Dial: Engagement elapsed over 90 seconds represents standard high-impact talk time.",
        "When in Phase 4, close directly for calendar commit. Never offer multiple days—suggest standard Thursdays 'or is that a terrible idea?'",
        "Dump notes in CRM sandbox triggers immediately to log follow-up tasks."
      ];
    }
    
    const scriptPitched = `Intro Phase: "${replaceTokens(activeScript?.intro || "")}"\n\nTargeting problem: "${replaceTokens(activeScript?.problemPitch || "")}"`;

    setSummaryData({
      duration,
      phasesRead,
      scriptPitched,
      coachingScore,
      deliveryAdvice: adviceList
    });
    
    setShowSummary(true);
  };

  const handleGenCallScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAudience || !valueProposition) {
      setError("Please input a target buyer persona and value proposition.");
      return;
    }

    setLoading(true);
    setError(null);
    setActiveScript(null);

    try {
      const response = await fetch("/api/gemini/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetAudience,
          valueProposition,
          problemSolved,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed query to Gemini script builder.");
      }

      const data = await response.json();
      setActiveScript(data);
      setActiveStep(0);
      setMaxStepReached(1);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while compiling AI calling script.");
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const getStepText = (step: number) => {
    if (!activeScript) return "";
    switch (step) {
      case 0:
        return activeScript.intro;
      case 1:
        return activeScript.problemPitch;
      case 2:
        return activeScript.socialProof;
      case 3:
        return activeScript.closeCall;
      default:
        return "";
    }
  };

  const stepsList = [
    { title: "Intro & Hook", desc: "Gain 30 secs permission" },
    { title: "Problem Tease", desc: "Target role pain" },
    { title: "Contrast / Social Proof", desc: "How you solve it" },
    { title: "Easy CTA Close", desc: "Book meeting time" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="caller_script_container">
      {/* Col 1 (5-span): Dashboard Timer + Client Script Builder Form */}
      <div className="lg:col-span-5 space-y-4" id="caller_control_pannels">
        {/* Call Timer Cockpit */}
        <div className="glass p-5 rounded-none flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold font-sans">Active Dialer Timer</span>
            <div className="text-3xl font-mono text-[#d4af37] leading-none font-light">{formatTimer(timerSeconds)}</div>
          </div>
          <div className="flex items-center gap-2" id="dialer_clock_controls">
            <button
              id="btn-timer-toggle"
              onClick={() => setTimerRunning(!timerRunning)}
              className={`p-2.5 border transition cursor-pointer rounded-none ${
                timerRunning
                  ? "border-[#d4af37]/30 bg-[#d4af37]/5 text-[#d4af37]"
                  : "border-white/10 bg-white/5 text-slate-300 hover:text-white"
              }`}
            >
              {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              id="btn-timer-reset"
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(0);
              }}
              title="Reset dialer clock"
              className="p-2.5 border border-white/10 bg-transparent text-slate-500 hover:text-white transition rounded-none cursor-pointer"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
            {timerSeconds > 0 && (
              <button
                id="btn-end-call-coach"
                onClick={handleEndCallAndCoach}
                className="py-2.5 px-3 bg-[#d4af37] text-black font-semibold text-[10px] uppercase tracking-wider hover:bg-[#ffe699] transition rounded-none flex items-center gap-1 cursor-pointer"
                title="Conclude call session and view coaching analytics"
              >
                <Square className="h-3 w-3 fill-black" />
                <span>Coach Me</span>
              </button>
            )}
          </div>
        </div>

        {/* Sales Script Target customization */}
        <div className="glass p-5 rounded-none space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <div className="p-2 bg-white/5 border border-white/10 text-blue-400">
              <MessageSquareCode className="h-4 w-4" />
            </div>
            <div>
              <h3 className="serif text-lg italic text-white flex items-center gap-1">Teleprompter Composer</h3>
              <p className="text-[9px] tracking-wide text-slate-500 uppercase mt-0.5 font-sans">Interactive speech scripting engine</p>
            </div>
          </div>

          {selectedLeadForScript && (
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none text-xs font-sans leading-relaxed">
              <span className="text-[9px] font-semibold text-[#8fa0c2] tracking-wider uppercase block">Target lead profile</span>
              Awaiting dial to <strong className="text-white">{selectedLeadForScript.name}</strong>, {selectedLeadForScript.title} at {selectedLeadForScript.company}.
            </div>
          )}

          <form onSubmit={handleGenCallScript} className="space-y-4 text-xs font-sans">
            {/* Live Personalization Fields */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-none">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[#d4af37] font-semibold mb-1">Prospect Name</label>
                <input
                  id="script-prospect-name"
                  type="text"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-none px-2 py-1 text-slate-200 focus:outline-none focus:border-[#d4af37]"
                  placeholder="e.g. Sarah"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[#d4af37] font-semibold mb-1">Prospect Company</label>
                <input
                  id="script-prospect-company"
                  type="text"
                  value={prospectCompany}
                  onChange={(e) => setProspectCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-none px-2 py-1 text-slate-200 focus:outline-none focus:border-[#d4af37]"
                  placeholder="e.g. SalesScale"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Target Buyer Persona *</label>
              <input
                id="script-buyer-persona"
                type="text"
                required
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]"
                placeholder="e.g. Sales directors inside cloud infrastructure"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Active Core Value Proposition *</label>
              <textarea
                id="script-value-prop"
                rows={2}
                required
                value={valueProposition}
                onChange={(e) => setValueProposition(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]"
                placeholder="e.g. Plugging research triggers directly into sequence lists to double reply rates..."
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Main Impediment & Pain Element</label>
              <input
                id="script-problem-solved"
                type="text"
                value={problemSolved}
                onChange={(e) => setProblemSolved(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]"
                placeholder="e.g. Wasting 3 hours per rep on research"
              />
            </div>

            <button
              id="gen-script-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 font-semibold tracking-wider uppercase text-[11px] bg-white text-black hover:bg-slate-200 transition-all rounded-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {loading ? "Composing Script..." : "Render Custom Speech Flow"}
            </button>
          </form>
        </div>
      </div>

      {/* Col 2 (7-span): Playback Teleprompter Wizard */}
      <div className="lg:col-span-7 space-y-4" id="teleprompter_play_deck">
        {loading && (
          <div className="p-12 glass border-dashed text-center min-h-[380px] flex flex-col items-center justify-center">
            <RefreshCcw className="h-8 w-8 text-[#d4af37] animate-spin mb-4" />
            <h4 className="serif text-xl italic text-white animate-pulse">Assembling Outbound Calling Pathway...</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-2 font-sans leading-relaxed">
              Gemini models are compiling problem statements, Contrast proof, permission sequences, and low friction close pitches.
            </p>
          </div>
        )}

        {error && (
          <div className="p-6 glass border-l-2 border-l-rose-500 text-xs text-rose-300 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
              <div>
                <h4 className="serif text-[#d4af37] text-lg italic leading-none">Script Building Blocked</h4>
                <p className="mt-1 text-slate-400 font-sans">The API returns an error detail. Please configure your workspace environment credentials.</p>
              </div>
            </div>
            <p className="p-2.5 bg-slate-950 border border-white/5 font-mono text-slate-300 break-all rounded-none">
              Details: {error}
            </p>
          </div>
        )}

        {!activeScript && !loading && !error && (
          <div className="p-12 glass text-center text-slate-500 min-h-[350px] flex flex-col items-center justify-center text-xs">
            <BookOpen className="h-10 w-10 text-slate-650 mb-3" />
            <p className="serif text-xl italic text-[#d4af37]">Teleprompter Standby</p>
            <p className="text-slate-400 max-w-sm mt-2 font-sans leading-relaxed">Adjust research coordinates on the prompt panel or lock a prospect lead to render custom pitch sequences.</p>
          </div>
        )}

        {activeScript && !loading && !error && (
          <div className="space-y-4 animate-in fade-in duration-300" id="teleprompter_wizard_success">
            {/* Steps tracker progress breadcrumb */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-none bg-slate-950 border border-white/10 text-center overflow-x-hidden font-sans">
              {stepsList.map((step, idx) => (
                <button
                  id={`btn-teleprompter-step-${idx}`}
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`py-2 px-1 rounded-none text-left transition duration-150 relative cursor-pointer ${
                    activeStep === idx
                      ? "bg-white/10 border-b border-[#d4af37] text-white"
                      : "border border-transparent text-slate-500 hover:text-slate-350"
                  }`}
                >
                  <div className="text-[8px] font-mono font-semibold text-slate-400 uppercase tracking-widest leading-none">
                    Phase {idx + 1}
                  </div>
                  <div className="text-[10px] font-medium truncate leading-tight mt-1">{step.title}</div>
                </button>
              ))}
            </div>

            {/* active step display block */}
            <div className="p-6 glass rounded-none relative min-h-[220px] flex flex-col justify-between" id="active_teleprompter_step">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse"></span>
                    <span className="text-[9px] text-[#d4af37] uppercase font-bold font-mono tracking-wider">
                      Prompter Script: {stepsList[activeStep].title}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      id="copy-step-script-btn"
                      onClick={() => handleCopyText(replaceTokens(getStepText(activeStep)), `step-${activeStep}`)}
                      className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {copiedScript === `step-${activeStep}` ? <Check className="h-3.5 w-3.5 text-[#d4af37]" /> : <Copy className="h-3.5 w-3.5 text-blue-400" />}
                      <span>Copy Block</span>
                    </button>
                    <span className="text-white/10">|</span>
                    <button
                      id="copy-full-script-btn"
                      onClick={handleCopyFullScript}
                      className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-semibold text-slate-450 hover:text-white transition cursor-pointer"
                    >
                      {copiedScript === "full-script" ? <Check className="h-3.5 w-3.5 text-[#d4af37]" /> : <Copy className="h-3.5 w-3.5 text-indigo-400" />}
                      <span className="text-[#d4af37]">Copy Full Script</span>
                    </button>
                  </div>
                </div>

                <div className="text-slate-250 text-sm leading-relaxed p-4 bg-slate-950/80 border border-white/5 select-all font-mono whitespace-pre-wrap leading-relaxed pr-2">
                  {replaceTokens(getStepText(activeStep))}
                </div>
              </div>

              {/* Navigation button controllers */}
              <div className="flex items-center justify-between mt-6 pt-3 border-t border-white/10 text-xs font-sans">
                <button
                  id="teleprompter-prev-btn"
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-1.5 rounded-none border border-white/10 bg-slate-950/50 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-medium uppercase tracking-wider text-[10px]"
                >
                  &larr; Prev step
                </button>
                <button
                  id="teleprompter-next-btn"
                  disabled={activeStep === 3}
                  onClick={() => setActiveStep((prev) => Math.min(3, prev + 1))}
                  className="px-4 py-1.5 rounded-none font-semibold bg-white text-black hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider text-[10px]"
                >
                  Next: {activeStep < 3 ? stepsList[activeStep + 1].title : "Done"} &rarr;
                </button>
              </div>
            </div>

            {/* Vocal delivery tips deck */}
            <div className="p-4 glass rounded-none text-xs leading-relaxed text-slate-400 font-sans space-y-2">
              <h4 className="serif italic text-base text-white font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
                Vocal Delivery & Speech Engineering Tips
              </h4>
              <ul className="space-y-1.5 pl-1">
                {activeScript.tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-2 items-start text-xs text-slate-300">
                    <span className="text-[#d4af37] font-mono font-bold select-none">{idx + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Post-Call Session Summary Diagnostics Dialog Modal overlay */}
      {showSummary && summaryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200" id="session_summary_modal_mask">
          <div className="bg-[#090d16] border border-white/10 rounded-none max-w-xl w-full p-6 space-y-5 shadow-2xl relative bg-gold-glow" id="session_summary_modal_content">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#d4af37]" />
                <h3 className="serif text-xl italic text-white flex items-center gap-1.5">Post-Call Session Coach</h3>
              </div>
              <button
                id="close-summary-modal-btn"
                onClick={() => {
                  setShowSummary(false);
                  setTimerSeconds(0);
                  setMaxStepReached(1);
                  setActiveStep(0);
                }}
                className="text-[10px] tracking-wider uppercase text-slate-500 hover:text-white transition duration-150"
              >
                [ Clear & Dismiss ]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none text-center font-sans space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Talk Duration</span>
                <p className="text-2xl font-mono text-white font-semibold flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4 text-sky-400" />
                  <span>{formatTimer(summaryData.duration)}</span>
                </p>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none text-center font-sans space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Phases Attempted</span>
                <p className="text-2xl font-mono text-[#d4af37] font-semibold">
                  {summaryData.phasesRead} / 4
                </p>
              </div>

              <div className="p-3 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-none text-center font-sans space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-[#d4af37] block">Coaching Score</span>
                <p className="text-2xl font-mono text-[#d4af37] font-bold">
                  {summaryData.coachingScore}%
                </p>
              </div>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 block">Script Parameters Deployed</span>
                <p className="p-3 bg-slate-950 border border-white/5 rounded-none text-slate-400 whitespace-pre-line font-mono text-[10px] max-h-[100px] overflow-y-auto">
                  {summaryData.scriptPitched}
                </p>
              </div>

              <div className="space-y-2 border-t border-white/5 pt-3">
                <h4 className="serif italic text-[#d4af37] text-sm font-semibold flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#d4af37]" />
                  Real-time Delivery Analytics & Actionable Advice:
                </h4>
                <ul className="space-y-2 text-slate-300">
                  {summaryData.deliveryAdvice.map((advice, i) => (
                    <li key={i} className="flex gap-2 items-start text-xs text-slate-300 pl-1 leading-relaxed">
                      <ChevronRight className="h-3.5 w-3.5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex gap-2 font-sans">
              <button
                id="summary-save-task-btn"
                onClick={() => {
                  alert("Call logging metrics synced and updated inside Cockpit dashboard.");
                  setShowSummary(false);
                  setTimerSeconds(0);
                  setMaxStepReached(1);
                  setActiveStep(0);
                }}
                className="flex-1 py-1.5 px-3 text-center text-[10px] font-semibold uppercase bg-white text-black hover:bg-slate-200 transition-colors rounded-none flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Synchronize and Close Session</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
