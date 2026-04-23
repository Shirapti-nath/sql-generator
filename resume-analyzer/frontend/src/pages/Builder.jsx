import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { resumeAPI } from '../utils/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const EMPTY_DATA = {
  personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '', summary: '' },
  education: [],
  experience: [],
  projects: [],
  skills: { languages: [], frameworks: [], tools: [], databases: [], cloud: [], other: [] },
  certifications: [],
  templateId: 'modern-classic',
};

const STEPS = ['Personal', 'Education', 'Experience', 'Projects', 'Skills', 'Preview'];

const Input = ({ label, value, onChange, placeholder, type = 'text', required }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}{required && ' *'}</label>
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      className="input-field text-sm py-2" />
  </div>
);

const Textarea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      className="input-field text-sm py-2 resize-none" />
  </div>
);

const TagInput = ({ label, tags, onChange }) => {
  const [input, setInput] = useState('');
  const add = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) onChange([...tags, input.trim()]);
      setInput('');
    }
  };
  const remove = (t) => onChange(tags.filter((x) => x !== t));
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <div className="input-field min-h-[42px] flex flex-wrap gap-1.5 p-2 cursor-text" onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
            {t}
            <button type="button" onClick={() => remove(t)} className="hover:text-red-400">×</button>
          </span>
        ))}
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={add}
          placeholder={tags.length === 0 ? 'Type and press Enter' : ''}
          className="bg-transparent text-sm outline-none flex-1 min-w-[100px] text-slate-200 placeholder-slate-600" />
      </div>
    </div>
  );
};

// Resume preview component
const ResumePreview = ({ data, templateId }) => {
  const { personalInfo: p, education, experience, projects, skills, certifications } = data;
  const allSkills = Object.values(skills).flat().filter(Boolean);

  return (
    <div className="bg-white text-gray-900 p-8 text-xs font-sans min-h-[1056px] shadow-2xl" style={{ width: '816px', lineHeight: '1.5' }}>
      {/* Header */}
      <div className="border-b-2 border-indigo-600 pb-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{p.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap gap-3 mt-1 text-gray-600 text-[11px]">
          {p.email && <span>✉ {p.email}</span>}
          {p.phone && <span>📱 {p.phone}</span>}
          {p.location && <span>📍 {p.location}</span>}
          {p.linkedin && <span>in {p.linkedin}</span>}
          {p.github && <span>⌥ {p.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {p.summary && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-1">Professional Summary</h2>
          <p className="text-gray-700">{p.summary}</p>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2">Education</h2>
          {education.map((e, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{e.degree} in {e.field}</span>
                <span className="text-gray-500">{e.startDate} – {e.endDate}</span>
              </div>
              <div className="text-gray-600">{e.institution}{e.gpa ? ` • GPA: ${e.gpa}` : ''}</div>
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2">Experience</h2>
          {experience.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <span className="font-semibold">{e.position}</span>
                <span className="text-gray-500">{e.startDate} – {e.current ? 'Present' : e.endDate}</span>
              </div>
              <div className="text-gray-600 mb-1">{e.company}{e.location ? ` • ${e.location}` : ''}</div>
              {e.bullets?.filter(Boolean).map((b, j) => (
                <div key={j} className="flex gap-2 text-gray-700">
                  <span className="flex-shrink-0">•</span><span>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2">Projects</h2>
          {projects.map((p, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <span className="font-semibold">{p.name}</span>
                {p.technologies?.length > 0 && <span className="text-gray-500 text-[10px]">{p.technologies.join(', ')}</span>}
              </div>
              {p.bullets?.filter(Boolean).map((b, j) => (
                <div key={j} className="flex gap-2 text-gray-700">
                  <span className="flex-shrink-0">•</span><span>{b}</span>
                </div>
              ))}
              {p.description && <p className="text-gray-700">{p.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {allSkills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2">Technical Skills</h2>
          <div className="space-y-1">
            {skills.languages?.length > 0 && <div><span className="font-medium">Languages:</span> {skills.languages.join(', ')}</div>}
            {skills.frameworks?.length > 0 && <div><span className="font-medium">Frameworks:</span> {skills.frameworks.join(', ')}</div>}
            {skills.tools?.length > 0 && <div><span className="font-medium">Tools:</span> {skills.tools.join(', ')}</div>}
            {skills.databases?.length > 0 && <div><span className="font-medium">Databases:</span> {skills.databases.join(', ')}</div>}
            {skills.cloud?.length > 0 && <div><span className="font-medium">Cloud:</span> {skills.cloud.join(', ')}</div>}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2">Certifications</h2>
          {certifications.map((c, i) => (
            <div key={i} className="flex justify-between">
              <span className="font-medium">{c.name} — {c.issuer}</span>
              <span className="text-gray-500">{c.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Builder() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(EMPTY_DATA);
  const [title, setTitle] = useState('My Resume');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef(null);

  useEffect(() => {
    if (id) {
      resumeAPI.getOne(id).then(({ resume }) => {
        if (resume.builderData) setData(resume.builderData);
        setTitle(resume.title);
      }).catch((err) => toast.error(err.message));
    }
    const templateId = searchParams.get('template');
    if (templateId) setData((d) => ({ ...d, templateId }));
  }, [id]);

  const set = (section, field) => (e) => {
    setData((d) => ({ ...d, [section]: { ...d[section], [field]: e.target.value } }));
  };

  const setSkill = (type) => (tags) => {
    setData((d) => ({ ...d, skills: { ...d.skills, [type]: tags } }));
  };

  const addItem = (section, empty) => {
    setData((d) => ({ ...d, [section]: [...d[section], empty] }));
  };

  const updateItem = (section, index, field, value) => {
    setData((d) => {
      const arr = [...d[section]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...d, [section]: arr };
    });
  };

  const removeItem = (section, index) => {
    setData((d) => ({ ...d, [section]: d[section].filter((_, i) => i !== index) }));
  };

  const updateBullet = (section, itemIndex, bulletIndex, value) => {
    setData((d) => {
      const arr = [...d[section]];
      const bullets = [...(arr[itemIndex].bullets || [])];
      bullets[bulletIndex] = value;
      arr[itemIndex] = { ...arr[itemIndex], bullets };
      return { ...d, [section]: arr };
    });
  };

  const addBullet = (section, itemIndex) => {
    setData((d) => {
      const arr = [...d[section]];
      arr[itemIndex] = { ...arr[itemIndex], bullets: [...(arr[itemIndex].bullets || []), ''] };
      return { ...d, [section]: arr };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        await resumeAPI.update(id, { title, builderData: data });
      } else {
        const { resume } = await resumeAPI.create({ title, builderData: data });
        navigate(`/builder/${resume._id}`, { replace: true });
      }
      toast.success('Resume saved!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    toast('Generating PDF...', { icon: '📄' });
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [816, 1056] });
      pdf.addImage(imgData, 'PNG', 0, 0, 816, 1056);
      pdf.save(`${title || 'resume'}.pdf`);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('PDF generation failed');
    } finally {
      setDownloading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="space-y-4">
          <Input label="Full Name" value={data.personalInfo.fullName} onChange={set('personalInfo', 'fullName')} placeholder="Jane Doe" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={data.personalInfo.email} onChange={set('personalInfo', 'email')} placeholder="jane@example.com" />
            <Input label="Phone" value={data.personalInfo.phone} onChange={set('personalInfo', 'phone')} placeholder="+1 555-0100" />
          </div>
          <Input label="Location" value={data.personalInfo.location} onChange={set('personalInfo', 'location')} placeholder="San Francisco, CA" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="LinkedIn URL" value={data.personalInfo.linkedin} onChange={set('personalInfo', 'linkedin')} placeholder="linkedin.com/in/jane" />
            <Input label="GitHub URL" value={data.personalInfo.github} onChange={set('personalInfo', 'github')} placeholder="github.com/jane" />
          </div>
          <Input label="Website / Portfolio" value={data.personalInfo.website} onChange={set('personalInfo', 'website')} placeholder="janedev.com" />
          <Textarea label="Professional Summary" value={data.personalInfo.summary} onChange={set('personalInfo', 'summary')}
            placeholder="Brief 2-3 sentence professional summary..." rows={4} />
        </div>
      );

      case 1: return (
        <div className="space-y-4">
          {data.education.map((e, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">Education #{i + 1}</span>
                <button onClick={() => removeItem('education', i)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
              </div>
              <Input label="Institution" value={e.institution} onChange={(ev) => updateItem('education', i, 'institution', ev.target.value)} placeholder="MIT" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Degree" value={e.degree} onChange={(ev) => updateItem('education', i, 'degree', ev.target.value)} placeholder="B.S." />
                <Input label="Field of Study" value={e.field} onChange={(ev) => updateItem('education', i, 'field', ev.target.value)} placeholder="Computer Science" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input label="Start Date" value={e.startDate} onChange={(ev) => updateItem('education', i, 'startDate', ev.target.value)} placeholder="Sep 2020" />
                <Input label="End Date" value={e.endDate} onChange={(ev) => updateItem('education', i, 'endDate', ev.target.value)} placeholder="May 2024" />
                <Input label="GPA" value={e.gpa} onChange={(ev) => updateItem('education', i, 'gpa', ev.target.value)} placeholder="3.9/4.0" />
              </div>
            </div>
          ))}
          <button onClick={() => addItem('education', { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' })}
            className="w-full border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl py-3 text-slate-400 hover:text-indigo-400 transition-all text-sm">
            + Add Education
          </button>
        </div>
      );

      case 2: return (
        <div className="space-y-4">
          {data.experience.map((e, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">Experience #{i + 1}</span>
                <button onClick={() => removeItem('experience', i)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Job Title" value={e.position} onChange={(ev) => updateItem('experience', i, 'position', ev.target.value)} placeholder="Software Engineer" />
                <Input label="Company" value={e.company} onChange={(ev) => updateItem('experience', i, 'company', ev.target.value)} placeholder="Google" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input label="Start Date" value={e.startDate} onChange={(ev) => updateItem('experience', i, 'startDate', ev.target.value)} placeholder="Jun 2022" />
                <Input label="End Date" value={e.endDate} onChange={(ev) => updateItem('experience', i, 'endDate', ev.target.value)} placeholder="Present" />
                <Input label="Location" value={e.location} onChange={(ev) => updateItem('experience', i, 'location', ev.target.value)} placeholder="Remote" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Bullet Points</label>
                {(e.bullets || []).map((b, j) => (
                  <div key={j} className="flex gap-2 mb-2">
                    <span className="text-slate-500 mt-2">•</span>
                    <textarea value={b} onChange={(ev) => updateBullet('experience', i, j, ev.target.value)}
                      className="input-field text-sm py-1.5 resize-none flex-1" rows={2}
                      placeholder="Developed feature X that improved Y by Z%" />
                  </div>
                ))}
                <button onClick={() => addBullet('experience', i)} className="text-xs text-indigo-400 hover:text-indigo-300">
                  + Add bullet point
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => addItem('experience', { position: '', company: '', startDate: '', endDate: '', location: '', bullets: [''] })}
            className="w-full border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl py-3 text-slate-400 hover:text-indigo-400 transition-all text-sm">
            + Add Experience
          </button>
        </div>
      );

      case 3: return (
        <div className="space-y-4">
          {data.projects.map((p, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">Project #{i + 1}</span>
                <button onClick={() => removeItem('projects', i)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
              </div>
              <Input label="Project Name" value={p.name} onChange={(ev) => updateItem('projects', i, 'name', ev.target.value)} placeholder="Smart Resume Analyzer" />
              <TagInput label="Technologies Used" tags={p.technologies || []}
                onChange={(tags) => updateItem('projects', i, 'technologies', tags)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Live Link" value={p.link} onChange={(ev) => updateItem('projects', i, 'link', ev.target.value)} placeholder="https://..." />
                <Input label="GitHub Link" value={p.github} onChange={(ev) => updateItem('projects', i, 'github', ev.target.value)} placeholder="github.com/..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Bullet Points</label>
                {(p.bullets || []).map((b, j) => (
                  <div key={j} className="flex gap-2 mb-2">
                    <span className="text-slate-500 mt-2">•</span>
                    <textarea value={b} onChange={(ev) => updateBullet('projects', i, j, ev.target.value)}
                      className="input-field text-sm py-1.5 resize-none flex-1" rows={2}
                      placeholder="Built X using Y, resulting in Z improvement" />
                  </div>
                ))}
                <button onClick={() => addBullet('projects', i)} className="text-xs text-indigo-400 hover:text-indigo-300">
                  + Add bullet point
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => addItem('projects', { name: '', description: '', technologies: [], link: '', github: '', bullets: [''] })}
            className="w-full border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl py-3 text-slate-400 hover:text-indigo-400 transition-all text-sm">
            + Add Project
          </button>
        </div>
      );

      case 4: return (
        <div className="space-y-4">
          <TagInput label="Programming Languages" tags={data.skills.languages} onChange={setSkill('languages')} />
          <TagInput label="Frameworks & Libraries" tags={data.skills.frameworks} onChange={setSkill('frameworks')} />
          <TagInput label="Tools & DevOps" tags={data.skills.tools} onChange={setSkill('tools')} />
          <TagInput label="Databases" tags={data.skills.databases} onChange={setSkill('databases')} />
          <TagInput label="Cloud Platforms" tags={data.skills.cloud} onChange={setSkill('cloud')} />
          <TagInput label="Other Skills" tags={data.skills.other} onChange={setSkill('other')} />
        </div>
      );

      case 5: return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Live preview of your resume</p>
            <button onClick={handleDownload} disabled={downloading} className="btn-primary text-sm py-2">
              {downloading ? 'Generating...' : '⬇ Download PDF'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <div ref={previewRef} className="mx-auto" style={{ width: '816px' }}>
              <ResumePreview data={data} />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-black bg-transparent text-white border-b border-transparent hover:border-slate-600 focus:border-indigo-500 focus:outline-none transition-all"
            placeholder="Resume Title" />
          <p className="text-slate-400 text-sm mt-1">Build your resume step by step</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-secondary text-sm py-2">
            {saving ? 'Saving...' : '💾 Save'}
          </button>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              step === i ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="card">
                <h2 className="text-lg font-bold text-white mb-5">{STEPS[step]}</h2>
                {renderStep()}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-5">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">← Previous</button>
            )}
            {step < STEPS.length - 1 && (
              <button onClick={() => setStep(step + 1)} className="btn-primary flex-1">Next →</button>
            )}
          </div>
        </div>

        {/* Live mini-preview */}
        {step < 5 && (
          <div className="hidden xl:block">
            <div className="card sticky top-24">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Live Preview</h3>
              <div className="overflow-hidden rounded-lg border border-slate-800" style={{ maxHeight: '60vh' }}>
                <div style={{ transform: 'scale(0.45)', transformOrigin: 'top left', width: '816px' }}>
                  <ResumePreview data={data} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
