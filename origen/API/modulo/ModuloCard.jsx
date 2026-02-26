import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, Play, BookOpen } from 'lucide-react';
import ProgressRing from '../common/ProgressRing';

export default function ModuleCard({ module, progress, isUnlocked, isCompleted, lessonsCompleted, totalLessons, onClick }) {
  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.02 } : {}}
      whileTap={isUnlocked ? { scale: 0.98 } : {}}
      onClick={isUnlocked ? onClick : undefined}
      className={`relative p-4 rounded-xl border-2 transition-all duration-300
        ${isUnlocked 
          ? 'border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-violet-300 cursor-pointer' 
          : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'}`}
    >
      <div className="flex items-start gap-4">
        {/* Icon/Progress */}
        <div className="relative">
          {isCompleted ? (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 
              flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
          ) : isUnlocked ? (
            <div className="relative">
              <ProgressRing progress={progress} size={56} strokeWidth={5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl">{module.icon || '📖'}</span>
              </div>
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center">
              <Lock className="w-6 h-6 text-slate-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 line-clamp-1">{module.title}</h3>
          <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{module.description}</p>
          
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{lessonsCompleted}/{totalLessons} lecciones</span>
            </div>
            {module.xp_reward && (
              <span className="text-xs font-medium text-amber-600">+{module.xp_reward} XP</span>
            )}
          </div>
        </div>

        {/* Action */}
        {isUnlocked && !isCompleted && (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
              <Play className="w-5 h-5 text-violet-600 ml-0.5" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}