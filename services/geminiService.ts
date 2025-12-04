import { GoogleGenAI } from "@google/genai";
import { dataService } from "./firebase";

// Initialize Gemini
// NOTE: Using a placeholder key handling strategy. In production, use a backend proxy.
// For this demo, we assume the user has a key or we simulate a response if the key is missing.
const API_KEY = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const geminiService = {
  async chatWithAssistant(message: string, history: {role: string, parts: string[]}[]): Promise<string> {
    if (!API_KEY) {
      console.warn("No API_KEY found. Returning mock AI response.");
      return "I can help answer questions about the community, summarize notices, or help you find rules. (Please configure process.env.API_KEY to see real AI responses!)";
    }

    try {
      const communityContext = await dataService.getAllCommunityContext();
      
      const model = 'gemini-2.5-flash';
      const systemInstruction = `You are a helpful AI assistant for the 'Sunrise Enclave' gated community.
      You are polite, concise, and helpful to residents.
      
      Here is the current context of the community (Rules, Notices, Events):
      ${communityContext}
      
      If the user asks about something not in the context, give a general helpful answer or ask them to contact the admin office.
      Answer questions about notices, gym timings, parking rules, etc.
      `;

      // Construct contents from history
      const contents = history.map(h => ({
        role: h.role,
        parts: h.parts.map(p => ({ text: p }))
      }));

      // Add the current user message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return response.text || "I'm sorry, I couldn't process that request.";

    } catch (error) {
      console.error("Gemini Error:", error);
      return "Sorry, I'm having trouble connecting to the AI service right now.";
    }
  },

  async summarizeNotices(): Promise<string> {
    if (!API_KEY) return "Mock Summary: There is a Diwali party on Nov 12th, lift maintenance on Monday, and new gym rules are in effect.";
    
    const context = await dataService.getAllCommunityContext();
    const prompt = "Summarize the active notices into a bulleted list of key points for a resident who is in a hurry.";
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt + "\n\nContext:\n" + context,
      });
      return response.text || "No summary available.";
    } catch (e) {
      return "Unable to summarize at this time.";
    }
  }
};