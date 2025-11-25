
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptProject, ShotPlan, EditingFeedback } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 前期制作：生成剧本结构、分析与关键场次
 */
export const generateScriptAnalysis = async (idea: string, genre: string): Promise<ScriptProject> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    角色：专业编剧导师。
    任务：根据用户的创意想法开发一个电影项目概念。
    用户创意："${idea}"
    类型："${genre}"
    
    要求：
    1. 写一个专业的 Logline (一句话梗概)。
    2. 分析三幕结构（铺垫、对抗、结局）。
    3. 定义主角的“内部创伤”（Internal Wound）和人物小传。
    4. 拆解：创作 3-5 个必须拍摄的“关键场次”（Key Scenes），格式为“场景标题 + 简短描述”。
    
    请以 JSON 格式输出，所有文本内容必须为中文。
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "电影标题" },
          logline: { type: Type.STRING, description: "一句话故事梗概" },
          structureAnalysis: { type: Type.STRING, description: "三幕结构深度分析" },
          characterNotes: { type: Type.STRING, description: "角色深度分析与人物小传" },
          scenes: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "关键场次列表，例如：'内景. 飞船驾驶舱 - 夜晚：主角发现导航系统被篡改。'"
          }
        },
        required: ["title", "logline", "structureAnalysis", "characterNotes", "scenes"]
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
    scenes: data.scenes || []
  };
};

/**
 * 拍摄制作：生成详细分镜表
 */
export const generateDetailedShotList = async (sceneDescription: string): Promise<ShotPlan[]> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    角色：诺兰风格的摄影指导 (DP) 和导演。
    任务：为以下场景创建一个极其详细的拍摄分镜表。
    场景描述："${sceneDescription}"
    
    要求：
    - 提供 4-6 个不同的镜头来覆盖这个场景。
    - 灯光：非常具体（例如：“伦勃朗光配合冷色轮廓光”、“高调实用灯光”）。
    - 运镜：具体的摄影机器材术语（例如：“斯坦尼康环绕”、“希区柯克变焦/Dolly Zoom”）。
    - 技术理由：详细解释为什么选择这个镜头？它如何服务于叙事或情感？(这是教育重点)。
    - 视觉提示词 (Visual Prompt)：用于 AI 绘图的详细英文描述（Midjourney 风格）。
    
    请以 JSON 格式输出，除 visualPrompt 外，其他所有字段必须为中文。
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
            shotType: { type: Type.STRING, description: "景别，如：特写、全景" },
            angle: { type: Type.STRING, description: "角度，如：低角度、上帝视角" },
            movement: { type: Type.STRING, description: "运镜方式" },
            lighting: { type: Type.STRING, description: "具体的布光方案" },
            description: { type: Type.STRING, description: "镜头内的动作描述" },
            technicalReasoning: { type: Type.STRING, description: "详细的教育性指导：为什么要这样拍？" },
            visualPrompt: { type: Type.STRING, description: "Detailed visual description for image generation in English" }
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
 * 拍摄制作：生成故事板图像
 */
export const generateStoryboardImage = async (visualPrompt: string): Promise<string> => {
  const model = "gemini-2.5-flash-image"; 

  // 强化提示词以获得更像电影分镜的草图风格
  const finalPrompt = `Professional movie storyboard sketch, noir graphic novel style, high contrast, rough pencil shading, cinematic composition, aspect ratio 16:9. Scene description: ${visualPrompt}`;

  const response = await ai.models.generateContent({
    model,
    contents: finalPrompt,
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
 * 后期制作：分析视频帧并提供调色建议
 * 支持传入 expectedShot (计划的分镜) 进行对比分析
 */
export const analyzeVideoFrame = async (base64Image: string, expectedShot?: ShotPlan): Promise<EditingFeedback[]> => {
  const model = "gemini-2.5-flash"; 
  
  let contextPrompt = "";
  if (expectedShot) {
      contextPrompt = `
      【重要：对比分析】
      学生原计划拍摄的镜头信息如下：
      - 景别：${expectedShot.shotType}
      - 角度：${expectedShot.angle}
      - 布光：${expectedShot.lighting}
      - 预期意图：${expectedShot.technicalReasoning}
      
      请重点分析当前画面是否达成了上述计划？如果没有，差距在哪里？
      `;
  }

  const prompt = `
    角色：资深调色师和电影剪辑师。
    任务：分析这张来自学生作业的视频帧。
    ${contextPrompt}
    
    要求：
    1. 从构图、色彩、光影、焦点维度进行批评。
    2. 提供具体的【调色参数建议】，以便我可以直接调整视频参数。
       - 对比度 (Contrast): 0.5 (低) 到 1.5 (高), 1.0 是正常。
       - 亮度 (Brightness): 0.5 (暗) 到 1.5 (亮), 1.0 是正常。
       - 饱和度 (Saturation): 0.0 (黑白) 到 2.0 (鲜艳), 1.0 是正常。
       - 暖色调 (Warmth): 0.0 (无) 到 1.0 (完全复古滤镜)。
    
    请以 JSON 格式输出列表，内容必须为中文。
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
            timecode: { type: Type.STRING, description: "使用 '当前帧' 或 'Current'" },
            suggestion: { type: Type.STRING, description: "详细的批评和修改建议" },
            category: { type: Type.STRING, enum: ["Composition", "Color", "Lighting", "Focus", "Plan Compliance"] },
            severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
            recommendedAdjustments: {
                type: Type.OBJECT,
                description: "AI 建议的调色参数",
                properties: {
                    contrast: { type: Type.NUMBER },
                    brightness: { type: Type.NUMBER },
                    saturation: { type: Type.NUMBER },
                    warmth: { type: Type.NUMBER }
                },
                required: ["contrast", "brightness", "saturation", "warmth"]
            }
          },
          required: ["id", "timecode", "suggestion", "category", "severity"]
        }
      }
    }
  });

  const text = response.text || "[]";
  return JSON.parse(text);
};


/**
 * AIGC 一键成片：优化提示词
 */
export const generateVideoPrompt = async (userIdea: string): Promise<string> => {
    const model = "gemini-2.5-flash";
    const prompt = `
      用户想法："${userIdea}"
      
      任务：将上述简单的想法重写为一个详细的、适合视频生成模型的英文提示词。
      要求：
      1. 增加视觉细节（光照、纹理、摄影机运动）。
      2. 保持简洁有力。
      3. 必须是英文。
      
      Output only the English prompt string.
    `;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt
    });
    
    return response.text || userIdea;
};

/**
 * AIGC 一键成片 (Veo)：生成真实视频
 */
export const generateVeoVideo = async (prompt: string): Promise<string> => {
    const model = 'veo-3.1-fast-generate-preview';
    let operation = await ai.models.generateVideos({
        model: model,
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation completed but no URI returned.");
    return `${videoUri}&key=${process.env.API_KEY}`;
};

/**
 * AIGC 动态分镜 (Animatic)：生成关键帧序列 (免费/标准版替代方案)
 */
export const generateAnimaticKeyframes = async (idea: string): Promise<string[]> => {
    // 1. First, decompose the idea into 4 key visual frames
    const planningModel = "gemini-2.5-flash";
    const planningPrompt = `
        Idea: "${idea}"
        Task: Break this scene down into exactly 4 sequential visual keyframes (prompts) to create a short animatic.
        Output format: JSON array of strings (English prompts).
        Example: ["Close up of...", "Wide shot of...", "Action shot of...", "Ending shot of..."]
    `;
    
    const planResponse = await ai.models.generateContent({
        model: planningModel,
        contents: planningPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });
    
    const prompts: string[] = JSON.parse(planResponse.text || "[]");
    
    // 2. Generate images for each frame using standard image model
    const imageModel = "gemini-2.5-flash-image";
    const imageUrls: string[] = [];

    // Run sequentially to ensure order and avoid hitting concurrent rate limits aggressively
    for (const p of prompts) {
        // Enforce consistent style
        const styledPrompt = `Cinematic movie scene, consistent style, high quality, 16:9 aspect ratio: ${p}`;
        
        const imgResponse = await ai.models.generateContent({
            model: imageModel,
            contents: styledPrompt
        });

        for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                imageUrls.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
        }
    }

    return imageUrls;
};

/**
 * 课堂助手：通用问答
 */
export const askClassroomAssistant = async (message: string): Promise<string> => {
    const model = "gemini-2.5-flash";
    const prompt = `
      角色：你是一位耐心、知识渊博的电影学院助教。
      任务：回答学生关于电影制作、剧本写作、摄影器材或后期剪辑的问题。
      风格：专业、鼓励性、简洁。如果涉及到专业术语（如 ISO, 光圈, 蒙太奇），请给予简单解释。
      
      学生问题："${message}"
    `;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt
    });
    
    return response.text || "抱歉，我暂时无法回答这个问题。";
};
