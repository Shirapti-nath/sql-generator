import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const getColor = (score) => {
  if (score >= 80) return { stroke: '#10b981', text: 'text-emerald-400', label: 'Excellent' };
  if (score >= 60) return { stroke: '#f59e0b', text: 'text-amber-400', label: 'Good' };
  if (score >= 40) return { stroke: '#f97316', text: 'text-orange-400', label: 'Fair' };
  return { stroke: '#ef4444', text: 'text-red-400', label: 'Needs Work' };
};

export default function ScoreGauge({ score = 0, size = 180 }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e293b" strokeWidth={12} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color.stroke} strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-4xl font-black ${color.text}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-slate-500 font-medium">/ 100</span>
        </div>
      </div>
      <span className={`text-sm font-semibold ${color.text}`}>{color.label}</span>
    </div>
  );
}
