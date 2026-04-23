import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { coverLetterAPI, resumeAPI } from '../utils/api';

const TONES = [
  {
    value: 'professional',
    label: 'Professional',
    desc: 'Formal & polished',
    icon: '👔',
    gradient: 'from-slate-600/20 to-slate-700/20 border-slate-600/30',
    active: 'border-slate-400 bg-slate-600/20 text-white',
  },
  {
    value: 'enthusiastic',
    label: 'Enthusiastic',
    desc: 'Energetic & passionate',
    icon: '🚀',
    gradient: 'from-amber-600/10 to-orange-600/10 border-amber-700/20',
    active: 'border-amber-400 bg-amber-500/15 text-amber-300',
  },
  {
    value: 'concise',
    label: 'Concise',
    desc: 'Short & impactful',
    icon: '⚡',
    gradient: 'from-emerald-600/10 to-teal-600/10 border-emerald-700/20',
    active: 'border-emerald-400 bg-emerald-500/15 text-emerald-300',
  },
  {
    value: 'creative',
    label: 'Creative',
    desc: 'Bold & memorable',
    icon: '✨',
    gradient: 'from-purple-600/10 to-violet-600/10 border-purple-700/20',
    active: 'border-purple-400 bg-purple-500/15 text-purple-300',
  },
];

const TONE_BADGE = {
  professional: 'bg-slate-700 text-slate-300',
  enthusiastic: 'bg-amber-500/20 text-amber-400',
  concise: 'bg-emerald-500/20 text-emerald-400',
  creative: 'bg-purple-500/20 text-purple-400',
};

export default function CoverLetter() {
  const [form, setForm] = useState({
    jobTitle: '',
    company: '',
    jobDescription: '',
    resumeId: '',
    additionalContext: '',
    tone: 'professional',
  });
  const [resumes, setResumes] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedLetter, setEditedLetter] = useState('');

  useEffect(() => {
    resumeAPI.getAll()
      .then(({ resumes }) => setResumes(resumes))
      .catch(() => {});
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.jobTitle || !form.company) return toast.error('Job title and company are required.');
    setLoading(true);
    setResult(null);
    try {
      const { coverLetter } = await coverLetterAPI.generate(form);
      setResult(coverLetter);
      setEditedLetter(coverLetter.generatedLetter);
      toast.success('Cover letter generated!');
      setTimeout(() => document.getElementById('letter-output')?.scrollIntoView({ behavior: 'smooth' }), 200);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editMode ? editedLetter : result.generatedLetter);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = editMode ? editedLetter : result.generatedLetter;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${result.company?.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-violet-500/25 flex-shrink-0">
            ✉️
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Cover Letter Generator</h1>
            <p className="text-slate-400 text-sm">AI writes a tailored, ATS-optimized cover letter in seconds — pick your tone and go.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Form panel */}
          <div className="xl:col-span-2">
            <form onSubmit={handleSubmit} className="card space-y-5 sticky top-24">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Job Title *</label>
                <input
                  value={form.jobTitle}
                  onChange={set('jobTitle')}
                  className="input-field"
                  placeholder="Senior Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Company *</label>
                <input
                  value={form.company}
                  onChange={set('company')}
                  className="input-field"
                  placeholder="Google, Stripe, OpenAI..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Job Description <span className="text-slate-500 font-normal">(recommended)</span>
                </label>
                <textarea
                  value={form.jobDescription}
                  onChange={set('jobDescription')}
                  className="input-field resize-none text-sm"
                  rows={4}
                  placeholder="Paste the job posting here for a highly tailored letter..."
                />
              </div>

              {resumes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Use Existing Resume</label>
                  <select value={form.resumeId} onChange={set('resumeId')} className="input-field text-sm">
                    <option value="">— Select a resume —</option>
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>{r.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Additional Context <span className="text-slate-500 font-normal">(optional)</span></label>
                <textarea
                  value={form.additionalContext}
                  onChange={set('additionalContext')}
                  className="input-field resize-none text-sm"
                  rows={2}
                  placeholder="Referral name, why you love this company, specific project you want to mention..."
                />
              </div>

              {/* Tone selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, tone: t.value }))}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                        form.tone === t.value
                          ? t.active
                          : 'border-slate-700 bg-white/3 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-base mb-0.5">{t.icon}</div>
                      <div className="text-sm font-medium leading-tight">{t.label}</div>
                      <div className="text-xs opacity-70 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating letter...
                  </span>
                ) : '✉️ Generate Cover Letter'}
              </button>
            </form>
          </div>

          {/* Output panel */}
          <div className="xl:col-span-3" id="letter-output">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-6" />
                  <p className="text-white font-semibold mb-1">Claude is writing your cover letter...</p>
                  <p className="text-slate-500 text-sm">Tailoring it to {form.company} and the {form.jobTitle} role</p>
                </motion.div>
              )}

              {!loading && !result && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="text-5xl mb-4 animate-float">✉️</div>
                  <p className="text-slate-300 font-medium mb-1">Your cover letter will appear here</p>
                  <p className="text-slate-500 text-sm">Fill in the form and click Generate</p>
                </motion.div>
              )}

              {!loading && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Meta bar */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${TONE_BADGE[result.tone]}`}>
                        {result.tone}
                      </span>
                      <span className="text-slate-500 text-xs">{result.wordCount} words</span>
                      <span className="text-slate-500 text-xs">•</span>
                      <span className="text-slate-400 text-sm font-medium">{result.jobTitle} @ {result.company}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                          editMode ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {editMode ? '👁 Preview' : '✏️ Edit'}
                      </button>
                      <button onClick={handleCopy}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                        {copied ? '✓ Copied' : '📋 Copy'}
                      </button>
                      <button onClick={handleDownload} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all">
                        ⬇ Download
                      </button>
                    </div>
                  </div>

                  {/* Letter body */}
                  <div className="card bg-slate-900/70">
                    {editMode ? (
                      <textarea
                        value={editedLetter}
                        onChange={(e) => setEditedLetter(e.target.value)}
                        className="w-full bg-transparent text-slate-200 text-sm leading-relaxed outline-none resize-none font-mono"
                        rows={22}
                      />
                    ) : (
                      <pre className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        {result.generatedLetter}
                      </pre>
                    )}
                  </div>

                  {/* Strengths + matched skills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.keyStrengths?.length > 0 && (
                      <div className="card">
                        <h4 className="text-sm font-semibold text-white mb-3">💪 Key Strengths Highlighted</h4>
                        <ul className="space-y-1.5">
                          {result.keyStrengths.map((s, i) => (
                            <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                              <span className="text-emerald-400 flex-shrink-0">✓</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.matchedSkills?.length > 0 && (
                      <div className="card">
                        <h4 className="text-sm font-semibold text-white mb-3">🎯 Skills Matched to JD</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {result.matchedSkills.map((s) => (
                            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setResult(null); setForm(f => ({ ...f, tone: 'professional', jobDescription: '', additionalContext: '' })); }}
                      className="btn-secondary flex-1 text-sm"
                    >
                      Generate Another
                    </button>
                    <Link to="/analyze" className="btn-primary flex-1 text-center text-sm">
                      Analyze Resume →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
