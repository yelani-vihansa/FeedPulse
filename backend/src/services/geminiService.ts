import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type GeminiAnalysis = {
  category: 'Bug' | 'Feature Request' | 'Improvement' | 'Other';
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  priority_score: number;
  summary: string;
  tags: string[];
};

const allowedCategories = new Set(['Bug', 'Feature Request', 'Improvement', 'Other']);
const allowedSentiments = new Set(['Positive', 'Neutral', 'Negative']);

const normalizeAnalysis = (raw: any): GeminiAnalysis | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const category = String(raw.category || '').trim();
  const sentiment = String(raw.sentiment || '').trim();
  const priority = Number(raw.priority_score);
  const summary = String(raw.summary || '').trim();
  const tags = Array.isArray(raw.tags)
    ? raw.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)
    : [];

  if (!allowedCategories.has(category)) {
    return null;
  }
  if (!allowedSentiments.has(sentiment)) {
    return null;
  }
  if (!Number.isFinite(priority) || priority < 1 || priority > 10) {
    return null;
  }
  if (!summary) {
    return null;
  }

  return {
    category: category as GeminiAnalysis['category'],
    sentiment: sentiment as GeminiAnalysis['sentiment'],
    priority_score: Math.round(priority),
    summary,
    tags
  };
};

export async function analyzeFeedback(title: string, description: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this product feedback. Return ONLY valid JSON with this exact schema:
{
  "category": "Bug | Feature Request | Improvement | Other",
  "sentiment": "Positive | Neutral | Negative",
  "priority_score": 1-10,
  "summary": "Short summary",
  "tags": ["tag1", "tag2"]
}
    
Title: ${title}
Description: ${description}`;
    
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return normalizeAnalysis(parsed);
    }
    return null;
  } catch (error) {
    console.error('Gemini error:', error);
    return null;
  }
}