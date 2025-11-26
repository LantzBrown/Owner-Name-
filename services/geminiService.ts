import { GoogleGenAI } from "@google/genai";
import { BusinessRow } from "../types";

// Using gemini-2.5-flash as it is the most cost-effective current model 
// that supports search grounding efficiently.
const MODEL_NAME = "gemini-2.5-flash";

interface OwnerResult {
  first_name: string;
  last_name: string;
  source: string;
  confidence: "High" | "Medium" | "Low";
}

/**
 * Investigates a single business row to find the owner.
 */
export const findBusinessOwner = async (row: BusinessRow): Promise<OwnerResult> => {
  try {
    // Initialize the client inside the function to ensure it uses the current environment context
    // and to handle initialization errors within the try/catch block.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      3.  **Conflict Resolution**: If multiple names appear, prioritize: Website > LinkedIn > News > Reviews.
      
      Requirements:
      *   Find the **First Name** and **Last Name**.
      *   **Crucial**: If there are middle names, include them in the **Last Name** field.
          *   Example: "John Von Doe" -> first_name: "John", last_name: "Von Doe"
          *   Example: "Mary Jane Watson" -> first_name: "Mary", last_name: "Jane Watson"
      *   If not found, return "Not Found" in first_name and empty string in last_name.
      *   Provide the **Source** (URL or specific text like "Google Review").
      *   Assign **Confidence**:
          *   High: Found on official website or LinkedIn owner profile.
          *   Medium: Mentioned in news or multiple directories.
          *   Low: Mentioned in a single review or inferred.

      Return JSON format only:
      \`\`\`json
      {
        "first_name": "First",
        "last_name": "Last (including middle)",
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
          first_name: parsed.first_name || "Not Found",
          last_name: parsed.last_name || "",
          source: parsed.source || "Unknown",
          confidence: parsed.confidence || "Low"
        };
      } catch (e) {
        console.error("Failed to parse JSON", e);
      }
    }

    return {
      first_name: "Not Found",
      last_name: "",
      source: "AI Investigation",
      confidence: "Low"
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Check for specific API Key errors (Leaked or Permission Denied)
    const errorMsg = error?.toString() || "";
    const errorJson = JSON.stringify(error);
    
    if (errorMsg.includes("leaked") || errorJson.includes("leaked") || error.status === 403) {
      return {
        first_name: "API KEY ERROR",
        last_name: "",
        source: "System",
        confidence: "Low"
      };
    }

    return {
      first_name: "Error",
      last_name: "",
      source: "System",
      confidence: "Low"
    };
  }
};