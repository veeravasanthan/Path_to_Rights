/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';

// Lazy initializer for the Gemini client to prevent crash on boot if key is missing
let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please enter it in the Settings/Secrets menu.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Executes a Gemini content generation request with a fallback model if the primary model is unavailable.
 */
async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: Parameters<typeof ai.models.generateContent>[0]
): ReturnType<typeof ai.models.generateContent> {
  try {
    return await ai.models.generateContent(params);
  } catch (error: any) {
    const errorStr = typeof error === 'object' ? JSON.stringify(error) : String(error);
    const isServiceUnavailable = 
      errorStr.includes('503') || 
      errorStr.includes('UNAVAILABLE') || 
      errorStr.toLowerCase().includes('high demand') ||
      errorStr.toLowerCase().includes('temporary');

    if (isServiceUnavailable && params.model !== 'gemini-3.1-flash-lite') {
      console.warn(`Primary model ${params.model} is experiencing high demand. Falling back to gemini-3.1-flash-lite...`);
      return await ai.models.generateContent({
        ...params,
        model: 'gemini-3.1-flash-lite',
      });
    }
    throw error;
  }
}

/**
 * 1. AI SERVICE: Main Document Analysis Pipeline
 */
export async function analyzeDocument({
  documentText,
  documentImageBase64,
  extractedPdfText,
  languageName,
}: {
  documentText?: string;
  documentImageBase64?: string;
  extractedPdfText?: string;
  languageName: string;
}) {
  const ai = getGeminiClient();

  const systemInstruction = `You are an expert, highly empathetic legal aid assistant helping extremely vulnerable, low-income, and rural families in India understand their complex legal documents.
Your main focus of communication is readability, supreme clarity, and removing panic.

You must follow these rules strictly:
1. Answer strictly in the requested Indian language: ${languageName}.
2. Use extremely short, simple sentences. Speak like you are talking to a person with no education at all (such as a poor farmer or wage laborer).
3. Do not use complex grammatical constructs or formal literary words. Prefer local daily language.
4. Avoid ALL legal jargon. If you MUST use a legal term (like summary suit, summons, mutation, FIR, bail, section etc.), you MUST explain what it means in brackets immediately after. Use simple daily terms of the selected language (${languageName}). For example, if translating to Tamil, explain legal words in Tamil. Under no circumstances should you explain words in Hindi or Devanagari script unless the target language is Hindi.
5. In your analysis, you must:
   - Identify what specific type of document it is (e.g. Police Complaint / FIR, Court summons, Rent eviction notice, Land revenue dispute, Bank loan recovery warning).
   - Explain what the document means in very simple terms.
   - Highlight exactly 3 most important points. No more, no less.
   - Highlight any urgent Red Flags or required actions (deadlines, signatures wanted, risks of neglecting it).
   - Carefully state WHEN and WHERE they must go or appear. If there is no court appearance required or no physical location, explicitly state "No physical appearance required, but respond online or to office" in ${languageName}.
`;

  const parts: any[] = [];
  
  if (documentImageBase64) {
    const cleanBase64 = documentImageBase64.replace(/^data:image\/\w+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: cleanBase64,
      },
    });
  }

  if (documentText) {
    parts.push({
      text: `The legal document text to analyze is:\n"""\n${documentText}\n"""`
    });
  }

  if (extractedPdfText) {
    parts.push({
      text: `The legal document text (extracted from PDF) to analyze is:\n"""\n${extractedPdfText}\n"""`
    });
  }

  parts.push({
    text: `Analyze the document above. Deliver the response in ${languageName} strictly adhering to the schema provided.`
  });

  const response = await generateContentWithFallback(ai, {
    model: 'gemini-3.5-flash',
    contents: parts,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          documentType: { 
            type: Type.STRING, 
            description: `Simplified name/type of the document translated entirely into ${languageName}. E.g. 'Civil Summons' or 'Police Complaint' translated to ${languageName}. Do NOT use Hindi unless the selected target language is Hindi.` 
          },
          simpleExplanation: { 
            type: Type.STRING, 
            description: `Short, direct explanation of what this document is about, what is happening, and why they received it. Use simple, short sentences translated entirely into ${languageName}.` 
          },
          importantPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `Exactly 3 critical points they must know about this document, formulated in simple bullet points translated entirely into ${languageName}.`
          },
          redFlags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `List of immediate tasks, deadlines, signatures requested, or dangers of ignoring this document, in simple sentences translated entirely into ${languageName}.`
          },
          whenAndWhere: {
            type: Type.OBJECT,
            properties: {
              required: { 
                type: Type.BOOLEAN, 
                description: 'True if they must physically go somewhere (court, police station, records room) or reply by a date.' 
              },
              when: { 
                type: Type.STRING, 
                description: `WHEN is this happening? State the date and time clearly translated to ${languageName}. If no date is given, look for an implicit deadline or state 'no date specified' translated to ${languageName}.` 
              },
              where: { 
                type: Type.STRING, 
                description: `WHERE do they have to go or send the reply? Be extremely specific. State the location translated into ${languageName}. If unknown, write 'unknown location' translated to ${languageName}.` 
              }
            },
            required: ['required', 'when', 'where']
          }
        },
        required: ['documentType', 'simpleExplanation', 'importantPoints', 'redFlags', 'whenAndWhere']
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned an empty response');
  }
  return JSON.parse(text.trim());
}

/**
 * 2. AI SERVICE: Regional Knowledge Retrieval
 */
export async function getRegionalKnowledge({
  category,
  query,
  languageName,
}: {
  category: 'schemes' | 'rights' | 'finance';
  query: string;
  languageName: string;
}) {
  const ai = getGeminiClient();

  let categoryInstruction = '';
  if (category === 'schemes') {
    categoryInstruction = `You are a friendly Indian welfare guide. Explain Indian central and state government schemes helpful to rural, middle-class, or underprivileged citizens (like PM-KISAN, PM-Awas Yojana, ration card details, MGNREGA, Sukanya Samriddhi, health insurance initiatives). Keep it very practical.`;
  } else if (category === 'rights') {
    categoryInstruction = `You are an expert on the Indian Constitution. Explain core citizen rights, fundamental rights (Articles 14, 19, 21, etc.), labor laws, consumer policies, or police regulations in simple domestic terms. Keep explaining any technical code or sections instantly.`;
  } else {
    categoryInstruction = `You are a financial advisor for low and middle-income families. Explain core financial concepts simply—how compound interest or loans work, how to avoid informal money lender debt traps, how savings schemes work, or micro-finance details.`;
  }

  const systemInstruction = `${categoryInstruction}
You must answer strictly in the local language: ${languageName}.
Ensure you use:
- Extremely clear, warm and welcoming language.
- Short paragraphs.
- A bulleted list with clear benefits or actions.
- Simple daily analogies rather than complex definitions.
- Direct contact details or steps if relevant (e.g. going to Gram Panchayat, block officer, or visiting local post office).
`;

  const response = await generateContentWithFallback(ai, {
    model: 'gemini-3.5-flash',
    contents: [{ role: 'user', parts: [{ text: query }] }],
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });

  return response.text || '';
}

/**
 * 3. AI SERVICE: Interactive Legal Chat Clarification
 */
export async function clarifyLegalChat({
  messages,
  originalDocumentText,
  originalAnalysis,
  languageName,
}: {
  messages: Array<{ role: 'user' | 'model'; content: string }>;
  originalDocumentText?: string;
  originalAnalysis?: any;
  languageName: string;
}) {
  const ai = getGeminiClient();

  const systemInstruction = `You are a helpful, warm regional legal aid assistant in India. The user has uploaded a document which was already analyzed.
You must answer the user's questions about this document in a friendly, reassuring, simple tone.
Follow these constraints perfectly:
1. Speak/Respond only in ${languageName}.
2. Keep your sentences short and extremely simple. Avoid legal jargon entirely.
3. If the user is worried, reassure them but give practical, safe real-world help (e.g., getting a government-provided legal aid service lawyer, contacting the local block officer, or visiting the taluka office). Make sure to explain terms entirely in ${languageName}.
4. Do not offer official legal counsel. Remind them gently that you are helping them understand the words, but they should talk to a helper or government legal service.
5. Refer to the Document Content and previous Analysis to stay 100% accurate.

Original Document analyzed:
"""
${originalDocumentText || 'Provided via image upload'}
"""

Previous Analysis Summary:
${JSON.stringify(originalAnalysis || {})}
`;

  const historyParts = messages.map((m: any) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const response = await generateContentWithFallback(ai, {
    model: 'gemini-3.5-flash',
    contents: historyParts,
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });

  return response.text || '';
}
