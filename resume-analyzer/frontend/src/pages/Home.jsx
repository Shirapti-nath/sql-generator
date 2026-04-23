import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

const Feature = ({ icon, title, desc, gradient }) => (
  <motion.div variants={fadeUp} className="card group hover:border-indigo-500/30 transition-all duration-300">
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const Stat = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl font-black gradient-text">{value}</div>
    <div className="text-slate-400 text-sm mt-1">{label}</div>
  </div>
);

export default function Home() {
  const features = [
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      title: 'ATS Score Engine',
      desc: 'Get a precise 0–100 score with breakdown across keywords, formatting, completeness, and experience clarity.',
      gradient: 'from-indigo-500 to-purple-600',
    },
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      title: 'AI Suggestions',
      desc: 'Claude AI rewrites your bullet points with strong action verbs and quantifiable metrics to maximize impact.',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
      title: '10 ATS Templates',
      desc: '5 student and 5 professional templates — visually stunning, fully ATS-friendly, and instantly editable.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
      title: 'Resume Builder',
      desc: 'Build from scratch with our intuitive form — live preview, section-by-section, download as PDF.',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
      title: 'Keyword Optimizer',
      desc: 'Discover missing keywords by domain — CS, AI/ML, Data Science — to beat ATS filters at top companies.',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
      title: 'Domain Analysis',
      desc: 'Tailored feedback for Software Engineering, AI/ML, and Data Science career paths.',
      gradient: 'from-violet-500 to-purple-600',
    },
  ];

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-3xl" />
          <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity }}
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Powered by Claude AI — Built for CS, AI & Data Science
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Land Your Dream Job<br />
            <span className="gradient-text">with AI-Powered</span><br />
            Resume Analysis
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your resume and get an instant ATS score, actionable AI feedback, and rewritten bullet points — tailored for tech roles.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base px-8 py-4">
              Analyze My Resume — Free
            </Link>
            <Link to="/templates" className="btn-secondary text-base px-8 py-4">
              Browse Templates
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-12 mt-16 pt-10 border-t border-white/10">
            <Stat value="95%" label="ATS Pass Rate" />
            <Stat value="10k+" label="Resumes Analyzed" />
            <Stat value="3" label="CS Domains" />
            <Stat value="10" label="ATS Templates" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            transition={{ staggerChildren: 0.1 }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl font-black text-white mb-4">
              Everything you need to <span className="gradient-text">get hired</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg max-w-2xl mx-auto">
              From analysis to building to downloading — a complete resume platform powered by cutting-edge AI.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            transition={{ staggerChildren: 0.08 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => <Feature key={f.title} {...f} />)}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="card border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-purple-600/10">
            <h2 className="text-3xl font-black text-white mb-4">Ready to optimize your resume?</h2>
            <p className="text-slate-400 mb-8">Join thousands of CS professionals who landed their dream jobs with ResumeAI.</p>
            <Link to="/register" className="btn-primary inline-block text-base px-10 py-4">
              Get Started for Free
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
