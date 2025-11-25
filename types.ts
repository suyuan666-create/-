export enum ModuleType {
  DASHBOARD = 'DASHBOARD',
  PRE_PRODUCTION = 'PRE_PRODUCTION',
  PRODUCTION = 'PRODUCTION',
  POST_PRODUCTION = 'POST_PRODUCTION',
  ARCHITECTURE = 'ARCHITECTURE',
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: 'Teacher Agent' | 'Student Agent' | 'Assistant Agent' | 'Director Agent' | 'Cinematography Agent' | 'Editor Agent' | 'System';
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ScriptProject {
  title: string;
  genre: string;
  logline: string;
  // Detailed breakdown from AI
  structureAnalysis: string; 
  characterNotes: string;
}

export interface ShotPlan {
  id: number;
  shotType: string;
  angle: string;
  movement: string;
  lighting: string;
  // New fields for detailed guidance
  description: string;
  technicalReasoning: string; // "Why this shot?"
  visualPrompt: string; // Prompt for image generation
  storyboardUrl?: string; // Generated image URL
}

export interface EditingFeedback {
  id: string;
  timecode: string;
  suggestion: string;
  category: 'Rhythm' | 'Continuity' | 'Audio' | 'Color' | 'Composition';
  severity: 'low' | 'medium' | 'high';
}

export enum AgentState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING = 'GENERATING',
  COLLABORATING = 'COLLABORATING',
}
