const Anthropic = require('@anthropic-ai/sdk');
const { buildAnalysisPrompt, buildBulletImproverPrompt } = require('../utils/prompts');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const analyzeResume = async (resumeText, domain, jobDescription = '') => {
  const prompt = buildAnalysisPrompt(resumeText, domain, jobDescription);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: 'You are an expert resume analyzer. Always respond with valid JSON only, no markdown code blocks.',
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0].text.trim();
  const jsonStr = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
    else throw new Error('AI response was not valid JSON');
  }

  return { ...parsed, rawResponse: content };
};

const improveBullets = async (bullets, context) => {
  const prompt = buildBulletImproverPrompt(bullets, context);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: 'You are a professional resume writer. Always respond with valid JSON only.',
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0].text.trim();
  const jsonStr = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    const match = content.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error('AI response was not valid JSON');
  }
};

const generateSummary = async (resumeText, domain) => {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Write a compelling 3-sentence professional summary for a ${domain.replace('-', ' ')} professional based on this resume. Return only the summary text, no labels:\n\n${resumeText}`,
    }],
  });

  return message.content[0].text.trim();
};

module.exports = { analyzeResume, improveBullets, generateSummary };
