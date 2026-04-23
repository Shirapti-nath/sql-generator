import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { resumeAPI, analysisAPI } from '../utils/api';

const DOMAINS = [
  { value: 'software-engineering', label: 'Software Engineering' },
  { value: 'ai-ml', label: 'AI / Machine Learning' },
  { value: 'data-science', label: 'Data Science' },
];

export default function Analyzer() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [domain, setDomain] = useState(user?.domain || 'software-engineering');
  const [jobDescription, setJobDescription] = useState('');
  const [step, setStep] = useState('upload'); // upload | analyzing | done
  const [progress, setProgress] = useState(0);
  const [resumeId, setResumeId] = useState(searchParams.get('resumeId') || null);

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    try {
      setStep('analyzing');

      let rId = resumeId;

      if (!rId) {
        if (!file) return toast.error('Please upload a resume file');
        setProgress(20);
        toast('Uploading resume...', { icon: '📤' });

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('title', file.name.replace(/\.[^.]+$/, ''));
        const { resume } = await resumeAPI.upload(formData);
        rId = resume._id;
        setResumeId(rId);
      }

      setProgress(50);
      toast('AI is analyzing your resume...', { icon: '🤖' });

      const { analysis } = await analysisAPI.analyze({
        resumeId: rId,
        domain,
        jobDescription,
      });

      setProgress(100);
      toast.success('Analysis complete!');
      navigate(`/report/${analysis._id}`);
    } catch (err) {
      toast.error(err.message);
      setStep('upload');
      setProgress(0);
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-white mb-2">Resume Analyzer</h1>
        <p className="text-slate-400 mb-8">Upload your resume and get an instant AI-powered ATS score with actionable feedback.</p>

        <div className="card space-y-6">
          {/* Dropzone */}
          {!resumeId && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Upload Resume (PDF or DOCX)</label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive ? 'border-indigo-500 bg-indigo-500/10' :
                  file ? 'border-emerald-500 bg-emerald-500/10' :
                  'border-slate-700 hover:border-slate-500'
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div>
                    <div className="text-3xl mb-2">✅</div>
                    <p className="text-emerald-400 font-medium">{file.name}</p>
                    <p className="text-slate-500 text-sm">{(file.size / 1024).toFixed(0)} KB</p>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-xs text-red-400 mt-2 hover:underline">Remove</button>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-3">📄</div>
                    <p className="text-slate-300 font-medium">
                      {isDragActive ? 'Drop it here!' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">or click to browse — PDF, DOCX up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {resumeId && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-2xl">📑</span>
              <div>
                <p className="text-indigo-400 font-medium">Re-analyzing existing resume</p>
                <button onClick={() => setResumeId(null)} className="text-xs text-slate-400 hover:text-white">
                  Upload different file instead
                </button>
              </div>
            </div>
          )}

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Your Domain</label>
            <div className="grid grid-cols-3 gap-3">
              {DOMAINS.map((d) => (
                <button key={d.value} onClick={() => setDomain(d.value)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    domain === d.value
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Job Description (optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Job Description <span className="text-slate-500 font-normal">(optional — for match score)</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="input-field h-28 resize-none"
              placeholder="Paste the job description here to get a match score..."
            />
          </div>

          {/* Analyze button */}
          <AnimatePresence mode="wait">
            {step === 'analyzing' ? (
              <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    {progress < 40 ? 'Uploading resume...' : progress < 80 ? 'Claude AI is analyzing...' : 'Finalizing report...'}
                  </span>
                  <span className="text-indigo-400 font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-center text-slate-500 text-sm">This usually takes 15-30 seconds...</p>
              </motion.div>
            ) : (
              <motion.button key="btn" onClick={handleAnalyze}
                disabled={!file && !resumeId}
                className="btn-primary w-full text-base py-4">
                🚀 Analyze with AI
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-slate-500 text-sm mt-4">
          Your resume is processed securely and never shared with third parties.
        </p>
      </motion.div>
    </div>
  );
}
