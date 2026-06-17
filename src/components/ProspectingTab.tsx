import React, { useState } from "react";
import { Lead, CallLog } from "../types";
import { User, Building2, Layers, Flame, Mail, Phone, Plus, Search, Trash2, Edit3, ClipboardList, CheckCircle2, Linkedin } from "lucide-react";

interface ProspectingTabProps {
  leads: Lead[];
  onAddLead: (lead: Omit<Lead, "id" | "leadScore">) => void;
  onUpdateLeadStatus: (leadId: string, status: Lead["status"]) => void;
  onDeleteLead: (leadId: string) => void;
  onSelectLeadForEmail: (lead: Lead) => void;
  onSelectLeadForScript: (lead: Lead) => void;
  onLogCall: (log: Omit<CallLog, "id" | "timestamp">) => void;
  callLogs: CallLog[];
}

export default function ProspectingTab({
  leads,
  onAddLead,
  onUpdateLeadStatus,
  onDeleteLead,
  onSelectLeadForEmail,
  onSelectLeadForScript,
  onLogCall,
  callLogs,
}: ProspectingTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(leads[0] || null);

  // New Lead states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    title: "",
    company: "",
    industry: "",
    email: "",
    phone: "",
    painPoints: "",
    linkedInUrl: "",
  });

  // Call Logger states
  const [showCallForm, setShowCallForm] = useState(false);
  const [callLogForm, setCallLogForm] = useState({
    durationSeconds: 120,
    outcome: "Follow-up Scheduled" as CallLog["outcome"],
    notes: "",
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.company || !newLead.email) return;
    onAddLead(newLead);
    setNewLead({
      name: "",
      title: "",
      company: "",
      industry: "",
      email: "",
      phone: "",
      painPoints: "",
      linkedInUrl: "",
    });
    setShowAddForm(false);
  };

  const handleLogCallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    onLogCall({
      leadId: selectedLead.id,
      leadName: selectedLead.name,
      durationSeconds: Number(callLogForm.durationSeconds),
      outcome: callLogForm.outcome,
      notes: callLogForm.notes,
    });
    // Automatically transition lead status
    if (callLogForm.outcome === "Interested (Booked)") {
      onUpdateLeadStatus(selectedLead.id, "Booked");
    } else if (selectedLead.status === "Cold") {
      onUpdateLeadStatus(selectedLead.id, "Called");
    }
    // Refresh the selected lead reference with the new status
    setSelectedLead({
      ...selectedLead,
      status: callLogForm.outcome === "Interested (Booked)" ? "Booked" : selectedLead.status === "Cold" ? "Called" : selectedLead.status,
    });
    setCallLogForm({
      durationSeconds: 120,
      outcome: "Follow-up Scheduled",
      notes: "",
    });
    setShowCallForm(false);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "All" || lead.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status: Lead["status"]) => {
    switch (status) {
      case "Cold":
        return "bg-white/5 text-slate-400 border border-white/10";
      case "Emailed":
        return "bg-purple-950/20 text-purple-300 border border-purple-800/20";
      case "Called":
        return "bg-blue-950/20 text-blue-300 border border-blue-800/20";
      case "Booked":
        return "bg-emerald-950/20 text-[#d4af37] border border-[#d4af37]/40";
      case "Not Interested":
        return "bg-rose-950/20 text-rose-350 border border-rose-800/20";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="prospecting_tab_container">
      {/* Col 1 & 2: Leads List Container */}
      <div className="lg:col-span-8 space-y-4" id="leads_list_column">
        {/* Search controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 glass rounded-none">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              id="lead-search-input"
              type="text"
              placeholder="Search prospects by name, company, job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950/50 border border-white/10 rounded-none text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#d4af37]/50 font-sans"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              id="status-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-950/50 border border-white/10 rounded-none px-3 py-1.5 text-slate-300 focus:outline-none focus:border-[#d4af37]/50 cursor-pointer font-sans"
            >
              <option value="All">All Statuses</option>
              <option value="Cold">Cold</option>
              <option value="Emailed">Emailed</option>
              <option value="Called">Called</option>
              <option value="Booked">Booked</option>
              <option value="Not Interested">Not Interested</option>
            </select>
            <button
              id="add-lead-btn"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-wider font-semibold uppercase rounded-none bg-white text-black hover:bg-slate-200 transition-colors duration-200 cursor-pointer shrink-0"
            >
              <Plus className="h-3 w-3" />
              Add Prospect
            </button>
          </div>
        </div>

        {/* Add Lead Dialog Modal (Relative Overlay inside list column) */}
        {showAddForm && (
          <div className="p-5 glass rounded-none border-l-2 border-l-[#d4af37] space-y-4 animate-in fade-in duration-250 relative bg-gold-glow" id="add_lead_form_panel">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="serif text-lg italic text-white">Register Outbound Pipeline Prospect</h3>
              <button
                id="cancel-add-lead-btn"
                onClick={() => setShowAddForm(false)}
                className="text-[10px] tracking-widest uppercase text-slate-500 hover:text-white"
              >
                [ Cancel ]
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Full Name *</label>
                <input
                  id="new-lead-name"
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]/50"
                  placeholder="Alexis Smith"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Job Title</label>
                <input
                  id="new-lead-title"
                  type="text"
                  value={newLead.title}
                  onChange={(e) => setNewLead({ ...newLead, title: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]/50"
                  placeholder="Sales Director"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Company Or Agency *</label>
                <input
                  id="new-lead-company"
                  type="text"
                  required
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]/50"
                  placeholder="ApexMedia Corp"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Industry Vertical</label>
                <input
                  id="new-lead-industry"
                  type="text"
                  value={newLead.industry}
                  onChange={(e) => setNewLead({ ...newLead, industry: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]/50"
                  placeholder="Fintech & SaaS"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Primary Email Coordinates *</label>
                <input
                  id="new-lead-email"
                  type="email"
                  required
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]/50"
                  placeholder="name@company.com"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Direct Phone Contact</label>
                <input
                  id="new-lead-phone"
                  type="text"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]/50"
                  placeholder="+1 (555) 392-4912"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">LinkedIn Profile URL</label>
                <input
                  id="new-lead-linkedin"
                  type="text"
                  value={newLead.linkedInUrl}
                  onChange={(e) => setNewLead({ ...newLead, linkedInUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]/50"
                  placeholder="https://www.linkedin.com/in/username"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Identified Pain Points & Research Notes</label>
                <textarea
                  id="new-lead-pain"
                  rows={2}
                  value={newLead.painPoints}
                  onChange={(e) => setNewLead({ ...newLead, painPoints: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-none px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]/50"
                  placeholder="Specifically wants to automate SOC-2 audit logs generation to release bottlenecks..."
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 text-right">
                <button
                  id="submit-lead-btn"
                  type="submit"
                  className="px-5 py-2 font-semibold text-[10px] tracking-wider uppercase bg-white text-black hover:bg-slate-200 transition-colors rounded-none cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leads Table Card View */}
        <div className="glass rounded-none overflow-hidden" id="leads_grid_card">
          {filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-sans text-xs">
              No registered profiles correspond to current filter parameters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="leads_data_table">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 text-[10px] tracking-wider uppercase font-semibold">
                    <th className="px-5 py-3">Lead Coordinates</th>
                    <th className="px-5 py-3">Company info</th>
                    <th className="px-5 py-3 text-center">Power Index</th>
                    <th className="px-5 py-3">Current Status</th>
                    <th className="px-5 py-3 text-right">Draft Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.map((lead) => (
                    <tr
                      id={`lead-row-${lead.id}`}
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`cursor-pointer hover:bg-white/[0.02] transition-colors duration-150 text-xs ${
                        selectedLead?.id === lead.id ? "bg-white/[0.04] text-white" : "text-slate-300"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{lead.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{lead.title}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-350">
                          <Building2 className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span>{lead.company}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{lead.industry}</div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-none border ${
                            lead.leadScore >= 90
                              ? "text-red-400 border-red-500/25 bg-red-950/10"
                              : lead.leadScore >= 80
                              ? "text-amber-400 border-amber-500/25 bg-amber-950/10"
                              : "text-slate-400 border-white/10 bg-white/[0.01]"
                          }`}
                        >
                          {lead.leadScore}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-none text-[9px] uppercase font-semibold tracking-wider ${getStatusStyle(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-email-lead-${lead.id}`}
                            title="Generate AI Email"
                            onClick={() => onSelectLeadForEmail(lead)}
                            className="p-1.5 border border-white/25 hover:border-white text-slate-300 hover:text-white transition duration-150 rounded-none bg-transparent cursor-pointer"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`btn-script-lead-${lead.id}`}
                            title="SDR Calling Script"
                            onClick={() => onSelectLeadForScript(lead)}
                            className="p-1.5 border border-white/25 hover:border-white text-slate-300 hover:text-white transition duration-150 rounded-none bg-transparent cursor-pointer"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`btn-delete-lead-${lead.id}`}
                            title="Delete Lead"
                            onClick={() => onDeleteLead(lead.id)}
                            className="p-1.5 border border-white/5 hover:border-rose-900 text-slate-500 hover:text-rose-450 transition duration-150 rounded-none bg-transparent cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Col 3: Lead Detail Panel & Dial Logger */}
      <div className="lg:col-span-4 space-y-4" id="lead_detail_column">
        {selectedLead ? (
          <div className="p-5 glass rounded-none space-y-5" id="lead_detail_panel">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] text-[#8fa0c2] border border-white/15 px-2 py-0.5 rounded-none font-mono uppercase tracking-wider font-semibold">Prospect Details</span>
                <h3 className="serif text-xl italic text-white mt-2 leading-none">{selectedLead.name}</h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">{selectedLead.title} @ <span className="font-semibold text-white">{selectedLead.company}</span></p>
              </div>
              <span className={`px-2 py-0.5 rounded-none text-[9px] uppercase font-semibold tracking-wider ${getStatusStyle(selectedLead.status)}`}>
                {selectedLead.status}
              </span>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs font-sans">
              <button
                id="log-call-click-btn"
                onClick={() => setShowCallForm(!showCallForm)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 font-semibold uppercase tracking-wider text-[10px] border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all bg-transparent rounded-none cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {showCallForm ? "Close Logger" : "Log Dial"}
              </button>
              <button
                id="quick-status-booked-btn"
                onClick={() => {
                  onUpdateLeadStatus(selectedLead.id, "Booked");
                  setSelectedLead({ ...selectedLead, status: "Booked" });
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 font-semibold uppercase tracking-wider text-[10px] border border-[#d4af37]/30 hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all bg-transparent text-[#d4af37] rounded-none cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                Mark Booked
              </button>
            </div>

            {/* Dial Logger Form */}
            {showCallForm && (
              <form onSubmit={handleLogCallSubmit} className="p-4 bg-slate-950 border border-white/15 rounded-none space-y-3 font-sans" id="dial_logger_form">
                <h4 className="serif text-xs italic text-white font-semibold">Log Live Outbound Dial outcomes</h4>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-slate-550 mb-1">Call Outcome *</label>
                  <select
                    id="dial-outcome-select"
                    value={callLogForm.outcome}
                    onChange={(e) => setCallLogForm({ ...callLogForm, outcome: e.target.value as CallLog["outcome"] })}
                    className="w-full text-xs bg-slate-900 border border-white/10 rounded-none px-2 py-1.5 text-slate-200 focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Interested (Booked)">Interested (Booked Meeting!)</option>
                    <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                    <option value="Gatekeeper Blocked">Gatekeeper Blocked</option>
                    <option value="No Answer">No Answer / Left Voicemail</option>
                    <option value="Not Interested">Not Interested (Do Not Call)</option>
                    <option value="Incorrect Number">Incorrect Number</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-550 mb-1 font-semibold">Duration (secs)</label>
                    <input
                      id="dial-duration-secs"
                      type="number"
                      value={callLogForm.durationSeconds}
                      onChange={(e) => setCallLogForm({ ...callLogForm, durationSeconds: Number(e.target.value) })}
                      className="w-full text-xs bg-slate-900 border border-white/10 rounded-none px-2 py-1 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-slate-550 mb-1 font-semibold">Change Status</label>
                    <select
                      id="dial-status-select"
                      value={selectedLead.status}
                      onChange={(e) => {
                        const nextStat = e.target.value as Lead["status"];
                        onUpdateLeadStatus(selectedLead.id, nextStat);
                        setSelectedLead({ ...selectedLead, status: nextStat });
                      }}
                      className="w-full text-xs bg-slate-900 border border-white/10 rounded-none px-2 py-1 text-slate-200 focus:outline-none"
                    >
                      <option value="Cold">Cold</option>
                      <option value="Emailed">Emailed</option>
                      <option value="Called">Called</option>
                      <option value="Booked">Booked</option>
                      <option value="Not Interested">Not Interested</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-slate-550 mb-1 font-semibold">Call Notes / Summary</label>
                  <textarea
                    id="dial-notes-input"
                    rows={2}
                    placeholder="e.g. Objections raised, competitor they use..."
                    value={callLogForm.notes}
                    onChange={(e) => setCallLogForm({ ...callLogForm, notes: e.target.value })}
                    className="w-full text-xs bg-slate-900 border border-white/10 rounded-none px-2 py-1.5 text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-1.5 mt-2">
                  <button
                    id="submit-dial-log-btn"
                    type="submit"
                    className="px-4 py-1.5 text-[9px] uppercase tracking-wider font-semibold rounded-none bg-white text-black hover:bg-slate-200 cursor-pointer"
                  >
                    Save Dial Log
                  </button>
                </div>
              </form>
            )}

            {/* Prospect Metadata Details */}
            <div className="border-t border-white/10 pt-4 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Industry</span>
                  <span className="text-slate-300 font-semibold">{selectedLead.industry || "Not Specified"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Lead Score Rating</span>
                  <span className="text-[#d4af37] font-bold block mt-0.5">{selectedLead.leadScore} / 100</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Outbound Coordinates</span>
                <div className="space-y-1 font-mono text-[11px] leading-relaxed">
                  <div className="text-slate-300 flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 border border-white/5 rounded-none">
                    <Mail className="h-3 w-3 text-purple-400 shrink-0" />
                    <span className="truncate">{selectedLead.email}</span>
                  </div>
                  <div className="text-slate-300 flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 border border-white/5 rounded-none">
                    <Phone className="h-3 w-3 text-blue-400 shrink-0" />
                    <span>{selectedLead.phone || "No direct phone"}</span>
                  </div>
                  {selectedLead.linkedInUrl && (
                    <a
                      href={selectedLead.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 flex items-center gap-1.5 bg-indigo-950/25 hover:bg-indigo-900/40 px-2 py-1 border border-indigo-500/20 rounded-none transition duration-150 cursor-pointer"
                    >
                      <Linkedin className="h-3 w-3 text-indigo-400 shrink-0" />
                      <span className="truncate font-sans font-medium text-indigo-300">Open LinkedIn Profile &rarr;</span>
                    </a>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase tracking-wider mb-1">Pain Points & Research Hooks</span>
                <p className="p-3 bg-slate-950/80 border border-white/5 text-slate-300 font-serif leading-relaxed text-[11px] italic">
                  "{selectedLead.painPoints || "None researched yet. Enter pain points above to enable custom AI personalized outreach."}"
                </p>
              </div>
            </div>

            {/* Send parameters directly to AI outbound assistants */}
            <div className="border-t border-white/10 pt-4 space-y-2 font-sans">
              <h4 className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mb-2">AI Outbound Launchpad</h4>
              <button
                id="launch-ai-email-action"
                onClick={() => onSelectLeadForEmail(selectedLead)}
                className="w-full flex items-center justify-between text-xs py-2 px-3 rounded-none bg-white/[0.02] border border-white/15 text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Generate Outreach Mail</div>
                    <div className="text-[10px] text-slate-400">Customized drafts powered by AI</div>
                  </div>
                </div>
                <span>&rarr;</span>
              </button>
              <button
                id="launch-ai-script-action"
                onClick={() => onSelectLeadForScript(selectedLead)}
                className="w-full flex items-center justify-between text-xs py-2 px-3 rounded-none bg-white/[0.02] border border-white/15 text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Interactive Cold Script</div>
                    <div className="text-[10px] text-slate-400">Micro-agreed teleprompter parameters</div>
                  </div>
                </div>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-none font-sans text-xs">
            Select a prospect lead from the pipeline list to view structured coordinates.
          </div>
        )}

        {/* Dial Logs Quick History */}
        <div className="p-5 glass rounded-none">
          <h4 className="serif text-base italic text-white mb-3 flex items-center gap-1.5 border-b border-white/10 pb-2">
            <ClipboardList className="h-3.5 w-3.5 text-[#d4af37]" />
            Continuous Dial History ({callLogs.length})
          </h4>
          {callLogs.length === 0 ? (
            <p className="text-xs text-slate-550 py-3 font-sans">No dialed results logged in current workspace session.</p>
          ) : (
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {callLogs.slice().reverse().map((log) => (
                <div id={`call-log-${log.id}`} key={log.id} className="p-3 bg-white/[0.01] border border-white/10 text-xs font-sans space-y-1 rounded-none">
                  <div className="flex items-center justify-between font-mono font-semibold">
                    <span className="text-white font-sans">{log.leadName}</span>
                    <span className={`px-2 py-0.5 rounded-none text-[8px] uppercase tracking-wider border ${
                      log.outcome === "Interested (Booked)"
                        ? "text-[#d4af37] border-[#d4af37]/35 bg-[#d4af37]/5"
                        : log.outcome === "Follow-up Scheduled"
                        ? "text-blue-300 border-blue-500/10 bg-blue-500/[0.02]"
                        : "text-slate-400 border-white/5 bg-white/[0.01]"
                    }`}>
                      {log.outcome}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed italic pr-2 font-serif">"{log.notes}"</p>
                  <div className="text-[9px] text-slate-500 font-mono text-right mt-1 uppercase">
                    Pacing: {log.durationSeconds} Seconds
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
