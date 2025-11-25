import { GoogleGenAI } from "@google/genai";
import { BusinessRow } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-2.5-flash as it is the most cost-effective current model 
// that supports search grounding efficiently.
const MODEL_NAME = "gemini-2.5-flash";

interface OwnerResult {
  name: string;
  source: string;
  confidence: "High" | "Medium" | "Low";
}

/**
 * Investigates a single business row to find the owner.
 */
export const findBusinessOwner = async (row: BusinessRow): Promise<OwnerResult> => {
  try {
    const contextStr = `
      Business Name: ${row.business_name}
      Website: ${row.website || 'N/A'}
      Google My Business Profile: ${row.google_my_business_url || 'N/A'}
      Phone: ${row.phone_number || 'N/A'}
      Email: ${row.email || 'N/A'}
    `;

    const prompt = `
      You are an expert business investigator. Your task is to identify the Owner, Founder, or CEO of the business.

      Business Details:
      ${contextStr}

      Investigation Strategy:
      1.  **Search Grounding**: Use the provided tools to search the web.
      2.  **Target Sources**:
          *   **Official Website**: Look for "About Us", "Team", "Leadership".
          *   **Google Reviews**: Search for reviews mentioning "owner", "manager", or specific names (e.g., "Thanks [Name] for the help").
          *   **Directories**: LinkedIn, Yelp, BBB, Bizapedia.
          *   **Social Media**: Facebook/Instagram bios.
      3.  **Conflict Resolution**: If multiple names appear, prioritize: Website > LinkedIn > News/Reviews.
      
      Requirements:
      *   Find the **First and Last Name**.
      *   If not found, return "Not Found".
      *   Provide the **Source** (URL or specific text like "Google Review").
      *   Assign **Confidence**:
          *   High: Found on official website or LinkedIn owner profile.
          *   Medium: Mentioned in news or multiple directories.
          *   Low: Mentioned in a single review or inferred.

      Return JSON format only:
      \`\`\`json
      {
        "name": "Name",
        "source": "Source URL/Description",
        "confidence": "High/Medium/Low"
      }
      \`\`\`
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    
    // Extract JSON
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      try {
        const parsed = JSON.parse(jsonStr);
        return {
          name: parsed.name || "Not Found",
          source: parsed.source || "Unknown",
          confidence: parsed.confidence || "Low"
        };
      } catch (e) {
        console.error("Failed to parse JSON", e);
      }
    }

    return {
      name: "Not Found",
      source: "AI Investigation",
      confidence: "Low"
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      name: "Error",
      source: "System",
      confidence: "Low"
    };
  }
};