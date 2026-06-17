export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  painPoints: string;
  status: "Cold" | "Emailed" | "Called" | "Not Interested" | "Booked";
  leadScore: number;
  linkedInUrl?: string;
}

export interface SDRTask {
  id: string;
  title: string;
  type: "Call" | "Email" | "LinkedIn" | "FollowUp";
  dueDate: string;
  completed: boolean;
  leadId?: string;
  leadName?: string;
}

export interface CallLog {
  id: string;
  leadId: string;
  leadName: string;
  durationSeconds: number;
  outcome: "No Answer" | "Gatekeeper Blocked" | "Incorrect Number" | "Interested (Booked)" | "Not Interested" | "Follow-up Scheduled";
  notes: string;
  timestamp: string;
}

export interface ColdEmailDraft {
  subjectLine: string;
  emailBody: string;
  personalizationHookExplanation: string;
}

export interface ObjectionSolution {
  empathyStatement: string;
  reframeFormula: string;
  suggestedResponse: string;
  objectionType: string;
  confidenceScore: number;
}

export interface ColdCallScript {
  intro: string;
  problemPitch: string;
  socialProof: string;
  closeCall: string;
  tips: string[];
}

export interface CampaignSequenceStep {
  id: string;
  stepNumber: number;
  daysAfterPrevious: number;
  channel: "Email" | "LinkedIn" | "Phone";
  title: string;
  description: string;
}
