import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { resumeAPI, analysisAPI, linkedinAPI, coverLetterAPI } from '../utils/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { user } = useAuthStore();
  const [resumes, setResumes] = useState([]);
  const [history, setHistory] = useState([]);
  const [linkedinHistory, setLinkedinHistory] = useState([]);
  const [coverLetterHistory, setCoverLetterHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumes');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { resumes },
          { analyses },
          { optimizations },
          { letters },
        ] = await Promise.all([
          resumeAPI.getAll(),
          analysisAPI.getHistory(),
          linkedinAPI.getHistory(),
          coverLetterAPI.getHistory(),
        ]);
        setResumes(resumes);
        setHistory(analyses);
        setLinkedinHistory(optimizations);
        setCoverLetterHistory(letters);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteResume = async (id) => {
    if (!confirm('Delete this resume?')) return;
    try {
      await resumeAPI.delete(id);
      setResumes(resumes.filter((r) => r._id !== id));
      toast.success('Resume deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const quickActions = [
    { to: '/analyze', icon: '📊', label: 'Resume Analyzer', desc: 'Upload & get ATS score', gradient: 'from-indigo-600/20 to-purple-600/20 border-indigo-500/20' },
    { to: '/linkedin', icon: '💼', label: 'LinkedIn Optimizer', desc: 'Optimize your profile', gradient: 'from-blue-600/20 to-cyan-600/20 border-blue-500/20' },
    { to: '/cover-letter', icon: '✉️', label: 'Cover Letter', desc: 'Generate in seconds', gradient: 'from-violet-600/20 to-purple-600/20 border-violet-500/20' },
    { to: '/builder', icon: '✏️', label: 'Build Resume', desc: 'Create from scratch', gradient: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/20' },
    { to: '/templates', icon: '🎨', label: 'Templates', desc: 'ATS-ready designs', gradient: 'from-amber-600/20 to-orange-600/20 border-amber-500/20' },
  ];

  const tabs = [
    { id: 'resumes', label: 'Resumes', count: resumes.length },
    { id: 'analyses', label: 'Analyses', count: history.length },
    { id: 'linkedin', label: 'LinkedIn', count: linkedinHistory.length },
    { id: 'coverletters', label: 'Cover Letters', count: coverLetterHistory.length },
  ];

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
        <h1 className="text-3xl font-black text-white">
          Hey, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">Your AI career toolkit — all in one place.</p>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10"
      >
        {quickActions.map((item) => (
          <motion.div key={item.to} variants={fadeUp}>
            <Link to={item.to}
              className={`block card border bg-gradient-to-br ${item.gradient} hover:scale-[1.03] transition-transform duration-200`}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-semibold text-white text-sm">{item.label}</div>
              <div className="text-slate-400 text-xs mt-0.5">{item.desc}</div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900/50 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-slate-800'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Resumes */}
      {activeTab === 'resumes' && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Your Resumes</h2>
            <Link to="/analyze" className="text-indigo-400 hover:text-indigo-300 text-sm">+ Upload New</Link>
          </div>
          {resumes.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">📄</div>
              <p className="text-slate-400">No resumes yet.</p>
              <Link to="/analyze" className="btn-primary inline-block mt-4">Upload Your First Resume</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map((r) => (
                <motion.div key={r._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="card group hover:border-indigo-500/30 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{r.title}</h3>
                      <span className="text-xs text-slate-500 capitalize">{r.type}</span>
                    </div>
                    {r.latestAnalysis && (
                      <div className="text-right">
                        <div className="text-2xl font-black text-indigo-400">{r.latestAnalysis.atsScore}</div>
                        <div className="text-xs text-slate-500">ATS Score</div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mb-4">{new Date(r.updatedAt).toLocaleDateString()}</div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/analyze?resumeId=${r._id}`)} className="flex-1 text-center text-xs btn-primary py-2">Analyze</button>
                    {r.type === 'built' && (
                      <button onClick={() => navigate(`/builder/${r._id}`)} className="flex-1 text-center text-xs btn-secondary py-2">Edit</button>
                    )}
                    <button onClick={() => handleDeleteResume(r._id)} className="px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-xs">🗑</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Analyses */}
      {activeTab === 'analyses' && (
        <div>
          <h2 className="text-xl font-bold text-white mb-5">Resume Analysis History</h2>
          {history.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-slate-400">No analyses yet.</p>
              <Link to="/analyze" className="btn-primary inline-block mt-4">Analyze a Resume</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((a) => (
                <Link key={a._id} to={`/report/${a._id}`}
                  className="card flex items-center justify-between hover:border-indigo-500/30 transition-all duration-200 group">
                  <div>
                    <div className="font-medium text-white group-hover:text-indigo-400 transition-colors">{a.resume?.title || 'Resume'}</div>
                    <div className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xl font-black text-indigo-400">{a.atsScore}</div>
                      <div className="text-xs text-slate-500">ATS</div>
                    </div>
                    <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: LinkedIn */}
      {activeTab === 'linkedin' && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">LinkedIn Optimizations</h2>
            <Link to="/linkedin" className="text-indigo-400 hover:text-indigo-300 text-sm">+ New Optimization</Link>
          </div>
          {linkedinHistory.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">💼</div>
              <p className="text-slate-400">No LinkedIn optimizations yet.</p>
              <Link to="/linkedin" className="btn-primary inline-block mt-4">Optimize Your LinkedIn</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {linkedinHistory.map((opt) => (
                <div key={opt._id} className="card flex items-center justify-between hover:border-blue-500/30 transition-all duration-200">
                  <div>
                    <div className="font-medium text-white">{opt.input?.targetRole || 'LinkedIn Profile'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{opt.input?.currentHeadline || ''}</div>
                    <div className="text-xs text-slate-500">{new Date(opt.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-blue-400">{opt.profileScore}</div>
                    <div className="text-xs text-slate-500">Profile Score</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Cover Letters */}
      {activeTab === 'coverletters' && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">Cover Letters</h2>
            <Link to="/cover-letter" className="text-indigo-400 hover:text-indigo-300 text-sm">+ Generate New</Link>
          </div>
          {coverLetterHistory.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">✉️</div>
              <p className="text-slate-400">No cover letters generated yet.</p>
              <Link to="/cover-letter" className="btn-primary inline-block mt-4">Generate a Cover Letter</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coverLetterHistory.map((l) => (
                <div key={l._id} className="card hover:border-violet-500/30 transition-all duration-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-white">{l.jobTitle}</div>
                      <div className="text-slate-400 text-sm">{l.company}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${
                      l.tone === 'professional' ? 'bg-slate-700 text-slate-300' :
                      l.tone === 'enthusiastic' ? 'bg-amber-500/20 text-amber-400' :
                      l.tone === 'concise' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>{l.tone}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{l.wordCount} words</span>
                    <span>{new Date(l.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
