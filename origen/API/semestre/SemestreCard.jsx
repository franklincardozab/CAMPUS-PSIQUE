import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import ProgressRing from '../common/ProgressRing';

const semesterColors = [
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50", border: "border-violet-200" },
  { bg: "from-blue-500 to-indigo-600", light: "bg-blue-50", border: "border-blue-200" },
  { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50", border: "border-emerald-200" },
  { bg: "from-amber-500 to-orange-600", light: "bg-amber-50", border: "border-amber-200" },
  { bg: "from-rose-500 to-pink-600", light: "bg-rose-50", border: "border-rose-200" },
  { bg: "from-cyan-500 to-blue-600", light: "bg-cyan-50", border: "border-cyan-200" },
  { bg: "from-fuchsia-500 to-purple-600", light: "bg-fuchsia-50", border: "border-fuchsia-200" },
  { bg: "from-slate-600 to-slate-800", light: "bg-slate-50", border: "border-slate-200" }
];

export default function SemesterCard({ semester, progress, isUnlocked, isCompleted, onClick }) {
  const colorIndex = (semester.number - 1) % semesterColors.length;
  const colors = semesterColors[colorIndex];

  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.02, y: -4 } : {}}
      whileTap={isUnlocked ? { scale: 0.98 } : {}}
      onClick={isUnlocked ? onClick : undefined}
      className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer
        ${isUnlocked ? `${colors.border} ${colors.light} shadow-lg hover:shadow-xl` : 
          'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'}`}
    >
      {/* Header gradient */}
      <div className={`h-24 bg-gradient-to-br ${isUnlocked ? colors.bg : 'from-slate-400 to-slate-500'} 
        flex items-center justify-center relative overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
        
        <div className="relative z-10 text-center">
          <span className="text-4xl">{semester.icon || '📚'}</span>
        </div>
        
        {/* Status badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
        )}
        {!isUnlocked && (
          <div className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5">
            <Lock className="w-5 h-5 text-slate-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Semestre {semester.number}
            </span>
            <h3 className="text-lg font-bold text-slate-800 mt-0.5 line-clamp-1">
              {semester.title}
            </h3>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
              {semester.description}
            </p>
          </div>
          
          {isUnlocked && !isCompleted && (
            <ProgressRing 
              progress={progress} 
              size={50} 
              strokeWidth={5}
              color={colors.bg.includes('violet') ? '#8B5CF6' : '#6366F1'}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60">
          <span className="text-xs text-slate-500">
            {semester.modules?.length || 0} módulos
          </span>
          {isUnlocked && (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>
    </motion.div>
  );
}