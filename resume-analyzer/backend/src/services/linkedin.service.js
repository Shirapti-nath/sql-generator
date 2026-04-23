const Anthropic = require('@anthropic-ai/sdk');
const { buildLinkedInPrompt } = require('../utils/prompts');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const optimizeLinkedIn = async (profileData) => {
  const prompt = buildLinkedInPrompt(profileData);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: 'You are an expert LinkedIn profile optimizer for tech professionals. Always respond with valid JSON only, no markdown code blocks.',
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

module.exports = { optimizeLinkedIn };
