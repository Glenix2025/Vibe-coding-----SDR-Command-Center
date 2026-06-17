import React, { useState, useEffect } from "react";
import { Lead, SDRTask, CallLog } from "./types";
import { INITIAL_LEADS, INITIAL_TASKS } from "./data";
import ProspectingTab from "./components/ProspectingTab";
import EmailPersonalizerTab from "./components/EmailPersonalizerTab";
import ObjectionCrusherTab from "./components/ObjectionCrusherTab";
import CallerScriptTab from "./components/CallerScriptTab";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import { Activity, Target, Mail, Shield, MessageSquareCode, Settings2, SlidersHorizontal, RefreshCw, Layers, Download, Laptop, Sun, Moon } from "lucide-react";

export default function App() {
  // Navigation Tabs selection
  const [activeTab, setActiveTab ] = useState<"dashboard" | "prospecting" | "email" | "script" | "objection">("dashboard");
  const [currentShiftTime, setCurrentShiftTime] = useState("");

  // Theme state representing 7 color vibes
  const [theme, setTheme] = useState<string>(() => {
    const saved = localStorage.getItem("sdr_theme") || "theme-dark";
    if (saved === "dark") return "theme-dark";
    if (saved === "light" || saved === "light font-medium") return "theme-light";
    return saved;
  });
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  useEffect(() => {
    localStorage.setItem("sdr_theme", theme);
  }, [theme]);

  // Live UTC counter
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toUTCString().replace("GMT", "UTC").split(" ")[4];
      setCurrentShiftTime(timeStr ? `${timeStr} UTC` : "Active");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // State managers
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem("sdr_leads");
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [tasks, setTasks] = useState<SDRTask[]>(() => {
    const saved = localStorage.getItem("sdr_tasks");
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [callLogs, setCallLogs] = useState<CallLog[]>(() => {
    const saved = localStorage.getItem("sdr_call_logs");
    return saved ? JSON.parse(saved) : [];
  });

  // Metrics quota statistics state
  const [metrics, setMetrics] = useState(() => {
    const saved = localStorage.getItem("sdr_metrics");
    return saved
      ? JSON.parse(saved)
      : {
          dialsGoal: 30,
          dialsMade: 12,
          emailsGoal: 40,
          emailsSent: 18,
          meetingsGoal: 5,
          meetingsBooked: 2,
        };
  });

  // Active Sales Offering Configuration Settings (The product being pitched/sold)
  const [activeProduct, setActiveProduct] = useState(() => {
    const saved = localStorage.getItem("sdr_active_product");
    return saved
      ? JSON.parse(saved)
      : {
          productName: "Autosend AI",
          productValueProps: "Plugs high-quality research triggers and role-based hooks directly into sales sequences, reducing manual prospect vetting from hours to seconds and increasing email open rates past 45%.",
        };
  });

  // Flow State links (Selected prospect indicators)
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<Lead | null>(null);
  const [selectedLeadForScript, setSelectedLeadForScript] = useState<Lead | null>(null);

  // Settings Panel visual modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    productName: activeProduct.productName,
    productValueProps: activeProduct.productValueProps,
  });

  // PWA App Installation States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showPwaInfoModal, setShowPwaInfoModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install prompt user choice: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      // Standard browsers may block prompt inside iframe, show informational helper cards
      setShowPwaInfoModal(true);
    }
  };

  const handleRestoreAllData = (
    importedLeads: Lead[],
    importedTasks: SDRTask[],
    importedLogs: CallLog[],
    importedMetrics: any,
    importedActiveProduct: any
  ) => {
    setLeads(importedLeads);
    setTasks(importedTasks);
    setCallLogs(importedLogs);
    setMetrics(importedMetrics);
    setActiveProduct(importedActiveProduct);
  };

  // Save to LocalStorage side effects
  useEffect(() => {
    localStorage.setItem("sdr_leads", JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem("sdr_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("sdr_call_logs", JSON.stringify(callLogs));
  }, [callLogs]);

  useEffect(() => {
    localStorage.setItem("sdr_metrics", JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    localStorage.setItem("sdr_active_product", JSON.stringify(activeProduct));
  }, [activeProduct]);

  // Lead functions
  const handleAddLead = (leadDetails: Omit<Lead, "id" | "leadScore">) => {
    const newId = `lead-${Date.now()}`;
    const randScore = Math.floor(Math.random() * 30) + 70; // score between 70 and 100
    const newLeadItem: Lead = {
      id: newId,
      ...leadDetails,
      leadScore: randScore,
      status: "Cold",
    };
    setLeads((prev) => [newLeadItem, ...prev]);

    // Add automatic task corresponding to the new prospect
    const newTaskItem: SDRTask = {
      id: `task-${Date.now()}`,
      title: `Draft first outbound email to ${leadDetails.name}`,
      type: "Email",
      dueDate: "Today",
      completed: false,
      leadId: newId,
      leadName: leadDetails.name,
    };
    setTasks((prev) => [newTaskItem, ...prev]);
  };

  const handleUpdateLeadStatus = (leadId: string, status: Lead["status"]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    // If marked booked, increment completed meetings booked metric
    if (status === "Booked") {
      setMetrics((prev: any) => ({ ...prev, meetingsBooked: prev.meetingsBooked + 1 }));
    } else if (status === "Emailed") {
      setMetrics((prev: any) => ({ ...prev, emailsSent: prev.emailsSent + 1 }));
    }
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    setTasks((prev) => prev.filter((t) => t.leadId !== leadId));
    setCallLogs((prev) => prev.filter((c) => c.leadId !== leadId));
    if (selectedLeadForEmail?.id === leadId) setSelectedLeadForEmail(null);
    if (selectedLeadForScript?.id === leadId) setSelectedLeadForScript(null);
  };

  // Task checklist functions
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Metrics functions
  const handleIncrementMetric = (key: "dialsMade" | "emailsSent" | "meetingsBooked") => {
    setMetrics((prev: any) => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const handleResetMetrics = () => {
    if (confirm("Reset current daily tracking metrics to baseline? This will clear logs too.")) {
      setMetrics({
        dialsGoal: 30,
        dialsMade: 0,
        emailsGoal: 40,
        emailsSent: 0,
        meetingsGoal: 5,
        meetingsBooked: 0,
      });
      setCallLogs([]);
    }
  };

  // Call logger
  const handleLogCall = (logDetails: Omit<CallLog, "id" | "timestamp">) => {
    const newLogItem: CallLog = {
      id: `call-log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      ...logDetails,
    };
    setCallLogs((prev) => [...prev, newLogItem]);
    setMetrics((prev: any) => ({ ...prev, dialsMade: prev.dialsMade + 1 }));
  };

  // Quick navigation routing links across tabs
  const handleSelectLeadForEmail = (lead: Lead) => {
    setSelectedLeadForEmail(lead);
    setActiveTab("email");
  };

  const handleSelectLeadForScript = (lead: Lead) => {
    setSelectedLeadForScript(lead);
    setActiveTab("script");
  };

  const handleSaveActiveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveProduct({
      productName: settingsForm.productName,
      productValueProps: settingsForm.productValueProps,
    });
    setShowSettingsModal(false);
  };

  return (
    <div className={`min-h-screen ${theme} bg-[#090d16] text-[#b1b9cb] flex flex-col font-sans select-none`} id="app_main_root">
      {/* Upper Cockpit Header: Sophisticated Dark */}
      <header className="bg-[#090d16]/90 border-b border-white/10 px-4 pt-6 pb-5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-5">
          {/* Main info row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-1 font-semibold flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
                Operations Control Command
              </span>
              <h1 className="serif text-3xl sm:text-4xl text-white italic leading-none font-medium">
                CommandCenter <span className="not-italic font-light text-slate-400">SDR</span>
              </h1>
            </div>

            {/* Live Telemetry Display */}
            <div className="flex items-center gap-6 sm:gap-10 text-xs text-slate-400">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-550 mb-0.5 font-bold">Server Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ● Operational
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-550 mb-0.5 font-bold">Current Shift</span>
                <span className="text-white font-mono text-[11px] font-medium tracking-wide">
                  {currentShiftTime || "14:28:42 UTC"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-550 mb-0.5 font-bold">Target Pitch</span>
                <span className="text-[#d4af37] font-semibold text-[11px] max-w-[120px] truncate" title={activeProduct.productName}>
                  {activeProduct.productName}
                </span>
              </div>
            </div>
          </div>

          {/* Tab controllers and configuration button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-white/5">
            {/* Elegant glass design tab line */}
            <nav className="hidden md:flex items-center gap-1 glass p-1 rounded font-semibold text-xs border border-white/10">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-sm transition duration-150 ${
                  activeTab === "dashboard"
                    ? "bg-white/10 text-white border-b border-b-white/80"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                Cockpit
              </button>
              <button
                id="nav-tab-prospecting"
                onClick={() => setActiveTab("prospecting")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-sm transition duration-150 ${
                  activeTab === "prospecting"
                    ? "bg-white/10 text-white border-b border-b-white/80"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Target className="h-3.5 w-3.5 text-rose-450" />
                Pipeline
              </button>
              <button
                id="nav-tab-email"
                onClick={() => setActiveTab("email")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-sm transition duration-150 ${
                  activeTab === "email"
                    ? "bg-white/10 text-white border-b border-b-white/80"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                AI Drafter
              </button>
              <button
                id="nav-tab-script"
                onClick={() => setActiveTab("script")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-sm transition duration-150 ${
                  activeTab === "script"
                    ? "bg-white/10 text-white border-b border-b-white/80"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquareCode className="h-3.5 w-3.5" />
                AI Scripts
              </button>
              <button
                id="nav-tab-objection"
                onClick={() => setActiveTab("objection")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-sm transition duration-150 ${
                  activeTab === "objection"
                    ? "bg-white/10 text-white border-b border-b-white/80"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                Objections
              </button>
            </nav>

            {/* Product Configuration Offering & PWA Install triggers */}
            <div className="flex items-center justify-between md:justify-end gap-2 text-xs relative">
              {/* Color Themes Multi-Selector Workspace Dropdown */}
              <div className="relative">
                <button
                  id="toggle-theme-btn"
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className="p-2 border border-white/20 hover:bg-white/10 hover:text-white transition-all bg-transparent rounded-sm text-slate-300 cursor-pointer flex items-center justify-center gap-1.5"
                  title="Customize visual workspaces"
                >
                  <SlidersHorizontal className="h-4.5 w-4.5 text-[#d4af37]" />
                  <span className="hidden sm:inline font-mono tracking-wider text-[10px] uppercase text-slate-300">Style Menu</span>
                </button>

                {showThemeSelector && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowThemeSelector(false)} 
                    />
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-slate-950 border border-white/15 rounded-none shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150" 
                      id="theme_picker_dropdown"
                    >
                      <p className="text-[9px] uppercase tracking-wider text-slate-550 font-bold px-2 py-1.5 border-b border-white/5 mb-1 font-mono">Workspace Theme</p>
                      {[
                        { id: "theme-dark", name: "Black Space", preview: "bg-[#090d16] border-white/20", icon: "🌌" },
                        { id: "theme-slate", name: "Matte Slate", preview: "bg-[#1a202c]", icon: "🖥️" },
                        { id: "theme-nordic", name: "Nordic Frost", preview: "bg-[#0d1624]", icon: "❄️" },
                        { id: "theme-emerald", name: "Forest Ops", preview: "bg-[#032115]", icon: "🌲" },
                        { id: "theme-burgundy", name: "Royal Wine", preview: "bg-[#220810]", icon: "🍷" },
                        { id: "theme-light", name: "Cloud Paper", preview: "bg-[#f8fafc] border-slate-300", icon: "📄" },
                        { id: "theme-amber", name: "Solar Sand", preview: "bg-[#fefcf7] border-amber-200", icon: "☀️" }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setTheme(t.id);
                            setShowThemeSelector(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 text-left text-[11px] font-semibold cursor-pointer transition rounded-none ${
                            theme === t.id
                              ? "bg-white/15 text-white"
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`${t.preview} w-3.5 h-3.5 border rounded-full inline-block shrink-0`} />
                            <span>{t.name}</span>
                          </div>
                          <span>{t.icon}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                id="pwa-install-header-btn"
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-4 py-2 font-medium tracking-wide text-[11px] uppercase border border-[#d4af37]/45 text-[#d4af37] bg-[#d4af37]/5 hover:bg-[#d4af37] hover:text-black transition-all rounded-sm cursor-pointer"
                title="Download / Install SDR CommandCenter App to your laptop"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download App</span>
              </button>

              <button
                id="toggle-settings-btn"
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 font-medium tracking-wide text-[11px] uppercase border border-white/20 hover:bg-white hover:text-black transition-all bg-transparent rounded-sm text-slate-300 cursor-pointer"
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>Pitch Offering</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Footer Navigation Menu (Because it is a PWA cockpit, perfect for small mobile sizes!) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090d16]/95 border-t border-slate-800/80 backdrop-blur-md grid grid-cols-5 text-center text-[10px] font-bold py-2 pb-safe-bottom text-slate-400">
        <button
          id="mobile-tab-dashboard"
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center gap-0.5 ${activeTab === "dashboard" ? "text-cyan-400" : ""}`}
        >
          <Activity className="h-4.5 w-4.5" />
          <span>Cockpit</span>
        </button>
        <button
          id="mobile-tab-prospecting"
          onClick={() => setActiveTab("prospecting")}
          className={`flex flex-col items-center justify-center gap-0.5 ${activeTab === "prospecting" ? "text-red-400" : ""}`}
        >
          <Target className="h-4.5 w-4.5" />
          <span>Pipeline</span>
        </button>
        <button
          id="mobile-tab-email"
          onClick={() => setActiveTab("email")}
          className={`flex flex-col items-center justify-center gap-0.5 ${activeTab === "email" ? "text-indigo-400" : ""}`}
        >
          <Mail className="h-4.5 w-4.5" />
          <span>AI Drafter</span>
        </button>
        <button
          id="mobile-tab-script"
          onClick={() => setActiveTab("script")}
          className={`flex flex-col items-center justify-center gap-0.5 ${activeTab === "script" ? "text-cyan-400" : ""}`}
        >
          <MessageSquareCode className="h-4.5 w-4.5" />
          <span>Scripts</span>
        </button>
        <button
          id="mobile-tab-objection"
          onClick={() => setActiveTab("objection")}
          className={`flex flex-col items-center justify-center gap-0.5 ${activeTab === "objection" ? "text-emerald-400" : ""}`}
        >
          <Shield className="h-4.5 w-4.5" />
          <span>Objections</span>
        </button>
      </nav>

      {/* Settings Modal (Product specifications customization) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200" id="settings_modal_mask">
          <div className="bg-[#090d16] border border-white/10 rounded-none max-w-md w-full p-6 space-y-5 shadow-2xl relative bg-gold-glow" id="settings_modal_content">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="serif text-xl italic text-white flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 accent-[#d4af37]" />
                Pitch Offering Config
              </h3>
              <button
                id="close-settings-modal-btn"
                onClick={() => setShowSettingsModal(false)}
                className="text-[10px] tracking-wider uppercase text-slate-500 hover:text-white transition duration-150"
              >
                [ Close ]
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Tailor the offering context leveraged across custom AI generators. The names and benefits inputted below feed live insights directly into real-time email drafting and calling script prompters.
            </p>
            <form onSubmit={handleSaveActiveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[9px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-1">Product/Service Name *</label>
                <input
                  id="settings-product-name"
                  type="text"
                  required
                  value={settingsForm.productName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, productName: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-none px-3 py-2 text-slate-100 focus:outline-none focus:border-[#d4af37]/60 font-sans"
                  placeholder="e.g. Acme Toolkit"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-1">Core Value Proposition & Benefit Profile *</label>
                <textarea
                  id="settings-product-value-prop"
                  rows={4}
                  required
                  value={settingsForm.productValueProps}
                  onChange={(e) => setSettingsForm({ ...settingsForm, productValueProps: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-none px-3 py-2 text-slate-200 focus:outline-none focus:border-[#d4af37]/60 font-sans leading-relaxed"
                  placeholder="e.g. Relieves security audits bottlenecks..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 text-right">
                <button
                  id="submit-product-config-btn"
                  type="submit"
                  className="px-5 py-2 font-semibold text-[10px] uppercase tracking-wider bg-white text-black hover:bg-slate-200 transition-colors rounded-none cursor-pointer"
                >
                  Save Active Context
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PWA App Installation Help Modal */}
      {showPwaInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200" id="pwa_info_modal_mask">
          <div className="bg-[#090d16] border border-white/10 rounded-none max-w-md w-full p-6 space-y-5 shadow-2xl relative bg-gold-glow" id="pwa_info_modal_content">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="serif text-xl italic text-white flex items-center gap-2">
                <Laptop className="h-4 w-4 text-[#d4af37]" />
                Download App (PWA Guide)
              </h3>
              <button
                id="close-pwa-modal-btn"
                onClick={() => setShowPwaInfoModal(false)}
                className="text-[10px] tracking-wider uppercase text-slate-500 hover:text-white transition duration-150"
              >
                [ Close ]
              </button>
            </div>
            
            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-none font-sans space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-555 block font-semibold">Active Web Platform Status</span>
                <p>Since you are viewing this applet within a nested sandbox iframe, standard in-browser install prompts are restricted by browser security policies.</p>
              </div>

              <div className="space-y-3">
                <h4 className="serif italic text-[#d4af37] text-sm font-semibold">How to download onto your laptop:</h4>
                <ol className="space-y-2 list-decimal pl-4 font-sans text-slate-400">
                  <li>
                    <span className="text-white font-medium">Open in standalone tab: </span> 
                    Click the "Open in new tab" icon at the top right of the application workspace preview panel, or copy the direct preview URL.
                  </li>
                  <li>
                    <span className="text-white font-medium">Click the Browser App Install button: </span>
                    Look at the right side of your Chrome, Edge, or Brave address/URL bar for the <strong className="text-white font-medium">Install App</strong> icon (represents a monitor outline with a down arrow, or "+" symbol).
                  </li>
                  <li>
                    <span className="text-white font-medium">Add on macOS/iOS: </span>
                    If on Safari, click the <strong className="text-white font-medium">Share</strong> button, then select <strong className="text-white font-medium">"Add to Dock"</strong> or <strong className="text-white font-medium">"Add to Home Screen"</strong>.
                  </li>
                </ol>
              </div>

              <div className="pt-2 border-t border-white/5 flex gap-2 font-sans">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-3 text-center text-[10px] font-semibold uppercase bg-white text-black hover:bg-slate-200 transition-colors rounded-none flex items-center justify-center gap-1"
                >
                  <Laptop className="h-3 w-3" />
                  <span>Launch Standalone Tab</span>
                </a>
                <button
                  onClick={() => setShowPwaInfoModal(false)}
                  className="flex-1 py-1.5 px-3 text-center text-[10px] font-semibold uppercase border border-white/10 text-slate-400 hover:text-white transition-colors rounded-none"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-8">
        {/* Secondary Title context details based on Tab */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <h2 className="serif text-2xl sm:text-3xl text-white italic capitalize">
              {activeTab === "dashboard" ? "SDR Analytics Cockpit" : activeTab === "prospecting" ? "Prospect Pipeline Queue" : activeTab === "email" ? "AI Outbound Draft Assistant" : activeTab === "script" ? "Active Dialer Teleprompter" : "Live Pushback Objection Crusher"}
            </h2>
            <p className="text-xs text-slate-450 max-w-3xl leading-relaxed">
              {activeTab === "dashboard"
                ? "Durable pipeline control telemetry, active customer checkpoints, and omnichannel progress tracking."
                : activeTab === "prospecting"
                ? "Manage current hot leads, view intelligence metrics, and launch personalized calling/email actions."
                : activeTab === "email"
                ? "Construct custom tailored prospecting templates backed by real-time intelligence prompts."
                : activeTab === "script"
                ? "Interactive speech flow, dynamic call stopwatch controls, and voice pacing prompteers."
                : "Continuous counteraction matrices designed to alleviate financial, timing, and competitive roadblocks."}
            </p>
          </div>
          <div className="text-[10px] font-mono tracking-wider font-semibold text-slate-400 flex items-center gap-1.5 bg-white/5 px-3 py-1.5 border border-white/5 rounded-none shrink-0 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span>
            <span>Channel: {activeProduct.productName}</span>
          </div>
        </div>

        {/* Selected View router */}
        <div className="transition-all duration-300">
          {activeTab === "dashboard" && (
            <AnalyticsDashboard
              leads={leads}
              tasks={tasks}
              callLogs={callLogs}
              metrics={metrics}
              activeProduct={activeProduct}
              onToggleTask={handleToggleTask}
              onIncrementMetric={handleIncrementMetric}
              onResetMetrics={handleResetMetrics}
              onRestoreAllData={handleRestoreAllData}
            />
          )}

          {activeTab === "prospecting" && (
            <ProspectingTab
              leads={leads}
              onAddLead={handleAddLead}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onDeleteLead={handleDeleteLead}
              onSelectLeadForEmail={handleSelectLeadForEmail}
              onSelectLeadForScript={handleSelectLeadForScript}
              onLogCall={handleLogCall}
              callLogs={callLogs}
            />
          )}

          {activeTab === "email" && (
            <EmailPersonalizerTab
              selectedLeadForEmail={selectedLeadForEmail}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              activeProduct={activeProduct}
            />
          )}

          {activeTab === "script" && (
            <CallerScriptTab
              selectedLeadForScript={selectedLeadForScript}
              activeProduct={activeProduct}
            />
          )}

          {activeTab === "objection" && (
            <ObjectionCrusherTab
              activeProduct={activeProduct}
            />
          )}
        </div>
      </main>
    </div>
  );
}
