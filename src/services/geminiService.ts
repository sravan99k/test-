import OpenAI from 'openai';

const openRouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "HTTP-Referer": "https://novo-wellness.ai",
    "X-Title": "Novo Wellness Chatbot",
  },
});

// Fallback responses when the AI service is unavailable
const FALLBACK_RESPONSES = {
  anxiety: `At Maintainence\nWe apologize for the inconvenience `,
  depression: `At Maintainence\nWe apologize for the inconvenience `,
  stress: `At Maintainence\nWe apologize for the inconvenience `,
  default: `At Maintainence\nWe apologize for the inconvenience `
};

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Model configuration - PRIMARY and FALLBACK for reliability
const PRIMARY_MODEL = "meta-llama/llama-3.3-70b-instruct:free";
const FALLBACK_MODEL = "meta-llama/llama-3.2-3b-instruct:free"; // Smaller, faster fallback

// Check if the message indicates the conversation should end
const shouldEndConversation = (message: string): boolean => {
  const lowerMessage = message.toLowerCase().trim();

  // Only match these exact phrases (case insensitive)
  const endPhrases = ['ok', 'okay', 'thanks', 'thank you'];

  return endPhrases.includes(lowerMessage);
};

// Check if user is asking about MASOOM, CII, Yi
const isAskingAboutOrganizations = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return (
    lowerText.includes('masoom') ||
    lowerText.includes('cii') ||
    lowerText.includes('confederation of indian industry') ||
    lowerText.includes('young indians') ||
    lowerText.includes('yi')
  );
};

export async function* generateResponse(
  prompt: string,
  chatHistory: Array<{ role: string; content: string }>,
  userRole: 'teacher' | 'student' = 'student'
) {
  if (!API_KEY) {
    console.warn(' using fallback response');
    yield getFallbackResponse(prompt);
    return;
  }

  // End conversation if needed
  if (shouldEndConversation(prompt)) {
    const closingMessage =
      userRole === 'teacher'
        ? "You're welcome! Feel free to reach out if you need any assistance with your students or the platform. Have a great day!"
        : "You're welcome, I'm always here if you need to talk. Take care and remember, you're doing great! 💙";
    yield closingMessage;
    return;
  }

  try {
    const isHindiRequest = prompt.toLowerCase().includes('respond in hindi');

    // TEACHER SYSTEM MESSAGE (unchanged)
    const teacherSystemMessage = `
You are Buddy, an educational assistant designed to help teachers support their students' mental health and well-being.
${isHindiRequest ? 'You are currently speaking in Hindi.' : ''}

IMPORTANT: Keep your responses concise, compact, and professional.
STRICT RULE: Do NOT use markdown formatting (no **bold**, no ## headings). Use plain text only.

Your role is to:
1. Help teachers recognize signs of student distress
2. Suggest appropriate classroom interventions
3. Provide resources for student support
4. Offer guidance on creating a supportive learning environment
5. Help with lesson planning around social-emotional learning

Be professional, informative, and supportive.
`;

    // STUDENT SYSTEM MESSAGE (Rulebook added here)
    const studentSystemMessage = `
==========================
🌟 OFFICIAL 10/10 RULEBOOK FOR THE STUDENT WELLBEING CHATBOT
==========================

CORE INSTRUCTION: Keep your responses SHORT, COMPACT, and SIMPLE. Use easy words. Avoid long paragraphs.
STRICT RULE: Do NOT use markdown formatting (no **bold**, no ## headings). Use plain text only.

1. HUMAN-LIKE CONVERSATION  
- Warm, caring, friendly  
- Natural, everyday words  
- Short, real sentences  
- No robotic tone  

2. EMOTION RECOGNITION  
- Understand feelings  
- Gently reflect emotions  
- Never diagnose  

3. SIMPLE ENGLISH  
- Small sentences  
- Easy vocabulary  
- No therapy jargon  

4. NO DIAGNOSING  
- Never label disorders  
- Only reflect feelings  

5. SAFE, SUPPORTIVE, NON-JUDGMENTAL  
- No blaming  
- No judging  
- Encourage gently  

6. CRISIS SAFETY  
If student mentions self-harm, suicide, abuse, danger:
- Stop normal chat  
- Be warm + concerned  
- Encourage trusted adult  
- Share 1098  
- No advice, no secrecy  

7. PRIVACY & MINOR SAFETY  
- Don’t ask personal info  
- Don’t save data  
- Don’t ask for photos, location  

8. AGE-APPROPRIATE  
- Tone for ages 10–18  
- No adult financial/legal/medical advice  

9. CULTURALLY FIT FOR INDIAN STUDENTS  
- Understand board exams, NEET/JEE stress  
- Tuition pressure  
- Family expectations  

10. EMOTIONAL SKILL-BUILDING  
- Teach calming  
- Help express feelings  
- Build coping skills

11. HANDLING EXPLICIT OR ADULT LANGUAGE
- If student uses profanity, curse words, or explicit language:
  - Stay calm and non-judgmental
  - Don't repeat or expand on the language
  - Gently redirect: "I notice you're using strong language. It sounds like you're feeling frustrated. Can you tell me more about what's bothering you?"
  - Don't lecture or scold
  - Focus on the underlying emotion

12. PERSONAL OR IDENTITY QUESTIONS
- If asked about your gender/identity:
  - "I'm NovoBuddy. I don't have a gender, and I'm here to help and support students in a safe and friendly way."
- If asked personal questions:
  - Give brief, neutral, friendly responses
  - Redirect to student's needs: "But enough about me - how can I help you today?"

13. NEVER GIVE HARMFUL ADVICE  
- No confronting abusers  
- No skipping school  
- No medication instructions  
- No secrets from adults  

14. ALWAYS RECOMMEND RESOURCES
- If a user's problem matches a resource topic, YOU MUST share the link.
- Example: "You can check this out: /resources/stress-management"


==========================
END OF RULEBOOK
==========================


You are Buddy, a friendly and supportive chatbot designed for children.
${isHindiRequest
        ? 'You are currently speaking in Hindi. Use clear, simple Hindi. No informal terms.'
        : 'You communicate in clear, simple English. Respectful and formal tone. No terms like "sweety" or "honey".'
      }

`;


    const teacherResources =
      userRole === 'teacher'
        ? `
Teacher Resources:
- [Professional Development: SEL & Self-Care](/teacher/resources/professional-development)
- [Parent–Teacher Communication](/teacher/resources/parent-teacher-communication)
- [Suicide Prevention Guidelines](/teacher/resources/suicide-prevention)
- [SEL Strategies](/teacher/resources/sel-strategies)
- [PBIS Classroom Support](/teacher/resources/pbis)
- [Recognizing Anxiety & Depression](/teacher/resources/anxiety-depression)
`
        : '';

    // FINAL SYSTEM MESSAGE (teacher untouched, student contains rulebook)
    const systemMessage =
      userRole === 'teacher'
        ? `${teacherSystemMessage}

Only mention MASOOM, CII, Yi if asked.
Be positive, encouraging, patient.
Use language appropriate for teachers.
${teacherResources}
`
        : `${studentSystemMessage}

Only mention MASOOM, CII, Yi if asked.
Always be positive, supportive, patient.
If the child is upset, be extra gentle.
Use only relevant resources.
Safety guidance only when needed.

Available Resources:
- Stress Management: /resources/stress-management
- Sleep & Relaxation: /resources/sleep-relaxation
- Healthy Mind Habits: /resources/healthy-mind-habits
- Focus & Study: /resources/focus-study-skill
- Peer Support: /resources/peer-support-sharing
- Digital Wellness: /resources/digital-wellness
- Growth Mindset: /resources/growth-mindset-motivation
- Values & Citizenship: /resources/values-citizenship-education
- Physical Wellness: /resources/physical-wellness-nutrition
- When to Ask for Help: /resources/when-to-ask-for-help

Safety Policy:
- Only share helplines in real unsafe situations.
- For danger: Childline 1098, Police 100, Ambulance 108, Women’s Helpline 181.
`;

    // Prevent continuing after a closing message
    const lastMessage =
      chatHistory[chatHistory.length - 1]?.content?.toLowerCase() || '';
    if (shouldEndConversation(lastMessage)) {
      yield "Take care, Remember, I'm always here if you need to talk. 💙";
      return;
    }

    // Build messages
    const messages = [
      { role: "system", content: systemMessage },
      ...chatHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: prompt },
    ];

    // Try primary model first
    try {
      const stream = await openRouter.chat.completions.create({
        model: PRIMARY_MODEL,
        messages: messages.map((msg) => ({
          role: msg.role as "system" | "user" | "assistant",
          content: msg.content,
        })),
        stream: true,
        max_tokens: 300,
      });

      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) yield content;
      }
    } catch (primaryError: any) {
      console.warn('[GeminiService] Primary model failed, trying fallback:', {
        model: PRIMARY_MODEL,
        error: primaryError.message,
        status: primaryError.status
      });

      // Try fallback model
      try {
        const stream = await openRouter.chat.completions.create({
          model: FALLBACK_MODEL,
          messages: messages.map((msg) => ({
            role: msg.role as "system" | "user" | "assistant",
            content: msg.content,
          })),
          stream: true,
          max_tokens: 300,
        });

        console.log('[GeminiService] ✅ Fallback model successful:', FALLBACK_MODEL);

        for await (const chunk of stream) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) yield content;
        }
      } catch (fallbackError: any) {
        console.error('[GeminiService] Both models failed:', {
          primary: PRIMARY_MODEL,
          fallback: FALLBACK_MODEL,
          primaryError: primaryError.message,
          fallbackError: fallbackError.message
        });
        throw fallbackError; // Re-throw to trigger outer catch
      }
    }
  } catch (error) {
    console.error("Error getting chat response:", error);
    yield getFallbackResponse(prompt);
  }
}

// Fallback logic
const getFallbackResponse = (prompt: string): string => {
  const lower = prompt.toLowerCase();
  if (lower.includes('anxiety') || lower.includes('anxious'))
    return FALLBACK_RESPONSES.anxiety;

  if (lower.includes('depress') || lower.includes('sad'))
    return FALLBACK_RESPONSES.depression;

  if (lower.includes('stress') || lower.includes('overwhelm'))
    return FALLBACK_RESPONSES.stress;

  return FALLBACK_RESPONSES.default;
};

export interface SessionSummary {
  focusArea: string;
  keyPoints: string[];
  actionPlan: string[];
}

export const generateSessionSummary = async (
  transcript: string
): Promise<SessionSummary> => {
  try {
    if (!API_KEY) throw new Error('Chat service not initialized');

    const prompt = `Analyze the following therapy session transcript and provide a structured summary.
1. Main focus area
2. 3–5 key points
3. 2–3 action items
Format as JSON with keys: focusArea, keyPoints, actionPlan

Transcript: ${transcript}
`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are a helpful assistant that analyzes therapy sessions.",
      },
      { role: "user", content: prompt },
    ];

    // Try primary model first
    let response;
    try {
      response = await openRouter.chat.completions.create({
        model: PRIMARY_MODEL,
        messages,
      });
    } catch (primaryError: any) {
      console.warn('[GeminiService] Session summary primary failed, trying fallback:', {
        error: primaryError.message
      });

      // Try fallback model
      response = await openRouter.chat.completions.create({
        model: FALLBACK_MODEL,
        messages,
      });

      console.log('[GeminiService] ✅ Session summary fallback successful');
    }

    let text = response.choices[0].message?.content as string;

    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (jsonMatch) text = jsonMatch[1];

    const summary = JSON.parse(text);

    return {
      focusArea: summary.focusArea || "General discussion",
      keyPoints: Array.isArray(summary.keyPoints)
        ? summary.keyPoints
        : [],
      actionPlan: Array.isArray(summary.actionPlan)
        ? summary.actionPlan
        : [],
    };
  } catch (error) {
    console.error("Error generating summary:", error);
    return {
      focusArea: "Session overview",
      keyPoints: ["Summary unavailable"],
      actionPlan: ["Review notes", "Schedule follow-up"],
    };
  }
};

export const transcribeAudio = async (
  audioBlob: Blob
): Promise<string> => {
  try {
    if (!API_KEY) throw new Error('Chat service not initialized');

    const prompt =
      "This is a placeholder for audio transcription. Actual implementation will use a dedicated service.";

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are a helpful assistant that processes audio.",
      },
      { role: "user", content: prompt },
    ];

    const response = await openRouter.chat.completions.create({
      model: PRIMARY_MODEL,
      messages,
    });

    return response.choices[0].message?.content as string;
  } catch (error) {
    console.error("Error processing audio:", error);
    throw new Error(
      "Audio processing is currently unavailable. Please try again later."
    );
  }
};
