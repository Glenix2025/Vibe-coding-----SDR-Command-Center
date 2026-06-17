import React, { useState } from "react";
import { Lead, SDRTask, CallLog, CampaignSequenceStep } from "../types";
import { CAMPAIGN_SEQUENCE } from "../data";
import { CheckCircle2, Circle, Mail, Phone, Calendar, Zap, RefreshCw, Layers, Trophy, Target, TrendingUp, Download, Upload } from "lucide-react";

interface AnalyticsDashboardProps {
  leads: Lead[];
  tasks: SDRTask[];
  callLogs: CallLog[];
  metrics: {
    dialsGoal: number;
    dialsMade: number;
    emailsGoal: number;
    emailsSent: number;
    meetingsGoal: number;
    meetingsBooked: number;
  };
  activeProduct: {
    productName: string;
    productValueProps: string;
  };
  onToggleTask: (taskId: string) => void;
  onIncrementMetric: (key: "dialsMade" | "emailsSent" | "meetingsBooked") => void;
  onResetMetrics: () => void;
  onRestoreAllData: (
    leads: Lead[],
    tasks: SDRTask[],
    callLogs: CallLog[],
    metrics: any,
    activeProduct: any
  ) => void;
}

export default function AnalyticsDashboard({
  leads,
  tasks,
  callLogs,
  metrics,
  activeProduct,
  onToggleTask,
  onIncrementMetric,
  onResetMetrics,
  onRestoreAllData,
}: AnalyticsDashboardProps) {
  const [restoreStatus, setRestoreStatus] = useState("");

  const handleExportPWAData = () => {
    try {
      const backupObj = {
        version: "1.0.0",
        appIdentifier: "sdr-command-center-pwa",
        timestamp: new Date().toISOString(),
        leads,
        tasks,
        callLogs,
        metrics,
        activeProduct,
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `sdr_command_center_backup_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setRestoreStatus("Data exported successfully!");
      setTimeout(() => setRestoreStatus(""), 3000);
    } catch (err) {
      console.error("Export failure:", err);
      setRestoreStatus("Export operation failed.");
    }
  };

  const handleImportPWAData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.leads)) {
          const importedLeads = parsed.leads;
          const importedTasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
          const importedLogs = Array.isArray(parsed.callLogs) ? parsed.callLogs : [];
          const importedMetrics = parsed.metrics || {
            dialsGoal: 30,
            dialsMade: 0,
            emailsGoal: 40,
            emailsSent: 0,
            meetingsGoal: 5,
            meetingsBooked: 0,
          };
          const importedActiveProduct = parsed.activeProduct || {
            productName: "Autosend AI",
            productValueProps: "Plugs high-quality research triggers directly into sequences.",
          };

          onRestoreAllData(importedLeads, importedTasks, importedLogs, importedMetrics, importedActiveProduct);
          setRestoreStatus("SDR workspace restored successfully!");
          setTimeout(() => setRestoreStatus(""), 4000);
        } else {
          setRestoreStatus("Invalid JSON schema.");
          setTimeout(() => setRestoreStatus(""), 4000);
        }
      } catch (err) {
        console.error("Restore parsing error:", err);
        setRestoreStatus("Parsing error or raw upload corrupt.");
        setTimeout(() => setRestoreStatus(""), 4000);
      }
    };
    fileReader.readAsText(files[0]);
  };

  // Calculate percentages
  const dialPercent = Math.min(100, Math.round((metrics.dialsMade / metrics.dialsGoal) * 100));
  const emailPercent = Math.min(100, Math.round((metrics.emailsSent / metrics.emailsGoal) * 100));
  const meetingPercent = Math.min(100, Math.round((metrics.meetingsBooked / metrics.meetingsGoal) * 100));

  // Sequence icon helpers
  const getStepIcon = (channel: CampaignSequenceStep["channel"]) => {
    switch (channel) {
      case "Email":
        return <Mail className="h-3.5 w-3.5 text-purple-400" />;
      case "Phone":
        return <Phone className="h-3.5 w-3.5 text-blue-400" />;
      case "LinkedIn":
        return <Zap className="h-3.5 w-3.5 text-amber-400" />;
    }
  };

  const getStepBorder = (channel: CampaignSequenceStep["channel"]) => {
    switch (channel) {
      case "Email":
        return "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]";
      case "Phone":
        return "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]";
      case "LinkedIn":
        return "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="analytics_dashboard_container">
      {/* Col 1 & 2: Stats Grid & Campaign Sequence */}
      <div className="lg:col-span-8 space-y-6" id="analytics_main_space">
        
        {/* Progress Metrics Cockpit Cards matching Mockup style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="stats_cards_grid">
          {/* Dial Card (Blue) */}
          <div className="glass p-5 rounded-none border-l-2 border-l-blue-500 flex flex-col justify-between" id="dial_stat_card">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] text-[#8fa0c2] uppercase tracking-[0.18em] font-semibold">Outbound Calls</span>
                <div className="text-3xl text-white font-light mt-1.5 font-sans">
                  {metrics.dialsMade} <span className="text-xs text-slate-500 font-normal">/ {metrics.dialsGoal}</span>
                </div>
              </div>
              <button
                id="btn-inc-dials"
                onClick={() => onIncrementMetric("dialsMade")}
                className="text-[9px] tracking-wider font-semibold border border-white/20 px-2.5 py-1 hover:bg-white hover:text-black transition-colors rounded-none uppercase cursor-pointer"
              >
                +1 Call
              </button>
            </div>
            <div className="mt-5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 tracking-wider">
                <span>Quota Progress</span>
                <span className="font-mono text-blue-400 font-bold">{dialPercent}%</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${dialPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* Email Card (Purple) */}
          <div className="glass p-5 rounded-none border-l-2 border-l-purple-500 flex flex-col justify-between" id="email_stat_card">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] text-[#8fa0c2] uppercase tracking-[0.18em] font-semibold">Email Reach</span>
                <div className="text-3xl text-white font-light mt-1.5 font-sans">
                  {metrics.emailsSent} <span className="text-xs text-slate-550 font-normal">/ {metrics.emailsGoal}</span>
                </div>
              </div>
              <button
                id="btn-inc-emails"
                onClick={() => onIncrementMetric("emailsSent")}
                className="text-[9px] tracking-wider font-semibold border border-white/20 px-2.5 py-1 hover:bg-white hover:text-black transition-colors rounded-none uppercase cursor-pointer"
              >
                +1 Email
              </button>
            </div>
            <div className="mt-5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 tracking-wider">
                <span>Outbound Speed</span>
                <span className="font-mono text-purple-400 font-bold">{emailPercent}%</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${emailPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* Meeting booked Card (Amber/Gold) */}
          <div className="glass p-5 rounded-none border-l-2 border-l-[#d4af37] flex flex-col justify-between relative overflow-hidden" id="meeting_stat_card">
            <div className="absolute right-0 top-0 w-16 h-16 bg-gold-glow pointer-events-none"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] text-[#8fa0c2] uppercase tracking-[0.18em] font-semibold">Meetings Secured</span>
                <div className="text-3xl text-white font-light mt-1.5 font-sans">
                  {metrics.meetingsBooked} <span className="text-xs text-slate-550 font-normal">/ {metrics.meetingsGoal}</span>
                </div>
              </div>
              <button
                id="btn-inc-meetings"
                onClick={() => onIncrementMetric("meetingsBooked")}
                className="text-[9px] tracking-wider font-semibold border border-white/20 px-2.5 py-1 hover:bg-white hover:text-black transition-colors rounded-none uppercase cursor-pointer"
              >
                +1 Book
              </button>
            </div>
            <div className="mt-5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 tracking-wider">
                <span>Awaiting Demo</span>
                <span className="font-mono text-[#d4af37] font-bold">{meetingPercent}%</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#d4af37]" style={{ width: `${meetingPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Sequencing playbook tree */}
        <div className="glass p-6 rounded-none space-y-5" id="sequencing_guide">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 border border-white/10 text-[#d4af37]">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="serif text-xl italic text-white">Multichannel Outreach Sequence Playbook</h3>
                <p className="text-[10px] tracking-wide text-slate-500 font-sans uppercase mt-0.5">Industry-proven campaign timeline for modern scale SDRs</p>
              </div>
            </div>
            <button
              id="reset-goals-btn"
              onClick={onResetMetrics}
              className="text-[9px] tracking-widest uppercase font-mono border border-white/10 bg-white/5 px-2.5 py-1.5 text-slate-400 hover:text-white hover:border-white/40 transition duration-150 rounded-none cursor-pointer"
            >
              Reset Statistics
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="cadence_timeline_steps">
            {CAMPAIGN_SEQUENCE.map((seq) => (
              <div
                id={`sequence-step-${seq.id}`}
                key={seq.id}
                className={`p-4 rounded-none border text-xs space-y-3 transition duration-150 relative ${getStepBorder(seq.channel)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStepIcon(seq.channel)}
                    <span className="font-medium uppercase tracking-wider text-[10px] text-slate-400">Step {seq.stepNumber}: {seq.channel}</span>
                  </div>
                  <span className="text-[9px] font-mono border border-white/10 px-2 py-0.5 rounded-none text-slate-400 font-semibold">
                    {seq.daysAfterPrevious === 0 ? "Initial Day" : `+${seq.daysAfterPrevious} Days`}
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="serif text-base italic text-white font-medium">{seq.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{seq.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Col 3: Tasks Checklist (Durable context tracker) */}
      <div className="lg:col-span-4 space-y-6" id="analytics_checklist_space">
        <div className="glass p-6 rounded-none space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#d4af37]" />
              <h3 className="serif text-xl italic text-white">Daily Priorities</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#8fa0c2] bg-white/5 border border-white/15 px-2 py-0.5 rounded-none">
              {tasks.filter((t) => t.completed).length} / {tasks.length} Done
            </span>
          </div>

          {tasks.length === 0 ? (
            <p className="p-8 text-center text-slate-500 text-xs border border-dashed border-white/5 rounded-none">All checklist items are completed.</p>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1" id="tasks_checkbox_list">
              {tasks.map((task) => (
                <div
                  id={`checked-task-wrapper-${task.id}`}
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`p-3 rounded-none border text-xs cursor-pointer flex items-start gap-2.5 transition duration-150 ${
                    task.completed
                      ? "bg-white/[0.01] border-white/5 opacity-40 text-slate-500"
                      : "bg-white/[0.03] hover:bg-white/[0.05] border-white/10 text-slate-300"
                  }`}
                >
                  <button id={`btn-check-task-${task.id}`} className="mt-0.5 flex-shrink-0 cursor-pointer">
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-[#d4af37]" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-650 hover:text-[#d4af37]" />
                    )}
                  </button>
                  <div className="space-y-1 flex-1 select-none">
                    <div className={`font-medium text-xs ${task.completed ? "line-through text-slate-500" : "text-white"}`}>
                      {task.title}
                    </div>
                    {task.leadName && (
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
                        <span className="uppercase font-semibold">Prospect:</span>
                        <span className="font-medium text-[#8fa0c2]">{task.leadName}</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-[8px] font-mono tracking-widest px-2 py-0.5 rounded-none uppercase font-semibold ${
                    task.type === "Call"
                      ? "text-blue-400 border border-blue-500/20"
                      : task.type === "Email"
                      ? "text-purple-400 border border-purple-500/20"
                      : task.type === "LinkedIn"
                      ? "text-amber-400 border border-amber-500/20"
                      : "text-slate-400 border border-white/10"
                  }`}>
                    {task.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Achievements badge card to enrich experience without adding complex logs */}
        <div className="glass p-4 rounded-none flex items-center gap-4 relative bg-gold-glow">
          <div className="p-2.5 bg-white/5 border border-white/15 text-[#d4af37] rounded-none">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="text-xs">
            <h4 className="serif italic text-base text-white font-medium">Outbound Honor System</h4>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">Execute continuous calls to sustain an elite daily pipeline health profile.</p>
          </div>
        </div>

        {/* JSON Backups Panel */}
        <div className="glass p-5 rounded-none space-y-4" id="json_backups_panel">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <Layers className="h-4 w-4 text-[#d4af37]" />
            <h3 className="serif text-base italic text-white flex items-center gap-1.5 font-medium">JSON Backup & Restore</h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Export your entire workspace (leads, tasks, logs, metrics, pitches) or import from a previous JSON backup file.
          </p>
          <div className="flex gap-2 font-sans">
            <button
              id="download-backup-btn"
              onClick={handleExportPWAData}
              className="flex-1 py-1.5 px-3 font-semibold text-[9px] uppercase tracking-wider text-center bg-white text-black hover:bg-slate-200 transition-all rounded-none cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="h-3 w-3" />
              <span>Export JSON</span>
            </button>
            <label
              htmlFor="pwa-restore-upload"
              className="flex-1 py-1.5 px-3 font-semibold text-[9px] uppercase tracking-wider text-center border border-white/20 text-white hover:bg-white/5 transition-all rounded-none cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Upload className="h-3 w-3" />
              <span>Import JSON</span>
              <input
                id="pwa-restore-upload"
                type="file"
                accept=".json"
                onChange={handleImportPWAData}
                style={{ display: "none" }}
              />
            </label>
          </div>
          {restoreStatus && (
            <p id="restore-status-msg" className="text-[10px] text-[#d4af37] font-mono text-center animate-pulse">
              {restoreStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
