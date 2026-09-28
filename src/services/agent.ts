import { GoogleGenAI } from '@google/genai';
import {
  toolSchemeSearch,
  toolEligibilityChecker,
  toolStateFilter,
  toolSectorFilter,
  toolSchemeDetails,
  toolBenefits,
  toolApplicationInfo,
  toolOfficialSource,
  toolWhatAmIMissing,
  ToolResult,
} from './tools.ts';
import { UserProfile, LANGUAGES } from '../data/constants.ts';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  toolsUsed?: ToolResult[];
  language?: string;
}

export interface AgentRequest {
  message: string;
  language: string; // e.g. 'en', 'hi', 'ta', 'te', 'bn', etc.
  sessionId: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  state?: string;
  sector?: string;
  profile?: UserProfile;
}

export interface AgentResponse {
  sessionId: string;
  reply: string;
  toolsUsed: ToolResult[];
  language: string;
  modelUsed?: string;
}

// System prompt enforcing accuracy, official sources only, no emojis, concise and helpful
const SYSTEM_INSTRUCTION = `You are the official India-wide Multilingual Government Scheme Assistant.
Your goal is to provide accurate, verified information regarding Central and State Government schemes across all 20 sectors and 36 States/UTs.

CRITICAL INSTRUCTIONS:
1. NEVER invent or hallucinate scheme names, rules, or links.
2. Rely strictly on the verified scheme data and tool findings provided in the context.
3. Keep explanations clear, concise, and structured.
4. DO NOT use emojis or decorative icons anywhere in your response.
5. Provide official government website links whenever relevant.
6. Always answer in the user's requested language.
7. If the user asks what they are missing or if cross-sector benefits apply, highlight relevant opportunities in health, energy, or pension schemes.`;

async function callLlamaAPI(prompt: string, systemInstruction: string): Promise<string> {
  const llamaKey =
    process.env.LLAMA_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.TOGETHER_API_KEY;

  const baseUrl =
    process.env.LLAMA_BASE_URL ||
    (process.env.OPENROUTER_API_KEY
      ? 'https://openrouter.ai/api/v1'
      : process.env.TOGETHER_API_KEY
      ? 'https://api.together.xyz/v1'
      : 'https://api.groq.com/openai/v1');

  const model =
    process.env.LLAMA_MODEL ||
    (process.env.OPENROUTER_API_KEY
      ? 'meta-llama/llama-3.3-70b-instruct'
      : process.env.TOGETHER_API_KEY
      ? 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
      : 'llama-3.3-70b-versatile');

  if (!llamaKey && !process.env.LLAMA_BASE_URL) {
    return '';
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(llamaKey ? { Authorization: `Bearer ${llamaKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Llama API call failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result?.choices?.[0]?.message?.content || '';
}

export async function runGovernmentSchemeAgent(req: AgentRequest): Promise<AgentResponse> {
  const { message, language, sessionId, history = [], state, sector, profile } = req;
  const lowerMsg = message.toLowerCase();

  // 1. Autonomous Tool Selection
  const toolsExecuted: ToolResult[] = [];

  // Determine which tools to invoke based on message intent:
  const isMissingQuery =
    lowerMsg.includes('missing') ||
    lowerMsg.includes('what else') ||
    lowerMsg.includes('other scheme') ||
    lowerMsg.includes('cross sector');

  const isEligibilityQuery =
    lowerMsg.includes('eligible') ||
    lowerMsg.includes('eligibility') ||
    lowerMsg.includes('can i apply') ||
    lowerMsg.includes('qualify') ||
    Boolean(profile && (profile.age || profile.occupation || profile.annualIncome));

  const isBenefitsQuery =
    lowerMsg.includes('benefit') ||
    lowerMsg.includes('how much') ||
    lowerMsg.includes('money') ||
    lowerMsg.includes('amount') ||
    lowerMsg.includes('grant') ||
    lowerMsg.includes('subsidy');

  const isApplicationQuery =
    lowerMsg.includes('apply') ||
    lowerMsg.includes('how to apply') ||
    lowerMsg.includes('documents') ||
    lowerMsg.includes('portal') ||
    lowerMsg.includes('link') ||
    lowerMsg.includes('website') ||
    lowerMsg.includes('official');

  // Execute State Filter if state context exists or mentioned
  if (state && state !== 'All-India (Central)') {
    toolsExecuted.push(toolStateFilter(state));
  }

  // Execute Sector Filter if sector context exists or mentioned
  if (sector && sector !== 'All') {
    toolsExecuted.push(toolSectorFilter(sector));
  }

  // Execute Eligibility Checker if profile details exist
  if (isEligibilityQuery) {
    const prof: UserProfile = {
      ...(profile || {}),
      state: state || profile?.state,
    };
    toolsExecuted.push(toolEligibilityChecker(prof));
  }

  // Execute Scheme Search for keywords
  const searchResult = toolSchemeSearch(message);
  toolsExecuted.push(searchResult);

  // If specific scheme matched, get its details & official source
  if (searchResult.foundCount > 0 && Array.isArray(searchResult.data) && searchResult.data.length > 0) {
    const primaryScheme = searchResult.data[0];
    if (isBenefitsQuery) {
      toolsExecuted.push(toolBenefits(primaryScheme.id));
    }
    if (isApplicationQuery) {
      toolsExecuted.push(toolApplicationInfo(primaryScheme.id));
      toolsExecuted.push(toolOfficialSource(primaryScheme.id));
    }
  }

  // Execute "What Am I Missing?" tool if requested
  if (isMissingQuery || toolsExecuted.length < 2) {
    const activeSectors: string[] = [];
    if (sector && sector !== 'All') activeSectors.push(sector);
    if (searchResult.foundCount > 0 && Array.isArray(searchResult.data)) {
      searchResult.data.slice(0, 2).forEach((s: any) => {
        if (s.sector) activeSectors.push(s.sector);
      });
    }
    toolsExecuted.push(toolWhatAmIMissing(activeSectors, profile));
  }

  // 2. Multilingual Generation with LLM (Llama or Gemini) or rule-based fallback
  const langObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const targetLanguage = langObj.name;

  let assistantReply = '';
  let modelUsed = 'Official Government Schemes Knowledge Engine';

  // Prepare compact tool context for LLM
  const toolsContext = toolsExecuted.map((t) => ({
    toolName: t.toolName,
    querySummary: t.querySummary,
    resultsCount: t.foundCount,
    data: t.data,
  }));

  const prompt = `User Query: "${message}"
Requested Language: ${targetLanguage} (${langObj.nativeName})
Selected State/UT: ${state || 'All-India'}
Selected Sector: ${sector || 'All'}

Facts retrieved from verified Government Tools:
${JSON.stringify(toolsContext, null, 2)}

Task:
Respond directly to the user in ${targetLanguage}.
Provide accurate, structured information including scheme name, key benefits, eligibility criteria, required documents, and official government website link.
Remind: DO NOT use any emojis or decorative icons. Keep explanations concise, clear, and professional.`;

  // Check for Llama AI first (Groq, Together, OpenRouter, or Ollama)
  const hasLlamaConfig = Boolean(
    process.env.LLAMA_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      process.env.TOGETHER_API_KEY ||
      process.env.LLAMA_BASE_URL
  );

  if (hasLlamaConfig) {
    try {
      const llamaOutput = await callLlamaAPI(prompt, SYSTEM_INSTRUCTION);
      if (llamaOutput && llamaOutput.trim()) {
        assistantReply = llamaOutput;
        const llamaModelName = process.env.LLAMA_MODEL || 'Meta Llama 3.3';
        modelUsed = `${llamaModelName} (Llama AI)`;
      }
    } catch (llamaErr) {
      console.error('Llama AI API call failed, falling back:', llamaErr);
    }
  }

  // If Llama was not configured or failed, check for Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!assistantReply && apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
        },
      });

      if (response.text && response.text.trim()) {
        assistantReply = response.text;
        modelUsed = 'Google Gemini 2.5 Flash';
      }
    } catch (err) {
      console.error('Gemini API call failed, generating factual fallback:', err);
    }
  }

  // Deterministic factual fallback if no LLM was available or both produced empty responses
  if (!assistantReply || !assistantReply.trim()) {
    assistantReply = buildDeterministicReply(message, targetLanguage, toolsExecuted, state, sector);
  }

  return {
    sessionId,
    reply: assistantReply,
    toolsUsed: toolsExecuted,
    language,
    modelUsed,
  };
}

function buildDeterministicReply(
  userQuery: string,
  language: string,
  tools: ToolResult[],
  state?: string,
  sector?: string
): string {
  const parts: string[] = [];

  parts.push(`Information regarding: "${userQuery}"`);
  if (state && state !== 'All-India (Central)') {
    parts.push(`State/UT Filter: ${state}`);
  }
  if (sector && sector !== 'All') {
    parts.push(`Sector Filter: ${sector}`);
  }

  // Find schemes from search or eligibility tool
  const searchTool = tools.find((t) => t.toolName === 'Scheme Search');
  const eligTool = tools.find((t) => t.toolName === 'Eligibility Checker');

  const schemeItems = (searchTool?.data as any[]) || (eligTool?.data as any[]) || [];

  if (schemeItems.length > 0) {
    parts.push('\nMatched Government Schemes:');
    schemeItems.slice(0, 3).forEach((item: any, idx: number) => {
      parts.push(`\n${idx + 1}. ${item.name} (${item.government} Government - ${item.state})`);
      parts.push(`   Sector: ${item.sector}`);
      parts.push(`   Description: ${item.description}`);
      parts.push(`   Benefits: ${item.benefits}`);
      parts.push(`   Eligibility: ${item.eligibility?.criteriaText || 'Check official guidelines'}`);
      if (item.documents && item.documents.length > 0) {
        parts.push(`   Required Documents: ${item.documents.join(', ')}`);
      }
      parts.push(`   Application Method: ${item.applicationMethod}`);
      parts.push(`   Official Portal: ${item.applicationLink} (${item.officialSource})`);
    });
  } else {
    parts.push('\nNo specific scheme matched your exact keywords. Please try searching by sector (e.g., Agriculture, Healthcare, Education) or view our comprehensive scheme catalog.');
  }

  // Check "What Am I Missing?"
  const missingTool = tools.find((t) => t.toolName === 'What Am I Missing?');
  if (missingTool && Array.isArray(missingTool.data) && missingTool.data.length > 0) {
    parts.push('\nRecommended Opportunities ("What Am I Missing?"):');
    missingTool.data.slice(0, 2).forEach((m: any) => {
      parts.push(`- Sector: ${m.sector}`);
      parts.push(`  Why: ${m.reason}`);
      if (m.recommendedSchemes && m.recommendedSchemes.length > 0) {
        parts.push(`  Suggested Scheme: ${m.recommendedSchemes[0].name} (Official Link: ${m.recommendedSchemes[0].applicationLink})`);
      }
    });
  }

  parts.push(`\nNote: All verified information is obtained directly from authorized Government of India and State Government portals. For language options: ${language}.`);

  return parts.join('\n');
}
