import { AgentState, LogEntry, ScriptProject, ShotPlan, EditingFeedback } from '../types';

/**
 * This service simulates the python backend logic described in the prompt.
 * In a real deployment, this would be REST API calls to the Python Flask/FastAPI server.
 */

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const simulateAgentThinking = async (duration: number = 1500) => {
  return new Promise((resolve) => setTimeout(resolve, duration));
};

// Mock data for the "Knowledge Graph"
export const MOCK_FILM_KNOWLEDGE_GRAPH = {
  concepts: ["镜头语言", "蒙太奇", "三点布光", "色彩心理学", "英雄之旅"],
  skills: ["Davinci Resolve", "Arri Alexa 操作", "Final Draft", "声音设计"],
  projects: ["黑色电影短片", "纪录片访谈", "音乐录影带"]
};

// Simulation of TeacherAgent.analyze_intent()
export const analyzeTeacherIntent = (input: string): string => {
  if (input.includes("评分") || input.includes("评估")) return "ASSESSMENT";
  if (input.includes("指导") || input.includes("帮助")) return "GUIDANCE";
  return "OBSERVATION";
};

// Simulation of StudentAgent.analyze_state()
export const analyzeStudentState = (input: string): string => {
  if (input.length < 50) return "UNCERTAIN";
  if (input.includes("卡住了") || input.includes("难")) return "STRUGGLING";
  return "ENGAGED";
};

// Simulation of PreProductionModule.script_development()
export const analyzeScript = async (project: ScriptProject): Promise<string[]> => {
  await simulateAgentThinking(2000);
  const feedback = [];
  
  if (project.logline.length < 20) {
    feedback.push("⚠️ 故事梗概太短。请考虑增加主角的主要冲突。");
  } else {
    feedback.push("✅ 故事梗概结构稳固。");
  }

  if (project.genre === "Horror") {
    feedback.push("💡 对于恐怖片，建议在第二幕设置中增加紧张感。");
  } else if (project.genre === "Sci-Fi") {
    feedback.push("💡 确保世界观规则在早期就已确立。");
  } else if (project.genre === "Drama") {
    feedback.push("💡 剧情片需要更深层的情感共鸣点。");
  }

  feedback.push("🤖 角色弧光分析：主角需要一个更清晰的内部创伤（Internal Wound）。");
  return feedback;
};

// Simulation of ProductionModule.cinematography_guide()
export const generateShotList = async (sceneDescription: string): Promise<ShotPlan[]> => {
  await simulateAgentThinking(1500);
  // Deterministic mock generation based on length of input
  const baseShots: ShotPlan[] = [
    { 
      id: 1, 
      shotType: "全景镜头 (主镜头)", 
      angle: "平视", 
      movement: "固定", 
      lighting: "高调自然光",
      description: "建立镜头，展示场景的整体空间关系和氛围。",
      technicalReasoning: "确立空间地理位置，让观众理解环境布局。",
      visualPrompt: "Wide shot, cinematic lighting, establishing shot showing the entire room."
    },
    { 
      id: 2, 
      shotType: "中景镜头", 
      angle: "平视", 
      movement: "缓慢推镜", 
      lighting: "三点布光",
      description: "捕捉人物上半身动作和神态。",
      technicalReasoning: "平衡环境与人物，关注肢体语言。",
      visualPrompt: "Medium shot, 35mm lens, subject waist up, depth of field." 
    },
    { 
      id: 3, 
      shotType: "特写镜头", 
      angle: "微仰角", 
      movement: "手持", 
      lighting: "伦勃朗光",
      description: "聚焦面部表情，展现细腻情感。",
      technicalReasoning: "强调情绪反应，构建心理连接。",
      visualPrompt: "Close up, face detail, dramatic lighting, emotional expression." 
    },
    { 
      id: 4, 
      shotType: "插入镜头", 
      angle: "俯视", 
      movement: "固定", 
      lighting: "聚光灯",
      description: "强调关键道具或细节。",
      technicalReasoning: "引导视觉注意力，暗示叙事线索。",
      visualPrompt: "Insert shot, high angle, focus on object, dramatic spotlight." 
    },
  ];
  return baseShots;
};

// Simulation of PostProductionModule.editing_assistant()
export const analyzeEditing = async (clipName: string): Promise<EditingFeedback[]> => {
  await simulateAgentThinking(2500);
  return [
    { 
      id: generateId(), 
      timecode: "00:00:15:00", 
      suggestion: "剪辑点稍晚。建议剪掉 12 帧以匹配音乐节拍。", 
      category: "Rhythm",
      severity: "medium"
    },
    { 
      id: generateId(), 
      timecode: "00:00:32:12", 
      suggestion: "检测到镜头 A 和镜头 B 之间的视线不匹配。", 
      category: "Continuity",
      severity: "high" 
    },
    { 
      id: generateId(), 
      timecode: "00:01:05:00", 
      suggestion: "音频电平接近失真峰值。建议应用限制器。", 
      category: "Audio",
      severity: "high"
    },
    {
      id: generateId(),
      timecode: "Global",
      suggestion: "色彩平衡在中间调部分偏向绿色。", 
      category: "Color",
      severity: "low"
    }
  ];
};

// Python Code Strings for the Architecture View
export const PYTHON_CODE_ARCH = `
# core/architecture.py
class EducationalAgentArchitecture:
    """教育智能体核心架构"""
    
    def __init__(self):
        self.teacher_agent = TeacherAgent()      # 教师智能体
        self.student_agent = StudentAgent()      # 学生智能体
        self.assistant_agent = AssistantAgent()  # 辅助智能体
        self.collaboration_engine = CollaborationEngine() # 协同引擎
    
    def triadic_collaboration(self, teacher_input, student_input):
        """三元协同处理流程"""
        # 教师意图分析
        teacher_intent = self.teacher_agent.analyze_intent(teacher_input)
        # 学生学习状态分析
        student_state = self.student_agent.analyze_state(student_input)
        # 智能体协同决策
        return self.collaboration_engine.coordinate(
            teacher_intent, student_state
        )
`;

export const PYTHON_CODE_FRAMEWORK = `
# framework/educational_framework.py
class EducationIntelligentAgentFramework:
    """教育智能体分层框架"""
    
    def __init__(self):
        self.infrastructure_layer = InfrastructureLayer() # 基础设施层
        self.data_layer = DataLayer()                     # 数据层
        self.agent_layer = AgentLayer()                   # 智能体层
        self.service_layer = ServiceLayer()               # 服务层
        self.interface_layer = InterfaceLayer()           # 接口层

    class AgentLayer:
        """智能体层"""
        def setup_media_agents(self):
            """设置影视制作专业智能体"""
            return {
                "director_agent": DirectorAgent(),      # 导演指导智能体
                "editor_agent": EditorAgent(),          # 剪辑指导智能体
                "cinematography_agent": CinematographyAgent(), # 摄影指导智能体
                "sound_agent": SoundDesignAgent()       # 声音设计智能体
            }
`;

export const PYTHON_CODE_MODULES = `
# modules/film_production.py
class FilmProductionTrainingPlatform:
    """影视制作实训平台"""
    
    class PreProductionModule:
        """前期制作模块"""
        def script_development(self, student_work):
            # 剧本开发指导
            return {
                "structure_analysis": self.analyze_structure(student_work),
                "character_feedback": self.analyze_characters(student_work),
            }
            
    class ProductionModule:
        """拍摄制作模块"""
        def cinematography_guide(self, scene_requirements):
            # 摄影指导
            return {
                "camera_angles": self.suggest_angles(scene_requirements),
                "lighting_setup": self.suggest_lighting(scene_requirements),
            }

    class PostProductionModule:
        """后期制作模块"""
        def editing_assistant(self, footage):
             # 剪辑助手
             return {
                "rhythm_analysis": self.analyze_pacing(footage),
                "transition_recommendations": self.suggest_transitions(footage)
            }
`;