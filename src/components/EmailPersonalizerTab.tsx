import React, { useState, useEffect } from "react";
import { Lead, ColdEmailDraft } from "../types";
import { Mail, Sparkles, Copy, Check, RotateCcw, AlertTriangle, HelpCircle, ChevronRight, Linkedin } from "lucide-react";

interface EmailPersonalizerTabProps {
  selectedLeadForEmail: Lead | null;
  onUpdateLeadStatus: (leadId: string, status: Lead["status"]) => void;
  activeProduct: { productName: string; productValueProps: string };
}

interface LinkedInStep {
  stepNumber: number;
  delayDays: number;
  channelActivity: string;
  messageBody: string;
  conversionTip: string;
}

interface LinkedInCampaign {
  steps: LinkedInStep[];
}

export default function EmailPersonalizerTab({
  selectedLeadForEmail,
  onUpdateLeadStatus,
  activeProduct,
}: EmailPersonalizerTabProps) {
  // Outreach Type Toggle
  const [outreachMode, setOutreachMode] = useState<"email" | "linkedin">("email");

  // Input Form States
  const [prospectName, setProspectName] = useState("");
  const [prospectTitle, setProspectTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [tone, setTone] = useState("consultative");
  const [length, setLength] = useState("short");
  const [callToAction, setCallToAction] = useState("a quick 10-minute feedback call next Thursday?");

  // Output States
  const [draft, setDraft] = useState<ColdEmailDraft | null>(null);
  const [linkedinSequence, setLinkedinSequence] = useState<LinkedInCampaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Copy States
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedFullSequence, setCopiedFullSequence] = useState(false);
  const [copiedSequenceStep, setCopiedSequenceStep] = useState<number | null>(null);
  const [hasMarkedEmailed, setHasMarkedEmailed] = useState(false);

  // Auto-populate when prospect is selected
  useEffect(() => {
    if (selectedLeadForEmail) {
      setProspectName(selectedLeadForEmail.name);
      setProspectTitle(selectedLeadForEmail.title);
      setCompanyName(selectedLeadForEmail.company);
      setCompanyIndustry(selectedLeadForEmail.industry);
      setPainPoints(selectedLeadForEmail.painPoints);
      setHasMarkedEmailed(false);
      // Clean outputs so they align with active prospect
      setDraft(null);
      setLinkedinSequence(null);
    }
  }, [selectedLeadForEmail]);

  // Loading animation sequence
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const getLoadingMessage = () => {
    if (outreachMode === "linkedin") {
      switch (loadingStep) {
        case 0:
          return "Analyzing LinkedIn target profile & credentials...";
        case 1:
          return "Synthesizing conversational connection hook...";
        case 2:
          return "Formulating social value delivery messages...";
        case 3:
          return "Balancing timeline follow-up triggers...";
        default:
          return "Spawning 8-step outbound sequence...";
      }
    }
    switch (loadingStep) {
      case 0:
        return "Analyzing role specific bottlenecks...";
      case 1:
        return "Mapping value proposition benefits...";
      case 2:
        return "Customizing conversation entry points...";
      case 3:
        return "Formulating call-to-action hooks...";
      default:
        return "Cooking outreach parameters...";
    }
  };

  const generateEmailDraft = async () => {
    if (!prospectName || !companyName) {
      setError("Please fill in the prospect name and company name before generating.");
      return;
    }

    setLoading(true);
    setError(null);
    setDraft(null);

    try {
      const response = await fetch("/api/gemini/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectName,
          prospectTitle,
          companyName,
          companyIndustry,
          productName: activeProduct.productName,
          productValueProps: activeProduct.productValueProps,
          painPoints,
          tone,
          length,
          callToAction,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed query to Gemini API server.");
      }

      const data = await response.json();
      setDraft(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while connecting to the email AI agent.");
    } finally {
      setLoading(false);
    }
  };

  const generateLinkedInSequence = async () => {
    if (!prospectName || !companyName) {
      setError("Please fill in the prospect name and company name before generating.");
      return;
    }

    setLoading(true);
    setError(null);
    setLinkedinSequence(null);

    try {
      const response = await fetch("/api/gemini/generate-linkedin-sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectName,
          prospectTitle,
          companyName,
          companyIndustry,
          productName: activeProduct.productName,
          productValueProps: activeProduct.productValueProps,
          painPoints,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to make sequence generation call to Gemini server.");
      }

      const data = await response.json();
      setLinkedinSequence(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while generating LinkedIn campaign sequence.");
    } finally {
      setLoading(false);
    }
  };

  const copySubject = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft.subjectLine);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const copyBody = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft.emailBody);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const copyStepText = (stepNum: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSequenceStep(stepNum);
    setTimeout(() => setCopiedSequenceStep(null), 2000);
  };

  const copyFullSequence = () => {
    if (!linkedinSequence) return;
    const compiled = linkedinSequence.steps
      .map((s) => {
        return `========================================
[Step ${s.stepNumber}] - ${s.channelActivity} (Day Delay: +${s.delayDays} days)
----------------------------------------
SDR Recommendation: ${s.conversionTip}
----------------------------------------
${s.messageBody}`;
      })
      .join("\n\n");
    navigator.clipboard.writeText(compiled);
    setCopiedFullSequence(true);
    setTimeout(() => setCopiedFullSequence(false), 2000);
  };

  const handleMarkAsEmailed = () => {
    if (selectedLeadForEmail) {
      onUpdateLeadStatus(selectedLeadForEmail.id, "Emailed");
      setHasMarkedEmailed(true);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="email_personalizer_container">
      {/* Col 1: Left configuration Form */}
      <div className="lg:col-span-12 xl:col-span-5 space-y-4" id="email_generator_form_panel">
        <div className="glass p-5 rounded-none space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <div className="p-2 bg-white/5 border border-white/10 text-purple-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="serif text-lg italic text-white flex items-center gap-2">AI Outbound Drafting Engine</h3>
              <p className="text-[9px] tracking-wide text-slate-500 uppercase mt-0.5 font-mono">Contextualized Prospect Copy Creation</p>
            </div>
          </div>

          {/* High-contrast outreach mode toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 border border-white/15 rounded-none text-xs">
            <button
              type="button"
              id="mode-email-toggle"
              onClick={() => {
                setOutreachMode("email");
                setError(null);
              }}
              className={`py-2 px-3 flex items-center justify-center gap-2 font-semibold transition cursor-pointer rounded-none ${
                outreachMode === "email"
                  ? "bg-white text-black"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Cold Email
            </button>
            <button
              type="button"
              id="mode-linkedin-toggle"
              onClick={() => {
                setOutreachMode("linkedin");
                setError(null);
              }}
              className={`py-2 px-3 flex items-center justify-center gap-2 font-semibold transition cursor-pointer rounded-none ${
                outreachMode === "linkedin"
                  ? "bg-[#0077b5] text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#0077b5]/10"
              }`}
            >
              <Linkedin className="h-3.5 w-3.5 text-white" />
              8-Step LinkedIn
            </button>
          </div>

          {selectedLeadForEmail && (
            <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/10 rounded-none text-xs font-sans">
              <div>
                <span className="text-[9px] text-[#8fa0c2] block font-semibold tracking-wider uppercase mb-0.5 font-mono">Active Target Prospect</span>
                <span className="font-bold text-white">{selectedLeadForEmail.name}</span>
                <span className="text-slate-400"> @ {selectedLeadForEmail.company}</span>
              </div>
              <button
                id="reset-form-btn"
                title="Input Custom Data"
                onClick={() => {
                  setProspectName("");
                  setProspectTitle("");
                  setCompanyName("");
                  setCompanyIndustry("");
                  setPainPoints("");
                }}
                className="p-1 px-1.5 border border-white/10 bg-slate-950 text-slate-400 hover:text-white transition rounded-none cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="space-y-4 text-xs font-sans">
            {/* Active product announcement */}
            <div className="p-3 bg-slate-950 border border-white/5 rounded-none">
              <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-semibold font-mono">Active Pitch Presentation Context</span>
              <span className="font-semibold text-white text-xs mt-0.5 block">{activeProduct.productName}</span>
              <p className="text-[10px] text-slate-400 leading-relaxed font-serif italic mt-1.5 border-t border-white/5 pt-1.5">
                "{activeProduct.productValueProps}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono mb-1">Prospect Name *</label>
                <input
                  id="email-prospect-name"
                  type="text"
                  required
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-none px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono mb-1">Job Title</label>
                <input
                  id="email-prospect-title"
                  type="text"
                  value={prospectTitle}
                  onChange={(e) => setProspectTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-none px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]"
                  placeholder="Chief Ops Officer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono mb-1">Company Name *</label>
                <input
                  id="email-company-name"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-none px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]"
                  placeholder="Acme Systems"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono mb-1">Company Industry</label>
                <input
                  id="email-company-industry"
                  type="text"
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-none px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]"
                  placeholder="Fintech SaaS"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono mb-1">Hook Point / Researched Pain</label>
              <textarea
                id="email-pain-points"
                rows={3}
                value={painPoints}
                onChange={(e) => setPainPoints(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37] font-sans leading-relaxed"
                placeholder="Convert manual sequences into automated, compliant, customized outreach pathways..."
              />
            </div>

            {outreachMode === "email" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono mb-1">Tone Pitch Profile</label>
                    <select
                      id="email-tone-select"
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-2 text-slate-300 focus:outline-none"
                    >
                      <option value="consultative">Consultative & Helpful</option>
                      <option value="casual">Casual & Direct (Chum)</option>
                      <option value="bold">Bold & High Contrast</option>
                      <option value="formal">Authoritative & Formal</option>
                      <option value="storytelling">Problem Storytelling</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono mb-1">Copy Target Length</label>
                    <select
                      id="email-length-select"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-2 text-slate-300 focus:outline-none"
                    >
                      <option value="short">Short (&lt; 120 words)</option>
                      <option value="medium">Medium (~180 words)</option>
                      <option value="detailed">Detailed (~250 words)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold font-mono mb-1">Customize Call to Action (CTA)</label>
                  <input
                    id="email-cta-input"
                    type="text"
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]"
                    placeholder="a 10-minute feedback session next Thursday?"
                  />
                </div>
              </>
            )}

            {outreachMode === "email" ? (
              <button
                id="generate-email-btn"
                onClick={generateEmailDraft}
                disabled={loading}
                className="w-full py-2.5 px-4 font-semibold tracking-wider uppercase text-[11px] bg-white text-black hover:bg-slate-200 transition-all rounded-none cursor-pointer disabled:cursor-wait disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5" />
                {loading ? "Drafting Output..." : "Compile Outbound Email"}
              </button>
            ) : (
              <button
                id="generate-linkedin-btn"
                onClick={generateLinkedInSequence}
                disabled={loading}
                className="w-full py-2.5 px-4 font-semibold tracking-wider uppercase text-[11px] bg-[#0077b5] text-white hover:bg-indigo-700 hover:opacity-90 transition-all rounded-none cursor-pointer disabled:cursor-wait disabled:opacity-50 flex items-center justify-center gap-1.5 font-mono"
              >
                <Linkedin className="h-3.5 w-3.5 text-white" />
                {loading ? "Composing Steps..." : "Assemble Social Campaign Steps"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Col 2: Right draft outputs */}
      <div className="lg:col-span-12 xl:col-span-7 flex flex-col justify-start" id="email_output_panel">
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 glass border-dashed text-center min-h-[460px]">
            <div className="animate-spin rounded-none h-8 w-8 border-t-2 border-r-2 border-purple-500 mb-5"></div>
            <p className="serif text-xl italic text-white animate-pulse">{getLoadingMessage()}</p>
            <p className="text-xs text-slate-500 mt-2 max-w-xs font-sans leading-relaxed">Gemini server is executing specialized outbound workflows with multi-agent context matching.</p>
          </div>
        )}

        {error && (
          <div className="flex-1 p-6 glass border-l-2 border-l-rose-500 text-xs text-rose-300 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="serif text-[#d4af37] text-lg italic leading-none">Intelligence Engine Interrupted</h4>
                <p className="text-slate-400 text-xs font-sans">The backend server reported an authorization error with the API Key credentials.</p>
              </div>
            </div>
            <div className="p-3 bg-slate-950 border border-white/5 font-mono text-slate-300 break-words rounded-none">
              Details: {error}
            </div>
            <div className="text-slate-400 leading-relaxed font-sans text-xs bg-slate-900/[0.15] p-3 border border-white/10 rounded-none">
              <strong className="text-white">Solution Checkpoint:</strong> Open the <strong className="text-white font-medium">Settings &gt; Secrets</strong> panel inside your Google AI Studio dashboard and paste in your valid <code className="text-[#d4af37] font-mono">GEMINI_API_KEY</code> to enable full communication capabilities.
            </div>
          </div>
        )}

        {/* Empty States */}
        {!draft && !linkedinSequence && !loading && !error && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 glass border-slate-800 text-center min-h-[400px] text-slate-500 text-xs">
            {outreachMode === "email" ? (
              <>
                <Mail className="h-10 w-10 text-slate-600 mb-3" />
                <p className="serif italic text-[#d4af37] text-xl font-medium">Outbound Draft Empty</p>
                <p className="mt-2 text-slate-400 max-w-sm font-sans leading-relaxed">Specify parameters on the configuration console or pick an active lead from your pipeline queue to synthesize customized outbound message copy.</p>
              </>
            ) : (
              <>
                <Linkedin className="h-10 w-10 text-[#0077b5] mb-3 opacity-60" />
                <p className="serif italic text-[#d4af37] text-xl font-medium">LinkedIn Sequence Empty</p>
                <p className="mt-2 text-slate-400 max-w-sm font-sans leading-relaxed">Initiate campaign assembly on the left layout to map out a hyper-targeted 8-step chronological outreach timeline for direct social engagement.</p>
              </>
            )}
          </div>
        )}

        {/* Successful Cold Email Draft view */}
        {outreachMode === "email" && draft && !loading && !error && (
          <div className="space-y-4 animate-in fade-in duration-300" id="email_draft_output_success">
            {/* Subject Line Block */}
            <div className="p-4 glass rounded-none space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[9px] text-purple-400 font-semibold uppercase tracking-widest font-mono">Outbound Subject Line</span>
                <button
                  id="copy-subject-btn"
                  onClick={copySubject}
                  className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {copiedSubject ? <Check className="h-3.5 w-3.5 text-[#d4af37]" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedSubject ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-sm font-semibold text-white py-1">{draft.subjectLine}</p>
            </div>

            {/* Email Body Block */}
            <div className="p-5 glass rounded-none space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[9px] text-[#8fa0c2] font-semibold uppercase tracking-widest font-mono">Custom Structured Email Copy</span>
                <button
                  id="copy-body-btn"
                  onClick={copyBody}
                  className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {copiedBody ? <Check className="h-3.5 w-3.5 text-[#d4af37]" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedBody ? "Copied Body" : "Copy Body text"}
                </button>
              </div>
              
              <textarea
                id="generated-email-textarea"
                rows={12}
                value={draft.emailBody}
                onChange={(e) => setDraft({ ...draft, emailBody: e.target.value })}
                className="w-full text-xs font-sans leading-relaxed tracking-wide bg-slate-950 border border-white/10 rounded-none p-4 text-slate-200 focus:outline-none focus:border-[#d4af37] select-all font-mono"
              />

              {selectedLeadForEmail && (
                <div className="flex items-center justify-between bg-slate-950 border border-white/5 px-4 py-3 text-xs font-sans">
                  <span className="text-slate-400">Log this action to prospect history:</span>
                  <button
                    id="mark-emailed-btn"
                    disabled={hasMarkedEmailed}
                    onClick={handleMarkAsEmailed}
                    className={`px-4 py-1.5 text-[9px] uppercase tracking-widest font-semibold border transition ${
                      hasMarkedEmailed
                        ? "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed"
                        : "bg-white text-black border-transparent hover:bg-slate-200 cursor-pointer"
                    }`}
                  >
                    {hasMarkedEmailed ? "Status Emailed: Complete" : "Advance status to 'Emailed'"}
                  </button>
                </div>
              )}
            </div>

            {/* AI Optimization Insight */}
            <div className="p-4 glass rounded-none text-[11px] text-slate-400 leading-relaxed flex items-start gap-3 relative bg-gold-glow">
              <HelpCircle className="h-4 w-4 text-[#d4af37] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="serif text-white italic text-xs block mb-1">Agent Personalization Strategy:</strong> {draft.personalizationHookExplanation}
              </div>
            </div>
          </div>
        )}

        {/* Successful LinkedIn Sequence View */}
        {outreachMode === "linkedin" && linkedinSequence && !loading && !error && (
          <div className="space-y-4 animate-in fade-in duration-300" id="linkedin_sequence_output_success">
            {/* Header copy action bar */}
            <div className="p-4 glass rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-2 border-[#0077b5] bg-indigo-950/10">
              <div>
                <span className="text-[9px] text-[#0077b5] font-semibold uppercase tracking-widest font-mono">Sequential Social Campaign</span>
                <h4 className="serif text-white text-lg font-bold italic mt-0.5">LinkedIn Outbound Sequence <span className="text-slate-400 text-xs normal-case font-light font-mono">(8 Interactive Steps)</span></h4>
              </div>

              <button
                id="copy-full-sequence-btn"
                onClick={copyFullSequence}
                className="px-3.5 py-1.5 bg-[#0077b5] text-white hover:bg-[#0077b5]/80 transition text-[9px] uppercase tracking-widest font-bold font-mono flex items-center justify-center gap-2 rounded-none cursor-pointer"
              >
                {copiedFullSequence ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedFullSequence ? "Full Sequence Copied!" : "Copy Full Campaign"}
              </button>
            </div>

            {/* Campaign Steps List */}
            <div className="space-y-4 overflow-y-auto max-h-[640px] pr-1.5 custom-scrollbar" id="linkedin_steps_timeline">
              {linkedinSequence.steps.map((step, idx) => {
                const sNum = step.stepNumber;
                return (
                  <div key={idx} className="p-4 bg-slate-950/80 border border-white/10 rounded-none relative space-y-3 hover:border-[#0077b5]/50 transition duration-150">
                    {/* Top step detail row */}
                    <div className="flex items-center justify-between border-b border-white/15 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 bg-[#0077b5]/20 text-[#0077b5] border border-[#0077b5]/30 flex items-center justify-center font-mono text-[11px] font-bold">
                          {sNum}
                        </span>
                        <span className="text-[11px] font-semibold text-white tracking-wide uppercase font-mono">
                          {step.channelActivity}
                        </span>
                        <span className="text-[9px] text-indigo-300 bg-indigo-950/40 px-2 py-0.5 border border-indigo-500/20 font-mono">
                          {step.delayDays === 0 ? "Immediate Send" : `Wait: +${step.delayDays} days`}
                        </span>
                      </div>

                      <button
                        onClick={() => copyStepText(sNum, step.messageBody)}
                        className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        {copiedSequenceStep === sNum ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copiedSequenceStep === sNum ? "Copied" : "Copy Step"}
                      </button>
                    </div>

                    {/* Editable Message text area */}
                    <textarea
                      rows={4}
                      value={step.messageBody}
                      onChange={(e) => {
                        const updated = [...linkedinSequence.steps];
                        updated[idx] = { ...step, messageBody: e.target.value };
                        setLinkedinSequence({ steps: updated });
                      }}
                      className="w-full text-xs font-mono leading-relaxed bg-slate-950 border border-white/10 rounded-none p-3 text-slate-200 focus:outline-none focus:border-[#0077b5] focus:bg-slate-950/40 select-all"
                      placeholder="Message sequence copy..."
                    />

                    {/* Step Psychological / Conversion Strategy Hint */}
                    <div className="text-[10px] text-slate-400 bg-slate-900/10 p-2.5 border border-white/5 flex items-start gap-2 italic font-serif">
                      <span className="text-[#0077b5] font-sans font-bold not-italic text-[9px] uppercase tracking-wider shrink-0 mt-0.5">SDR Tactic:</span>
                      <span>"{step.conversionTip}"</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
