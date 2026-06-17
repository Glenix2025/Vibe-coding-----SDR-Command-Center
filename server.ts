import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in your Secrets/Environment panel in AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. API: Personalized Cold Email Generator
app.post("/api/gemini/generate-email", async (req, res) => {
  try {
    const {
      prospectName,
      prospectTitle,
      companyName,
      companyIndustry,
      productName,
      productValueProps,
      painPoints,
      tone = "consultative",
      length = "short",
      callToAction = "a quick 10-minute feedback call, maybe next Thursday?",
    } = req.body;

    if (!prospectName || !companyName || !productName) {
      return res.status(400).json({ error: "Missing required fields: prospectName, companyName, and productName are required." });
    }

    const client = getGeminiClient();

    const systemPrompt = `You are a world-class Sales Development Representative (SDR) and outbound email copywriting expert.
Your goal is to write a highly converting, non-spammy, hyper-personalized, ultra-engaging cold pitch.
Adhere strictly to modern cold email best practices:
- NEVER use generic corporate fluff (e.g. "I hope this email finds you well", "We are the leading provider of...").
- Hook the recipient in the first 1-2 lines based on their role/company.
- Describe the solution simply without heavy technical jargon.
- Suggest a very soft, zero-pressure Call to Action (CTA).
- Maintain a clean, readable layout with short lines.`;

    const userPrompt = `Generate a cold outbound email for the following scenario:
Recipient: ${prospectName} (${prospectTitle || "Decision Maker"} at ${companyName}, Industry: ${companyIndustry || "Technology"})
Our Company/Product: "${productName}"
What our product does & core value proposition: "${productValueProps || "Helping businesses automate leads & outbound sequences."}"
Recipients painful point/hook: "${painPoints || "Needs to book more sales meetings without wasting endless hours on LinkedIn manual messaging"}"
Email Tone: ${tone} (e.g. consultative, bold, casual, formal, narrative)
Length Constraint: ${length} (short should be under 120 words, medium ~180 words, detailed ~250 words)
Specific Call to Action (CTA): "${callToAction}"

Please output a JSON response containing:
1. "subjectLine": An enticing, clickable, curiosity-inducing subject line (no clickbait, e.g., "quick question", "idea for ${companyName}", "${prospectName} + ${productName}?").
2. "emailBody": The fully formatted body of the email (using \\n for line breaks, no HTML tags, just clean text), signed off as "[My Name], SDR Team".
3. "personalizationHookExplanation": A quick 1-sentence tip on why this subject line or hook works for this prospect.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subjectLine: { type: Type.STRING },
            emailBody: { type: Type.STRING },
            personalizationHookExplanation: { type: Type.STRING },
          },
          required: ["subjectLine", "emailBody", "personalizationHookExplanation"],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Received empty response from Gemini API.");
    }

    const data = JSON.parse(outputText.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini Email Generator Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate email pitch." });
  }
});

// 2. API: Objection Handler
app.post("/api/gemini/objection-handler", async (req, res) => {
  try {
    const { objectionText, productName, productValueProps } = req.body;

    if (!objectionText) {
      return res.status(400).json({ error: "objectionText is required." });
    }

    const client = getGeminiClient();

    const systemPrompt = `You are a high-performing sales objection crusher. You excel at turning hard customer pushbacks into collaborative dialogue.
Your method is "Empathize, Reframe, and Check-In (Acknowledge, Pivot, Ask Client-Led Question)".
- Never get defensive.
- Validate their concern so they lower their guard.
- Reframe the objection as a challenge you solve.
- Ask a powerful open-ended or closing question.`;

    const userPrompt = `Live conversation prospect objection:
" ${objectionText} "

Context:
- We are selling: "${productName || "SDR Automation Toolkit"}"
- Key benefits / Value proposition: "${productValueProps || "Automating pipeline building and booking 3x more meetings"}"

Generate a response plan containing:
1. "empathyStatement": A professional response acknowledging or validating their concern without conceding the deal.
2. "reframeFormula": A persuasive pivot that reframes their objection.
3. "suggestedResponse": A natural, highly realistic verbal response script they can speak or send, keeping it warm and authoritative.
4. "objectionType": Categorize this objection (e.g., Price/Budget, Timing, Competitor, No Interest/Need, Authority).
5. "confidenceScore": Scale 1 to 10 on our ability to overcome this objection (number).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            empathyStatement: { type: Type.STRING },
            reframeFormula: { type: Type.STRING },
            suggestedResponse: { type: Type.STRING },
            objectionType: { type: Type.STRING },
            confidenceScore: { type: Type.INTEGER },
          },
          required: ["empathyStatement", "reframeFormula", "suggestedResponse", "objectionType", "confidenceScore"],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Received empty response from Gemini API.");
    }

    const data = JSON.parse(outputText.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini Objection Handler Error:", error);
    return res.status(500).json({ error: error.message || "Failed to handle sales objection." });
  }
});

// 3. API: Cold Call Script Generator
app.post("/api/gemini/generate-script", async (req, res) => {
  try {
    const { targetAudience, valueProposition, problemSolved } = req.body;

    if (!targetAudience || !valueProposition) {
      return res.status(400).json({ error: "Missing targetAudience or valueProposition." });
    }

    const client = getGeminiClient();

    const systemPrompt = `You are a cold call expert. You construct scripts that bypass secretaries, command immediate interest in 15 seconds, and respect prospect's time.
Your framework:
- Permission hook ("Hi, I know I'm an interruption, do you have 30 seconds for me to tell you why we're calling, then you can decide if we hang up?")
- Problem-centric tease (rather than pitching features, pitch a problem they likely face)
- Contrast/Social proof ("We work with teams like X, helping them solve Y.")
- Zero-pressure close for a follow up.`;

    const userPrompt = `Create a cold call script for:
Target Buyer Persona: "${targetAudience}"
What we offer / Value proposition: "${valueProposition}"
Specific pain we eliminate: "${problemSolved || "manual contact lookups and bad data bounces"}"

Output a JSON package with:
1. "intro": Friendly start & permission hook.
2. "problemPitch": Hook addressing the key problem they face.
3. "socialProof": How we've helped others.
4. "closeCall": Clean closing request for a short meeting.
5. "tips": 2 quick delivery tips for speaking this script (speaking speed, tone).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intro: { type: Type.STRING },
            problemPitch: { type: Type.STRING },
            socialProof: { type: Type.STRING },
            closeCall: { type: Type.STRING },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["intro", "problemPitch", "socialProof", "closeCall", "tips"],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Received empty response from Gemini API.");
    }

    const data = JSON.parse(outputText.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini Script Generator Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate script." });
  }
});

// 4. API: 8-Step LinkedIn Outbound Sequence Generator
app.post("/api/gemini/generate-linkedin-sequence", async (req, res) => {
  try {
    const {
      prospectName,
      prospectTitle,
      companyName,
      companyIndustry,
      productName,
      productValueProps,
      painPoints,
    } = req.body;

    if (!prospectName || !companyName || !productName) {
      return res.status(400).json({ error: "Missing required fields: prospectName, companyName, and productName are required." });
    }

    const client = getGeminiClient();

    const systemPrompt = `You are an elite, world-class outbound sales copywriter and social selling architect. 
Your goal is to build an 8-step, hyper-converting outbound sequence specifically designed for LinkedIn Messaging and Social outreach. 
This sequence should feel human, conversational, low-friction, and exceptionally authentic—completely free of boilerplate corporate pitches or cheesy automated bot opener vibes.

The steps MUST represent a natural social selling funnel of 8 sequential steps:
1. Step 1: Blank Connection Request or 1-sentence personalized invite (under 300 characters).
2. Step 2: Welcome / Thank You touchpoint (establishing a low-friction hook, not selling).
3. Step 3: Thought leadership content share or brief industry insight.
4. Step 4: Engagement touchpoint—Asking an open question about their operations/pain.
5. Step 5: Soft pitch & value proposition introduction, proposing a soft solution call.
6. Step 6: Follow-up nudge, referring to the value proposition.
7. Step 7: Social proof sharing (metric from a similar agency or team).
8. Step 8: Breakup message / Final graceful nudge, giving them space.`;

    const userPrompt = `Synthesize an 8-step LinkedIn outreach sequence based on the following prospect details:
- Name: ${prospectName}
- Title: ${prospectTitle || "Decision Maker"}
- Company: ${companyName}
- Industry: ${companyIndustry || "Technology"}
- Pain Points / Hook: "${painPoints || "Struggling to build premium pipeline without manual lead scraping and generic email tools."}"
- Our Product / Offering: "${productName}"
- Our Value Props: "${productValueProps}"

Format each message to be short, space-segmented (using double line breaks), highly relatable, and under 350 characters per message where possible so it feels like a native chat or brief LinkedIn in-box note (except Connection Request which MUST be under 300 characters).

Return a JSON object containing a "steps" array with exactly 8 objects. Each object must have:
1. "stepNumber": number (1 to 8)
2. "delayDays": number (days to wait after previous touchpoint, e.g. 0 for connection, then 2, 3, etc.)
3. "channelActivity": string (activity title, e.g. "Step 1: Connection Request", "Step 2: Welcome Message")
4. "messageBody": string (fully formatted message body with user names dynamically inserted, signed off as "[My Name]")
5. "conversionTip": string (a quick, 1-sentence tactical tip on why this step holds heavy psychological leverage)`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  delayDays: { type: Type.INTEGER },
                  channelActivity: { type: Type.STRING },
                  messageBody: { type: Type.STRING },
                  conversionTip: { type: Type.STRING },
                },
                required: ["stepNumber", "delayDays", "channelActivity", "messageBody", "conversionTip"],
              },
            },
          },
          required: ["steps"],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Received empty response from Gemini API for LinkedIn sequence.");
    }

    const data = JSON.parse(outputText.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini LinkedIn Sequence Generator Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate LinkedIn sequence." });
  }
});

// Serve frontend assets in production, use Vite Dev Server in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Command Center Server actively listening on port ${PORT}`);
  });
}

startServer();
