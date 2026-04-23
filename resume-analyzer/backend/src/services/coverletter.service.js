const Anthropic = require('@anthropic-ai/sdk');
const { buildCoverLetterPrompt } = require('../utils/prompts');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const generateCoverLetter = async (data) => {
  const prompt = buildCoverLetterPrompt(data);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: 'You are an expert cover letter writer for tech professionals. Always respond with valid JSON only, no markdown code blocks.',
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0].text.trim();
  const jsonStr = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('AI response was not valid JSON');
  }
};

module.exports = { generateCoverLetter };
