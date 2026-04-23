import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { resumeAPI, analysisAPI } from '../utils/api';
import ScoreGauge from '../components/ScoreGauge';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const DomainBadge = ({ domain }) => {
  const colors = {
    'software-engineering': 'bg-indigo-500/20 text-indigo-400',
    'ai-ml': 'bg-purple-500/20 text-purple-400',
    'data-science': 'bg-emerald-500/20 text-emerald-400',
    'other': 'bg-slate-500/20 text-slate-400',
  };
  const labels = {
    'software-engineering': 'SWE',
    'ai-ml': 'AI/ML',
    'data-science': 'Data Science',
    'other': 'Other',
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors[domain] || colors.other}`}>
      {labels[domain] || domain}
    </span>
  );
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [resumes, setResumes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ resumes }, { analyses }] = await Promise.all([
          resumeAPI.getAll(),
          analysisAPI.getHistory(),
        ]);
        setResumes(resumes);
        setHistory(analyses);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
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

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
        <h1 className="text-3xl font-black text-white">
          Hey, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's your resume command center.</p>
      </motion.div>

      {/* Quick actions */}
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { to: '/analyze', icon: '📊', label: 'Analyze Resume', desc: 'Upload & get ATS score', gradient: 'from-indigo-600/20 to-purple-600/20 border-indigo-500/20' },
          { to: '/builder', icon: '✏️', label: 'Build Resume', desc: 'Create from scratch', gradient: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/20' },
          { to: '/templates', icon: '🎨', label: 'Templates', desc: 'Browse 10 ATS templates', gradient: 'from-amber-600/20 to-orange-600/20 border-amber-500/20' },
        ].map((item) => (
          <motion.div key={item.to} variants={fadeUp}>
            <Link to={item.to}
              className={`block card border bg-gradient-to-br ${item.gradient} hover:scale-[1.02] transition-transform duration-200`}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-semibold text-white">{item.label}</div>
              <div className="text-slate-400 text-sm">{item.desc}</div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Resumes */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Your Resumes</h2>
          <Link to="/analyze" className="text-indigo-400 hover:text-indigo-300 text-sm">
            + Upload New
          </Link>
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
                className="card group relative">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {r.title}
                    </h3>
                    <span className="text-xs text-slate-500 capitalize">{r.type}</span>
                  </div>
                  {r.latestAnalysis && (
                    <div className="text-right">
                      <div className="text-2xl font-black text-indigo-400">{r.latestAnalysis.atsScore}</div>
                      <div className="text-xs text-slate-500">ATS Score</div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500 mb-4">
                  {new Date(r.updatedAt).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => navigate(`/analyze?resumeId=${r._id}`)}
                    className="flex-1 text-center text-xs btn-primary py-2">
                    Analyze
                  </button>
                  {r.type === 'built' && (
                    <button onClick={() => navigate(`/builder/${r._id}`)}
                      className="flex-1 text-center text-xs btn-secondary py-2">
                      Edit
                    </button>
                  )}
                  <button onClick={() => handleDelete(r._id)}
                    className="px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-xs">
                    🗑
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis history */}
      <div>
        <h2 className="text-xl font-bold text-white mb-5">Analysis History</h2>
        {history.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-slate-400">No analyses yet. Upload and analyze a resume to start.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 6).map((a) => (
              <Link key={a._id} to={`/report/${a._id}`}
                className="card flex items-center justify-between hover:border-indigo-500/30 transition-all duration-200 group">
                <div>
                  <div className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                    {a.resume?.title || 'Unnamed Resume'}
                  </div>
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
    </div>
  );
}
