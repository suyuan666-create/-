import { GoogleGenAI, Type } from "@google/genai";
import { ScriptProject, ShotPlan, EditingFeedback } from "../types";

// Initialize Gemini Client
// The API key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Pre-Production: Generate Script Structure & Analysis
 */
export const generateScriptAnalysis = async (idea: string, genre: string): Promise<ScriptProject> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Role: Professional Screenwriting Instructor.
    Task: Develop a film concept based on the user's idea.
    User Idea: "${idea}"
    Genre: "${genre}"
    
    Output JSON with:
    - title: A creative title.
    - logline: A professional industry-standard logline (30-50 words).
    - structureAnalysis: specific advice on the 3-act structure for this specific story.
    - characterNotes: internal wound, goal, and conflict for the protagonist.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          logline: { type: Type.STRING },
          structureAnalysis: { type: Type.STRING },
          characterNotes: { type: Type.STRING },
        },
        required: ["title", "logline", "structureAnalysis", "characterNotes"]
      }
    }
  });

  const text = response.text || "{}";
  const data = JSON.parse(text);
  
  return {
    title: data.title,
    genre: genre,
    logline: data.logline,
    structureAnalysis: data.structureAnalysis,
    characterNotes: data.characterNotes,
  };
};

/**
 * Production: Generate Detailed Shot List
 */
export const generateDetailedShotList = async (sceneDescription: string): Promise<ShotPlan[]> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    Role: Director of Photography & Director.
    Task: Create a detailed shot list for the following scene.
    Scene: "${sceneDescription}"
    
    Requirements:
    - Provide 4-6 distinct shots covering the scene.
    - Include detailed lighting and camera movement instructions.
    - Explain the "Technical Reasoning" (why this shot works emotionally/technically).
    - Create a "Visual Prompt" that describes the image visually for an image generator.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            shotType: { type: Type.STRING, description: "e.g. Medium Shot, Close Up" },
            angle: { type: Type.STRING, description: "e.g. Low Angle, Eye Level" },
            movement: { type: Type.STRING, description: "e.g. Static, Dolly In" },
            lighting: { type: Type.STRING, description: "Detailed lighting setup" },
            description: { type: Type.STRING, description: "What happens in the shot" },
            technicalReasoning: { type: Type.STRING, description: "Educational explanation of the choice" },
            visualPrompt: { type: Type.STRING, description: "Visual description for image generation" }
          },
          required: ["id", "shotType", "angle", "movement", "lighting", "description", "technicalReasoning", "visualPrompt"]
        }
      }
    }
  });

  const text = response.text || "[]";
  return JSON.parse(text);
};

/**
 * Production: Generate Storyboard Image
 */
export const generateStoryboardImage = async (visualPrompt: string): Promise<string> => {
  const model = "gemini-2.5-flash-image";

  const response = await ai.models.generateContent({
    model,
    contents: `Cinematic storyboard sketch, rough pencil style, high contrast: ${visualPrompt}`,
  });

  // Extract image from response
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated");
};

/**
 * Post-Production: Analyze Video Frame
 */
export const analyzeVideoFrame = async (base64Image: string): Promise<EditingFeedback[]> => {
  const model = "gemini-2.5-flash"; // Flash is multimodal and good for analysis

  const prompt = `
    Role: Film Editor & Colorist.
    Task: Analyze this video frame.
    
    Provide critique on:
    1. Composition (Rule of thirds, balance)
    2. Color Grading (White balance, mood, saturation)
    3. Lighting/Exposure
    
    Return a JSON list of feedback items.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            timecode: { type: Type.STRING, description: "Use 'Current Frame'" },
            suggestion: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["Composition", "Color", "Lighting", "Focus"] },
            severity: { type: Type.STRING, enum: ["low", "medium", "high"] }
          },
          required: ["id", "timecode", "suggestion", "category", "severity"]
        }
      }
    }
  });

  const text = response.text || "[]";
  return JSON.parse(text);
};
