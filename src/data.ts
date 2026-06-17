import { Lead, SDRTask, CampaignSequenceStep } from "./types";

export const INITIAL_LEADS: Lead[] = [
  {
    id: "lead-1",
    name: "Sarah Jenkins",
    title: "VP of Business Development",
    company: "CloudVenture Inc.",
    industry: "SaaS & Cloud",
    email: "sarah.j@cloudventure.com",
    phone: "+1 (555) 234-5678",
    painPoints: "SDR team spends 4 hours a day manually researching prospect criteria before writing emails.",
    status: "Cold",
    leadScore: 85,
    linkedInUrl: "https://www.linkedin.com/in/sarah-jenkins-sales4",
  },
  {
    id: "lead-2",
    name: "David Chen",
    title: "Head of Demand Gen",
    company: "FinScale Dynamics",
    industry: "Fintech",
    email: "david.chen@finscale.io",
    phone: "+1 (555) 789-0123",
    painPoints: "Low outbound email conversion rate, open rates are under 15% due to generic subject lines.",
    status: "Emailed",
    leadScore: 92,
    linkedInUrl: "https://www.linkedin.com/in/david-chen-demand-ops",
  },
  {
    id: "lead-3",
    name: "Marcus Aurelius",
    title: "Chief of Growth",
    company: "Stoic Analytics Group",
    industry: "Data Solutions",
    email: "marcus@stoicgroup.co",
    phone: "+1 (555) 456-7890",
    painPoints: "Outbound reps are making 80 cold calls a day but booking fewer than 2 meetings per week.",
    status: "Called",
    leadScore: 78,
    linkedInUrl: "https://www.linkedin.com/in/marcus-growth-stoic",
  },
  {
    id: "lead-4",
    name: "Elena Rostova",
    title: "Director of Inside Sales",
    company: "LogixLogistics GmbH",
    industry: "Supply Chain",
    email: "e.rostova@logixsupply.com",
    phone: "+1 (555) 901-2345",
    painPoints: "Struggling to train new junior reps. High turnover. Needs structured calling scripts and instant objection handling support.",
    status: "Booked",
    leadScore: 95,
    linkedInUrl: "https://www.linkedin.com/in/elena-rostova-logix",
  },
  {
    id: "lead-5",
    name: "Robert Miller",
    title: "Co-Founder & CEO",
    company: "SwiftAutomate",
    industry: "Artificial Intelligence",
    email: "robert@swiftautomate.io",
    phone: "+1 (555) 345-6789",
    painPoints: "Lacks dedicated SDR team. Wants to optimize founder-led sales before hire #1.",
    status: "Cold",
    leadScore: 70,
    linkedInUrl: "https://www.linkedin.com/in/robert-miller-swift",
  }
];

export const INITIAL_TASKS: SDRTask[] = [
  {
    id: "task-1",
    title: "Custom follow-up email to David Chen",
    type: "Email",
    dueDate: "Today",
    completed: false,
    leadId: "lead-2",
    leadName: "David Chen",
  },
  {
    id: "task-2",
    title: "Initial dial to Sarah Jenkins",
    type: "Call",
    dueDate: "Today",
    completed: false,
    leadId: "lead-1",
    leadName: "Sarah Jenkins",
  },
  {
    id: "task-3",
    title: "Connect on LinkedIn with Marcus Aurelius",
    type: "LinkedIn",
    dueDate: "Today",
    completed: true,
    leadId: "lead-3",
    leadName: "Marcus Aurelius",
  },
  {
    id: "task-4",
    title: "Pre-meeting research for Elena Rostova demo",
    type: "FollowUp",
    dueDate: "Tomorrow",
    completed: false,
    leadId: "lead-4",
    leadName: "Elena Rostova",
  },
  {
    id: "task-5",
    title: "Draft cold campaign sequence outline",
    type: "Email",
    dueDate: "Today",
    completed: false,
  }
];

export const CAMPAIGN_SEQUENCE: CampaignSequenceStep[] = [
  {
    id: "seq-1",
    stepNumber: 1,
    daysAfterPrevious: 0,
    channel: "Email",
    title: "The Personalized Problem Hook",
    description: "Short personalized outbound email referencing a specific bottleneck or pain point they have",
  },
  {
    id: "seq-2",
    stepNumber: 2,
    daysAfterPrevious: 2,
    channel: "LinkedIn",
    title: "Profile View & Soft Connection",
    description: "Send connection request WITHOUT pitching. Just say: 'Hey, noticed your growth in [Industry], would love to stay connected!'"
  },
  {
    id: "seq-3",
    stepNumber: 3,
    daysAfterPrevious: 3,
    channel: "Phone",
    title: "First Cold Call Attempt",
    description: "Deliver permission-based opener. If voicemail, leave a 25-second teaser indicating an email will follow up.",
  },
  {
    id: "seq-4",
    stepNumber: 4,
    daysAfterPrevious: 4,
    channel: "Email",
    title: "Case Study / Social Proof Value Video",
    description: "Quick summary of how you solved the exact same challenge for a direct competitor in their space.",
  },
  {
    id: "seq-5",
    stepNumber: 5,
    daysAfterPrevious: 3,
    channel: "LinkedIn",
    title: "Content Interaction",
    description: "Like or comment insightfully on a post of theirs, or send a brief tip on DM relating to their pain.",
  },
  {
    id: "seq-6",
    stepNumber: 6,
    daysAfterPrevious: 5,
    channel: "Email",
    title: "The Breakup Email / Permission-to-Close CTA",
    description: "Honest, human signoff stating we assume this isn't a focal point right now and asking if they want us to stop following up.",
  }
];

export const PRELOADED_OBJECTIONS = [
  {
    id: "obj-1",
    objectionText: "We don't have secondary budget for diagnostic tools this fiscal year.",
    empathyStatement: "I completely understand that, budget cycles are exceptionally tight for tech departments right now.",
    reframeFormula: "Reframe as a cost-saving measure: if this solution saves 5 hours per week per rep, it actually reduces current operational drag by more than its cost.",
    suggestedResponse: "I appreciate that, and I know timing with budgets is everything. Many growing sales teams we contact are frozen. However, they look at us because we actually give back 15 hours of manual writing per rep each week, reducing overtime costs. If I could show you a 2-minute workflow that frees up that time without asking for any budget until Q4, would you be open to reviewing it?",
    objectionType: "Price/Budget",
    confidenceScore: 8
  },
  {
    id: "obj-2",
    objectionText: "We already use Salesforce High Velocity Sales. We don't need another tool.",
    empathyStatement: "That makes complete sense—Salesforce is the gold standard for records management.",
    reframeFormula: "Reframe as a symbiotic integration rather than a tool replacement: enhancing Salesforce content without requiring team members to migrate platforms.",
    suggestedResponse: "Salesforce is phenomenal for tracking and sequences. Most of our clients also run SFDC. We actually don't replace it—we plug straight in to act as the supercharged personalization layer, writing target hooks inside your Salesforce task list. Leads never have to hop between apps. Could I show you how we integrate in 90 seconds?",
    objectionType: "Competitor",
    confidenceScore: 9
  },
  {
    id: "obj-3",
    objectionText: "Just send me an email and I'll take a look.",
    empathyStatement: "I'd glad to do that, I know your inbox is probably overflowing right now.",
    reframeFormula: "Reframe as context qualification: ensuring the email contains exactly what resonates rather than generic generic slide decks.",
    suggestedResponse: "I will certainly do that! Mind if I ask. If I just send over our standard 15-page deck, it's going to end up in your spam folder anyway. Are you more focused on lowering list bounce rates, or is personalizing emails to VPs of Engineering what's on your agenda right now? That way I can tailor a 3-sentence summary for you.",
    objectionType: "No Interest/Need",
    confidenceScore: 7
  },
  {
    id: "obj-4",
    objectionText: "I am not the right person for this. Try looking on LinkedIn.",
    empathyStatement: "No worries at all, appreciate you letting me know right away.",
    reframeFormula: "Reframe as finding the internal champion: requesting an internal referral to have a warm intro.",
    suggestedResponse: "Thanks for saving us both the time! Usually, this sits under either the Head of Revenue Ops or the Outbound SDR Manager. Who heads up that side of the court on your team? I'd love to refer to our conversation so they know I reached out to you first.",
    objectionType: "Authority",
    confidenceScore: 9
  }
];
