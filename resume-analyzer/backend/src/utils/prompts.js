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
  'devops-cloud': [
    'Kubernetes', 'Docker', 'Terraform', 'Ansible', 'CI/CD', 'Jenkins', 'GitHub Actions',
    'AWS', 'GCP', 'Azure', 'infrastructure as code', 'Helm', 'ArgoCD', 'observability',
    'Prometheus', 'Grafana', 'SRE', 'incident response', 'on-call', 'SLO', 'SLA',
  ],
  'cybersecurity': [
    'penetration testing', 'vulnerability assessment', 'SIEM', 'SOC', 'threat modeling',
    'incident response', 'cryptography', 'zero trust', 'OWASP', 'NIST', 'ISO 27001',
    'network security', 'ethical hacking', 'CTF', 'malware analysis', 'forensics',
  ],
  'product-management': [
    'product roadmap', 'OKRs', 'KPIs', 'user research', 'A/B testing', 'agile',
    'sprint planning', 'stakeholder management', 'go-to-market', 'PRD', 'wireframing',
    'data-driven', 'user stories', 'backlog grooming', 'product-market fit',
  ],
  'mobile': [
    'iOS', 'Android', 'React Native', 'Flutter', 'Swift', 'Kotlin', 'Xcode',
    'Android Studio', 'App Store', 'Google Play', 'push notifications', 'offline-first',
    'mobile CI/CD', 'Fastlane', 'TestFlight', 'Firebase',
  ],
  'fullstack': [
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Next.js', 'TypeScript',
    'GraphQL', 'REST API', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'AWS',
    'responsive design', 'Tailwind CSS', 'authentication', 'WebSockets',
  ],
};

const buildAnalysisPrompt = (resumeText, domain = 'software-engineering', jobDescription = '') => {
  const domainKeywords = DOMAIN_KEYWORDS[domain] || DOMAIN_KEYWORDS['software-engineering'];
  const jobContext = jobDescription
    ? `\n\nJob Description to match against:\n${jobDescription}\n`
    : '';

  return `You are an expert ATS (Applicant Tracking System) analyzer and career coach for the tech industry.

Analyze the following resume and provide a detailed, actionable assessment. Return your response as a valid JSON object.${jobContext}

RESUME TEXT:
${resumeText}

TARGET ROLE DOMAIN: ${domain}
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
- Keywords (0-25): Domain-specific keywords, industry terms, technologies
- Formatting (0-20): Section headers clarity, bullet points, consistent formatting, length (1-2 pages ideal)
- Completeness (0-20): All sections present (contact, summary, education, experience, skills, projects)
- Experience Clarity (0-20): Quantifiable achievements, action verbs, STAR method
- Skills Relevance (0-15): Skills match domain requirements

Be strict but fair. Provide at least 5 specific, actionable suggestions. Return ONLY valid JSON.`;
};

const buildBulletImproverPrompt = (bullets, context) => {
  return `You are an expert resume writer for the tech industry. Improve these bullet points to be more impactful using strong action verbs and quantifiable metrics.

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

const buildLinkedInPrompt = (profileData) => {
  const { currentHeadline, about, experienceSummaries, skills, targetRole, linkedinUrl } = profileData;

  return `You are an expert LinkedIn profile optimizer for tech professionals. Analyze this LinkedIn profile and provide detailed, actionable improvements.

CURRENT PROFILE DATA:
Headline: ${currentHeadline || 'Not provided'}
Target Role: ${targetRole || 'Not specified'}
LinkedIn URL: ${linkedinUrl || 'Not provided'}

About / Summary:
${about || 'Not provided'}

Experience Summaries:
${experienceSummaries?.length ? experienceSummaries.map((e, i) => `${i + 1}. ${e}`).join('\n') : 'Not provided'}

Current Skills Listed:
${skills?.length ? skills.join(', ') : 'Not provided'}

Return a JSON object with EXACTLY this structure:
{
  "profileScore": <number 0-100>,
  "scoreBreakdown": {
    "headline": { "score": <0-20>, "max": 20, "explanation": "<string>" },
    "about": { "score": <0-25>, "max": 25, "explanation": "<string>" },
    "experience": { "score": <0-25>, "max": 25, "explanation": "<string>" },
    "skills": { "score": <0-15>, "max": 15, "explanation": "<string>" },
    "keywords": { "score": <0-15>, "max": 15, "explanation": "<string>" }
  },
  "headlineSuggestions": [
    "<headline option 1 — role + specialization + value prop>",
    "<headline option 2 — different angle>",
    "<headline option 3 — achievement-focused>"
  ],
  "rewrittenAbout": "<full rewritten About section — 3-5 paragraphs, first-person, keywords-rich, ends with CTA>",
  "missingKeywords": ["<keyword 1>", "<keyword 2>", ...],
  "skillsToAdd": ["<skill 1>", "<skill 2>", ...],
  "experienceImprovements": [
    {
      "original": "<original experience description>",
      "improved": "<improved with metrics and impact>",
      "reason": "<why this is more effective>"
    }
  ],
  "actionableTips": [
    "<tip 1 — specific actionable LinkedIn optimization step>",
    "<tip 2>",
    "<tip 3>",
    "<tip 4>",
    "<tip 5>"
  ],
  "seoKeywords": ["<keyword recruiters search for>", ...]
}

Guidelines:
- Headline: max 220 chars, include role + specialization + value differentiation
- About: Start with a hook, showcase impact with numbers, include keywords naturally, end with a clear call to action
- Experience: Use bullet-style descriptions with strong verbs and quantifiable results
- Skills: Prioritize skills that appear in job descriptions for the target role
- Tips should be immediately actionable (e.g., "Request 3 recommendations from senior colleagues", not vague advice)

Return ONLY valid JSON.`;
};

const buildCoverLetterPrompt = (data) => {
  const { jobTitle, company, jobDescription, resumeText, tone, additionalContext } = data;

  const toneInstructions = {
    professional: 'Write in a formal, polished, and confident tone. Use precise language and demonstrate expertise.',
    enthusiastic: 'Write with genuine excitement and passion for the role. Show energy while remaining professional.',
    concise: 'Write a punchy, direct letter. Keep it to 3 short paragraphs. Every sentence must add value.',
    creative: 'Write with a creative hook that immediately grabs attention. Show personality while staying relevant to the role.',
  };

  return `You are an expert cover letter writer for tech professionals. Write a highly personalized, compelling cover letter.

JOB DETAILS:
Position: ${jobTitle}
Company: ${company}
Job Description:
${jobDescription || 'Not provided — write a general but tailored letter for this role/company.'}

CANDIDATE'S RESUME SUMMARY:
${resumeText || 'Not provided'}

TONE: ${tone} — ${toneInstructions[tone] || toneInstructions.professional}

${additionalContext ? `ADDITIONAL CONTEXT FROM CANDIDATE:\n${additionalContext}` : ''}

Return a JSON object with EXACTLY this structure:
{
  "generatedLetter": "<complete cover letter text — properly formatted with line breaks using \\n>",
  "keyStrengths": ["<strength highlighted in letter 1>", "<strength 2>", "<strength 3>"],
  "matchedSkills": ["<skill from resume that matches JD 1>", "<skill 2>", ...],
  "wordCount": <number>
}

Cover letter requirements:
- Opening paragraph: Strong hook specific to ${company} and the ${jobTitle} role — NO "I am writing to apply for" openers
- Body paragraph(s): 2-3 specific achievements from the resume tied directly to the job requirements
- Closing paragraph: Clear call to action, express enthusiasm for next steps
- Length: 280-380 words for "${tone}" tone
- Must feel personal and specific to ${company}, not generic
- Include the candidate's name placeholder as [Your Name] at the end
- Format: Professional letter format with proper salutation and closing

Return ONLY valid JSON.`;
};

module.exports = {
  buildAnalysisPrompt,
  buildBulletImproverPrompt,
  buildLinkedInPrompt,
  buildCoverLetterPrompt,
  DOMAIN_KEYWORDS,
};
