import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { templateAPI } from '../utils/api';
import useAuthStore from '../store/authStore';

const CATEGORIES = [
  { value: '', label: 'All Templates' },
  { value: 'student', label: 'Student / Fresher' },
  { value: 'professional', label: 'Professional' },
];

const ATS_COLOR = (score) => score >= 95 ? 'text-emerald-400' : score >= 90 ? 'text-amber-400' : 'text-orange-400';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    templateAPI.getAll(category || undefined)
      .then(({ templates }) => setTemplates(templates))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  const handleSave = async (id) => {
    if (!token) return toast.error('Please sign in to save templates');
    try {
      await templateAPI.save(id);
      toast.success('Template saved!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const ACCENT_PREVIEWS = [
    'from-indigo-900 to-purple-900',
    'from-slate-800 to-indigo-900',
    'from-cyan-900 to-blue-900',
    'from-pink-900 to-rose-900',
    'from-blue-900 to-slate-900',
    'from-slate-900 to-slate-800',
    'from-sky-900 to-blue-900',
    'from-emerald-900 to-teal-900',
    'from-amber-900 to-orange-900',
    'from-gray-900 to-slate-900',
  ];

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-3">Resume Templates</h1>
          <p className="text-slate-400 text-lg">10 ATS-friendly templates for students and professionals</p>
        </div>

        {/* Filter */}
        <div className="flex gap-3 justify-center mb-10">
          {CATEGORIES.map((c) => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                category === c.value
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}>
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((t, i) => (
              <motion.div key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card group hover:border-indigo-500/30 transition-all duration-300 flex flex-col">

                {/* Preview mockup */}
                <div className={`h-44 rounded-xl bg-gradient-to-br ${ACCENT_PREVIEWS[i % 10]} mb-4 relative overflow-hidden flex items-center justify-center`}>
                  <div className="absolute inset-0 flex flex-col gap-2 p-4 opacity-60">
                    <div className="h-3 w-3/4 bg-white/30 rounded" />
                    <div className="h-2 w-1/2 bg-white/20 rounded" />
                    <div className="h-px bg-white/20 my-1" />
                    <div className="h-2 w-full bg-white/15 rounded" />
                    <div className="h-2 w-5/6 bg-white/15 rounded" />
                    <div className="h-2 w-4/6 bg-white/15 rounded" />
                    <div className="h-px bg-white/20 my-1" />
                    <div className="h-2 w-full bg-white/10 rounded" />
                    <div className="h-2 w-3/4 bg-white/10 rounded" />
                  </div>
                  <div className="relative">
                    <span className="text-4xl opacity-50">📄</span>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      t.category === 'student' ? 'bg-purple-500/70 text-purple-100' : 'bg-blue-500/70 text-blue-100'
                    }`}>
                      {t.category === 'student' ? 'Student' : 'Professional'}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-white mb-1">{t.name}</h3>
                <p className="text-slate-400 text-xs mb-3 flex-1">{t.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-sm font-bold ${ATS_COLOR(t.atsScore)}`}>{t.atsScore}%</span>
                  <span className="text-slate-500 text-xs">ATS compatible</span>
                </div>

                <div className="flex gap-2">
                  <Link to={`/builder?template=${t.id}`}
                    className="flex-1 text-center btn-primary text-xs py-2">
                    Use Template
                  </Link>
                  <button onClick={() => handleSave(t.id)}
                    className="px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm">
                    🔖
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
