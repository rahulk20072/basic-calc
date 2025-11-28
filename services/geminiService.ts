import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// Note: API Key must be in process.env.API_KEY
const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const solveWithGemini = async (prompt: string): Promise<string> => {
  try {
    const ai = getAIClient();
    
    // We want a precise answer for a calculator.
    const systemInstruction = `You are a high-precision mathematical assistant. 
    Your goal is to solve the user's math problem or answer their math-related question concisely.
    
    Rules:
    1. If the user asks for a calculation (e.g., "square root of 144", "15% of 850"), return JUST the numeric result or the result with units if applicable. Do not explain unless asked.
    2. If the user asks a complex word problem, provide the final answer clearly, followed by a very brief 1-sentence explanation if necessary.
    3. Use LaTeX formatting for complex mathematical symbols if possible, but plain text is preferred for a simple calculator display.
    4. If the input is not math-related, politely refuse and ask for a math problem.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // Low temperature for deterministic math results
      }
    });

    if (response.text) {
      return response.text.trim();
    } else {
      throw new Error("No response from AI");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Could not connect to AI.";
  }
};
