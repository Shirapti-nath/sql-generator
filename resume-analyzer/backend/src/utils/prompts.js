const DOMAIN_KEYWORDS = {
  'software-engineering': [
    'REST API', 'microservices', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Agile', 'Scrum',
    'React', 'Node.js', 'Python', 'Java', 'TypeScript', 'PostgreSQL', 'Redis', 'AWS',
    'system design', 'algorithms', 'data structures', 'OOP', 'unit testing', 'TDD',
  ],
  'ai-ml': [
    'machine learning', 'deep learning', 'neural networks', 'PyTorch', 'TensorFlow',
    'scikit-learn', 'NLP', 'computer vision', 'transformer', 'BERT', 'LLM', 'fine-tuning',
    'MLOps', 'model deployment', 'feature engineering', 'cross-validation', 'hyperparameter',
    'reinforcement learning', 'GANs', 'diffusion models', 'RAG', 'LangChain',
  ],
  'data-science': [
    'data analysis', 'pandas', 'NumPy', 'SQL', 'Tableau', 'Power BI', 'statistics',
    'A/B testing', 'data visualization', 'ETL', 'data pipeline', 'Spark', 'Hadoop',
    'regression', 'classification', 'clustering', 'time series', 'data cleaning',
    'Jupyter', 'R', 'statistical modeling', 'business intelligence', 'KPI',
  ],
};

const buildAnalysisPrompt = (resumeText, domain = 'software-engineering', jobDescription = '') => {
  const domainKeywords = DOMAIN_KEYWORDS[domain] || DOMAIN_KEYWORDS['software-engineering'];
  const jobContext = jobDescription
    ? `\n\nJob Description to match against:\n${jobDescription}\n`
    : '';

  return `You are an expert ATS (Applicant Tracking System) analyzer and career coach specializing in the ${domain.replace('-', ' ')} domain.

Analyze the following resume and provide a detailed, actionable assessment. Return your response as a valid JSON object.${jobContext}

RESUME TEXT:
${resumeText}

DOMAIN: ${domain}
RELEVANT KEYWORDS FOR THIS DOMAIN: ${domainKeywords.join(', ')}

Analyze the resume and return a JSON object with EXACTLY this structure:
{
  "atsScore": <number 0-100>,
  "scoreBreakdown": {
    "keywords": { "score": <0-25>, "max": 25, "explanation": "<string>" },
    "formatting": { "score": <0-20>, "max": 20, "explanation": "<string>" },
    "completeness": { "score": <0-20>, "max": 20, "explanation": "<string>" },
    "experienceClarity": { "score": <0-20>, "max": 20, "explanation": "<string>" },
    "skillsRelevance": { "score": <0-15>, "max": 15, "explanation": "<string>" }
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>", "<strength 5>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "missingKeywords": ["<keyword 1>", "<keyword 2>", ...],
  "suggestions": [
    {
      "category": "<skills|experience|projects|formatting|keywords|summary>",
      "original": "<original text or issue>",
      "improved": "<improved version>",
      "explanation": "<why this is better>"
    }
  ],
  "improvedBullets": [
    {
      "section": "<Experience|Projects>",
      "original": "<original bullet point>",
      "improved": "<improved bullet with strong action verb and metrics>"
    }
  ],
  "domainAnalysis": {
    "domain": "${domain}",
    "relevantSkillsFound": ["<skill 1>", "<skill 2>"],
    "missingCriticalSkills": ["<skill 1>", "<skill 2>"],
    "domainScore": <0-100>
  },
  "aiGeneratedSummary": "<2-3 sentence professional summary the candidate could use>"${jobDescription ? `,
  "jobDescriptionMatch": {
    "matchScore": <0-100>,
    "matchedKeywords": ["<keyword 1>"],
    "missingKeywords": ["<keyword 1>"]
  }` : ''}
}

Scoring guidelines:
- Keywords (0-25): Check for domain-specific keywords, industry terms, technologies
- Formatting (0-20): Section headers clarity, bullet points, consistent formatting, length (1-2 pages ideal)
- Completeness (0-20): All sections present (contact, summary, education, experience, skills, projects)
- Experience Clarity (0-20): Quantifiable achievements, action verbs, STAR method
- Skills Relevance (0-15): Skills match domain requirements

Be strict but fair. Provide at least 5 specific, actionable suggestions. Return ONLY valid JSON.`;
};

const buildBulletImproverPrompt = (bullets, context) => {
  return `You are an expert resume writer. Improve these bullet points to be more impactful using strong action verbs and quantifiable metrics.

Context: ${context}

Bullets to improve:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Return a JSON array:
[
  { "original": "<original>", "improved": "<improved with action verb + metric + impact>" }
]

Rules:
- Start with strong action verbs (Developed, Architected, Optimized, Led, Implemented, Reduced, Increased)
- Add specific metrics where possible (e.g., "by 40%", "serving 10K+ users")
- Keep under 2 lines
- Focus on impact, not just tasks
Return ONLY valid JSON array.`;
};

module.exports = { buildAnalysisPrompt, buildBulletImproverPrompt, DOMAIN_KEYWORDS };
