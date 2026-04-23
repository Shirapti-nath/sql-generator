import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { linkedinAPI } from '../utils/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const ScoreBar = ({ label, score, max, explanation }) => {
  const pct = Math.round((score / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{score}/{max}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 mb-1">
        <motion.div
          className={`h-2 rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
      {explanation && <p className="text-xs text-slate-500">{explanation}</p>}
    </div>
  );
};

const Tag = ({ text, color = 'indigo' }) => {
  const map = {
    indigo: 'bg-indigo-500/20 text-indigo-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    blue: 'bg-blue-500/20 text-blue-400',
    amber: 'bg-amber-500/20 text-amber-400',
    red: 'bg-red-500/20 text-red-400',
  };
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${map[color]}`}>{text}</span>;
};

const SCORE_COLOR = (score) =>
  score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';

export default function LinkedIn() {
  const [form, setForm] = useState({
    currentHeadline: '',
    about: '',
    experienceSummaries: [''],
    skills: '',
    targetRole: '',
    linkedinUrl: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const updateExp = (i, val) => {
    const arr = [...form.experienceSummaries];
    arr[i] = val;
    setForm((f) => ({ ...f, experienceSummaries: arr }));
  };

  const addExp = () => setForm((f) => ({ ...f, experienceSummaries: [...f.experienceSummaries, ''] }));
  const removeExp = (i) => setForm((f) => ({
    ...f,
    experienceSummaries: f.experienceSummaries.filter((_, idx) => idx !== i),
  }));

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentHeadline && !form.about) {
      return toast.error('Please fill in at least your current headline or About section.');
    }
    setLoading(true);
    try {
      const skillsArray = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
      const { optimization } = await linkedinAPI.optimize({
        ...form,
        skills: skillsArray,
        experienceSummaries: form.experienceSummaries.filter(Boolean),
      });
      setResult(optimization);
      toast.success('Profile analysis complete!');
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 200);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/25">
              💼
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">LinkedIn Profile Optimizer</h1>
              <p className="text-slate-400 text-sm">Get a profile score, rewritten sections, and recruiter-magnet keywords.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Headline *</label>
                <input
                  value={form.currentHeadline}
                  onChange={set('currentHeadline')}
                  className="input-field"
                  placeholder="e.g. Software Engineer at Google | React & Node.js"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Role</label>
                <input
                  value={form.targetRole}
                  onChange={set('targetRole')}
                  className="input-field"
                  placeholder="e.g. Senior Backend Engineer, ML Engineer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn URL <span className="text-slate-500 font-normal">(optional)</span></label>
              <input
                value={form.linkedinUrl}
                onChange={set('linkedinUrl')}
                className="input-field"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">About / Summary Section *</label>
              <textarea
                value={form.about}
                onChange={set('about')}
                className="input-field resize-none"
                rows={5}
                placeholder="Paste your current LinkedIn About section here..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">Experience Descriptions</label>
                <button type="button" onClick={addExp} className="text-xs text-indigo-400 hover:text-indigo-300">
                  + Add experience
                </button>
              </div>
              <div className="space-y-2">
                {form.experienceSummaries.map((exp, i) => (
                  <div key={i} className="flex gap-2">
                    <textarea
                      value={exp}
                      onChange={(e) => updateExp(i, e.target.value)}
                      className="input-field resize-none flex-1 text-sm"
                      rows={2}
                      placeholder={`Experience #${i + 1} — paste description or key bullet points`}
                    />
                    {form.experienceSummaries.length > 1 && (
                      <button type="button" onClick={() => removeExp(i)}
                        className="px-2 text-red-400 hover:text-red-300 flex-shrink-0">
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Skills Listed on Profile</label>
              <input
                value={form.skills}
                onChange={set('skills')}
                className="input-field"
                placeholder="React, Python, AWS, Docker, SQL (comma-separated)"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base py-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing your profile...
                </span>
              ) : '💼 Optimize My LinkedIn Profile'}
            </button>
          </form>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              id="results-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Score overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card flex flex-col items-center justify-center text-center">
                  <div className={`text-6xl font-black mb-2 ${SCORE_COLOR(result.profileScore)}`}>
                    {result.profileScore}
                  </div>
                  <div className="text-slate-400 text-sm">Profile Strength</div>
                  <div className={`text-sm font-semibold mt-1 ${SCORE_COLOR(result.profileScore)}`}>
                    {result.profileScore >= 80 ? 'All-Star' : result.profileScore >= 60 ? 'Intermediate' : 'Beginner'}
                  </div>
                </div>

                <div className="card md:col-span-2">
                  <h3 className="font-bold text-white mb-4">Score Breakdown</h3>
                  <div className="space-y-4">
                    {result.scoreBreakdown && Object.entries(result.scoreBreakdown).map(([key, val]) => (
                      <ScoreBar
                        key={key}
                        label={{ headline: 'Headline', about: 'About Section', experience: 'Experience', skills: 'Skills', keywords: 'Keywords & SEO' }[key] || key}
                        score={val.score}
                        max={val.max}
                        explanation={val.explanation}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Headline suggestions */}
              {result.headlineSuggestions?.length > 0 && (
                <div className="card">
                  <h3 className="font-bold text-white mb-4">✨ Headline Suggestions</h3>
                  <div className="space-y-3">
                    {result.headlineSuggestions.map((h, i) => (
                      <div key={i} className="flex items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3">
                        <div>
                          <span className="text-xs text-slate-500 mr-2">Option {i + 1}</span>
                          <span className="text-slate-200 text-sm">{h}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(h, `headline-${i}`)}
                          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-all ${
                            copied === `headline-${i}`
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {copied === `headline-${i}` ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rewritten About */}
              {result.rewrittenAbout && (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">📝 Rewritten About Section</h3>
                    <button
                      onClick={() => handleCopy(result.rewrittenAbout, 'about')}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                        copied === 'about' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {copied === 'about' ? '✓ Copied' : 'Copy All'}
                    </button>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{result.rewrittenAbout}</p>
                  </div>
                </div>
              )}

              {/* Keywords + Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.missingKeywords?.length > 0 && (
                  <div className="card">
                    <h3 className="font-bold text-white mb-3">🔑 Missing Keywords</h3>
                    <p className="text-slate-500 text-xs mb-3">Add these to improve recruiter search visibility:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map((k) => <Tag key={k} text={k} color="red" />)}
                    </div>
                  </div>
                )}
                {result.skillsToAdd?.length > 0 && (
                  <div className="card">
                    <h3 className="font-bold text-white mb-3">⚡ Skills to Add</h3>
                    <p className="text-slate-500 text-xs mb-3">Endorsed skills that boost profile discoverability:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.skillsToAdd.map((s) => <Tag key={s} text={s} color="emerald" />)}
                    </div>
                  </div>
                )}
              </div>

              {/* Experience improvements */}
              {result.experienceImprovements?.length > 0 && (
                <div className="card">
                  <h3 className="font-bold text-white mb-4">🚀 Experience Rewrites</h3>
                  <div className="space-y-4">
                    {result.experienceImprovements.map((imp, i) => (
                      <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Original</p>
                            <p className="text-sm text-slate-400 bg-red-500/5 border border-red-500/10 rounded-lg p-3">{imp.original}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Improved</p>
                            <p className="text-sm text-emerald-300 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">{imp.improved}</p>
                          </div>
                        </div>
                        {imp.reason && <p className="text-xs text-slate-500 italic">{imp.reason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Tips */}
              {result.actionableTips?.length > 0 && (
                <div className="card">
                  <h3 className="font-bold text-white mb-4">✅ Actionable Next Steps</h3>
                  <div className="space-y-3">
                    {result.actionableTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-slate-300 text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO Keywords */}
              {result.seoKeywords?.length > 0 && (
                <div className="card">
                  <h3 className="font-bold text-white mb-3">🔍 Recruiter Search Keywords</h3>
                  <p className="text-slate-500 text-xs mb-3">Sprinkle these throughout your profile for maximum search visibility:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.seoKeywords.map((k) => <Tag key={k} text={k} color="blue" />)}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => { setResult(null); window.scrollTo(0, 0); }} className="btn-secondary flex-1">
                  Optimize Another Profile
                </button>
                <Link to="/cover-letter" className="btn-primary flex-1 text-center">
                  Generate Cover Letter →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
