import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import { analysisAPI } from '../utils/api';
import ScoreGauge from '../components/ScoreGauge';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const Section = ({ title, children, className = '' }) => (
  <motion.div variants={fadeUp} className={`card ${className}`}>
    <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
    {children}
  </motion.div>
);

const Tag = ({ text, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-500/20 text-indigo-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    red: 'bg-red-500/20 text-red-400',
    amber: 'bg-amber-500/20 text-amber-400',
  };
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[color]}`}>{text}</span>;
};

export default function AnalysisReport() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analysisAPI.getOne(id)
      .then(({ analysis }) => setAnalysis(analysis))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!analysis) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-400">Analysis not found.</p>
        <Link to="/dashboard" className="btn-primary inline-block mt-4">Back to Dashboard</Link>
      </div>
    </div>
  );

  const { scoreBreakdown } = analysis;
  const radarData = scoreBreakdown ? [
    { subject: 'Keywords', score: Math.round((scoreBreakdown.keywords?.score / scoreBreakdown.keywords?.max) * 100) || 0 },
    { subject: 'Formatting', score: Math.round((scoreBreakdown.formatting?.score / scoreBreakdown.formatting?.max) * 100) || 0 },
    { subject: 'Completeness', score: Math.round((scoreBreakdown.completeness?.score / scoreBreakdown.completeness?.max) * 100) || 0 },
    { subject: 'Experience', score: Math.round((scoreBreakdown.experienceClarity?.score / scoreBreakdown.experienceClarity?.max) * 100) || 0 },
    { subject: 'Skills', score: Math.round((scoreBreakdown.skillsRelevance?.score / scoreBreakdown.skillsRelevance?.max) * 100) || 0 },
  ] : [];

  return (
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 text-sm mb-2 inline-flex items-center gap-1">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black text-white">{analysis.resume?.title || 'Resume'} — Analysis Report</h1>
          <p className="text-slate-400 mt-1">{new Date(analysis.createdAt).toLocaleString()}</p>
        </div>
        <Link to={`/analyze?resumeId=${analysis.resume?._id}`} className="btn-secondary text-sm">
          Re-analyze
        </Link>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6">

        {/* Score overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Section title="ATS Score" className="flex flex-col items-center justify-center">
            <ScoreGauge score={analysis.atsScore} size={200} />
          </Section>

          <Section title="Score Breakdown" className="lg:col-span-2">
            {scoreBreakdown && (
              <div className="space-y-3">
                {Object.entries(scoreBreakdown).map(([key, val]) => {
                  const pct = Math.round((val.score / val.max) * 100);
                  const label = {
                    keywords: 'Keywords Match',
                    formatting: 'Formatting',
                    completeness: 'Section Completeness',
                    experienceClarity: 'Experience Clarity',
                    skillsRelevance: 'Skills Relevance',
                  }[key] || key;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{label}</span>
                        <span className="text-slate-400">{val.score}/{val.max}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                      {val.explanation && <p className="text-xs text-slate-500 mt-1">{val.explanation}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </div>

        {/* Radar chart */}
        {radarData.length > 0 && (
          <Section title="Skill Radar">
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </Section>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="✅ Strengths">
            <ul className="space-y-2">
              {(analysis.strengths || []).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </Section>
          <Section title="⚠️ Weaknesses">
            <ul className="space-y-2">
              {(analysis.weaknesses || []).map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-amber-400 mt-0.5 flex-shrink-0">!</span>
                  {w}
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Missing Keywords */}
        {analysis.missingKeywords?.length > 0 && (
          <Section title="🔑 Missing Keywords">
            <p className="text-slate-400 text-sm mb-3">Add these to improve your ATS pass rate:</p>
            <div className="flex flex-wrap gap-2">
              {analysis.missingKeywords.map((k) => <Tag key={k} text={k} color="red" />)}
            </div>
          </Section>
        )}

        {/* AI Suggestions */}
        {analysis.suggestions?.length > 0 && (
          <Section title="💡 AI Suggestions">
            <div className="space-y-4">
              {analysis.suggestions.map((s, i) => (
                <div key={i} className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag text={s.category} color="indigo" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Original</p>
                      <p className="text-sm text-slate-400 bg-red-500/5 border border-red-500/10 rounded-lg p-2">{s.original || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Improved</p>
                      <p className="text-sm text-emerald-300 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2">{s.improved}</p>
                    </div>
                  </div>
                  {s.explanation && <p className="text-xs text-slate-500 mt-2 italic">{s.explanation}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Improved Bullets */}
        {analysis.improvedBullets?.length > 0 && (
          <Section title="🚀 Rewritten Bullet Points">
            <div className="space-y-4">
              {analysis.improvedBullets.map((b, i) => (
                <div key={i} className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <span className="text-xs text-indigo-400 font-medium mb-2 block">{b.section}</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Before</p>
                      <p className="text-sm text-slate-400">• {b.original}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">After</p>
                      <p className="text-sm text-emerald-300">• {b.improved}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Domain Analysis */}
        {analysis.domainAnalysis && (
          <Section title="🎯 Domain Analysis">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-indigo-400">{analysis.domainAnalysis.domainScore}</div>
                <div className="text-slate-400 text-sm">Domain Score</div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Skills Found</p>
                <div className="flex flex-wrap gap-1">
                  {(analysis.domainAnalysis.relevantSkillsFound || []).map((s) => <Tag key={s} text={s} color="emerald" />)}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Missing Critical Skills</p>
                <div className="flex flex-wrap gap-1">
                  {(analysis.domainAnalysis.missingCriticalSkills || []).map((s) => <Tag key={s} text={s} color="red" />)}
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* AI Generated Summary */}
        {analysis.aiGeneratedSummary && (
          <Section title="✨ AI-Generated Professional Summary">
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
              <p className="text-slate-300 leading-relaxed">{analysis.aiGeneratedSummary}</p>
            </div>
            <p className="text-xs text-slate-500 mt-2">You can copy this and use it as your resume summary.</p>
          </Section>
        )}

        {/* Job Match */}
        {analysis.jobDescriptionMatch?.matchScore && (
          <Section title="🎯 Job Description Match">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-black text-indigo-400">{analysis.jobDescriptionMatch.matchScore}%</div>
              <p className="text-slate-400">match with the provided job description</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">Matched Keywords</p>
                <div className="flex flex-wrap gap-1">
                  {(analysis.jobDescriptionMatch.matchedKeywords || []).map((k) => <Tag key={k} text={k} color="emerald" />)}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Missing from JD</p>
                <div className="flex flex-wrap gap-1">
                  {(analysis.jobDescriptionMatch.missingKeywords || []).map((k) => <Tag key={k} text={k} color="red" />)}
                </div>
              </div>
            </div>
          </Section>
        )}
      </motion.div>
    </div>
  );
}
